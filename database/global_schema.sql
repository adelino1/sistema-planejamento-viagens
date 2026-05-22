-- database/global_schema.sql

USE tripnomad;

-- Expand Users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS surname VARCHAR(255) AFTER name,
ADD COLUMN IF NOT EXISTS country VARCHAR(100) AFTER email,
ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'pt' AFTER country,
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD' AFTER language,
ADD COLUMN IF NOT EXISTS profile_image VARCHAR(512) AFTER currency;

-- Continents
CREATE TABLE IF NOT EXISTS continents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Countries
CREATE TABLE IF NOT EXISTS countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    continent_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    FOREIGN KEY (continent_id) REFERENCES continents(id) ON DELETE CASCADE
);

-- Destinations (Cities/Regions)
CREATE TABLE IF NOT EXISTS destinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    history TEXT,
    culture TEXT,
    climate VARCHAR(255),
    best_time_to_visit VARCHAR(255),
    average_cost DECIMAL(10,2),
    local_currency VARCHAR(50),
    local_language VARCHAR(100),
    safety_tips TEXT,
    transport_tips TEXT,
    cover_image VARCHAR(512),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
);

-- Destination Images (Gallery)
CREATE TABLE IF NOT EXISTS destination_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destination_id INT NOT NULL,
    image_url VARCHAR(512) NOT NULL,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

-- Hotels
CREATE TABLE IF NOT EXISTS hotels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destination_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    stars INT DEFAULT 3,
    price_per_night DECIMAL(10,2),
    amenities TEXT,
    image_url VARCHAR(512),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

-- Restaurants
CREATE TABLE IF NOT EXISTS restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destination_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cuisine_type VARCHAR(100),
    price_range VARCHAR(50),
    image_url VARCHAR(512),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_type ENUM('destination', 'hotel', 'restaurant', 'trip') NOT NULL,
    item_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, item_type, item_id)
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_type ENUM('destination', 'hotel', 'restaurant') NOT NULL,
    item_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
