import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserService } from '../services/userService';
import { ApiResponse, CreateUserData, LoginData } from '../types';

const router = Router();

// Validation middleware
const validateSignup = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('first_name').optional().isLength({ min: 1, max: 100 }),
  body('last_name').optional().isLength({ min: 1, max: 100 }),
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
];

// POST /api/auth/signup
router.post('/signup', validateSignup, async (req: Request, res: Response<ApiResponse>) => {
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
    const { token } = await UserService.authenticateUser({
      email: userData.email,
      password: userData.password
    });

    res.status(201).json({
      success: true,
      data: { user, token },
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Signup error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create user';
    res.status(400).json({
      success: false,
      error: message
    });
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req: Request, res: Response<ApiResponse>) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        data: errors.array()
      });
    }

    const loginData: LoginData = req.body;
    const result = await UserService.authenticateUser(loginData);

    res.json({
      success: true,
      data: result,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    const message = error instanceof Error ? error.message : 'Login failed';
    res.status(401).json({
      success: false,
      error: message
    });
  }
});

export default router;
