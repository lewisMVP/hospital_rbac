-- Query 2: NURSE ROLE TEST (Quyền: SELECT Patients, SELECT MedicalRecords)
SET ROLE nurse;
SELECT * FROM Patients;                     -- ✅ được phép (SELECT Patients)
SELECT * FROM MedicalRecords;               -- ✅ được phép (SELECT MedicalRecords)
INSERT INTO Patients (first_name, last_name) VALUES ('Test', 'Nurse'); -- ❌ bị cấm (INSERT Patients - BÁO LỖI 'permission denied')
UPDATE MedicalRecords SET diagnosis = 'Change' WHERE record_id = 1;    -- ❌ bị cấm (UPDATE MedicalRecords - BÁO LỖI 'permission denied')
RESET ROLE;