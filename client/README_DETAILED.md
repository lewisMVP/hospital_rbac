# Hospital RBAC - Frontend Client 🏥

## 📁 Cấu trúc Project

```
client/
├── src/
│   ├── components/           # UI Components
│   │   ├── Dashboard.jsx           # Component gốc với mock data
│   │   ├── Dashboard.example.jsx   # Ví dụ tích hợp backend
│   │   ├── UserManagement.jsx
│   │   ├── UserManagement.example.jsx
│   │   ├── RoleMatrix.jsx
│   │   ├── AuditLog.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   ├── LoadingSpinner.jsx      # Loading states
│   │   └── ErrorMessage.jsx        # Error handling
│   │
│   ├── services/             # API Layer
│   │   └── api.js                  # Tất cả API calls
│   │
│   ├── hooks/                # Custom React Hooks
│   │   └── useAPI.js               # Hook để fetch data
│   │
│   ├── App.jsx              # Main App component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
│
├── BACKEND_INTEGRATION.md   # Hướng dẫn tích hợp backend
└── package.json
```

---

## 🎯 Tình trạng hiện tại

### ✅ Đã hoàn thành:

1. **UI Components** - 100%
   - ✅ Dashboard với stats, activities, role distribution
   - ✅ User Management với tabs (Users/Roles)
   - ✅ Role & Permission Matrix (2 views)
   - ✅ Audit Logs với security alerts
   - ✅ Sidebar navigation
   - ✅ Header động

2. **Design System** - 100%
   - ✅ Apple-inspired design
   - ✅ Glassmorphism effects
   - ✅ Smooth animations
   - ✅ Responsive layout
   - ✅ Custom scrollbars

3. **Backend Integration Ready** - 100%
   - ✅ API Service Layer (`services/api.js`)
   - ✅ Custom Hooks (`hooks/useAPI.js`)
   - ✅ Loading components
   - ✅ Error handling components
   - ✅ Example components với API integration

### 🔄 Đang sử dụng Mock Data:

Hiện tại tất cả components đang dùng **dữ liệu tĩnh** để demo UI. 

**Để chuyển sang backend:**
1. Đọc file `BACKEND_INTEGRATION.md`
2. Tham khảo `*.example.jsx` files
3. Thay thế components hoặc cập nhật code

---

## 🚀 Chạy Development Server

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Server sẽ chạy tại: `http://localhost:5173`

---

## 🔌 Tích hợp Backend

### Bước 1: Cấu hình API URL

Tạo file `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### Bước 2: Cập nhật Components

**Option A: Sử dụng Example Files**

Đổi tên hoặc copy nội dung:
- `Dashboard.example.jsx` → `Dashboard.jsx`
- `UserManagement.example.jsx` → `UserManagement.jsx`

**Option B: Tự cập nhật**

```jsx
// Import hooks và API
import { useAPI } from '../hooks/useAPI'
import { dashboardAPI } from '../services/api'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

const MyComponent = () => {
  // Fetch data
  const { data, loading, error, refetch } = useAPI(dashboardAPI.getStats)
  
  // Loading state
  if (loading) return <LoadingSpinner fullScreen />
  
  // Error state
  if (error) return <ErrorMessage error={error} onRetry={refetch} fullScreen />
  
  // Render với data từ backend
  return (
    <div>
      {data?.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

### Bước 3: Backend API Requirements

Chi tiết trong file `BACKEND_INTEGRATION.md`

---

## 📊 Data Structure từ Database

### Dashboard Stats
```javascript
{
  label: "Total Users",
  value: "247",
  change: "+12%",
  trend: "up",
  icon: "👥",
  color: "#007aff"
}
```

### Users
```javascript
{
  id: 1,
  name: "Dr. Sarah Johnson",
  email: "sarah@hospital.com",
  role: "Doctor",
  status: "Active",
  avatar: "👩‍⚕️"
}
```

### Roles
```javascript
{
  id: 1,
  name: "Doctor",
  users: 45,
  permissions: 12,
  color: "#007aff",
  icon: "👨‍⚕️"
}
```

### Permission Matrix
```javascript
{
  roles: ["Doctor", "Nurse", "Admin", ...],
  resources: [
    { 
      name: "Patients", 
      actions: ["SELECT", "INSERT", "UPDATE", "DELETE"] 
    },
    ...
  ],
  permissions: {
    "Doctor": {
      "Patients": ["SELECT", "INSERT", "UPDATE"],
      "MedicalRecords": ["SELECT", "INSERT", "UPDATE"]
    },
    ...
  }
}
```

### Audit Logs
```javascript
{
  id: 1,
  timestamp: "2024-10-11 14:32:15",
  user: "Dr. Sarah Johnson",
  action: "SELECT",
  resource: "MedicalRecords",
  status: "Success",
  ip: "192.168.1.45",
  details: "Viewed patient record #12345"
}
```

---

## 🎨 Design Features

### Colors (Apple Palette)
- Primary Blue: `#007aff`
- Green: `#34c759`
- Orange: `#ff9500`
- Red: `#ff3b30`
- Purple: `#5856d6`
- Gray: `#86868b`

### Typography
- Font: SF Pro Display / SF Pro Text (fallback to system fonts)
- Weights: 400, 500, 600, 700
- Letter spacing: -0.2px to -0.8px

### Effects
- Glassmorphism: `backdrop-filter: blur(20px)`
- Shadows: Multi-layered, subtle
- Transitions: `cubic-bezier(0.4, 0, 0.2, 1)`
- Border radius: 8-16px

---

## 🛠️ Available Utilities

### Custom Hooks

#### `useAPI(apiFunction, dependencies, immediate)`
Fetch data từ API với auto loading/error states

```jsx
const { data, loading, error, refetch } = useAPI(dashboardAPI.getStats)
```

#### `useMutation(apiFunction)`
Cho POST/PUT/DELETE operations

```jsx
const { mutate, loading, error } = useMutation(userAPI.create)

const handleCreate = async () => {
  const result = await mutate({ name: "John", email: "john@example.com" })
  if (result.success) {
    // Success!
  }
}
```

### Components

#### `<LoadingSpinner />`
```jsx
<LoadingSpinner size="small" />
<LoadingSpinner size="medium" />
<LoadingSpinner size="large" />
<LoadingSpinner fullScreen />
```

#### `<ErrorMessage />`
```jsx
<ErrorMessage error="Something went wrong" onRetry={refetch} />
<ErrorMessage error="Network error" fullScreen />
```

---

## 📋 Next Steps (Sau khi có Backend)

1. ✅ Tích hợp Authentication
2. ✅ Form validation
3. ✅ Real-time updates (WebSocket)
4. ✅ Export/Import features
5. ✅ Advanced filtering
6. ✅ Dark mode
7. ✅ Mobile responsive improvements
8. ✅ Toast notifications
9. ✅ Modal dialogs
10. ✅ Pagination

---

## 📝 Notes

- Interface đã **sẵn sàng** cho backend integration
- Mock data hiện tại chỉ để demo UI
- Tất cả APIs đã được define trong `services/api.js`
- Backend cần trả về đúng format như documented
- CORS phải được configure đúng ở backend

---

## 🐛 Known Issues

- Chưa có authentication flow
- Chưa có form validation
- Chưa có modal dialogs
- Mock data chưa persist

---

**Được tạo bởi GitHub Copilot - October 2025** ✨
