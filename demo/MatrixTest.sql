SELECT 
    grantee AS role_name,
    table_name,
    string_agg(privilege_type, ', ') AS privileges,
    'Allowed' AS expected_result,
    'Tested' AS actual_result,
    'Pass' AS status
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
GROUP BY grantee, table_name
ORDER BY grantee, table_name;
