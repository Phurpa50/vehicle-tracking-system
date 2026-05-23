import { getConnection } from '../config/database';
import { User, CreateUserData, LoginData } from '../types';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';

export class UserService {
  static async createUser(userData: CreateUserData): Promise<User> {
    const connection = await getConnection();
    try {
      // Check if user already exists
      const [existing] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [userData.email]
      );

      if (Array.isArray(existing) && existing.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const passwordHash = await hashPassword(userData.password);

      // Create user
      await connection.execute(
        'INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)',
        [userData.email, passwordHash, userData.first_name || null, userData.last_name || null]
      );

      // Get the created user by email
      const [rows] = await connection.execute(
        'SELECT id, email, first_name, last_name, created_at, updated_at FROM users WHERE email = ?',
        [userData.email]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error('Failed to create user');
      }

      return rows[0] as User;
    } finally {
      connection.release();
    }
  }

  static async authenticateUser(loginData: LoginData): Promise<{ user: User; token: string }> {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT id, email, password_hash, first_name, last_name, created_at, updated_at FROM users WHERE email = ?',
        [loginData.email]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = rows[0] as User & { password_hash: string };

      const isValidPassword = await verifyPassword(loginData.password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Remove password hash from user object
      const { password_hash, ...userWithoutPassword } = user;
      const token = generateToken(userWithoutPassword);

      return {
        user: userWithoutPassword,
        token
      };
    } finally {
      connection.release();
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT id, email, first_name, last_name, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        return null;
      }

      return rows[0] as User;
    } finally {
      connection.release();
    }
  }

  static async getAllUsers(): Promise<User[]> {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT id, email, first_name, last_name, created_at, updated_at FROM users ORDER BY created_at DESC'
      );

      return (rows as User[]) || [];
    } finally {
      connection.release();
    }
  }

  static async deleteUser(id: string): Promise<boolean> {
    const connection = await getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }
}
