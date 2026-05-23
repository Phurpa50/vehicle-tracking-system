"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const os_1 = __importDefault(require("os"));
const auth_1 = __importDefault(require("./routes/auth"));
const vehicles_1 = __importDefault(require("./routes/vehicles"));
const admin_1 = __importDefault(require("./routes/admin"));
const location_1 = __importDefault(require("./routes/location"));
const database_1 = require("./config/database");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:9003",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});
const PORT = process.env.PORT || 3001;
// Get local IP address for debugging
function getLocalIP() {
    const interfaces = os_1.default.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}
const localIP = getLocalIP();
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:9003",
    credentials: true
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// REQUEST LOGGING MIDDLEWARE - Debug incoming requests
app.use((req, res, next) => {
    console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});
// Health check endpoint
app.get('/health', (req, res) => {
    console.log('[Health Check] Status OK');
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// DEBUG: Test endpoint to verify backend is receiving requests
app.get('/debug/test', (req, res) => {
    console.log('[DEBUG] Test endpoint hit');
    res.json({
        success: true,
        message: 'Backend is running',
        timestamp: new Date().toISOString(),
        localIP,
        port: PORT
    });
});
// DEBUG: POST test endpoint for Arduino
app.post('/debug/test-location', (req, res) => {
    console.log('\n[DEBUG TEST POST] Received location test');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    res.json({
        success: true,
        received: req.body,
        message: 'Test location received successfully'
    });
});
// API routes
app.use('/api/auth', auth_1.default);
app.use('/api/vehicles', vehicles_1.default);
app.use('/api/vehicle', location_1.default);
app.use('/api/admin', admin_1.default);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});
// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('join-vehicle-room', (vehicleId) => {
        socket.join(`vehicle-${vehicleId}`);
        console.log(`Client ${socket.id} joined vehicle room: ${vehicleId}`);
    });
    socket.on('leave-vehicle-room', (vehicleId) => {
        socket.leave(`vehicle-${vehicleId}`);
        console.log(`Client ${socket.id} left vehicle room: ${vehicleId}`);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
global.io = io;
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await (0, database_1.closeConnection)();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await (0, database_1.closeConnection)();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Listening on: 0.0.0.0:${PORT}`);
    console.log(`🌐 Local IP: ${localIP}:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 Location API: http://${localIP}:${PORT}/api/vehicle/location`);
    console.log(`${'='.repeat(50)}\n`);
});
//# sourceMappingURL=server.js.map