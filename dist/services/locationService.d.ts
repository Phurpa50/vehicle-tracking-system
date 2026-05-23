interface LocationUpdateData {
    vehicleId: string;
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    satellites: number;
    timestamp: number;
}
interface StatusUpdateData {
    vehicleId: string;
    status: 'online' | 'offline' | 'error';
    publishCount: number;
    errorCount: number;
    signal: number;
    uptime: number;
}
interface LocationData {
    id: string;
    vehicleId: string;
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    satellites: number;
    timestamp: string;
}
export declare class LocationService {
    /**
     * Update vehicle location from GPS data
     */
    static updateVehicleLocation(data: LocationUpdateData): Promise<void>;
    /**
     * Update vehicle status
     */
    static updateVehicleStatus(data: StatusUpdateData): Promise<void>;
    /**
     * Get location history for a vehicle
     */
    static getLocationHistory(vehicleId: string, limit?: number, offset?: number): Promise<LocationData[]>;
    /**
     * Get latest location for a vehicle by vehicle_id
     */
    static getLatestLocation(vehicleId: string): Promise<LocationData | null>;
    /**
     * Get latest telemetry data for a vehicle by UUID
     */
    static getLatestTelemetry(vehicleUuid: string): Promise<LocationData | null>;
    /**
     * Get all vehicles with latest locations
     */
    static getAllVehiclesWithLocations(): Promise<any[]>;
    /**
     * Delete old location history (cleanup)
     */
    static deleteOldLocations(vehicleId: string, daysToKeep?: number): Promise<void>;
}
export {};
//# sourceMappingURL=locationService.d.ts.map