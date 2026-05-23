import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/auth';
import { getConnection } from '../config/database';
import { User } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Get user from database
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT id, email, first_name, last_name, created_at, updated_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = rows[0] as User;
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
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
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({
      success: false,
      error: 'Authorization failed'
    });
  }
}
