"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

exports.LocationService = void 0;

const { getConnection } = require("../config/database");

class LocationService {

    /**
     * Update vehicle location from GPS data
     */
    static async updateVehicleLocation(data) {

        const connection = await getConnection();

        try {

            console.log(
                `[LocationService] Updating location for ${data.vehicleId}`
            );

            console.log(
                `[LocationService] lat=${data.latitude}, lng=${data.longitude}`
            );

            // =====================================
            // FIND VEHICLE
            // =====================================

            const [vehicleResult] = await connection.execute(
                `SELECT id
                 FROM vehicles
                 WHERE vehicle_id = ?`,
                [data.vehicleId]
            );

            if (
                !Array.isArray(vehicleResult) ||
                vehicleResult.length === 0
            ) {

                throw new Error(
                    `Vehicle ${data.vehicleId} not found`
                );
            }

            const vehicleUUID = vehicleResult[0].id;

            console.log(
                `[LocationService] Vehicle UUID: ${vehicleUUID}`
            );

            // =====================================
            // UPDATE VEHICLES TABLE
            // =====================================

            const [updateResult] = await connection.execute(
                `UPDATE vehicles
                 SET lat = ?,
                     lng = ?,
                     last_location_update = NOW(),
                     status = 'active'
                 WHERE id = ?`,
                [
                    data.latitude,
                    data.longitude,
                    vehicleUUID
                ]
            );

            console.log(
                `[LocationService] ✓ Updated vehicles table`
            );

            console.log(updateResult);

            // =====================================
            // INSERT LOCATION HISTORY
            // =====================================

            try {

                const [insertResult] =
                await connection.execute(

                    `INSERT INTO vehicle_locations
                    (
                        vehicle_id,
                        latitude,
                        longitude,
                        altitude,
                        speed_kmh,
                        satellite
                    )
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        vehicleUUID,
                        data.latitude,
                        data.longitude,
                        data.altitude || 0,
                        data.speed || 0,
                        data.satellites || 0
                    ]
                );

                console.log(
                    `[LocationService] ✓ Inserted into vehicle_locations`
                );

                console.log(insertResult);

            } catch (insertError) {

                console.error(
                    '[LocationService] ✗ Error inserting location:',
                    insertError
                );

                throw insertError;
            }

            console.log(
                `[LocationService] ✓ Successfully updated location for ${data.vehicleId}`
            );

            return {
                success: true
            };

        } catch (error) {

            console.error(
                '[LocationService] ✗ Error updating location:',
                error
            );

            throw error;

        } finally {

            connection.release();
        }
    }

    /**
     * Update vehicle status
     */
    static async updateVehicleStatus(data) {

        const connection = await getConnection();

        try {

            console.log(
                `[LocationService] Updating status for ${data.vehicleId}`
            );

            // FIND VEHICLE
            const [vehicleResult] = await connection.execute(
                `SELECT id
                 FROM vehicles
                 WHERE vehicle_id = ?`,
                [data.vehicleId]
            );

            if (
                !Array.isArray(vehicleResult) ||
                vehicleResult.length === 0
            ) {

                throw new Error(
                    `Vehicle ${data.vehicleId} not found`
                );
            }

            const vehicleUUID = vehicleResult[0].id;

            // UPDATE STATUS
            await connection.execute(
                `UPDATE vehicles
                 SET status = ?,
                     last_location_update = NOW()
                 WHERE id = ?`,
                [
                    data.status,
                    vehicleUUID
                ]
            );

            console.log(
                `[LocationService] ✓ Status updated`
            );

            return {
                success: true
            };

        } catch (error) {

            console.error(
                '[LocationService] ✗ Error updating status:',
                error
            );

            throw error;

        } finally {

            connection.release();
        }
    }

    /**
     * Get location history
     */
    static async getLocationHistory(
        vehicleId,
        limit = 50,
        offset = 0
    ) {

        const connection = await getConnection();

        try {

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
                JOIN vehicles v
                    ON vl.vehicle_id = v.id
                WHERE v.vehicle_id = ?
                ORDER BY vl.timestamp DESC
                LIMIT ? OFFSET ?`,
                [
                    vehicleId,
                    limit,
                    offset
                ]
            );

            return result || [];

        } catch (error) {

            console.error(
                '[LocationService] Error getting location history:',
                error
            );

            throw error;

        } finally {

            connection.release();
        }
    }

    /**
     * Get latest location
     */
    static async getLatestLocation(vehicleId) {

        const connection = await getConnection();

        try {

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
                JOIN vehicles v
                    ON vl.vehicle_id = v.id
                WHERE v.vehicle_id = ?
                ORDER BY vl.timestamp DESC
                LIMIT 1`,
                [vehicleId]
            );

            return (
                Array.isArray(result) &&
                result.length > 0
            )
                ? result[0]
                : null;

        } catch (error) {

            console.error(
                '[LocationService] Error getting latest location:',
                error
            );

            throw error;

        } finally {

            connection.release();
        }
    }

    /**
     * Get all vehicles with latest locations
     */
    static async getAllVehiclesWithLocations() {

        const connection = await getConnection();

        try {

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

                LEFT JOIN vehicle_locations vl
                    ON v.id = vl.vehicle_id

                AND vl.timestamp = (
                    SELECT MAX(timestamp)
                    FROM vehicle_locations
                    WHERE vehicle_id = v.id
                )

                ORDER BY v.created_at DESC`
            );

            return result || [];

        } catch (error) {

            console.error(
                '[LocationService] Error getting vehicles:',
                error
            );

            throw error;

        } finally {

            connection.release();
        }
    }

    /**
     * Delete old locations
     */
    static async deleteOldLocations(
        vehicleId,
        daysToKeep = 30
    ) {

        const connection = await getConnection();

        try {

            await connection.execute(

                `DELETE FROM vehicle_locations
                 WHERE vehicle_id =
                 (
                    SELECT id
                    FROM vehicles
                    WHERE vehicle_id = ?
                 )

                 AND timestamp <
                 DATE_SUB(NOW(), INTERVAL ? DAY)`,

                [
                    vehicleId,
                    daysToKeep
                ]
            );

            console.log(
                `[LocationService] Deleted old locations`
            );

            return {
                success: true
            };

        } catch (error) {

            console.error(
                '[LocationService] Error deleting locations:',
                error
            );

            throw error;

        } finally {

            connection.release();
        }
    }
}

exports.LocationService = LocationService;