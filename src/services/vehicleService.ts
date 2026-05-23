import { getConnection } from '../config/database';
import { Vehicle, CreateVehicleData, UpdateVehicleData, VehicleLocation } from '../types';

function formatDateForMySQL(date: string | Date): string {
  const d = new Date(date);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

export class VehicleService {
  static async getVehiclesByUserId(userId: string): Promise<Vehicle[]> {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT id, user_id, vehicle_id, registration_time, status, lat, lng, last_location_update, created_at, updated_at FROM vehicles WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      return (rows as Vehicle[]) || [];
    } finally {
      connection.release();
    }
  }

  static async getVehicleById(vehicleId: string, userId: string): Promise<Vehicle | null> {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT id, user_id, vehicle_id, registration_time, status, lat, lng, last_location_update, created_at, updated_at FROM vehicles WHERE id = ? AND user_id = ?',
        [vehicleId, userId]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        return null;
      }

      return rows[0] as Vehicle;
    } finally {
      connection.release();
    }
  }

  static async createVehicle(userId: string, vehicleData: CreateVehicleData): Promise<Vehicle> {
    const connection = await getConnection();
    try {
      // Check if vehicle_id already exists
      const [existing] = await connection.execute(
        'SELECT id FROM vehicles WHERE vehicle_id = ?',
        [vehicleData.vehicle_id]
      );

      if (Array.isArray(existing) && existing.length > 0) {
        throw new Error('Vehicle with this Vehicle ID already exists');
      }

      const { id } = vehicleData;
      const finalId = id || undefined;

      if (finalId) {
        await connection.execute(
          'INSERT INTO vehicles (id, user_id, vehicle_id, registration_time, status, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            finalId,
            userId,
            vehicleData.vehicle_id,
            formatDateForMySQL(vehicleData.registration_time),
            vehicleData.status || 'active',
            vehicleData.lat || 0,
            vehicleData.lng || 0
          ]
        );
      } else {
        await connection.execute(
          'INSERT INTO vehicles (user_id, vehicle_id, registration_time, status, lat, lng) VALUES (?, ?, ?, ?, ?, ?)',
          [
            userId,
            vehicleData.vehicle_id,
            formatDateForMySQL(vehicleData.registration_time),
            vehicleData.status || 'active',
            vehicleData.lat || 0,
            vehicleData.lng || 0
          ]
        );
      }

      // Get the created vehicle
      const [rows] = await connection.execute(
        'SELECT id, user_id, vehicle_id, registration_time, status, lat, lng, last_location_update, created_at, updated_at FROM vehicles WHERE vehicle_id = ?',
        [vehicleData.vehicle_id]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error('Failed to create vehicle');
      }

      return rows[0] as Vehicle;
    } finally {
      connection.release();
    }
  }

  static async updateVehicle(vehicleId: string, userId: string, updateData: UpdateVehicleData): Promise<Vehicle | null> {
    const connection = await getConnection();
    try {
      // Check if vehicle exists and belongs to user
      const existingVehicle = await this.getVehicleById(vehicleId, userId);
      if (!existingVehicle) {
        return null;
      }

      // Check for conflicts if vehicle_id is being updated
      if (updateData.vehicle_id) {
        const [conflicts] = await connection.execute(
          'SELECT id FROM vehicles WHERE vehicle_id = ? AND id != ?',
          [updateData.vehicle_id, vehicleId]
        );

        if (Array.isArray(conflicts) && conflicts.length > 0) {
          throw new Error('Another vehicle with this Vehicle ID already exists');
        }
      }

      // Build update query dynamically
      const updates: string[] = [];
      const values: any[] = [];

      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      });

      if (updates.length === 0) {
        return existingVehicle;
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(vehicleId);

      await connection.execute(
        `UPDATE vehicles SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      // Return updated vehicle
      return this.getVehicleById(vehicleId, userId);
    } finally {
      connection.release();
    }
  }

  static async deleteVehicle(vehicleId: string, userId: string): Promise<boolean> {
    const connection = await getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM vehicles WHERE id = ? AND user_id = ?',
        [vehicleId, userId]
      );

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  static async updateVehicleLocation(vehicleId: string, userId: string, lat: number, lng: number, latitude?: number, longitude?: number, satellite?: number, speed_kmh?: number): Promise<boolean> {
    const connection = await getConnection();
    try {
      // Update vehicle location
      const [result] = await connection.execute(
        'UPDATE vehicles SET lat = ?, lng = ?, last_location_update = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        [lat, lng, vehicleId, userId]
      );

      if ((result as any).affectedRows === 0) {
        return false;
      }

      // Store location history with all tracking data
      await connection.execute(
        'INSERT INTO vehicle_locations (vehicle_id, latitude, longitude, satellite, speed_kmh, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [vehicleId, latitude || lat, longitude || lng, satellite || 0, speed_kmh || 0, lat, lng]
      );

      return true;
    } finally {
      connection.release();
    }
  }

  static async getVehicleLocationHistory(vehicleId: string, userId: string, limit: number = 100): Promise<VehicleLocation[]> {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT id, vehicle_id, latitude, longitude, satellite, speed_kmh, lat, lng, timestamp FROM vehicle_locations WHERE vehicle_id = ? ORDER BY timestamp DESC LIMIT ?',
        [vehicleId, limit]
      );

      return (rows as VehicleLocation[]) || [];
    } finally {
      connection.release();
    }
  }

  static async getAllVehicles(): Promise<Vehicle[]> {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT id, user_id, vehicle_id, registration_time, status, lat, lng, last_location_update, created_at, updated_at FROM vehicles ORDER BY created_at DESC'
      );

      return (rows as Vehicle[]) || [];
    } finally {
      connection.release();
    }
  }

  static async createVehicleForUser(userId: string, vehicleData: CreateVehicleData): Promise<Vehicle> {
    // This is the same as createVehicle but allows admin to create for any user
    return this.createVehicle(userId, vehicleData);
  }

  /**
   * Get vehicle by vehicle_id (not UUID id)
   * Used for Arduino auto-registration
   */
  static async getVehicleByVehicleId(vehicleId: string): Promise<Vehicle | null> {
    const connection = await getConnection();
    
    try {
      const [rows] = await connection.execute(
        'SELECT id, user_id, vehicle_id, registration_time, status, lat, lng, last_location_update, created_at, updated_at FROM vehicles WHERE vehicle_id = ? LIMIT 1',
        [vehicleId]
      );

      return (rows as Vehicle[])?.[0] || null;
    } catch (error) {
      console.error('[VehicleService] Error fetching vehicle:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Create vehicle from Arduino (no user authentication needed)
   * Called when Arduino sends location for non-existent vehicle
   */
  static async createVehicleFromArduino(vehicleData: {
    vehicle_id: string;
    make?: string;
    model?: string;
    year?: number;
    license_plate?: string;
    vin?: string;
    lat: number;
    lng: number;
    status?: string;
  }): Promise<Vehicle> {
    const connection = await getConnection();

    try {
      // Get or create a default system user for Arduino vehicles
      let systemUserId = await this.getSystemUserId(connection);
      
      if (!systemUserId) {
        // Create system user if it doesn't exist
        const [userResult] = await connection.execute(
          `INSERT INTO users (email, password_hash, first_name, last_name) 
           VALUES (?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
          ['system@arduino.local', 'system_user_no_login', 'System', 'Arduino']
        );
        
        const result = await connection.execute(
          `SELECT id FROM users WHERE email = 'system@arduino.local' LIMIT 1`
        );
        systemUserId = (result[0] as any)[0]?.id;
      }

      const query = `
        INSERT INTO vehicles (
          user_id,
          vehicle_id,
          registration_time,
          lat,
          lng,
          status,
          created_at,
          updated_at
        ) VALUES (?, ?, NOW(), ?, ?, ?, NOW(), NOW())
      `;

      await connection.execute(query, [
        systemUserId,
        vehicleData.vehicle_id,
        vehicleData.lat,
        vehicleData.lng,
        vehicleData.status || 'active'
      ]);

      console.log(`[VehicleService] ✓ Created vehicle from Arduino: ${vehicleData.vehicle_id}`);

      const created = await this.getVehicleByVehicleId(vehicleData.vehicle_id);
      if (!created) {
        throw new Error('Failed to create vehicle');
      }
      return created;
    } catch (error) {
      console.error('[VehicleService] Error creating vehicle from Arduino:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get or create system user for Arduino vehicles
   */
  private static async getSystemUserId(connection: any): Promise<string | null> {
    try {
      const [rows] = await connection.execute(
        `SELECT id FROM users WHERE email = 'system@arduino.local' LIMIT 1`
      );
      return (rows as any)?.[0]?.id || null;
    } catch (error) {
      console.error('[VehicleService] Error getting system user:', error);
      return null;
    }
  }

  /**
   * Note: This method uses a connection passed as parameter, so it should NOT release
   * The caller is responsible for releasing the connection
   */

  static async updateVehicleAdmin(vehicleId: string, updateData: Partial<Vehicle>): Promise<Vehicle | null> {
    const connection = await getConnection();
    try {
      // Check if vehicle exists
      const [existing] = await connection.execute(
        'SELECT id, user_id, vehicle_id, registration_time, status, lat, lng FROM vehicles WHERE id = ?',
        [vehicleId]
      );

      if (!Array.isArray(existing) || existing.length === 0) {
        return null;
      }

      const currentVehicle = (existing as any)[0] as Vehicle;

      // Check for conflicts if vehicle_id is being updated
      if (updateData.vehicle_id && updateData.vehicle_id !== currentVehicle.vehicle_id) {
        const [conflicts] = await connection.execute(
          'SELECT id FROM vehicles WHERE vehicle_id = ? AND id != ?',
          [updateData.vehicle_id, vehicleId]
        );

        if (Array.isArray(conflicts) && conflicts.length > 0) {
          throw new Error('Another vehicle with this Vehicle ID already exists');
        }
      }

      // Prepare update fields
      const fields = [
        'user_id = ?',
        'vehicle_id = ?',
        'registration_time = ?',
        'status = ?',
        'lat = ?',
        'lng = ?',
        'updated_at = CURRENT_TIMESTAMP'
      ];

      const values = [
        updateData.user_id || currentVehicle.user_id,
        updateData.vehicle_id || currentVehicle.vehicle_id,
        formatDateForMySQL(updateData.registration_time || currentVehicle.registration_time),
        updateData.status || currentVehicle.status,
        updateData.lat !== undefined ? updateData.lat : currentVehicle.lat,
        updateData.lng !== undefined ? updateData.lng : currentVehicle.lng,
        vehicleId
      ];

      await connection.execute(
        `UPDATE vehicles SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      // Get the updated vehicle
      const [rows] = await connection.execute(
        'SELECT id, user_id, vehicle_id, registration_time, status, lat, lng, last_location_update, created_at, updated_at FROM vehicles WHERE id = ?',
        [vehicleId]
      );

      return (rows as any)[0] as Vehicle;
    } finally {
      connection.release();
    }
  }

  static async deleteVehicleAdmin(vehicleId: string): Promise<boolean> {
    const connection = await getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM vehicles WHERE id = ?',
        [vehicleId]
      );

      return (result as any).affectedRows > 0;
    } finally {
      connection.release();
    }
  }
}
