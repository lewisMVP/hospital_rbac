INSERT INTO Roles (role_name) VALUES ('Doctor'), ('Nurse'), ('Receptionist');
INSERT INTO Users (username, password_hash, role_id) VALUES 
    ('doctor1', 'hashed_pass', 1),  -- Role Doctor
    ('nurse1', 'hashed_pass', 2);   -- Role Nurse
    
INSERT INTO Patients (first_name, last_name, date_of_birth, address, created_by) 
VALUES ('Nguyễn', 'Văn A', '1990-01-01', 'Hà Nội', 1);  -- Tạo bởi doctor1

INSERT INTO Appointments (patient_id, doctor_id, appointment_date, notes, created_by) 
VALUES (1, 1, '2025-10-10 09:00:00', 'Kiểm tra sức khỏe', 1);

INSERT INTO MedicalRecords (patient_id, doctor_id, diagnosis, treatment_notes, created_by) 
VALUES (1, 1, 'Bình thường', 'Uống thuốc', 1);

SELECT * FROM Patients;
SELECT * FROM Appointments;
SELECT * FROM MedicalRecords;