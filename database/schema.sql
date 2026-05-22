-- database/schema.sql

CREATE DATABASE IF NOT EXISTS tripnomad;
USE tripnomad;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    cover_image VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Trip Days table (Groups items by day)
CREATE TABLE IF NOT EXISTS trip_days (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    day_date DATE NOT NULL,
    day_index INT NOT NULL, -- 1 for day 1, 2 for day 2, etc.
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

-- Trip Items table (Activities/Places)
CREATE TABLE IF NOT EXISTS trip_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_day_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    category ENUM('attraction', 'restaurant', 'hotel', 'event', 'custom') NOT NULL,
    start_time TIME,
    end_time TIME,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    cost_estimate DECIMAL(10, 2) DEFAULT 0.00,
    notes TEXT,
    order_index INT NOT NULL, -- Order within the day
    FOREIGN KEY (trip_day_id) REFERENCES trip_days(id) ON DELETE CASCADE
);
