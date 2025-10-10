-- Query 5: ADMIN ROLE TEST (Quyền: Toàn quyền) và Xác nhận
SET ROLE admin;
SELECT * FROM Users;     
DELETE FROM Patients WHERE patient_id = 1; 
RESET ROLE;

-- Kiểm tra danh sách quyền đã cấp 
SELECT 
    grantee, 
    table_name, 
    string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges 
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
GROUP BY grantee, table_name 
ORDER BY grantee, table_name;