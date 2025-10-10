-- =============================================
-- AUDIT TRIGGER FUNCTIONS - PostgreSQL
-- automatic write log for important table
-- =============================================

-- Function helper to get user information
CREATE OR REPLACE FUNCTION get_current_user_info()
RETURNS TABLE (
    current_username VARCHAR,
    current_app VARCHAR,
    current_host VARCHAR
) AS $$
BEGIN
    RETURN QUERY SELECT 
        CURRENT_USER::VARCHAR,
        COALESCE(current_setting('application_name', true), 'unknown')::VARCHAR,
        inet_client_addr()::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGER FUNCTION for MedicalRecords
-- =============================================

-- Trigger function for INSERT
CREATE OR REPLACE FUNCTION trg_medicalrecords_insert_audit()
RETURNS TRIGGER AS $$
DECLARE
    v_username VARCHAR;
    v_app VARCHAR;
    v_host VARCHAR;
BEGIN
    SELECT current_username, current_app, current_host 
    INTO v_username, v_app, v_host
    FROM get_current_user_info();
    
    INSERT INTO AuditLog (
        event_type, 
        table_name, 
        username, 
        status, 
        details, 
        application_name, 
        host_name
    )
    VALUES (
        'INSERT',
        'MedicalRecords',
        v_username,
        'SUCCESS',
        format('RecordID: %s, PatientID: %s, Diagnosis: %s', 
            NEW.recordid, 
            NEW.patientid, 
            COALESCE(NEW.diagnosis, 'N/A')
        ),
        v_app,
        v_host
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for UPDATE
CREATE OR REPLACE FUNCTION trg_medicalrecords_update_audit()
RETURNS TRIGGER AS $$
DECLARE
    v_username VARCHAR;
    v_app VARCHAR;
    v_host VARCHAR;
BEGIN
    SELECT current_username, current_app, current_host 
    INTO v_username, v_app, v_host
    FROM get_current_user_info();
    
    INSERT INTO AuditLog (
        event_type, 
        table_name, 
        username, 
        status, 
        details, 
        application_name, 
        host_name
    )
    VALUES (
        'UPDATE',
        'MedicalRecords',
        v_username,
        'SUCCESS',
        format('RecordID: %s | Old Diagnosis: %s | New Diagnosis: %s | Old Treatment: %s | New Treatment: %s',
            NEW.recordid,
            COALESCE(OLD.diagnosis, 'N/A'),
            COALESCE(NEW.diagnosis, 'N/A'),
            COALESCE(OLD.treatment, 'N/A'),
            COALESCE(NEW.treatment, 'N/A')
        ),
        v_app,
        v_host
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for DELETE
CREATE OR REPLACE FUNCTION trg_medicalrecords_delete_audit()
RETURNS TRIGGER AS $$
DECLARE
    v_username VARCHAR;
    v_app VARCHAR;
    v_host VARCHAR;
BEGIN
    SELECT current_username, current_app, current_host 
    INTO v_username, v_app, v_host
    FROM get_current_user_info();
    
    INSERT INTO AuditLog (
        event_type, 
        table_name, 
        username, 
        status, 
        details, 
        application_name, 
        host_name
    )
    VALUES (
        'DELETE',
        'MedicalRecords',
        v_username,
        'SUCCESS',
        format('RecordID: %s, PatientID: %s, Diagnosis: %s',
            OLD.recordid,
            OLD.patientid,
            COALESCE(OLD.diagnosis, 'N/A')
        ),
        v_app,
        v_host
    );
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- attach triggers to MedicalRecords
DROP TRIGGER IF EXISTS medicalrecords_insert_audit ON MedicalRecords;
CREATE TRIGGER medicalrecords_insert_audit
    AFTER INSERT ON MedicalRecords
    FOR EACH ROW
    EXECUTE FUNCTION trg_medicalrecords_insert_audit();

DROP TRIGGER IF EXISTS medicalrecords_update_audit ON MedicalRecords;
CREATE TRIGGER medicalrecords_update_audit
    AFTER UPDATE ON MedicalRecords
    FOR EACH ROW
    EXECUTE FUNCTION trg_medicalrecords_update_audit();

DROP TRIGGER IF EXISTS medicalrecords_delete_audit ON MedicalRecords;
CREATE TRIGGER medicalrecords_delete_audit
    AFTER DELETE ON MedicalRecords
    FOR EACH ROW
    EXECUTE FUNCTION trg_medicalrecords_delete_audit();

-- =============================================
-- TRIGGER FUNCTION for Patients
-- =============================================

CREATE OR REPLACE FUNCTION trg_patients_insert_audit()
RETURNS TRIGGER AS $$
DECLARE
    v_username VARCHAR;
    v_app VARCHAR;
    v_host VARCHAR;
BEGIN
    SELECT current_username, current_app, current_host 
    INTO v_username, v_app, v_host
    FROM get_current_user_info();
    
    INSERT INTO AuditLog (
        event_type, 
        table_name, 
        username, 
        status, 
        details, 
        application_name, 
        host_name
    )
    VALUES (
        'INSERT',
        'Patients',
        v_username,
        'SUCCESS',
        format('PatientID: %s, Name: %s', NEW.patientid, NEW.fullname),
        v_app,
        v_host
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_patients_update_audit()
RETURNS TRIGGER AS $$
DECLARE
    v_username VARCHAR;
    v_app VARCHAR;
    v_host VARCHAR;
BEGIN
    SELECT current_username, current_app, current_host 
    INTO v_username, v_app, v_host
    FROM get_current_user_info();
    
    INSERT INTO AuditLog (
        event_type, 
        table_name, 
        username, 
        status, 
        details, 
        application_name, 
        host_name
    )
    VALUES (
        'UPDATE',
        'Patients',
        v_username,
        'SUCCESS',
        format('PatientID: %s | Updated fields recorded', NEW.patientid),
        v_app,
        v_host
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- attach triggers into Patients
DROP TRIGGER IF EXISTS patients_insert_audit ON Patients;
CREATE TRIGGER patients_insert_audit
    AFTER INSERT ON Patients
    FOR EACH ROW
    EXECUTE FUNCTION trg_patients_insert_audit();

DROP TRIGGER IF EXISTS patients_update_audit ON Patients;
CREATE TRIGGER patients_update_audit
    AFTER UPDATE ON Patients
    FOR EACH ROW
    EXECUTE FUNCTION trg_patients_update_audit();

-- =============================================
-- TRIGGER FUNCTION for Appointments
-- =============================================

CREATE OR REPLACE FUNCTION trg_appointments_audit()
RETURNS TRIGGER AS $$
DECLARE
    v_username VARCHAR;
    v_app VARCHAR;
    v_host VARCHAR;
    v_event_type VARCHAR;
BEGIN
    SELECT current_username, current_app, current_host 
    INTO v_username, v_app, v_host
    FROM get_current_user_info();
    
    -- Xác định event type
    IF TG_OP = 'INSERT' THEN
        v_event_type := 'INSERT';
    ELSIF TG_OP = 'UPDATE' THEN
        v_event_type := 'UPDATE';
    END IF;
    
    INSERT INTO AuditLog (
        event_type, 
        table_name, 
        username, 
        status, 
        details, 
        application_name, 
        host_name
    )
    VALUES (
        v_event_type,
        'Appointments',
        v_username,
        'SUCCESS',
        format('AppointmentID: %s, PatientID: %s', NEW.appointmentid, NEW.patientid),
        v_app,
        v_host
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- attach trigger to Appointments
DROP TRIGGER IF EXISTS appointments_audit ON Appointments;
CREATE TRIGGER appointments_audit
    AFTER INSERT OR UPDATE ON Appointments
    FOR EACH ROW
    EXECUTE FUNCTION trg_appointments_audit();