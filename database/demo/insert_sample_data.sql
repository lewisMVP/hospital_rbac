-- ============================================
-- SAMPLE DATA FOR TESTING
-- Run this after create_schema.sql
-- ============================================

-- Step 1: Insert Roles (nếu chưa có)
INSERT INTO Roles (role_name) VALUES 
('Admin'), 
('Doctor'), 
('Nurse'), 
('Receptionist'),
('Billing')
ON CONFLICT (role_name) DO NOTHING;

-- Tắt triggers trước khi insert
ALTER TABLE Patients DISABLE TRIGGER ALL;
ALTER TABLE Appointments DISABLE TRIGGER ALL;
ALTER TABLE MedicalRecords DISABLE TRIGGER ALL;

-- Step 2: Insert test users với password 'password'
-- Password hash: $2b$12$sMk6GEfr8eIi0bs61TzIJ.wdQrdCah/jHITfrx/sMPAY7dbPiD/EW
-- Login: username / password
INSERT INTO Users (username, password_hash, role_id) VALUES
('admin', '$2b$12$sMk6GEfr8eIi0bs61TzIJ.wdQrdCah/jHITfrx/sMPAY7dbPiD/EW', 
    (SELECT role_id FROM Roles WHERE role_name = 'Admin')),
('doctor1', '$2b$12$sMk6GEfr8eIi0bs61TzIJ.wdQrdCah/jHITfrx/sMPAY7dbPiD/EW', 
    (SELECT role_id FROM Roles WHERE role_name = 'Doctor')),
('nurse1', '$2b$12$sMk6GEfr8eIi0bs61TzIJ.wdQrdCah/jHITfrx/sMPAY7dbPiD/EW', 
    (SELECT role_id FROM Roles WHERE role_name = 'Nurse')),
('receptionist1', '$2b$12$sMk6GEfr8eIi0bs61TzIJ.wdQrdCah/jHITfrx/sMPAY7dbPiD/EW', 
    (SELECT role_id FROM Roles WHERE role_name = 'Receptionist'))
ON CONFLICT (username) DO NOTHING;

INSERT INTO Patients (first_name, last_name, date_of_birth, address, created_by) 
VALUES ('Nguyễn', 'Văn A', '1990-01-01', 'Hà Nội', 1);  -- Tạo bởi doctor1

INSERT INTO Appointments (patient_id, doctor_id, appointment_date, notes, created_by) 
VALUES (1, 1, '2025-10-10 09:00:00', 'Kiểm tra sức khỏe', 1);

INSERT INTO MedicalRecords (patient_id, doctor_id, diagnosis, treatment_notes, created_by) 
VALUES (1, 1, 'Bình thường', 'Uống thuốc', 1);

-- Bật lại triggers sau khi insert xong
ALTER TABLE Patients ENABLE TRIGGER ALL;
ALTER TABLE Appointments ENABLE TRIGGER ALL;
ALTER TABLE MedicalRecords ENABLE TRIGGER ALL;

-- Verification queries
SELECT 'Roles:' as info, COUNT(*) as count FROM Roles
UNION ALL
SELECT 'Users:', COUNT(*) FROM Users
UNION ALL
SELECT 'Patients:', COUNT(*) FROM Patients
UNION ALL
SELECT 'Appointments:', COUNT(*) FROM Appointments
UNION ALL
SELECT 'MedicalRecords:', COUNT(*) FROM MedicalRecords;

-- Show users with roles
SELECT 
    u.username,
    r.role_name,
    'Password: password' as login_info
FROM Users u
JOIN Roles r ON u.role_id = r.role_id
ORDER BY u.user_id;