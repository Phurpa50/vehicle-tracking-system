-- Database schema for TrackNet
-- Run this SQL to create the database and tables

CREATE DATABASE IF NOT EXISTS tracknet;
USE tracknet;

DROP TABLE IF EXISTS vehicle_locations;
DROP TABLE IF EXISTS vehicles;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE vehicles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    vehicle_id VARCHAR(50) UNIQUE NOT NULL,
    registration_time DATETIME NOT NULL,
    status ENUM('active', 'offline', 'error') DEFAULT 'active',
    lat DECIMAL(10, 8) DEFAULT 0.00000000,
    lng DECIMAL(11, 8) DEFAULT 0.00000000,
    last_location_update TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Vehicle location history (optional, for tracking history)
CREATE TABLE vehicle_locations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    vehicle_id VARCHAR(36) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    altitude DECIMAL(8, 2) DEFAULT 0.00,
    satellite INT DEFAULT 0,
    speed_kmh DECIMAL(6, 2) DEFAULT 0.00,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_timestamp (vehicle_id, timestamp)
);

-- Indexes for better performance
CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicle_locations_vehicle_id ON vehicle_locations(vehicle_id);
