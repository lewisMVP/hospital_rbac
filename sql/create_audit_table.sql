CREATE TABLE IF NOT EXISTS AuditLog (
    audit_id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,           -- Loại sự kiện: LOGIN, LOGOUT, SELECT, INSERT, UPDATE, DELETE, GRANT, REVOKE
    table_name VARCHAR(100),                   -- Bảng bị tác động
    username VARCHAR(100) NOT NULL,            -- Người dùng thực hiện
    event_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Thời gian sự kiện
    status VARCHAR(20) NOT NULL,               -- SUCCESS hoặc FAILED
    details TEXT,                              -- Chi tiết sự kiện
    ip_address VARCHAR(50),                    -- Địa chỉ IP (nếu có)
    application_name VARCHAR(100),             -- Tên ứng dụng
    host_name VARCHAR(100)                     -- Tên máy trạm
);

-- Tạo index để tăng hiệu suất truy vấn audit log
CREATE INDEX idx_auditlog_event_time ON AuditLog(event_time DESC);
CREATE INDEX idx_auditlog_username ON AuditLog(username);
CREATE INDEX idx_auditlog_event_type ON AuditLog(event_type);
CREATE INDEX idx_auditlog_status ON AuditLog(status);

-- Comment cho bảng
COMMENT ON TABLE AuditLog IS 'Bảng lưu trữ audit log cho toàn bộ hệ thống';
COMMENT ON COLUMN AuditLog.audit_id IS 'ID tự động tăng cho mỗi audit record';
COMMENT ON COLUMN AuditLog.event_type IS 'Loại sự kiện: LOGIN, INSERT, UPDATE, DELETE, GRANT, REVOKE, etc.';
COMMENT ON COLUMN AuditLog.status IS 'Trạng thái: SUCCESS hoặc FAILED';

-- Tạo view để xem các sự kiện failed
CREATE OR REPLACE VIEW vw_failed_events AS
SELECT 
    audit_id,
    event_type,
    table_name,
    username,
    event_time,
    details,
    ip_address,
    host_name
FROM AuditLog
WHERE status = 'FAILED';

COMMENT ON VIEW vw_failed_events IS 'View hiển thị tất cả các sự kiện thất bại';

-- Tạo view để xem các thay đổi quyền
CREATE OR REPLACE VIEW vw_permission_changes AS
SELECT 
    audit_id,
    event_type,
    username AS performed_by,
    event_time,
    details,
    host_name
FROM AuditLog
WHERE event_type IN ('GRANT', 'REVOKE', 'ALTER_ROLE');

COMMENT ON VIEW vw_permission_changes IS 'View hiển thị tất cả các thay đổi về quyền';