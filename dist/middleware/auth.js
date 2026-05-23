"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.requireAdmin = requireAdmin;
const auth_1 = require("../utils/auth");
const database_1 = require("../config/database");
async function authenticateToken(req, res, next) {
    try {
        const token = (0, auth_1.extractTokenFromHeader)(req.headers.authorization);
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access token required'
            });
        }
        const decoded = (0, auth_1.verifyToken)(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
        // Get user from database
        const connection = await (0, database_1.getConnection)();
        const [rows] = await connection.execute('SELECT id, email, first_name, last_name, created_at, updated_at FROM users WHERE id = ?', [decoded.id]);
        if (!Array.isArray(rows) || rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }
        const user = rows[0];
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            error: 'Authentication failed'
        });
    }
}
async function requireAdmin(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        // Simple admin check - for now, we'll check if email contains 'admin'
        // In production, you might want to add a role column to the users table
        if (!req.user.email?.includes('admin')) {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }
        next();
    }
    catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({
            success: false,
            error: 'Authorization failed'
        });
    }
}
//# sourceMappingURL=auth.js.map