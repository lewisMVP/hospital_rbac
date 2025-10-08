-- =============================================
-- AUDIT REPORT EXAMPLES - PostgreSQL
-- Sample queries for analyzing and reporting audit logs
-- =============================================

-- ============================================
-- SECTION 1: FAILED LOGIN ANALYSIS
-- ============================================

-- 1. View all failed login attempts in the last 24 hours
SELECT 
    event_time,
    username,
    details,
    ip_address,
    host_name
FROM AuditLog
WHERE event_type = 'LOGIN'
    AND status = 'FAILED'
    AND event_time > CURRENT_TIMESTAMP - INTERVAL '24 hours'
ORDER BY event_time DESC;

-- 2. Top 10 users with most failed login attempts
SELECT * FROM get_top_failed_logins(10);

-- 3. Failed login attempts by IP address
SELECT 
    ip_address,
    COUNT(*) AS failed_attempts,
    array_agg(DISTINCT username) AS usernames,
    MIN(event_time) AS first_attempt,
    MAX(event_time) AS last_attempt
FROM AuditLog
WHERE event_type = 'LOGIN'
    AND status = 'FAILED'
    AND event_time > CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY ip_address
ORDER BY failed_attempts DESC;

-- ============================================
-- SECTION 2: PERMISSION CHANGES
-- ============================================

-- 4. View all permission changes (GRANT/REVOKE)
SELECT 
    event_time,
    event_type,
    username AS performed_by,
    table_name AS on_object,
    details,
    host_name
FROM AuditLog
WHERE event_type IN ('GRANT', 'REVOKE', 'ALTER_ROLE')
ORDER BY event_time DESC;

-- 5. Permission changes in the last 30 days
SELECT * FROM vw_permission_changes
WHERE event_time > CURRENT_TIMESTAMP - INTERVAL '30 days'
ORDER BY event_time DESC;

-- ============================================
-- SECTION 3: UNAUTHORIZED ACCESS
-- ============================================

-- 6. View unauthorized access attempts
SELECT 
    event_time,
    username,
    table_name,
    details,
    ip_address,
    host_name
FROM AuditLog
WHERE event_type = 'UNAUTHORIZED_ACCESS'
ORDER BY event_time DESC;

-- 7. Unauthorized access grouped by user
SELECT 
    username,
    table_name,
    COUNT(*) AS attempt_count,
    MAX(event_time) AS last_attempt
FROM AuditLog
WHERE event_type = 'UNAUTHORIZED_ACCESS'
    AND event_time > CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY username, table_name
ORDER BY attempt_count DESC;

-- ============================================
-- SECTION 4: DATA CHANGES
-- ============================================

-- 8. View all changes on MedicalRecords table
SELECT 
    event_time,
    event_type,
    username,
    details,
    application_name
FROM AuditLog
WHERE table_name = 'MedicalRecords'
ORDER BY event_time DESC
LIMIT 100;

-- 9. Audit trail for a specific patient (example: PatientID = 1)
SELECT * FROM get_patient_audit_trail(1);

-- 10. Statistics of changes by table
SELECT 
    table_name,
    event_type,
    COUNT(*) AS change_count,
    COUNT(DISTINCT username) AS users_involved
FROM AuditLog
WHERE event_type IN ('INSERT', 'UPDATE', 'DELETE')
    AND event_time > CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY table_name, event_type
ORDER BY change_count DESC;

-- ============================================
-- SECTION 5: SECURITY ALERTS
-- ============================================

-- 11. Security alerts in the last 7 days
SELECT 
    event_time,
    username,
    details,
    ip_address
FROM AuditLog
WHERE event_type = 'SECURITY_ALERT'
    AND event_time > CURRENT_TIMESTAMP - INTERVAL '7 days'
ORDER BY event_time DESC;

-- 12. Security alerts summary by user
SELECT 
    username,
    COUNT(*) AS alert_count,
    array_agg(DISTINCT LEFT(details, 50)) AS alert_types,
    MAX(event_time) AS last_alert
