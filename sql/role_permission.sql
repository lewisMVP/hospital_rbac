--Role Table
CREATE ROLE admin;
CREATE ROLE doctor;
CREATE ROLE nurse;
CREATE ROLE receptionist;
CREATE ROLE billing;

--Patient Table
GRANT SELECT, INSERT, UPDATE, DELETE ON Patients TO admin;
GRANT SELECT ON Patients TO doctor;
GRANT SELECT ON Patients TO nurse;
GRANT SELECT, INSERT ON Patients TO receptionist;
GRANT SELECT ON Patients TO billing;


--Medicalrecords Table
GRANT SELECT, INSERT, UPDATE, DELETE ON MedicalRecords TO admin;
GRANT SELECT, INSERT, UPDATE ON MedicalRecords TO doctor;
GRANT SELECT ON MedicalRecords TO nurse;
-- Receptionist & Billing khong co quyen truy cap ho so benh an

--Appointment table
GRANT SELECT, INSERT, UPDATE, DELETE ON Appointments TO admin;
GRANT SELECT ON Appointments TO doctor;
GRANT SELECT ON Appointments TO nurse;
GRANT SELECT, INSERT, UPDATE, DELETE ON Appointments TO receptionist;

--User table
GRANT SELECT, INSERT, UPDATE, DELETE ON Users TO admin;

--Roles Table
GRANT SELECT, INSERT, UPDATE, DELETE ON Roles TO admin;


--Create User for each role
CREATE USER sys_admin WITH PASSWORD '12345';
CREATE USER dr_smith WITH PASSWORD '12345';
CREATE USER nurse_anna WITH PASSWORD '12345';
CREATE USER reception_john WITH PASSWORD '12345';
CREATE USER billing_mary WITH PASSWORD '12345';

--Gan vai tro
GRANT admin TO sys_admin;
GRANT doctor TO dr_smith;
GRANT nurse TO nurse_anna;
GRANT receptionist TO reception_john;
GRANT billing TO billing_mary;
