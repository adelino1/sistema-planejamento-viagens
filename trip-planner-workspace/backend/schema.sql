CREATE DATABASE IF NOT EXISTS tripnomad CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tripnomad;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trips (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    budget_level ENUM('economy', 'standard', 'luxury') DEFAULT 'standard',
    status ENUM('draft', 'planned', 'completed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(36) PRIMARY KEY,
    trip_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('attraction', 'restaurant', 'event', 'accommodation') NOT NULL,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    cost_estimate DECIMAL(10, 2),
    scheduled_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);
