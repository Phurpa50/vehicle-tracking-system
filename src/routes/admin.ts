import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { UserService } from '../services/userService';
import { VehicleService } from '../services/vehicleService';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { ApiResponse, CreateUserData, CreateVehicleData } from '../types';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// User management endpoints

// GET /api/admin/users - Get all users
router.get('/users', async (req: Request, res: Response<ApiResponse>) => {
  try {
    const users = await UserService.getAllUsers();
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// POST /api/admin/users - Create new user
router.post('/users', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('first_name').optional().isLength({ min: 1, max: 100 }),
  body('last_name').optional().isLength({ min: 1, max: 100 }),
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

    const userData: CreateUserData = req.body;
    const user = await UserService.createUser(userData);

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
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
  param('id').isUUID(),
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

    const userId = req.params.id;
    const deleted = await UserService.deleteUser(userId);

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
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

// Vehicle management endpoints

// GET /api/admin/vehicles - Get all vehicles
router.get('/vehicles', async (req: Request, res: Response<ApiResponse>) => {
  try {
    const vehicles = await VehicleService.getAllVehicles();
    res.json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    console.error('Get all vehicles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicles'
    });
  }
});

// POST /api/admin/vehicles - Create new vehicle for any user
router.post('/vehicles', [
  body('user_id').isUUID(),
  body('id').optional().isUUID(),
  body('vehicle_id').isLength({ min: 1, max: 50 }),
  body('registration_time').isISO8601(),
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

    const vehicleData: CreateVehicleData & { user_id: string } = req.body;
    const vehicle = await VehicleService.createVehicleForUser(vehicleData.user_id, vehicleData);

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

// DELETE /api/admin/vehicles/:id - Delete vehicle
// PUT /api/admin/vehicles/:id - Update vehicle
router.put('/vehicles/:id', [
  param('id').isUUID(),
  body('user_id').isUUID(),
  body('vehicle_id').isLength({ min: 1, max: 50 }),
  body('registration_time').isISO8601(),
  body('lat').isFloat({ min: -90, max: 90 }),
  body('lng').isFloat({ min: -180, max: 180 }),
  body('status').optional().isIn(['active', 'idle', 'stopped', 'offline']),
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

    const vehicleId = req.params.id;
    const vehicleData = req.body;
    const updatedVehicle = await VehicleService.updateVehicleAdmin(vehicleId, vehicleData);

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
  } catch (error) {
    console.error('Update vehicle error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update vehicle';
    res.status(400).json({
      success: false,
      error: message
    });
  }
});

router.delete('/vehicles/:id', [
  param('id').isUUID(),
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

    const vehicleId = req.params.id;
    const deleted = await VehicleService.deleteVehicleAdmin(vehicleId);

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

export default router;
