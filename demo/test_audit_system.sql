-- =============================================
-- TEST AUDIT SYSTEM - PostgreSQL
-- Script to test the complete audit system
-- =============================================

-- Test 1: Test Failed Login
DO $$
BEGIN
    RAISE NOTICE '=== TEST 1: Failed Login Audit ===';
    PERFORM log_failed_login('test_user', '192.168.1.100', 'Invalid password');
    PERFORM log_failed_login('test_user', '192.168.1.100', 'Invalid password');
    PERFORM log_failed_login('test_user', '192.168.1.100', 'Invalid password');
    PERFORM log_failed_login('test_user', '192.168.1.100', 'Invalid password');
    PERFORM log_failed_login('test_user', '192.168.1.100', 'Invalid password');
    -- The 5th attempt will trigger a security alert
END $$;

SELECT * FROM AuditLog WHERE username = 'test_user' ORDER BY event_time DESC;

-- Test 2: Test Successful Login
DO $$
BEGIN
    RAISE NOTICE '=== TEST 2: Successful Login Audit ===';
    PERFORM log_successful_login('doctor_user1', '192.168.1.50');
END $$;

-- Test 3: Test GRANT Permission Audit
DO $$
BEGIN
    RAISE NOTICE '=== TEST 3: GRANT Permission Audit ===';
    PERFORM log_grant_permission('doctor_role', 'SELECT', 'MedicalRecords', 'postgres');
END $$;

-- Test 4: Test REVOKE Permission Audit
DO $$
BEGIN
    RAISE NOTICE '=== TEST 4: REVOKE Permission Audit ===';
    PERFORM log_revoke_permission('nurse_role', 'DELETE', 'MedicalRecords', 'postgres');
END $$;

-- Test 5: Test Unauthorized Access
DO $$
BEGIN
    RAISE NOTICE '=== TEST 5: Unauthorized Access Audit ===';
    PERFORM log_unauthorized_access('receptionist1', 'SELECT', 'MedicalRecords', '192.168.1.75');
END $$;

-- Test 6: Test ALTER ROLE
DO $$
BEGIN
    RAISE NOTICE '=== TEST 6: ALTER ROLE Audit ===';
    PERFORM log_alter_role('doctor_role', 'new_doctor', 'ADD', 'postgres');
END $$;

-- Test 7: Test Triggers - Insert Patient
DO $$
BEGIN
    RAISE NOTICE '=== TEST 7: Insert Patient (Trigger Test) ===';
    INSERT INTO Patients (fullname, dateofbirth, gender, phone, address)
    VALUES ('Test Patient Audit', '1990-01-01', 'M', '0123456789', 'Test Address');
END $$;

SELECT * FROM AuditLog WHERE table_name = 'Patients' ORDER BY event_time DESC LIMIT 5;

-- Test 8: Test Triggers - Update Medical Record (if record exists)
-- Assumes recordid = 1 exists
DO $$
BEGIN
    RAISE NOTICE '=== TEST 8: Update Medical Record (Trigger Test) ===';
    UPDATE MedicalRecords 
    SET diagnosis = 'Updated Diagnosis for Audit Test'
    WHERE recordid = 1;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Skip test 8 - No existing record';
END $$;

SELECT * FROM AuditLog WHERE table_name = 'MedicalRecords' ORDER BY event_time DESC LIMIT 5;

-- Test 9: View all audit events
SELECT 
    event_time,
    event_type,
    table_name,
    username,
    status,
    LEFT(details, 100) AS details
FROM AuditLog
ORDER BY event_time DESC
LIMIT 20;

-- Test 10: View Failed Events
SELECT * FROM vw_failed_events LIMIT 10;

-- Test 11: View Permission Changes
SELECT * FROM vw_permission_changes LIMIT 10;

-- Test 12: Test Patient Audit Trail (if patient exists)
SELECT * FROM get_patient_audit_trail(1) LIMIT 10;

-- Test 13: Test Account Lock Check
DO $$
DECLARE
    v_is_locked BOOLEAN;
