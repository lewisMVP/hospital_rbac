--Role Test
SET ROLE doctor;
SELECT * FROM Patients;                     -- ✅ được phép
INSERT INTO MedicalRecords (patient_id, doctor_id, diagnosis, treatment_notes)
VALUES (1, 2, 'Flu', 'Rest and hydration'); -- ✅ được phép
DELETE FROM MedicalRecords WHERE record_id = 1; -- ❌ bị cấm
RESET ROLE;

SET ROLE nurse;
SELECT * FROM Patients;                     -- ✅ được phép
INSERT INTO Patients (first_name, last_name) VALUES ('Test', 'Nurse'); -- ❌ bị cấm
UPDATE MedicalRecords SET diagnosis = 'Change' WHERE record_id = 1;    -- ❌ bị cấm
RESET ROLE;

SET ROLE receptionist;
INSERT INTO Patients (first_name, last_name, phone)
VALUES ('John', 'Doe', '123456789');        -- ✅ được phép
SELECT * FROM MedicalRecords;               -- ❌ bị cấm
INSERT INTO Appointments (patient_id, doctor_id, appointment_date)
VALUES (1, 2, CURRENT_TIMESTAMP + interval '1 day'); -- ✅ được phép
RESET ROLE;

SET ROLE billing;
SELECT patient_id, first_name, last_name FROM Patients; -- ✅ được phép
SELECT * FROM MedicalRecords;                           -- ❌ bị cấm
RESET ROLE;

SET ROLE admin;
SELECT * FROM Users;      -- ✅ toàn quyền
DELETE FROM Patients WHERE patient_id = 1; -- ✅ toàn quyền
RESET ROLE;

-Kiểm tra danh sách quyền đã cấp(chạy dưới tài khoản postgres hoặc sys_admin)
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
ORDER BY grantee, table_name;

