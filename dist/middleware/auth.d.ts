import { Request, Response, NextFunction } from 'express';
import { User } from '../types';
declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}
export declare function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.d.ts.map