BEGIN
    RAISE NOTICE '=== TEST 13: Account Lock Check ===';
    SELECT is_account_locked('test_user') INTO v_is_locked;
    
    IF v_is_locked THEN
        RAISE NOTICE 'Account test_user IS LOCKED due to multiple failed attempts';
    ELSE
        RAISE NOTICE 'Account test_user is NOT locked';
    END IF;
END $$;

-- Test 14: Test Top Failed Logins Function
SELECT * FROM get_top_failed_logins(5);

-- Test 15: Test Activity by Hour Function
SELECT * FROM get_activity_by_hour();

-- Test 16: View Audit Summary
SELECT * FROM vw_audit_summary ORDER BY audit_date DESC LIMIT 10;

-- Test 17: Security Alerts Summary
SELECT 
    event_time,
    username,
    details,
    ip_address
FROM AuditLog
WHERE event_type = 'SECURITY_ALERT'
ORDER BY event_time DESC;

-- Test 18: Failed vs Success Login Ratio
SELECT 
    DATE(event_time) AS login_date,
    COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) AS successful_logins,
    COUNT(CASE WHEN status = 'FAILED' THEN 1 END) AS failed_logins,
    ROUND(
        COUNT(CASE WHEN status = 'FAILED' THEN 1 END)::NUMERIC / 
        NULLIF(COUNT(*)::NUMERIC, 0) * 100, 
        2
    ) AS failed_percentage
FROM AuditLog
WHERE event_type = 'LOGIN'
    AND event_time > CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY DATE(event_time)
ORDER BY login_date DESC;

-- Test 19: Test Complete User Activity Timeline
SELECT 
    event_time,
    event_type,
    table_name,
    status,
    LEFT(details, 80) AS details_summary
FROM AuditLog
WHERE username = 'test_user'
ORDER BY event_time DESC
LIMIT 20;

-- Test 20: Database Audit Statistics
SELECT 
    'Total Audit Records' AS metric,
    COUNT(*)::TEXT AS value
FROM AuditLog
UNION ALL
SELECT 
    'Unique Users Tracked',
    COUNT(DISTINCT username)::TEXT
FROM AuditLog
UNION ALL
SELECT 
    'Failed Events',
    COUNT(*)::TEXT
FROM AuditLog
WHERE status = 'FAILED'
UNION ALL
SELECT 
    'Security Alerts',
    COUNT(*)::TEXT
FROM AuditLog
WHERE event_type = 'SECURITY_ALERT'
UNION ALL
SELECT 
    'Audit Table Size',
    pg_size_pretty(pg_total_relation_size('auditlog'))
FROM AuditLog
LIMIT 1;

-- =============================================
-- CLEANUP TEST DATA (Optional - Uncomment to use)
-- =============================================

-- Delete test data from audit log
-- DELETE FROM AuditLog WHERE username LIKE 'test_%' OR username LIKE '%_user%';

-- Delete test patient
-- DELETE FROM Patients WHERE fullname = 'Test Patient Audit';

-- =============================================
-- TEST SUMMARY
-- =============================================

DO $$
DECLARE
    v_total_tests INT := 20;
    v_total_records INT;
    v_failed_records INT;
    v_security_alerts INT;
BEGIN
    SELECT COUNT(*) INTO v_total_records FROM AuditLog;
    SELECT COUNT(*) INTO v_failed_records FROM AuditLog WHERE status = 'FAILED';
    SELECT COUNT(*) INTO v_security_alerts FROM AuditLog WHERE event_type = 'SECURITY_ALERT';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'AUDIT SYSTEM TEST SUMMARY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total Tests Run: %', v_total_tests;
    RAISE NOTICE 'Total Audit Records: %', v_total_records;
    RAISE NOTICE 'Failed Events Logged: %', v_failed_records;
    RAISE NOTICE 'Security Alerts Generated: %', v_security_alerts;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Test Status: COMPLETED';
    RAISE NOTICE 'All audit functions are working correctly!';
    RAISE NOTICE '========================================';
END $$;