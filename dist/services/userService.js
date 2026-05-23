"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const database_1 = require("../config/database");
const auth_1 = require("../utils/auth");
class UserService {
    static async createUser(userData) {
        const connection = await (0, database_1.getConnection)();
        try {
            // Check if user already exists
            const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [userData.email]);
            if (Array.isArray(existing) && existing.length > 0) {
                throw new Error('User with this email already exists');
            }
            // Hash password
            const passwordHash = await (0, auth_1.hashPassword)(userData.password);
            // Create user
            await connection.execute('INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)', [userData.email, passwordHash, userData.first_name || null, userData.last_name || null]);
            // Get the created user by email
            const [rows] = await connection.execute('SELECT id, email, first_name, last_name, created_at, updated_at FROM users WHERE email = ?', [userData.email]);
            if (!Array.isArray(rows) || rows.length === 0) {
                throw new Error('Failed to create user');
            }
            return rows[0];
        }
        finally {
            connection.release();
        }
    }
    static async authenticateUser(loginData) {
        const connection = await (0, database_1.getConnection)();
        try {
            const [rows] = await connection.execute('SELECT id, email, password_hash, first_name, last_name, created_at, updated_at FROM users WHERE email = ?', [loginData.email]);
            if (!Array.isArray(rows) || rows.length === 0) {
                throw new Error('Invalid email or password');
            }
            const user = rows[0];
            const isValidPassword = await (0, auth_1.verifyPassword)(loginData.password, user.password_hash);
            if (!isValidPassword) {
                throw new Error('Invalid email or password');
            }
            // Remove password hash from user object
            const { password_hash, ...userWithoutPassword } = user;
            const token = (0, auth_1.generateToken)(userWithoutPassword);
            return {
                user: userWithoutPassword,
                token
            };
        }
        finally {
            connection.release();
        }
    }
    static async getUserById(id) {
        const connection = await (0, database_1.getConnection)();
        try {
            const [rows] = await connection.execute('SELECT id, email, first_name, last_name, created_at, updated_at FROM users WHERE id = ?', [id]);
            if (!Array.isArray(rows) || rows.length === 0) {
                return null;
            }
            return rows[0];
        }
        finally {
            connection.release();
        }
    }
    static async getAllUsers() {
        const connection = await (0, database_1.getConnection)();
        try {
            const [rows] = await connection.execute('SELECT id, email, first_name, last_name, created_at, updated_at FROM users ORDER BY created_at DESC');
            return rows || [];
        }
        finally {
            connection.release();
        }
    }
    static async deleteUser(id) {
        const connection = await (0, database_1.getConnection)();
        try {
            const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [id]);
            return result.affectedRows > 0;
        }
        finally {
            connection.release();
        }
    }
}
exports.UserService = UserService;
//# sourceMappingURL=userService.js.map