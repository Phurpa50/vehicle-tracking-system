"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const userService_1 = require("../services/userService");
const vehicleService_1 = require("../services/vehicleService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All admin routes require authentication and admin role
router.use(auth_1.authenticateToken);
router.use(auth_1.requireAdmin);
// User management endpoints
// GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await userService_1.UserService.getAllUsers();
        res.json({
            success: true,
            data: users
        });
    }
    catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users'
        });
    }
});
// POST /api/admin/users - Create new user
router.post('/users', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('first_name').optional().isLength({ min: 1, max: 100 }),
    (0, express_validator_1.body)('last_name').optional().isLength({ min: 1, max: 100 }),
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
        const userData = req.body;
        const user = await userService_1.UserService.createUser(userData);
        res.status(201).json({
            success: true,
            data: user,
            message: 'User created successfully'
        });
    }
    catch (error) {
        console.error('Create user error:', error);
        const message = error instanceof Error ? error.message : 'Failed to create user';
        res.status(400).json({
            success: false,
            error: message
        });
    }
});
// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', [
    (0, express_validator_1.param)('id').isUUID(),
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
        const userId = req.params.id;
        const deleted = await userService_1.UserService.deleteUser(userId);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete user'
        });
    }
});
// Vehicle management endpoints
// GET /api/admin/vehicles - Get all vehicles
router.get('/vehicles', async (req, res) => {
    try {
        const vehicles = await vehicleService_1.VehicleService.getAllVehicles();
        res.json({
            success: true,
            data: vehicles
        });
    }
    catch (error) {
        console.error('Get all vehicles error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch vehicles'
        });
    }
});
// POST /api/admin/vehicles - Create new vehicle for any user
router.post('/vehicles', [
    (0, express_validator_1.body)('user_id').isUUID(),
    (0, express_validator_1.body)('id').optional().isUUID(),
    (0, express_validator_1.body)('vehicle_id').isLength({ min: 1, max: 50 }),
    (0, express_validator_1.body)('registration_time').isISO8601(),
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
        const vehicleData = req.body;
        const vehicle = await vehicleService_1.VehicleService.createVehicleForUser(vehicleData.user_id, vehicleData);
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
// DELETE /api/admin/vehicles/:id - Delete vehicle
// PUT /api/admin/vehicles/:id - Update vehicle
router.put('/vehicles/:id', [
    (0, express_validator_1.param)('id').isUUID(),
    (0, express_validator_1.body)('user_id').isUUID(),
    (0, express_validator_1.body)('vehicle_id').isLength({ min: 1, max: 50 }),
    (0, express_validator_1.body)('registration_time').isISO8601(),
    (0, express_validator_1.body)('lat').isFloat({ min: -90, max: 90 }),
    (0, express_validator_1.body)('lng').isFloat({ min: -180, max: 180 }),
    (0, express_validator_1.body)('status').optional().isIn(['active', 'idle', 'stopped', 'offline']),
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
        const vehicleId = req.params.id;
        const vehicleData = req.body;
        const updatedVehicle = await vehicleService_1.VehicleService.updateVehicleAdmin(vehicleId, vehicleData);
        if (!updatedVehicle) {
            return res.status(404).json({
                success: false,
                error: 'Vehicle not found'
            });
        }
        res.json({
            success: true,
            data: updatedVehicle,
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
router.delete('/vehicles/:id', [
    (0, express_validator_1.param)('id').isUUID(),
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
        const vehicleId = req.params.id;
        const deleted = await vehicleService_1.VehicleService.deleteVehicleAdmin(vehicleId);
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
exports.default = router;
//# sourceMappingURL=admin.js.map