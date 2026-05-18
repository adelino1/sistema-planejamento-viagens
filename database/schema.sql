-- Script de Criação do Banco de Dados: Sistema de Planejamento de Viagens
-- Banco de Dados: travel_planner_db
-- Moeda Base do Sistema: Kwanza (AOA)

CREATE DATABASE IF NOT EXISTS travel_planner_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE travel_planner_db;

-- Tabela: users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela: trips
CREATE TABLE IF NOT EXISTS trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL, -- Ex: "Luanda, Angola" ou "Paris, França"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget_aoa DECIMAL(15, 2) DEFAULT 0.00, -- Orçamento armazenado nativamente em Kwanza
    cover_image VARCHAR(500) DEFAULT NULL, -- URL de imagens de alta qualidade
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela: trip_participants
CREATE TABLE IF NOT EXISTS trip_participants (
    trip_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (trip_id, user_id),
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela: itinerary_days
CREATE TABLE IF NOT EXISTS itinerary_days (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    day_date DATE NOT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

-- Tabela: activities
CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    itinerary_day_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    start_time TIME DEFAULT NULL,
    end_time TIME DEFAULT NULL,
    location_name VARCHAR(255) DEFAULT NULL,
    place_id VARCHAR(255) DEFAULT NULL, -- ID do Google Places
    latitude DECIMAL(10, 8) DEFAULT NULL,
    longitude DECIMAL(11, 8) DEFAULT NULL,
    cost_aoa DECIMAL(15, 2) DEFAULT 0.00, -- Custo local ou estimado, armazenado em Kwanza
    original_cost DECIMAL(15, 2) DEFAULT 0.00,
    original_currency VARCHAR(3) DEFAULT 'AOA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (itinerary_day_id) REFERENCES itinerary_days(id) ON DELETE CASCADE
);

-- Tabela: expenses
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    payer_user_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount_aoa DECIMAL(15, 2) NOT NULL, -- Valor em Kwanza
    original_amount DECIMAL(15, 2) NOT NULL,
    original_currency VARCHAR(3) DEFAULT 'AOA', -- Moeda original da transação (ex: USD, EUR, AOA)
    date DATE NOT NULL,
    category ENUM('accommodation', 'transportation', 'food', 'activities', 'other') DEFAULT 'other',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (payer_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela: expense_splits (Divisão da despesa estilo Splitwise)
CREATE TABLE IF NOT EXISTS expense_splits (
    expense_id INT NOT NULL,
    user_id INT NOT NULL,
    owed_amount_aoa DECIMAL(15, 2) NOT NULL, -- Parte da despesa devida por este usuário em Kwanza
    PRIMARY KEY (expense_id, user_id),
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela: reservations
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    type ENUM('flight', 'hotel', 'car', 'other') NOT NULL,
    provider VARCHAR(255) NOT NULL, -- Ex: "TAAG", "Emirates", "Epic Sana"
    confirmation_number VARCHAR(100) DEFAULT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME DEFAULT NULL,
    cost_aoa DECIMAL(15, 2) DEFAULT 0.00,
    file_url VARCHAR(500) DEFAULT NULL, -- URL para o comprovante em PDF ou Imagem
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);
