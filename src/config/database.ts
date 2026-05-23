import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tracknet',
};

let pool: mysql.Pool | null = null;

export async function getConnection(): Promise<mysql.PoolConnection> {
  if (!pool) {
    // Create connection pool with proper settings
    pool = mysql.createPool({
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
    } catch (error) {
      console.error('[Database] ✗ Connection failed:', error);
      throw error;
    }
  }

  return pool.getConnection();
}

export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export { dbConfig };
