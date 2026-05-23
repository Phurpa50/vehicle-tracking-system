"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const userService_1 = require("../services/userService");
const vehicleService_1 = require("../services/vehicleService");
async function seedDatabase() {
    try {
        console.log('🌱 Seeding database with sample data...');
        // Create a test user
        let testUser;
        try {
            testUser = await userService_1.UserService.createUser({
                email: 'test@example.com',
                password: 'password123',
                first_name: 'John',
                last_name: 'Doe'
            });
            console.log('✅ Created test user:', testUser.email);
        }
        catch (error) {
            if (error.message.includes('already exists')) {
                const connection = await (require('../config/database').getConnection)();
                const [rows] = await connection.execute('SELECT id, email FROM users WHERE email = ?', ['test@example.com']);
                testUser = rows[0];
                console.log('ℹ️  User already exists, using existing user:', testUser.email);
            }
            else {
                throw error;
            }
        }
        // Create some sample vehicles
        const vehicles = [
            {
                vehicle_id: 'V-001-NYC',
                registration_time: new Date(),
                status: 'active',
                lat: 40.7128,
                lng: -74.0060
            },
            {
                vehicle_id: 'V-002-LAX',
                registration_time: new Date(),
                status: 'active',
                lat: 34.0522,
                lng: -118.2437
            },
            {
                vehicle_id: 'V-003-CHI',
                registration_time: new Date(),
                status: 'active',
                lat: 41.8781,
                lng: -87.6298
            },
            {
                vehicle_id: 'V-004-HOU',
                registration_time: new Date(),
                status: 'active',
                lat: 29.7604,
                lng: -95.3698
            }
        ];
        for (const vehicleData of vehicles) {
            const vehicle = await vehicleService_1.VehicleService.createVehicle(testUser.id, vehicleData);
            console.log('✅ Created vehicle:', vehicle.vehicle_id);
        }
        console.log('🎉 Database seeding completed successfully!');
        console.log('📧 Test user credentials:');
        console.log('   Email: test@example.com');
        console.log('   Password: password123');
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}
// Run seeding if this script is executed directly
if (require.main === module) {
    seedDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
//# sourceMappingURL=seed.js.map