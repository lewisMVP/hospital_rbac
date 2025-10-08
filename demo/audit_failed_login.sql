-- =============================================
-- Functions: Record Failed Login Attempts - PostgreSQL
-- =============================================

-- Function for log failed login
CREATE OR REPLACE FUNCTION log_failed_login(
    p_username VARCHAR,
    p_ip_address VARCHAR DEFAULT NULL,
    p_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_failed_count INT;
BEGIN
    -- record log failed login
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
        inet_client_addr()::VARCHAR
    );
    
    -- Check the number of consecutive failed logins within 15 minutes
    SELECT COUNT(*)
    INTO v_failed_count
    FROM AuditLog
    WHERE username = p_username
        AND event_type = 'LOGIN'
        AND status = 'FAILED'
        AND event_time > CURRENT_TIMESTAMP - INTERVAL '15 minutes';
    
    -- Warn if there are too many failed login attempts
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
        
        -- Raise notice for administrator to known
        RAISE NOTICE 'SECURITY ALERT: User % has % failed login attempts from IP %', 
            p_username, v_failed_count, p_ip_address;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_failed_login IS 'Ghi log failed login và cảnh báo nếu có nhiều lần thử thất bại';

-- Function for log successful login
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
        inet_client_addr()::VARCHAR
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log_successful_login IS 'Ghi log successful login';

-- Function for log logout
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
        inet_client_addr()::VARCHAR
    );
END;
$$ LANGUAGE plpgsql;