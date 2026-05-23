"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConfig = void 0;
exports.getConnection = getConnection;
exports.closeConnection = closeConnection;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tracknet',
};
exports.dbConfig = dbConfig;
let pool = null;
async function getConnection() {
    if (!pool) {
        // Create connection pool with proper settings
        pool = promise_1.default.createPool({
            ...dbConfig,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0
        });
        // Test connection
        try {
            const conn = await pool.getConnection();
            console.log('[Database] ✓ Connected to MySQL');
            conn.release();
        }
        catch (error) {
            console.error('[Database] ✗ Connection failed:', error);
            throw error;
        }
    }
    return pool.getConnection();
}
async function closeConnection() {
    if (pool) {
        await pool.end();
        pool = null;
    }
}
//# sourceMappingURL=database.js.map