import bcrypt from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import { User } from '../types';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
  };

  // Use a simpler approach to avoid TypeScript issues
  const options = { expiresIn: JWT_EXPIRES_IN };
  return (jwt as any).sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
