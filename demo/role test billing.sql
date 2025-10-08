-- Query 4: BILLING ROLE TEST (Quyền: SELECT Patients)
SET ROLE billing;
SELECT patient_id, first_name, last_name FROM Patients; -- ✅ được phép (SELECT Patients)
SELECT * FROM MedicalRecords;                           -- ❌ bị cấm (SELECT MedicalRecords - BÁO LỖI 'permission denied')
RESET ROLE;