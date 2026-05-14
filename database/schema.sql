-- Sistema de Planejamento de Viagens — modelo relacional inicial
-- MySQL 8+ / MariaDB 10.4+ (XAMPP)
-- Charset: utf8mb4 para suportar nomes e descrições internacionais

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS itinerary_activities;
DROP TABLE IF EXISTS itinerary_days;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------------
-- Utilizadores e autenticação
-- ---------------------------------------------------------------------------

CREATE TABLE users (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(190) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(120) NOT NULL,
    role            ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    preferred_lang  VARCHAR(5) NOT NULL DEFAULT 'pt' COMMENT 'pt | en',
    theme           ENUM('light', 'dark', 'system') NOT NULL DEFAULT 'system',
    is_active       TINYINT(1) NOT NULL DEFAULT 1,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_email (email),
    CONSTRAINT chk_users_lang CHECK (preferred_lang IN ('pt', 'en'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_sessions (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    token_hash      CHAR(64) NOT NULL COMMENT 'SHA-256 do token opaco',
    user_agent      VARCHAR(255) NULL,
    ip_address      VARCHAR(45) NULL,
    expires_at      DATETIME NOT NULL,
    revoked_at      DATETIME NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_sessions_token (token_hash),
    KEY idx_user_sessions_user (user_id),
    KEY idx_user_sessions_expires (expires_at),
    CONSTRAINT fk_user_sessions_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE password_reset_tokens (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    token_hash      CHAR(64) NOT NULL,
    expires_at      DATETIME NOT NULL,
    used_at         DATETIME NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_pwd_reset_token (token_hash),
    KEY idx_pwd_reset_user (user_id),
    CONSTRAINT fk_pwd_reset_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Viagens
-- ---------------------------------------------------------------------------

CREATE TABLE trips (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    name            VARCHAR(180) NOT NULL,
    country         VARCHAR(120) NOT NULL,
    city            VARCHAR(120) NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    budget_amount   DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    budget_currency CHAR(3) NOT NULL DEFAULT 'EUR',
    description     TEXT NULL,
    status          ENUM('draft', 'planned', 'ongoing', 'completed', 'cancelled') NOT NULL DEFAULT 'draft',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_trips_user_dates (user_id, start_date, end_date),
    CONSTRAINT fk_trips_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_trips_dates CHECK (end_date >= start_date),
    CONSTRAINT chk_trips_budget CHECK (budget_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Itinerário: um registo por dia de viagem
CREATE TABLE itinerary_days (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    trip_id         INT UNSIGNED NOT NULL,
    day_date        DATE NOT NULL,
    sort_order      SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    notes           TEXT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_itinerary_day_per_trip (trip_id, day_date),
    KEY idx_itinerary_days_trip (trip_id),
    CONSTRAINT fk_itinerary_days_trip
        FOREIGN KEY (trip_id) REFERENCES trips (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE itinerary_activities (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    day_id          INT UNSIGNED NOT NULL,
    title           VARCHAR(200) NOT NULL,
    location_name   VARCHAR(200) NULL,
    start_time      TIME NULL,
    end_time        TIME NULL,
    sort_order      SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    notes           TEXT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_activities_day (day_id),
    CONSTRAINT fk_activities_day
        FOREIGN KEY (day_id) REFERENCES itinerary_days (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Gastos / custos estimados ou reais
CREATE TABLE expenses (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    trip_id         INT UNSIGNED NOT NULL,
    category        VARCHAR(80) NOT NULL,
    amount          DECIMAL(12, 2) NOT NULL,
    currency        CHAR(3) NOT NULL DEFAULT 'EUR',
    description     VARCHAR(255) NULL,
    expense_date    DATE NOT NULL,
    is_estimated    TINYINT(1) NOT NULL DEFAULT 1,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_expenses_trip_date (trip_id, expense_date),
    CONSTRAINT fk_expenses_trip
        FOREIGN KEY (trip_id) REFERENCES trips (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_expenses_amount CHECK (amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reservas fictícias (laboratório)
CREATE TABLE bookings (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    trip_id         INT UNSIGNED NOT NULL,
    provider_name   VARCHAR(160) NOT NULL,
    booking_type    ENUM('flight', 'hotel', 'car', 'activity', 'other') NOT NULL DEFAULT 'other',
    reference_code  VARCHAR(80) NULL,
    start_datetime  DATETIME NULL,
    end_datetime    DATETIME NULL,
    amount          DECIMAL(12, 2) NULL,
    currency        CHAR(3) NOT NULL DEFAULT 'EUR',
    status          ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
    notes           TEXT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_bookings_trip (trip_id),
    CONSTRAINT fk_bookings_trip
        FOREIGN KEY (trip_id) REFERENCES trips (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Favoritos (destinos ou locais genéricos)
-- ---------------------------------------------------------------------------

CREATE TABLE favorites (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    favorite_type   ENUM('destination', 'place') NOT NULL,
    label           VARCHAR(200) NOT NULL,
    country         VARCHAR(120) NULL,
    city            VARCHAR(120) NULL,
    latitude        DECIMAL(10, 7) NULL,
    longitude       DECIMAL(10, 7) NULL,
    metadata_json   JSON NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_favorites_user (user_id),
    CONSTRAINT fk_favorites_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Notificações in-app
-- ---------------------------------------------------------------------------

CREATE TABLE notifications (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    notif_type      VARCHAR(60) NOT NULL COMMENT 'ex: trip_upcoming, budget_exceeded',
    title           VARCHAR(180) NOT NULL,
    body            TEXT NOT NULL,
    read_at         DATETIME NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_notifications_user_unread (user_id, read_at),
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
