"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const vehicleService_1 = require("../services/vehicleService");
const locationService_1 = require("../services/locationService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticateToken);
// Validation middleware
const validateCreateVehicle = [
    (0, express_validator_1.body)('id').optional().isUUID(),
    (0, express_validator_1.body)('vehicle_id').isLength({ min: 1, max: 50 }),
    (0, express_validator_1.body)('registration_time').isISO8601(),
    (0, express_validator_1.body)('lat').isFloat({ min: -90, max: 90 }),
    (0, express_validator_1.body)('lng').isFloat({ min: -180, max: 180 }),
];
const validateUpdateVehicle = [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('vehicle_id').optional().isLength({ min: 1, max: 50 }),
    (0, express_validator_1.body)('registration_time').optional().isISO8601(),
    (0, express_validator_1.body)('status').optional().isIn(['active', 'idle', 'stopped', 'offline']),
    (0, express_validator_1.body)('lat').optional().isFloat({ min: -90, max: 90 }),
    (0, express_validator_1.body)('lng').optional().isFloat({ min: -180, max: 180 }),
];
const validateVehicleId = [
    (0, express_validator_1.param)('id').isUUID(),
];
// GET /api/vehicles
router.get('/', async (req, res) => {
    try {
        const vehicles = await vehicleService_1.VehicleService.getAllVehicles();
        res.json({
            success: true,
            data: vehicles
        });
    }
    catch (error) {
        console.error('Get vehicles error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch vehicles'
        });
    }
});
// GET /api/vehicles/:id
router.get('/:id', validateVehicleId, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                data: errors.array()
            });
        }
        const userId = req.user.id;
        const vehicleId = req.params.id;
        const vehicle = await vehicleService_1.VehicleService.getVehicleById(vehicleId, userId);
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
    }
    catch (error) {
        console.error('Get vehicle error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch vehicle'
        });
    }
});
// POST /api/vehicles
router.post('/', validateCreateVehicle, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                data: errors.array()
            });
        }
        const userId = req.user.id;
        const vehicleData = req.body;
        const vehicle = await vehicleService_1.VehicleService.createVehicle(userId, vehicleData);
        res.status(201).json({
            success: true,
            data: vehicle,
            message: 'Vehicle created successfully'
        });
    }
    catch (error) {
        console.error('Create vehicle error:', error);
        const message = error instanceof Error ? error.message : 'Failed to create vehicle';
        res.status(400).json({
            success: false,
            error: message
        });
    }
});
// PUT /api/vehicles/:id
router.put('/:id', validateUpdateVehicle, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                data: errors.array()
            });
        }
        const userId = req.user.id;
        const vehicleId = req.params.id;
        const updateData = req.body;
        const vehicle = await vehicleService_1.VehicleService.updateVehicle(vehicleId, userId, updateData);
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
    }
    catch (error) {
        console.error('Update vehicle error:', error);
        const message = error instanceof Error ? error.message : 'Failed to update vehicle';
        res.status(400).json({
            success: false,
            error: message
        });
    }
});
// DELETE /api/vehicles/:id
router.delete('/:id', validateVehicleId, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                data: errors.array()
            });
        }
        const userId = req.user.id;
        const vehicleId = req.params.id;
        const deleted = await vehicleService_1.VehicleService.deleteVehicle(vehicleId, userId);
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
    }
    catch (error) {
        console.error('Delete vehicle error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete vehicle'
        });
    }
});
// PUT /api/vehicles/:id/location
router.put('/:id/location', [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('lat').isFloat({ min: -90, max: 90 }),
    (0, express_validator_1.body)('lng').isFloat({ min: -180, max: 180 }),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                data: errors.array()
            });
        }
        const userId = req.user.id;
        const vehicleId = req.params.id;
        const { lat, lng } = req.body;
        const updated = await vehicleService_1.VehicleService.updateVehicleLocation(vehicleId, userId, lat, lng);
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
    }
    catch (error) {
        console.error('Update location error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update vehicle location'
        });
    }
});
// GET /api/vehicles/:id/history
router.get('/:id/history', validateVehicleId, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                data: errors.array()
            });
        }
        const userId = req.user.id;
        const vehicleId = req.params.id;
        const limit = parseInt(req.query.limit) || 100;
        // Verify vehicle belongs to user
        const vehicle = await vehicleService_1.VehicleService.getVehicleById(vehicleId, userId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                error: 'Vehicle not found'
            });
        }
        const history = await vehicleService_1.VehicleService.getVehicleLocationHistory(vehicleId, userId, limit);
        res.json({
            success: true,
            data: history
        });
    }
    catch (error) {
        console.error('Get location history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch location history'
        });
    }
});
// GET /api/vehicles/:id/telemetry - Get latest telemetry data (lat, lng, altitude, speed, satellites)
router.get('/:id/telemetry', validateVehicleId, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                data: errors.array()
            });
        }
        const userId = req.user.id;
        const vehicleId = req.params.id;
        // Verify vehicle belongs to user
        const vehicle = await vehicleService_1.VehicleService.getVehicleById(vehicleId, userId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                error: 'Vehicle not found'
            });
        }
        // Get latest telemetry data
        const telemetry = await locationService_1.LocationService.getLatestTelemetry(vehicleId);
        res.json({
            success: true,
            data: telemetry
        });
    }
    catch (error) {
        console.error('Get telemetry error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch telemetry data'
        });
    }
});
exports.default = router;
//# sourceMappingURL=vehicles.js.map