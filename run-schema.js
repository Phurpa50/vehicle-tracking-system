const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');

async function runSchema() {
  let connection;
  try {
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log('Reading schema from:', schemaPath);
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Connect to MySQL
    connection = await mysql.createConnection({
      host: 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      multipleStatements: true
    });

    console.log('✓ Connected to MySQL');
    console.log('▶ Running schema.sql...');

    // Execute schema
    await connection.query(schema);

    console.log('✓ Schema executed successfully');
    console.log('✓ Database initialized');

  } catch (error) {
    console.error('✗ Error running schema:');
    console.error(error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runSchema();
