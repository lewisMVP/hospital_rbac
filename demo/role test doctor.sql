-- Query 1: DOCTOR ROLE TEST (Quyền: SELECT Patients, SELECT/INSERT/UPDATE MedicalRecords)
SET ROLE doctor;
SELECT * FROM Patients;                     -- ✅ được phép (SELECT)
INSERT INTO MedicalRecords (patient_id, doctor_id, diagnosis, treatment_notes)
VALUES (1, 2, 'Flu', 'Rest and hydration'); -- ✅ được phép (INSERT - Sẽ thành công sau khi sửa Sequence)
UPDATE MedicalRecords SET diagnosis = 'Updated by Doctor' WHERE record_id = 1; -- ✅ được phép (UPDATE)
DELETE FROM MedicalRecords WHERE record_id = 1; -- ❌ bị cấm (DELETE - BÁO LỖI 'permission denied')
RESET ROLE;