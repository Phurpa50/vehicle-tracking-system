"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = require("../config/database");
async function runMigrations() {
    try {
        console.log('🔄 Running database migrations...');
        const connection = await (0, database_1.getConnection)();
        // Read and execute schema.sql
        const schemaPath = path_1.default.join(__dirname, '../../schema.sql');
        const schemaSQL = fs_1.default.readFileSync(schemaPath, 'utf8');
        // Split SQL commands and execute them
        const commands = schemaSQL.split(';').filter(cmd => cmd.trim().length > 0);
        for (const command of commands) {
            if (command.trim()) {
                // Use query() for DDL commands that aren't supported by execute()
                if (command.trim().toUpperCase().startsWith('USE') ||
                    command.trim().toUpperCase().startsWith('CREATE DATABASE') ||
                    command.trim().toUpperCase().startsWith('DROP')) {
                    await connection.query(command);
                }
                else {
                    await connection.execute(command);
                }
            }
        }
        console.log('✅ Database migrations completed successfully');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}
// Run migrations if this script is executed directly
if (require.main === module) {
    runMigrations()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
//# sourceMappingURL=migrate.js.map