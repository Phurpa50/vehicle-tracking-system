import { Vehicle, CreateVehicleData, UpdateVehicleData, VehicleLocation } from '../types';
export declare class VehicleService {
    static getVehiclesByUserId(userId: string): Promise<Vehicle[]>;
    static getVehicleById(vehicleId: string, userId: string): Promise<Vehicle | null>;
    static createVehicle(userId: string, vehicleData: CreateVehicleData): Promise<Vehicle>;
    static updateVehicle(vehicleId: string, userId: string, updateData: UpdateVehicleData): Promise<Vehicle | null>;
    static deleteVehicle(vehicleId: string, userId: string): Promise<boolean>;
    static updateVehicleLocation(vehicleId: string, userId: string, lat: number, lng: number, latitude?: number, longitude?: number, satellite?: number, speed_kmh?: number): Promise<boolean>;
    static getVehicleLocationHistory(vehicleId: string, userId: string, limit?: number): Promise<VehicleLocation[]>;
    static getAllVehicles(): Promise<Vehicle[]>;
    static createVehicleForUser(userId: string, vehicleData: CreateVehicleData): Promise<Vehicle>;
    /**
     * Get vehicle by vehicle_id (not UUID id)
     * Used for Arduino auto-registration
     */
    static getVehicleByVehicleId(vehicleId: string): Promise<Vehicle | null>;
    /**
     * Create vehicle from Arduino (no user authentication needed)
     * Called when Arduino sends location for non-existent vehicle
     */
    static createVehicleFromArduino(vehicleData: {
        vehicle_id: string;
        make?: string;
        model?: string;
        year?: number;
        license_plate?: string;
        vin?: string;
        lat: number;
        lng: number;
        status?: string;
    }): Promise<Vehicle>;
    /**
     * Get or create system user for Arduino vehicles
     */
    private static getSystemUserId;
    /**
     * Note: This method uses a connection passed as parameter, so it should NOT release
     * The caller is responsible for releasing the connection
     */
    static updateVehicleAdmin(vehicleId: string, updateData: Partial<Vehicle>): Promise<Vehicle | null>;
    static deleteVehicleAdmin(vehicleId: string): Promise<boolean>;
}
//# sourceMappingURL=vehicleService.d.ts.map