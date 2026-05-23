import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { LocationService } from '../services/locationService';
import { VehicleService } from '../services/vehicleService';
import { ApiResponse } from '../types';

const router = Router();

// Validation for new Arduino location update (with EEPROM queue - multiple locations)
const validateLocationUpdateWithQueue = [
  body('vehicleId').isLength({ min: 1, max: 50 }).trim(),
  body('locations').isArray({ min: 1 }),
  body('locations.*.lat').isFloat({ min: -90, max: 90 }),
  body('locations.*.lng').isFloat({ min: -180, max: 180 }),
  body('locations.*.altitude').optional().isFloat(),
  body('locations.*.speed').optional().isFloat({ min: 0 }),
  body('locations.*.satellites').optional().isInt({ min: 0 }),
];

// Validation for legacy Arduino location update (single location)
const validateLocationUpdate = [
  body('vehicleId').isLength({ min: 1, max: 50 }).trim(),
  body('lat').isFloat({ min: -90, max: 90 }),
  body('lng').isFloat({ min: -180, max: 180 }),
  body('alt').optional().isFloat(),
  body('speed').optional().isFloat({ min: 0 }),
  body('sats').optional().isInt({ min: 0 }),
  body('altitude').optional().isFloat(),
  body('satellites').optional().isInt({ min: 0 }),
  body('course').optional().isFloat({ min: 0, max: 360 }),
  body('hdop').optional().isFloat(),
  body('make').optional().isString(),
  body('model').optional().isString(),
  body('year').optional().isInt(),
  body('license_plate').optional().isString(),
  body('vin').optional().isString(),
  body('timestamp').optional().isInt(),
];

// POST /api/vehicle/location - Receive location from Arduino (with EEPROM queue)
// Handles array of locations + auto-creates vehicle if it doesn't exist
router.post('/location', async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { vehicleId, locations, lat, lng } = req.body;

    // Check if this is the new format (with locations array) or legacy format
    if (locations && Array.isArray(locations)) {
      // NEW FORMAT: Handle queued locations from EEPROM

      // Manual validation for queue format
      if (!vehicleId || vehicleId.length < 1 || vehicleId.length > 50) {
        return res.status(400).json({
          success: false,
          error: 'Invalid vehicleId'
        });
      }

      if (!locations || locations.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'locations array is required and must not be empty'
        });
      }

      console.log(`[Location] Received ${locations.length} queued locations for vehicle: ${vehicleId}`);

      // Check if vehicle exists
      let existingVehicle = await VehicleService.getVehicleByVehicleId(vehicleId);

      if (!existingVehicle) {
        console.log(`[Location] Vehicle not found. Auto-creating: ${vehicleId}`);
        try {
          existingVehicle = await VehicleService.createVehicleFromArduino({
            vehicle_id: vehicleId,
            make: 'Unknown',
            model: 'Unknown',
            year: new Date().getFullYear(),
            license_plate: `TEMP-${vehicleId}`,
            vin: `VIN-${vehicleId}`,
            lat: locations[locations.length - 1].lat,
            lng: locations[locations.length - 1].lng,
            status: 'active'
          });
          console.log(`[Location] ✓ Vehicle auto-created successfully: ${vehicleId}`);
        } catch (createError) {
          console.error('[Location] ✗ Failed to auto-create vehicle:', createError);
          return res.status(400).json({
            success: false,
            error: 'Failed to auto-create vehicle: ' + (createError as Error).message
          });
        }
      }

      // Process each queued location
      let successCount = 0;
      for (let i = 0; i < locations.length; i++) {
        const loc = locations[i];
        try {
          await LocationService.updateVehicleLocation({
            vehicleId,
            latitude: loc.lat,
            longitude: loc.lng,
            altitude: loc.altitude || 0,
            speed: loc.speed || 0,
            satellites: loc.satellites || 0,
            timestamp: Date.now()
          });
          successCount++;
        } catch (locError) {
          console.error(`[Location] ✗ Failed to process location ${i + 1}:`, locError);
        }
      }

      console.log(`[Location] ✓ Processed ${successCount}/${locations.length} locations for ${vehicleId}`);

      res.json({
        success: true,
        data: {
          message: `Processed ${successCount} locations successfully`,
          vehicleId,
          locationsProcessed: successCount,
          totalLocations: locations.length,
          lat: locations[locations.length - 1].lat,
          lng: locations[locations.length - 1].lng,
          updatedAt: new Date().toISOString()
        }
      });
    } else {
      // LEGACY FORMAT: Handle single location
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed: ' + errors.array().map((e: any) => e.msg).join(', ')
        });
      }

      const {
        vehicleId: legacyVehicleId,
        lat: legacyLat,
        lng: legacyLng,
        alt,
        speed,
        sats,
        altitude,
        satellites,
        course,
        hdop,
        make,
        model,
        year,
        license_plate,
        vin,
        timestamp
      } = req.body;

      console.log(`[Location] Received location update for vehicle: ${legacyVehicleId} at (${legacyLat}, ${legacyLng})`);

      // Check if vehicle exists
      let existingVehicle = await VehicleService.getVehicleByVehicleId(legacyVehicleId);

      if (!existingVehicle) {
        console.log(`[Location] Vehicle not found. Auto-creating: ${legacyVehicleId}`);
        try {
          existingVehicle = await VehicleService.createVehicleFromArduino({
            vehicle_id: legacyVehicleId,
            make: make || 'Unknown',
            model: model || 'Unknown',
            year: year || new Date().getFullYear(),
            license_plate: license_plate || `TEMP-${legacyVehicleId}`,
            vin: vin || `VIN-${legacyVehicleId}`,
            lat: legacyLat,
            lng: legacyLng,
            status: 'active'
          });
          console.log(`[Location] ✓ Vehicle auto-created successfully: ${legacyVehicleId}`);
        } catch (createError) {
          console.error('[Location] ✗ Failed to auto-create vehicle:', createError);
          return res.status(400).json({
            success: false,
            error: 'Failed to auto-create vehicle: ' + (createError as Error).message
          });
        }
      }

      // Update vehicle location
      try {
        console.log(`[Location] Calling LocationService.updateVehicleLocation with:`, {
          vehicleId: legacyVehicleId,
          latitude: legacyLat,
          longitude: legacyLng,
          altitude: altitude || alt || 0,
          speed: speed || 0,
          satellites: satellites || sats || 0,
          timestamp: timestamp || Date.now()
        });
        
        await LocationService.updateVehicleLocation({
          vehicleId: legacyVehicleId,
          latitude: legacyLat,
          longitude: legacyLng,
          altitude: altitude || alt || 0,
          speed: speed || 0,
          satellites: satellites || sats || 0,
          timestamp: timestamp || Date.now()
        });

        console.log(`[Location] ✓ Location updated for ${legacyVehicleId}`);

        res.json({
          success: true,
          data: {
            message: 'Location updated successfully',
            vehicleId: legacyVehicleId,
            isNewVehicle: !existingVehicle,
            lat: legacyLat,
            lng: legacyLng,
            speed: speed || 0,
            updatedAt: new Date().toISOString()
          }
        });
      } catch (locationError) {
        console.error('[Location] ✗ Failed to update location:', locationError);
        return res.status(400).json({
          success: false,
          error: 'Failed to update location: ' + (locationError as Error).message
        });
      }
    }
  } catch (error) {
    console.error('[Location] ✗ Update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update location'
    });
  }
});

