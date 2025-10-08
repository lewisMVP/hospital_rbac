-- Query 3: RECEPTION ROLE TEST (Quyền: SELECT/INSERT Appointments/Patients)
SET ROLE receptionist;
INSERT INTO Patients (first_name, last_name, phone)
VALUES ('John', 'Doe', '123456789');        -- ✅ được phép (INSERT Patients - Sẽ thành công sau khi sửa Sequence)
SELECT * FROM MedicalRecords;               -- ❌ bị cấm (SELECT MedicalRecords - BÁO LỖI 'permission denied')
INSERT INTO Appointments (patient_id, doctor_id, appointment_date)
VALUES (1, 2, CURRENT_TIMESTAMP + interval '1 day'); -- ✅ được phép (INSERT Appointments)
RESET ROLE;