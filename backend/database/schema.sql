-- Reconstructed development schema from API queries; not a production export.
-- Import into a NEW disposable database. No guest or admin records are included.
CREATE TABLE rooms (
 id INT UNSIGNED PRIMARY KEY,
 slug VARCHAR(120) NOT NULL UNIQUE,
 price DECIMAL(10,2) NOT NULL,
 available TINYINT(1) NOT NULL DEFAULT 1,
 inventory_count INT UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE admins (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 email VARCHAR(190) NOT NULL UNIQUE,
 password_hash VARCHAR(255) NOT NULL,
 role VARCHAR(20) NOT NULL DEFAULT 'admin',
 failed_attempts INT UNSIGNED NOT NULL DEFAULT 0,
 locked_until DATETIME NULL,
 last_login_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE bookings (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 booking_code VARCHAR(64) NOT NULL UNIQUE,
 room_id INT UNSIGNED NULL,
 room_name VARCHAR(120) NOT NULL,
 guest_name VARCHAR(150) NOT NULL,
 guest_email VARCHAR(254) NOT NULL,
 guest_phone VARCHAR(50) NULL,
 check_in DATE NOT NULL,
 check_out DATE NOT NULL,
 nights INT UNSIGNED NOT NULL,
 rooms_count INT UNSIGNED NOT NULL,
 adults INT UNSIGNED NOT NULL,
 children INT UNSIGNED NOT NULL DEFAULT 0,
 infants INT UNSIGNED NOT NULL DEFAULT 0,
 price_per_night DECIMAL(10,2) NOT NULL,
 total_price DECIMAL(12,2) NOT NULL,
 status VARCHAR(20) NOT NULL DEFAULT 'pending',
 admin_notes TEXT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 INDEX availability_lookup (room_id, status, check_in, check_out),
 CONSTRAINT booking_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Synthetic inventory for local development; not actual hotel availability.
INSERT INTO rooms (id, slug, price, inventory_count) VALUES
 (1, 'deluxe-queen-suite', 100.00, 2),
 (2, 'deluxe-double-room-with-bath', 55.00, 4),
 (3, 'family-studio', 80.00, 2),
 (4, 'deluxe-triple-room', 65.00, 2);
