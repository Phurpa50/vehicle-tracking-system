import { User, CreateUserData, LoginData } from '../types';
export declare class UserService {
    static createUser(userData: CreateUserData): Promise<User>;
    static authenticateUser(loginData: LoginData): Promise<{
        user: User;
        token: string;
    }>;
    static getUserById(id: string): Promise<User | null>;
    static getAllUsers(): Promise<User[]>;
    static deleteUser(id: string): Promise<boolean>;
}
//# sourceMappingURL=userService.d.ts.map