import fs from 'fs';
import path from 'path';
import { getConnection } from '../config/database';

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');

    const connection = await getConnection();

    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, '../../schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Split SQL commands and execute them
    const commands = schemaSQL.split(';').filter(cmd => cmd.trim().length > 0);

    for (const command of commands) {
      if (command.trim()) {
        // Use query() for DDL commands that aren't supported by execute()
        if (command.trim().toUpperCase().startsWith('USE') ||
          command.trim().toUpperCase().startsWith('CREATE DATABASE') ||
          command.trim().toUpperCase().startsWith('DROP')) {
          await connection.query(command);
        } else {
          await connection.execute(command);
        }
      }
    }

    console.log('✅ Database migrations completed successfully');
  } catch (error) {
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

export { runMigrations };