// POST /api/vehicle/status - Receive status from Arduino
router.post('/status', [
  body('vehicleId').isLength({ min: 1, max: 50 }),
  body('status').isIn(['online', 'offline', 'error']),
  body('publish_count').optional().isInt({ min: 0 }),
  body('error_count').optional().isInt({ min: 0 }),
  body('signal').optional().isInt({ min: 0, max: 31 }),
  body('uptime').optional().isInt({ min: 0 }),
], async (req: Request, res: Response<ApiResponse>) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: ' + errors.array().map((e: any) => e.msg).join(', ')
      });
    }

    const { vehicleId, status, publish_count, error_count, signal, uptime } = req.body;

    // Update vehicle status
    const result = await LocationService.updateVehicleStatus({
      vehicleId,
      status,
      publishCount: publish_count || 0,
      errorCount: error_count || 0,
      signal: signal || 0,
      uptime: uptime || 0
    });

    res.json({
      success: true,
      data: {
        message: 'Status updated successfully',
        vehicleId,
        status,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update status'
    });
  }
});

// GET /api/vehicle/:vehicleId/locations - Get location history
router.get('/:vehicleId/locations', async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { vehicleId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

    const locations = await LocationService.getLocationHistory(vehicleId, limit, offset);

    res.json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch locations'
    });
  }
});

// GET /api/vehicle/:vehicleId/latest - Get latest vehicle location
router.get('/:vehicleId/latest', async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { vehicleId } = req.params;

    const location = await LocationService.getLatestLocation(vehicleId);

    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'No location data found for this vehicle'
      });
    }

    res.json({
      success: true,
      data: location
    });
  } catch (error) {
    console.error('Get latest location error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch location'
    });
  }
});

export default router;
