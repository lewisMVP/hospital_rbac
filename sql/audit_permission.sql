-- =============================================
-- AUDIT: Permission Changes (GRANT/REVOKE) - PostgreSQL
-- =============================================

-- Function helper: Get current user information
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
        CAST(inet_client_addr() AS TEXT)::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- LOGIN/LOGOUT FUNCTIONS 
-- =============================================

-- Function: Log failed login
CREATE OR REPLACE FUNCTION log_failed_login(
    p_username VARCHAR,
    p_ip_address VARCHAR DEFAULT NULL,
    p_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_failed_count INT;
BEGIN
    INSERT INTO AuditLog (
        event_type, 
        table_name, 
        username, 
        status, 
        details, 
        ip_address,
        application_name,
        host_name
    )
    VALUES (
        'LOGIN',
        NULL,
        p_username,
        'FAILED',
        COALESCE(p_reason, 'Invalid credentials or insufficient permissions'),
        p_ip_address,
        current_setting('application_name', true),
        CAST(inet_client_addr() AS TEXT)
    );
    
    SELECT COUNT(*)
    INTO v_failed_count
    FROM AuditLog
    WHERE username = p_username
        AND event_type = 'LOGIN'
        AND status = 'FAILED'
        AND event_time > CURRENT_TIMESTAMP - INTERVAL '15 minutes';
    
    IF v_failed_count >= 5 THEN
        INSERT INTO AuditLog (
            event_type, 
            username, 
            status, 
            details,
            ip_address
        )
        VALUES (
            'SECURITY_ALERT',
            p_username,
            'WARNING',
            format('Multiple failed login attempts detected: %s attempts in 15 minutes', v_failed_count),
            p_ip_address
        );
        
        RAISE NOTICE 'SECURITY ALERT: User % has % failed login attempts from IP %', 
            p_username, v_failed_count, p_ip_address;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_failed_login IS 'Ghi log failed login và cảnh báo nếu có nhiều lần thử thất bại';

-- Function: Log successful login
CREATE OR REPLACE FUNCTION log_successful_login(
    p_username VARCHAR,
    p_ip_address VARCHAR DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO AuditLog (
        event_type, 
        username, 
        status, 
        details, 
        ip_address,
        application_name,
        host_name
    )
    VALUES (
        'LOGIN',
        p_username,
        'SUCCESS',
        'User successfully logged in',
        p_ip_address,
        current_setting('application_name', true),
        CAST(inet_client_addr() AS TEXT)
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_successful_login IS 'Ghi log successful login';

-- Function: Log logout
CREATE OR REPLACE FUNCTION log_logout(
    p_username VARCHAR
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO AuditLog (
        event_type, 
        username, 
        status, 
        details,
        application_name,
        host_name
    )
    VALUES (
        'LOGOUT',
        p_username,
        'SUCCESS',
        'User logged out',
        current_setting('application_name', true),
        CAST(inet_client_addr() AS TEXT)
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_logout IS 'Ghi log logout';

-- =============================================
-- PERMISSION CHANGE FUNCTIONS
-- =============================================

-- Function: Record GRANT permissions
CREATE OR REPLACE FUNCTION log_grant_permission(
    p_granted_to VARCHAR,
    p_permission VARCHAR,
    p_on_object VARCHAR,
    p_granted_by VARCHAR DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
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
        'GRANT',
        p_on_object,
        COALESCE(p_granted_by, CURRENT_USER),
        'SUCCESS',
        format('Permission: %s granted to: %s on: %s', p_permission, p_granted_to, p_on_object),
        current_setting('application_name', true),
        CAST(inet_client_addr() AS TEXT)
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_grant_permission IS 'Ghi log khi GRANT quyền cho user/role';

-- Function: Record REVOKE permissions
CREATE OR REPLACE FUNCTION log_revoke_permission(
    p_revoked_from VARCHAR,
    p_permission VARCHAR,
    p_on_object VARCHAR,
    p_revoked_by VARCHAR DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
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
        'REVOKE',
        p_on_object,
        COALESCE(p_revoked_by, CURRENT_USER),
        'SUCCESS',
        format('Permission: %s revoked from: %s on: %s', p_permission, p_revoked_from, p_on_object),
        current_setting('application_name', true),
        CAST(inet_client_addr() AS TEXT)
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_revoke_permission IS 'Ghi log khi REVOKE quyền từ user/role';

-- Function: Record Unauthorized Access Attempt
CREATE OR REPLACE FUNCTION log_unauthorized_access(
    p_username VARCHAR,
    p_attempted_action VARCHAR,
    p_on_table VARCHAR,
    p_ip_address VARCHAR DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO AuditLog (
        event_type, 
        table_name, 
        username, 
        status, 
        details,
        ip_address,
        application_name,
        host_name
    )
    VALUES (
        'UNAUTHORIZED_ACCESS',
        p_on_table,
        p_username,
        'FAILED',
        format('Attempted action: %s on table: %s - Permission Denied', p_attempted_action, p_on_table),
        p_ip_address,
        current_setting('application_name', true),
        CAST(inet_client_addr() AS TEXT)
    );
    
    -- Create security alerts
    INSERT INTO AuditLog (
        event_type, 
        username, 
        status, 
        details
    )
    VALUES (
        'SECURITY_ALERT',
        p_username,
        'WARNING',
        format('Unauthorized access attempt detected for user: %s', p_username)
    );
    
    -- Raise warning
    RAISE WARNING 'Unauthorized access attempt by user % on table %', p_username, p_on_table;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_unauthorized_access IS 'Ghi log khi có unauthorized access attempt';

-- Function: Record ALTER ROLE (add/delete member)
CREATE OR REPLACE FUNCTION log_alter_role(
    p_role_name VARCHAR,
    p_member_name VARCHAR,
    p_action VARCHAR, -- 'ADD' or 'DROP'
    p_modified_by VARCHAR DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO AuditLog (
        event_type, 
        username, 
        status, 
        details,
        application_name,
        host_name
    )
    VALUES (
        'ALTER_ROLE',
        COALESCE(p_modified_by, CURRENT_USER),
        'SUCCESS',
        format('Role: %s - %s member: %s', p_role_name, p_action, p_member_name),
        current_setting('application_name', true),
        CAST(inet_client_addr() AS TEXT)
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_alter_role IS 'Ghi log khi alter role (add/drop member)';

-- =============================================
-- SECURITY HELPER FUNCTIONS
-- =============================================

-- Function: Check if account is locked
CREATE OR REPLACE FUNCTION is_account_locked(p_username VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_failed_count INT;
BEGIN
    SELECT COUNT(*)
    INTO v_failed_count
    FROM AuditLog
    WHERE username = p_username
        AND event_type = 'LOGIN'
        AND status = 'FAILED'
        AND event_time > CURRENT_TIMESTAMP - INTERVAL '15 minutes';
    
    RETURN v_failed_count >= 5;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION is_account_locked IS 'Kiểm tra xem account có bị lock do nhiều failed login không';

-- Function: Safe GRANT with logging
CREATE OR REPLACE FUNCTION safe_grant_select(
    p_role VARCHAR,
    p_table VARCHAR
)
RETURNS VOID AS $$
BEGIN
    -- Only admin can grant
    IF NOT pg_has_role(CURRENT_USER, 'admin_role', 'MEMBER') THEN
        PERFORM log_unauthorized_access(CURRENT_USER, 'GRANT', p_table);
        RAISE EXCEPTION 'Only admins can grant permissions';
    END IF;
    
    -- Execute grant
    EXECUTE format('GRANT SELECT ON %I TO %I', p_table, p_role);
    
    -- Log it
    PERFORM log_grant_permission(p_role, 'SELECT', p_table, CURRENT_USER);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION safe_grant_select IS 'Safely grant SELECT permission with logging';

-- Function: Safe REVOKE with logging
CREATE OR REPLACE FUNCTION safe_revoke_select(
    p_role VARCHAR,
    p_table VARCHAR
)
RETURNS VOID AS $$
BEGIN
    -- Only admin can revoke
    IF NOT pg_has_role(CURRENT_USER, 'admin_role', 'MEMBER') THEN
        PERFORM log_unauthorized_access(CURRENT_USER, 'REVOKE', p_table);
        RAISE EXCEPTION 'Only admins can revoke permissions';
    END IF;
    
    -- Execute revoke
    EXECUTE format('REVOKE SELECT ON %I FROM %I', p_table, p_role);
    
    -- Log it
    PERFORM log_revoke_permission(p_role, 'SELECT', p_table, CURRENT_USER);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION safe_revoke_select IS 'Safely revoke SELECT permission with logging';

-- =============================================
-- USAGE EXAMPLES
-- =============================================

/*
-- Example 1: Log failed login
SELECT log_failed_login('john_doe', '192.168.1.100', 'Invalid password');

-- Example 2: Log successful login
SELECT log_successful_login('jane_doctor', '192.168.1.50');

-- Example 3: Log GRANT permission
SELECT log_grant_permission('doctor_role', 'SELECT', 'MedicalRecords', 'admin');

-- Example 4: Log REVOKE permission
SELECT log_revoke_permission('nurse_role', 'DELETE', 'MedicalRecords', 'admin');

-- Example 5: Log unauthorized access
SELECT log_unauthorized_access('receptionist1', 'DELETE', 'MedicalRecords', '192.168.1.75');

-- Example 6: Log ALTER ROLE
SELECT log_alter_role('doctor_role', 'new_doctor', 'ADD', 'admin');

-- Example 7: Check if account is locked
SELECT is_account_locked('john_doe');

-- Example 8: Safe grant (with permission check)
SELECT safe_grant_select('doctor_role', 'medicalrecords');

-- Example 9: Safe revoke (with permission check)
SELECT safe_revoke_select('nurse_role', 'patients');
*/