FROM AuditLog
WHERE event_type = 'SECURITY_ALERT'
    AND event_time > CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY username
ORDER BY alert_count DESC;

-- ============================================
-- SECTION 6: ACTIVITY STATISTICS
-- ============================================

-- 13. Event count statistics by type (last 7 days)
SELECT 
    event_type,
    status,
    COUNT(*) AS event_count
FROM AuditLog
WHERE event_time > CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY event_type, status
ORDER BY event_count DESC;

-- 14. Activity statistics by hour of day
SELECT * FROM get_activity_by_hour();

-- 15. Activity by user (top 20)
SELECT 
    username,
    COUNT(*) AS total_actions,
    COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) AS successful,
    COUNT(CASE WHEN status = 'FAILED' THEN 1 END) AS failed,
    MAX(event_time) AS last_activity
FROM AuditLog
WHERE event_time > CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY username
ORDER BY total_actions DESC
LIMIT 20;

-- ============================================
-- SECTION 7: COMPLIANCE REPORTS
-- ============================================

-- 16. Daily summary report
SELECT * FROM vw_audit_summary
WHERE audit_date > CURRENT_DATE - INTERVAL '30 days'
ORDER BY audit_date DESC;

-- 17. Failed events report
SELECT 
    DATE(event_time) AS failed_date,
    event_type,
    COUNT(*) AS failed_count,
    array_agg(DISTINCT username) AS users
FROM AuditLog
WHERE status = 'FAILED'
    AND event_time > CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY DATE(event_time), event_type
ORDER BY failed_date DESC, failed_count DESC;

-- 18. Activity report by application
SELECT 
    application_name,
    COUNT(*) AS action_count,
    COUNT(DISTINCT username) AS unique_users,
    MIN(event_time) AS first_seen,
    MAX(event_time) AS last_seen
FROM AuditLog
WHERE event_time > CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY application_name
ORDER BY action_count DESC;

-- ============================================
-- SECTION 8: ADVANCED ANALYTICS
-- ============================================

-- 19. Detect suspicious patterns (users with multiple unauthorized attempts)
SELECT 
    username,
    COUNT(*) AS suspicious_attempts,
    array_agg(DISTINCT event_type) AS attempt_types,
    array_agg(DISTINCT table_name) AS targeted_tables,
    MIN(event_time) AS first_attempt,
    MAX(event_time) AS last_attempt
FROM AuditLog
WHERE event_type IN ('UNAUTHORIZED_ACCESS', 'SECURITY_ALERT')
    AND event_time > CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY username
HAVING COUNT(*) >= 3
ORDER BY suspicious_attempts DESC;

-- 20. Timeline for a specific user (example: 'doctor_user1')
SELECT 
    event_time,
    event_type,
    table_name,
    status,
    LEFT(details, 100) AS details_preview,
    ip_address
FROM AuditLog
WHERE username = 'doctor_user1'
    AND event_time > CURRENT_TIMESTAMP - INTERVAL '7 days'
ORDER BY event_time DESC;

-- ============================================
-- SECTION 9: PERFORMANCE QUERIES
-- ============================================

-- 21. Number of audit records by month
SELECT 
    DATE_TRUNC('month', event_time) AS month,
    COUNT(*) AS record_count,
    pg_size_pretty(pg_total_relation_size('auditlog')) AS table_size
FROM AuditLog
GROUP BY DATE_TRUNC('month', event_time)
ORDER BY month DESC;

-- 22. Audit log growth rate
SELECT 
    DATE(event_time) AS log_date,
    COUNT(*) AS daily_records,
    SUM(COUNT(*)) OVER (ORDER BY DATE(event_time)) AS cumulative_records
FROM AuditLog
WHERE event_time > CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY DATE(event_time)
ORDER BY log_date;

-- ============================================
-- END OF REPORT EXAMPLES
-- ============================================