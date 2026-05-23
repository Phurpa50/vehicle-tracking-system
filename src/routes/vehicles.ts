import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { VehicleService } from '../services/vehicleService';
import { LocationService } from '../services/locationService';
import { authenticateToken } from '../middleware/auth';
import { ApiResponse, CreateVehicleData, UpdateVehicleData } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Validation middleware
const validateCreateVehicle = [
  body('id').optional().isUUID(),
  body('vehicle_id').isLength({ min: 1, max: 50 }),
  body('registration_time').isISO8601(),
  body('lat').isFloat({ min: -90, max: 90 }),
  body('lng').isFloat({ min: -180, max: 180 }),
];

const validateUpdateVehicle = [
  param('id').isUUID(),
  body('vehicle_id').optional().isLength({ min: 1, max: 50 }),
  body('registration_time').optional().isISO8601(),
  body('status').optional().isIn(['active', 'idle', 'stopped', 'offline']),
  body('lat').optional().isFloat({ min: -90, max: 90 }),
  body('lng').optional().isFloat({ min: -180, max: 180 }),
];

const validateVehicleId = [
  param('id').isUUID(),
];

// GET /api/vehicles
router.get('/', async (req: Request, res: Response<ApiResponse>) => {
  try {
    const vehicles = await VehicleService.getAllVehicles();

    res.json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicles'
    });
  }
});

// GET /api/vehicles/:id
router.get('/:id', validateVehicleId, async (req: Request, res: Response<ApiResponse>) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        data: errors.array()
      });
    }

    const userId = req.user!.id;
    const vehicleId = req.params.id;

    const vehicle = await VehicleService.getVehicleById(vehicleId, userId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicle'
    });
  }
});

// POST /api/vehicles
router.post('/', validateCreateVehicle, async (req: Request, res: Response<ApiResponse>) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        data: errors.array()
      });
    }

    const userId = req.user!.id;
    const vehicleData: CreateVehicleData = req.body;

    const vehicle = await VehicleService.createVehicle(userId, vehicleData);

    res.status(201).json({
      success: true,
      data: vehicle,
      message: 'Vehicle created successfully'
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create vehicle';
    res.status(400).json({
      success: false,
      error: message
    });
  }
});

// PUT /api/vehicles/:id
router.put('/:id', validateUpdateVehicle, async (req: Request, res: Response<ApiResponse>) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        data: errors.array()
      });
    }

    const userId = req.user!.id;
    const vehicleId = req.params.id;
    const updateData: UpdateVehicleData = req.body;

    const vehicle = await VehicleService.updateVehicle(vehicleId, userId, updateData);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: vehicle,
      message: 'Vehicle updated successfully'
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update vehicle';
    res.status(400).json({
      success: false,
      error: message
    });
  }
});

// DELETE /api/vehicles/:id
router.delete('/:id', validateVehicleId, async (req: Request, res: Response<ApiResponse>) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        data: errors.array()
      });
    }

    const userId = req.user!.id;
    const vehicleId = req.params.id;

    const deleted = await VehicleService.deleteVehicle(vehicleId, userId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete vehicle'
    });
  }
});

// PUT /api/vehicles/:id/location
router.put('/:id/location', [
  param('id').isUUID(),
  body('lat').isFloat({ min: -90, max: 90 }),
  body('lng').isFloat({ min: -180, max: 180 }),
], async (req: Request, res: Response<ApiResponse>) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        data: errors.array()
      });
    }

    const userId = req.user!.id;
    const vehicleId = req.params.id;
    const { lat, lng } = req.body;

    const updated = await VehicleService.updateVehicleLocation(vehicleId, userId, lat, lng);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle location updated successfully'
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update vehicle location'
    });
  }
});

// GET /api/vehicles/:id/history
router.get('/:id/history', validateVehicleId, async (req: Request, res: Response<ApiResponse>) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        data: errors.array()
      });
    }

    const userId = req.user!.id;
    const vehicleId = req.params.id;
    const limit = parseInt(req.query.limit as string) || 100;

    // Verify vehicle belongs to user
    const vehicle = await VehicleService.getVehicleById(vehicleId, userId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    const history = await VehicleService.getVehicleLocationHistory(vehicleId, userId, limit);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Get location history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch location history'
    });
  }
});

// GET /api/vehicles/:id/telemetry - Get latest telemetry data (lat, lng, altitude, speed, satellites)
router.get('/:id/telemetry', validateVehicleId, async (req: Request, res: Response<ApiResponse>) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        data: errors.array()
      });
    }

    const userId = req.user!.id;
    const vehicleId = req.params.id;

    // Verify vehicle belongs to user
    const vehicle = await VehicleService.getVehicleById(vehicleId, userId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    // Get latest telemetry data
    const telemetry = await LocationService.getLatestTelemetry(vehicleId);

    res.json({
      success: true,
      data: telemetry
    });
  } catch (error) {
    console.error('Get telemetry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch telemetry data'
    });
  }
});

export default router;
