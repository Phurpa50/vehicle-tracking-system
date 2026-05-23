"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const userService_1 = require("../services/userService");
const router = (0, express_1.Router)();
// Validation middleware
const validateSignup = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('first_name').optional().isLength({ min: 1, max: 100 }),
    (0, express_validator_1.body)('last_name').optional().isLength({ min: 1, max: 100 }),
];
const validateLogin = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').exists(),
];
// POST /api/auth/signup
router.post('/signup', validateSignup, async (req, res) => {
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
        const { token } = await userService_1.UserService.authenticateUser({
            email: userData.email,
            password: userData.password
        });
        res.status(201).json({
            success: true,
            data: { user, token },
            message: 'User created successfully'
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        const message = error instanceof Error ? error.message : 'Failed to create user';
        res.status(400).json({
            success: false,
            error: message
        });
    }
});
// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                data: errors.array()
            });
        }
        const loginData = req.body;
        const result = await userService_1.UserService.authenticateUser(loginData);
        res.json({
            success: true,
            data: result,
            message: 'Login successful'
        });
    }
    catch (error) {
        console.error('Login error:', error);
        const message = error instanceof Error ? error.message : 'Login failed';
        res.status(401).json({
            success: false,
            error: message
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map