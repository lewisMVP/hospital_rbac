-- =============================================
-- AUDIT QUERIES & VIEWS - PostgreSQL
-- Views and Functions for querying audit logs
-- =============================================

-- View: Daily audit summary
CREATE OR REPLACE VIEW vw_audit_summary AS
SELECT 
    DATE(event_time) AS audit_date,
    event_type,
    status,
    COUNT(*) AS event_count,
    COUNT(DISTINCT username) AS unique_users
FROM AuditLog
GROUP BY DATE(event_time), event_type, status
ORDER BY audit_date DESC, event_count DESC;

COMMENT ON VIEW vw_audit_summary IS 'Daily summary view of audit logs';

-- Function: Get audit trail for a specific patient
CREATE OR REPLACE FUNCTION get_patient_audit_trail(p_patient_id INT)
RETURNS TABLE (
    event_time TIMESTAMP,
    event_type VARCHAR,
    table_name VARCHAR,
    username VARCHAR,
    status VARCHAR,
    details TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.event_time,
        a.event_type,
        a.table_name,
        a.username,
        a.status,
        a.details
    FROM AuditLog a
    WHERE a.details LIKE '%PatientID: ' || p_patient_id || '%'
       OR a.details LIKE '%patientid: ' || p_patient_id || '%'
    ORDER BY a.event_time DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_patient_audit_trail IS 'Get complete audit trail for a specific patient';

-- Function: Get top users with most failed login attempts
CREATE OR REPLACE FUNCTION get_top_failed_logins(p_limit INT DEFAULT 10)
RETURNS TABLE (
    username VARCHAR,
    failed_attempts BIGINT,
    last_failed_attempt TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.username,
        COUNT(*) AS failed_attempts,
        MAX(a.event_time) AS last_failed_attempt
    FROM AuditLog a
    WHERE a.status = 'FAILED'
        AND a.event_time > CURRENT_TIMESTAMP - INTERVAL '30 days'
    GROUP BY a.username
    ORDER BY failed_attempts DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_top_failed_logins IS 'Get list of users with most failed login attempts';

-- Function: Activity statistics by hour of day
CREATE OR REPLACE FUNCTION get_activity_by_hour()
RETURNS TABLE (
    hour_of_day INT,  -- FIXED: Changed from DOUBLE PRECISION to INT
    activity_count BIGINT,
    failed_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CAST(EXTRACT(HOUR FROM event_time) AS INT) AS hour_of_day,  -- FIXED: Cast to INT
        COUNT(*) AS activity_count,
        COUNT(CASE WHEN status = 'FAILED' THEN 1 END) AS failed_count
    FROM AuditLog
    WHERE event_time > CURRENT_TIMESTAMP - INTERVAL '7 days'
    GROUP BY CAST(EXTRACT(HOUR FROM event_time) AS INT)
    ORDER BY hour_of_day;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_activity_by_hour IS 'Activity statistics by hour of day (last 7 days)';