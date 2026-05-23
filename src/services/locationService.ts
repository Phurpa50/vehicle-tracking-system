import { getConnection } from '../config/database';

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

export class LocationService {
  /**
   * Update vehicle location from GPS data
   */
  static async updateVehicleLocation(data: LocationUpdateData): Promise<void> {
    const connection = await getConnection();
    try {
      console.log(`[LocationService] Updating location for ${data.vehicleId}: lat=${data.latitude}, lng=${data.longitude}`);
      
      // Find vehicle by vehicle_id
      console.log(`[LocationService] Querying vehicle with vehicle_id: ${data.vehicleId}`);
      const [vehicleResult] = await connection.execute(
        'SELECT id FROM vehicles WHERE vehicle_id = ?',
        [data.vehicleId]
      );

      if (!Array.isArray(vehicleResult) || vehicleResult.length === 0) {
        throw new Error(`Vehicle ${data.vehicleId} not found`);
      }

      const vehicleId = (vehicleResult as any)[0].id;
      console.log(`[LocationService] Found vehicle UUID: ${vehicleId}`);

      // Update vehicle with latest location
      console.log(`[LocationService] Updating vehicles table with lat=${data.latitude}, lng=${data.longitude}`);
      const [updateResult] = await connection.execute(
        `UPDATE vehicles 
         SET lat = ?, lng = ?, last_location_update = NOW() 
         WHERE id = ?`,
        [data.latitude, data.longitude, vehicleId]
      );
      console.log(`[LocationService] ✓ Updated vehicles table, affected rows: ${(updateResult as any).affectedRows}`);

      // Insert into location history
      console.log(`[LocationService] Inserting into vehicle_locations: vehicle_id=${vehicleId}, lat=${data.latitude}, lng=${data.longitude}, alt=${data.altitude}, speed=${data.speed}, satellites=${data.satellites}`);
      try {
        const [insertResult] = await connection.execute(
          `INSERT INTO vehicle_locations 
           (vehicle_id, latitude, longitude, altitude, speed_kmh, satellite, timestamp)
           VALUES (?, ?, ?, ?, ?, ?, FROM_UNIXTIME(?))`,
          [vehicleId, data.latitude, data.longitude, data.altitude, data.speed, data.satellites, Math.floor(data.timestamp / 1000)]
        );
        console.log(`[LocationService] ✓ Inserted into vehicle_locations, affected rows: ${(insertResult as any).affectedRows}`);
      } catch (insertError) {
        console.error('[LocationService] ✗ Error inserting into vehicle_locations:', insertError);
        throw insertError;
      }

      console.log(`[LocationService] ✓ Successfully updated location for ${data.vehicleId}`);
    } catch (error) {
      console.error('[LocationService] ✗ Error updating location:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update vehicle status
   */
  static async updateVehicleStatus(data: StatusUpdateData): Promise<void> {
    const connection = await getConnection();
    try {
      console.log(`[LocationService] Updating status for ${data.vehicleId}: ${data.status}`);

      // Find vehicle by vehicle_id
      const [vehicleResult] = await connection.execute(
        'SELECT id FROM vehicles WHERE vehicle_id = ?',
        [data.vehicleId]
      );

      if (!Array.isArray(vehicleResult) || vehicleResult.length === 0) {
        throw new Error(`Vehicle ${data.vehicleId} not found`);
      }

      const vehicleId = (vehicleResult as any)[0].id;

      // Update vehicle status
      await connection.execute(
        `UPDATE vehicles 
         SET status = ?, last_location_update = NOW()
         WHERE id = ?`,
        [data.status, vehicleId]
      );

      // Log status to console
      console.log(`[LocationService] ✓ Updated status for ${data.vehicleId}: ${data.status} (Signal: ${data.signal}, Errors: ${data.errorCount})`);
    } catch (error) {
      console.error('[LocationService] ✗ Error updating status:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get location history for a vehicle
   */
  static async getLocationHistory(vehicleId: string, limit: number = 50, offset: number = 0): Promise<LocationData[]> {
    try {
      const connection = await getConnection();

      const [result] = await connection.execute(
        `SELECT 
          vl.id,
          v.vehicle_id as vehicleId,
          vl.latitude,
          vl.longitude,
          vl.altitude,
          vl.speed_kmh as speed,
          vl.satellite as satellites,
          vl.timestamp
        FROM vehicle_locations vl
        JOIN vehicles v ON vl.vehicle_id = v.id
        WHERE v.vehicle_id = ?
        ORDER BY vl.timestamp DESC
        LIMIT ? OFFSET ?`,
        [vehicleId, limit, offset]
      );

      connection.release();
      return (result as LocationData[]) || [];
    } catch (error) {
      console.error('[LocationService] Error getting location history:', error);
      throw error;
    }
  }

  /**
   * Get latest location for a vehicle by vehicle_id
   */
  static async getLatestLocation(vehicleId: string): Promise<LocationData | null> {
    try {
      const connection = await getConnection();

      const [result] = await connection.execute(
        `SELECT 
          vl.id,
          v.vehicle_id as vehicleId,
          vl.latitude,
          vl.longitude,
          vl.altitude,
          vl.speed_kmh as speed,
          vl.satellite as satellites,
          vl.timestamp
        FROM vehicle_locations vl
        JOIN vehicles v ON vl.vehicle_id = v.id
        WHERE v.vehicle_id = ?
        ORDER BY vl.timestamp DESC
        LIMIT 1`,
        [vehicleId]
      );

      return (Array.isArray(result) && result.length > 0) ? (result[0] as LocationData) : null;
    } catch (error) {
      console.error('[LocationService] Error getting latest location:', error);
      throw error;
    }
  }

  /**
   * Get latest telemetry data for a vehicle by UUID
   */
  static async getLatestTelemetry(vehicleUuid: string): Promise<LocationData | null> {
    try {
      const connection = await getConnection();

      const [result] = await connection.execute(
        `SELECT 
          vl.id,
          v.vehicle_id as vehicleId,
          vl.latitude,
          vl.longitude,
          vl.altitude,
          vl.speed_kmh as speed,
          vl.satellite as satellites,
          vl.timestamp
        FROM vehicle_locations vl
        WHERE vl.vehicle_id = ?
        ORDER BY vl.timestamp DESC
        LIMIT 1`,
        [vehicleUuid]
      );

      connection.release();
      return (Array.isArray(result) && result.length > 0) ? (result[0] as LocationData) : null;
    } catch (error) {
      console.error('[LocationService] Error getting latest telemetry:', error);
      throw error;
    }
  }

  /**
   * Get all vehicles with latest locations
   */
  static async getAllVehiclesWithLocations(): Promise<any[]> {
    try {
      const connection = await getConnection();

      const [result] = await connection.execute(
        `SELECT 
          v.id,
          v.vehicle_id as vehicleId,
          v.lat,
          v.lng,
          v.status,
          v.last_location_update as lastUpdate,
          vl.altitude,
          vl.speed_kmh as speed,
          vl.satellite as satellites
        FROM vehicles v
        LEFT JOIN vehicle_locations vl ON v.id = vl.vehicle_id 
          AND vl.timestamp = (
            SELECT MAX(timestamp) FROM vehicle_locations 
            WHERE vehicle_id = v.id
          )
        ORDER BY v.created_at DESC`
      );

      return (result as any[]) || [];
    } catch (error) {
      console.error('[LocationService] Error getting all vehicles with locations:', error);
      throw error;
    }
  }

  /**
   * Delete old location history (cleanup)
   */
  static async deleteOldLocations(vehicleId: string, daysToKeep: number = 30): Promise<void> {
    try {
      const connection = await getConnection();

      await connection.execute(
        `DELETE FROM vehicle_locations 
         WHERE vehicle_id = (SELECT id FROM vehicles WHERE vehicle_id = ?) 
         AND timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)`,
        [vehicleId, daysToKeep]
      );

      console.log(`[LocationService] Deleted old locations for ${vehicleId} (kept last ${daysToKeep} days)`);
    } catch (error) {
      console.error('[LocationService] Error deleting old locations:', error);
      throw error;
    }
  }
}
