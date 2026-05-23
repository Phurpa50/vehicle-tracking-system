import mysql from 'mysql2/promise';
export interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}
declare const dbConfig: DatabaseConfig;
export declare function getConnection(): Promise<mysql.PoolConnection>;
export declare function closeConnection(): Promise<void>;
export { dbConfig };
//# sourceMappingURL=database.d.ts.map