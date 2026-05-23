import { User } from '../types';
export declare function hashPassword(password: string): Promise<string>;
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
export declare function generateToken(user: User): string;
export declare function verifyToken(token: string): any;
export declare function extractTokenFromHeader(authHeader: string | undefined): string | null;
//# sourceMappingURL=auth.d.ts.map