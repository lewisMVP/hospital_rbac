# HƯỚNG DẪN TÍCH HỢP BACKEND - Hospital RBAC

## 📋 Tổng quan

Interface đã được chuẩn bị sẵn sàng để tích hợp với backend. Bạn cần:
1. Tạo backend API endpoints
2. Thay thế mock data bằng API calls
3. Cấu hình environment variables

---

## 🚀 Bước 1: Cấu hình Backend URL

Tạo file `.env` trong folder `client/`:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 📡 Bước 2: Backend API Structure

Backend của bạn cần cung cấp các endpoints sau:

### Dashboard APIs
```
GET /api/dashboard/stats
Response: {
  success: true,
  data: [
    { label: "Total Users", value: "247", change: "+12%", trend: "up", icon: "👥", color: "#007aff" },
    ...
  ]
}

GET /api/dashboard/activities?limit=5
Response: {
  success: true,
  data: [
    { user: "Dr. Sarah Johnson", action: "Viewed patient record", time: "2 minutes ago", type: "view" },
    ...
  ]
}

GET /api/dashboard/role-distribution
Response: {
  success: true,
  data: [
    { role: "Doctor", count: 45, percentage: 18, color: "#007aff" },
    ...
  ]
}
```

### User Management APIs
```
GET /api/users?search=query
Response: {
  success: true,
  data: {
    users: [
      { id: 1, name: "Dr. Sarah Johnson", email: "sarah@hospital.com", role: "Doctor", status: "Active" },
      ...
    ]
  }
}

POST /api/users
Body: { name: "...", email: "...", role: "..." }
Response: { success: true, data: { id: 1, ... } }

PUT /api/users/:id
Body: { name: "...", email: "...", ... }
Response: { success: true, data: { id: 1, ... } }

DELETE /api/users/:id
Response: { success: true }
```

### Role & Permission APIs
```
GET /api/roles
Response: {
  success: true,
  data: {
    roles: [
      { id: 1, name: "Doctor", users: 45, permissions: 12, color: "#007aff" },
      ...
    ]
  }
}

GET /api/permissions/matrix
Response: {
  success: true,
  data: {
    roles: ["Doctor", "Nurse", ...],
    resources: [
      { name: "Patients", actions: ["SELECT", "INSERT", "UPDATE", "DELETE"] },
      ...
    ],
    permissions: {
      "Doctor": {
        "Patients": ["SELECT", "INSERT", "UPDATE"],
        ...
      },
      ...
    }
  }
}

POST /api/permissions/grant
Body: { roleId: 1, resource: "Patients", action: "SELECT" }
Response: { success: true }

POST /api/permissions/revoke
Body: { roleId: 1, resource: "Patients", action: "SELECT" }
Response: { success: true }
```

### Audit Log APIs
```
GET /api/audit/logs?dateRange=today&status=all
Response: {
  success: true,
  data: {
    logs: [
      {
        id: 1,
        timestamp: "2024-10-11 14:32:15",
        user: "Dr. Sarah Johnson",
        action: "SELECT",
        resource: "MedicalRecords",
        status: "Success",
        ip: "192.168.1.45",
        details: "Viewed patient record #12345"
      },
      ...
    ]
  }
}

GET /api/audit/alerts
Response: {
  success: true,
  data: [
    {
      id: 1,
      severity: "high",
      message: "Multiple failed login attempts from IP 203.45.67.89",
      count: 5,
      timestamp: "14:30"
    },
    ...
  ]
}

GET /api/audit/stats
Response: {
  success: true,
  data: [
    { label: "Total Events", value: "1,847", icon: "📊", color: "#007aff" },
    ...
  ]
}
```

---

## 🔄 Bước 3: Thay thế Components

### Option 1: Cập nhật từng component

Xem file examples:
- `Dashboard.example.jsx` - Ví dụ Dashboard với API
- `UserManagement.example.jsx` - Ví dụ User Management với API

### Option 2: Sử dụng ngay API service

```jsx
import { useAPI } from '../hooks/useAPI'
import { dashboardAPI } from '../services/api'

const MyComponent = () => {
  const { data, loading, error, refetch } = useAPI(dashboardAPI.getStats)
  
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} onRetry={refetch} />
  
  return <div>{JSON.stringify(data)}</div>
}
```

---

## 📝 Bước 4: Cấu trúc Data từ SQL Database

### Mapping từ Database Schema sang Frontend

#### Users Table → Frontend
```sql
SELECT 
  u.user_id as id,
  u.username as name,
  u.email,
  r.role_name as role,
  CASE WHEN u.is_active = 1 THEN 'Active' ELSE 'Inactive' END as status
FROM Users u
LEFT JOIN Roles r ON u.role_id = r.role_id
```

#### Roles → Frontend
```sql
SELECT 
  r.role_id as id,
  r.role_name as name,
  COUNT(u.user_id) as users,
  COUNT(DISTINCT rp.permission_id) as permissions
FROM Roles r
LEFT JOIN Users u ON r.role_id = u.role_id
LEFT JOIN Role_Permissions rp ON r.role_id = rp.role_id
GROUP BY r.role_id
```

#### Permission Matrix → Frontend
```sql
SELECT 
  r.role_name,
  p.resource_name as resource,
  p.action_name as action
FROM Role_Permissions rp
JOIN Roles r ON rp.role_id = r.role_id
JOIN Permissions p ON rp.permission_id = p.permission_id
```

#### Audit Logs → Frontend
```sql
SELECT 
  al.audit_id as id,
  al.timestamp,
  u.username as user,
  al.action,
  al.resource_name as resource,
  CASE WHEN al.status = 1 THEN 'Success' ELSE 'Failed' END as status,
  al.ip_address as ip,
  al.details
FROM Audit_Log al
LEFT JOIN Users u ON al.user_id = u.user_id
ORDER BY al.timestamp DESC
```

---

## 🔐 Bước 5: Authentication (Optional nhưng recommended)

### Thêm token vào API calls

Update `src/services/api.js`:

```javascript
async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token')
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }
  
  // ... rest of code
}
```

---

## ✅ Checklist Tích Hợp

- [ ] Backend API endpoints đã ready
- [ ] Database schema phù hợp với requirements
- [ ] Tạo file `.env` với API URL
- [ ] Test API endpoints với Postman/Thunder Client
- [ ] Thay thế mock data trong components
- [ ] Thêm error handling
- [ ] Thêm loading states
- [ ] Test CORS settings
- [ ] Implement authentication nếu cần
- [ ] Test toàn bộ flow

---

## 🐛 Troubleshooting

### CORS Error
Thêm trong backend (Express.js):
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
```

### 404 Errors
Kiểm tra:
- API URL trong `.env` đúng chưa
- Backend server đã chạy chưa
- Endpoint paths đúng chưa

### Network Errors
- Kiểm tra firewall
- Kiểm tra backend port
- Kiểm tra console logs

---

## 📞 Support

Nếu gặp vấn đề, check:
1. Console logs trong browser (F12)
2. Network tab để xem API requests
3. Backend logs
4. Database connections

---

**Happy Coding! 🚀**
