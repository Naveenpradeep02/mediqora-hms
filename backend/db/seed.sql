-- Seeds data for Shree Ram Homeo
CREATE DATABASE IF NOT EXISTS shreeram_homeo;
USE shreeram_homeo;

-- Insert Branches with exact visiting card addresses, phone numbers & operating hours
INSERT INTO branches (id, name, slug, address, phone, morning_open, morning_close, evening_open, evening_close, sunday_morning_open, sunday_morning_close, sunday_evening_open, sunday_evening_close, is_sunday_open, is_active) VALUES
(1, 'Shree Ram Homeo - Anna Nagar', 'anna-nagar', 'G-2, Firm Foundation, Plot No: 3738, 6/22, 17th Street, Q Block, Anna Nagar, Chennai - 600040 (Near K4 Police Station)', '+91 95515 19766', NULL, NULL, '16:00', '18:00', NULL, NULL, NULL, NULL, 0, 1),
(2, 'Shree Ram Homeo - West Mambalam / T Nagar', 't-nagar', '58, Arya Gowder Road, West Mambalam, Chennai - 600033 (Near Panigraha Marriage Hall)', '044 2483 7465', '10:00', '14:00', '18:30', '21:00', '11:00', '14:00', NULL, NULL, 1, 1)
ON DUPLICATE KEY UPDATE 
  name = VALUES(name),
  address = VALUES(address),
  phone = VALUES(phone),
  morning_open = VALUES(morning_open),
  morning_close = VALUES(morning_close),
  evening_open = VALUES(evening_open),
  evening_close = VALUES(evening_close),
  sunday_morning_open = VALUES(sunday_morning_open),
  sunday_morning_close = VALUES(sunday_morning_close),
  is_sunday_open = VALUES(is_sunday_open);

-- Insert Services
INSERT INTO services (id, name, description, icon_name, display_order, is_active) VALUES
(1, 'General Homeopathic Consultation', 'Comprehensive health assessment and constitutional remedy prescription', 'Stethoscope', 1, 1),
(2, 'Chronic Illness Care', 'Long-term management for skin, respiratory, digestive, and autoimmune conditions', 'Activity', 2, 1),
(3, 'Pediatric & Immunity Care', 'Gentle and safe homeopathic treatments for children and infants', 'HeartPulse', 3, 1),
(4, 'Women\'s Health & Wellness', 'Specialized homeopathic care for hormonal balance, PCOD, thyroid, and wellness', 'Sparkles', 4, 1)
ON DUPLICATE KEY UPDATE 
  name = VALUES(name),
  description = VALUES(description);

-- Insert Default Users for RRK Clinic & Super Admin
-- Password Hashes:
-- admin123: $2b$10$2l1ZJekf/83b3aEms5rLweq803yF9t2B5O7eKjP0w1.nFwPjNlmWy
-- superadmin123: $2b$10$wN1rFj0V5.cK4M8.5jYyweCjKk2t9N2.K7f2H9eJ0m1.nFwPjNlmWy
INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'RRK Hospital Administrator', 'admin@rrkclinic.com', '$2b$10$2l1ZJekf/83b3aEms5rLweq803yF9t2B5O7eKjP0w1.nFwPjNlmWy', 'admin'),
(2, 'Dr. R.R. Rajan', 'dr.rajan@rrkclinic.com', '$2b$10$2l1ZJekf/83b3aEms5rLweq803yF9t2B5O7eKjP0w1.nFwPjNlmWy', 'doctor'),
(3, 'Srija', 'info@mediqora.in', '$2b$10$wN1rFj0V5.cK4M8.5jYyweCjKk2t9N2.K7f2H9eJ0m1.nFwPjNlmWy', 'superadmin')
ON DUPLICATE KEY UPDATE 
  name = VALUES(name),
  email = VALUES(email),
  password_hash = VALUES(password_hash),
  role = VALUES(role);

