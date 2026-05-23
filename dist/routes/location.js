"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const { Router } = require("express");
const { body, validationResult } = require("express-validator");

const { LocationService } = require("../services/locationService");
const { VehicleService } = require("../services/vehicleService");

const router = Router();

// =====================================
// VALIDATION
// =====================================

const validateLocationUpdate = [

    body('vehicleId')
        .isLength({ min: 1, max: 50 })
        .trim(),

    body('lat')
        .isFloat({ min: -90, max: 90 }),

    body('lng')
        .isFloat({ min: -180, max: 180 }),

    body('speed')
        .optional()
        .isFloat({ min: 0 }),

    body('altitude')
        .optional()
        .isFloat(),

    body('satellites')
        .optional()
        .isInt({ min: 0 })
];

// =====================================
// POST LOCATION
// =====================================

router.post(
    '/location',
    validateLocationUpdate,

    async (req, res) => {

        try {

            // VALIDATION
            const errors = validationResult(req);

            if (!errors.isEmpty()) {

                return res.status(400).json({

                    success: false,

                    error:
                    errors.array()
                });
            }

            // REQUEST DATA
            const {
                vehicleId,
                lat,
                lng,
                speed,
                altitude,
                satellites
            } = req.body;

            console.log("=================================");
            console.log("[LOCATION RECEIVED]");
            console.log(req.body);
            console.log("=================================");

            // =====================================
            // CHECK VEHICLE
            // =====================================

            let existingVehicle =
            await VehicleService.getVehicleByVehicleId(
                vehicleId
            );

            // =====================================
            // AUTO CREATE VEHICLE
            // =====================================

            if (!existingVehicle) {

                console.log(
                    `[Location] Auto creating vehicle: ${vehicleId}`
                );

                existingVehicle =
                await VehicleService.createVehicleFromArduino({

                    vehicle_id: vehicleId,

                    make: "Unknown",

                    model: "Unknown",

                    year: new Date().getFullYear(),

                    license_plate:
                    `TEMP-${vehicleId}`,

                    vin:
                    `VIN-${vehicleId}`,

                    lat: lat,

                    lng: lng,

                    status: "active"
                });

                console.log(
                    `[Location] Vehicle created`
                );
            }

            // =====================================
            // UPDATE LOCATION
            // =====================================

            await LocationService.updateVehicleLocation({

                vehicleId: vehicleId,

                latitude: lat,

                longitude: lng,

                altitude: altitude || 0,

                speed: speed || 0,

                satellites: satellites || 0
            });

            console.log(
                `[Location] SUCCESS`
            );

            // =====================================
            // RESPONSE
            // =====================================

            res.status(200).json({

                success: true,

                data: {

                    message:
                    "Location updated successfully",

                    vehicleId: vehicleId,

                    lat: lat,

                    lng: lng,

                    speed: speed || 0,

                    altitude: altitude || 0,

                    satellites: satellites || 0,

                    updatedAt:
                    new Date().toISOString()
                }
            });

        } catch (error) {

            console.error(
                "[Location] ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                error:
                error.message ||
                "Failed to update location"
            });
        }
    }
);

// =====================================
// GET LOCATION HISTORY
// =====================================

router.get(
    '/:vehicleId/locations',

    async (req, res) => {

        try {

            const { vehicleId } = req.params;

            const limit =
            req.query.limit
            ? parseInt(req.query.limit)
            : 50;

            const offset =
            req.query.offset
            ? parseInt(req.query.offset)
            : 0;

            const locations =
            await LocationService.getLocationHistory(
                vehicleId,
                limit,
                offset
            );

            res.json({

                success: true,

                data: locations
            });

        } catch (error) {

            console.error(
                "Get locations error:",
                error
            );

            res.status(500).json({

                success: false,

                error:
                "Failed to fetch locations"
            });
        }
    }
);

// =====================================
// GET LATEST LOCATION
// =====================================

router.get(
    '/:vehicleId/latest',

    async (req, res) => {

        try {

            const { vehicleId } = req.params;

            const location =
            await LocationService.getLatestLocation(
                vehicleId
            );

            if (!location) {

                return res.status(404).json({

                    success: false,

                    error:
                    "No location found"
                });
            }

            res.json({

                success: true,

                data: location
            });

        } catch (error) {

            console.error(
                "Latest location error:",
                error
            );

            res.status(500).json({

                success: false,

                error:
                "Failed to fetch latest location"
            });
        }
    }
);

module.exports = router;