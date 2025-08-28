-- Create database (run once)
CREATE DATABASE IF NOT EXISTS gallery_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gallery_app;

-- Images table (Cloudinary fields included for Step 2)
CREATE TABLE IF NOT EXISTS images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(500) NOT NULL,   -- full URL to image
  public_id VARCHAR(255) NOT NULL,   -- Cloudinary public_id (placeholder for now)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional seed data
INSERT INTO images (image_url, public_id)
VALUES 
('https://example.com/placeholder1.jpg', 'placeholder_1'),
('https://example.com/placeholder2.jpg', 'placeholder_2');
