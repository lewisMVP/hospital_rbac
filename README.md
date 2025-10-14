# Hospital RBAC System

A modern, secure Role-Based Access Control (RBAC) system for hospital management with React frontend, Flask backend, and PostgreSQL database.

<img width="2876" height="1568" alt="image" src="https://github.com/user-attachments/assets/6f9caf67-f457-47bf-ab8c-5db3639568eb" />
<img width="2879" height="1578" alt="image" src="https://github.com/user-attachments/assets/06c6d2bc-97f0-4583-9a21-6b7fc2dc8de1" />
<img width="2877" height="1576" alt="image" src="https://github.com/user-attachments/assets/8d961222-a48b-4e59-b1b9-623f8f02abcd" />
<img width="2875" height="1570" alt="image" src="https://github.com/user-attachments/assets/787cd7f8-503b-4487-8664-177b65fb7388" />
<img width="2879" height="1568" alt="image" src="https://github.com/user-attachments/assets/8df33577-4a19-4b00-8b3a-9b438adc551a" />

## ✨ Features

### Core Functionality
- **Modern UI**: React-based interface with Apple-inspired design system
- **RBAC Implementation**: Secure role-based access control (Admin, Doctor, Nurse, Receptionist, Billing)
- **Real-time Dashboard**: Statistics, activities, and role distribution monitoring
- **User Management**: Complete CRUD operations for users and roles
- **Permission Matrix**: Visual permission management interface
- **Audit Logging**: Comprehensive tracking of all system activities with failed login detection
- **Security Alerts**: Real-time monitoring of unauthorized access attempts

### Hospital Management Modules
- **👥 Patient Management**: Register and manage patient records with full CRUD operations
- **📅 Appointment Scheduling**: Schedule, update, and track patient appointments
- **📋 Medical Records**: Manage patient diagnoses, treatments, prescriptions, and notes
- **🔐 Authentication & Authorization**: JWT-based secure login with role-based access
- **📊 Dashboard Analytics**: Real-time statistics and activity monitoring

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - UI framework
- **Vite 7.1.14** - Build tool and dev server
- **React Router 7.1.1** - Client-side routing
- **Axios 1.7.9** - HTTP client for API requests
- **Lucide React** - Modern icon library
- **Apple Design System** - Glassmorphism, SF Pro fonts, smooth animations

### Backend
- **Flask 3.0.0** - Python web framework
- **PostgreSQL 14+** - Relational database
- **psycopg2-binary 2.9.9** - PostgreSQL adapter
- **Flask-CORS 4.0.0** - Cross-origin resource sharing
- **Flask-JWT-Extended 4.6.0** - JWT authentication
- **bcrypt 4.1.2** - Password hashing

### Security
- **JWT Tokens**: Secure authentication with 24-hour expiration
- **bcrypt**: Industry-standard password hashing (cost factor: 12)
- **Audit Logging**: Comprehensive activity tracking with failed login detection
- **Role-based Permissions**: Granular access control per table and operation

## 📁 Project Structure

```
hospital_rbac/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── services/       # API service layer
│   │   ├── hooks/          # Custom React hooks
│   │   └── App.jsx         # Main application
│   ├── .env.example        # Frontend environment template
│   └── package.json
├── server/                 # Flask backend
│   ├── app/
│   │   ├── routes/         # API endpoints
│   │   ├── utils/          # Database utilities
│   │   └── __init__.py     # App factory
│   ├── .env.example        # Backend environment template
│   ├── requirements.txt    # Python dependencies
│   └── run.py              # Server entry point
├── database/               # SQL scripts
│   ├── sql/                # Schema and permissions
│   └── demo/               # Sample data and tests
├── .gitignore              # Git ignore rules
└── README.md
```

## Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **PostgreSQL 14+**
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/lewisMVP/hospital_rbac.git
cd hospital_rbac
```

### 2. Setup Database

```bash
# Create database
createdb hospital_rbac

# Run SQL scripts in order
psql -U postgres -d hospital_rbac -f database/sql/create_schema.sql
psql -U postgres -d hospital_rbac -f database/sql/role_permission.sql
psql -U postgres -d hospital_rbac -f database/sql/create_audit_table.sql
psql -U postgres -d hospital_rbac -f database/sql/create_audit_triggers.sql
psql -U postgres -d hospital_rbac -f database/demo/insert_sample_data.sql
```

### 3. Setup Backend

```bash
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\activate
# Windows CMD:
venv\Scripts\activate.bat
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# ⚠️ Edit .env and update:
#    - DB_PASSWORD (your PostgreSQL password)
#    - SECRET_KEY (generate a secure random key)
```

**Generate a secure SECRET_KEY:**
```python
python -c "import secrets; print(secrets.token_hex(32))"
```

### 4. Setup Frontend

```bash
cd client

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env if needed (default: http://localhost:5000/api)
```

### 5. Run Application

**Terminal 1 - Backend:**
```bash
cd server
python run.py
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

**Open browser:** Navigate to [http://localhost:5173](http://localhost:5173)

## 🔑 Default Login Credentials

Use these credentials to test different role permissions:

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| **Admin** | `admin` | `password` | Full system access - all modules, all operations |
| **Doctor** | `doctor1` | `password` | Patients (view), Appointments (view), Medical Records (full CRUD) |
| **Nurse** | `nurse1` | `password` | Patients (view), Appointments (view), Medical Records (view) |
| **Receptionist** | `receptionist1` | `password` | Patients (full CRUD), Appointments (full CRUD) |

**⚠️ Security Warning**: Change these default passwords immediately in production!

## 📊 Role Permission Matrix

| Module | Admin | Doctor | Nurse | Receptionist | Billing |
|--------|-------|--------|-------|--------------|---------|
| **Dashboard** | ✅ View | ✅ View | ✅ View | ✅ View | ✅ View |
| **Users** | ✅ Full CRUD | ❌ | ❌ | ❌ | ❌ |
| **Roles** | ✅ Full CRUD | ❌ | ❌ | ❌ | ❌ |
| **Patients** | ✅ Full CRUD | 👁️ View Only | 👁️ View Only | ✅ Full CRUD | 👁️ View Only |
| **Appointments** | ✅ Full CRUD | 👁️ View Only | 👁️ View Only | ✅ Full CRUD | ❌ |
| **Medical Records** | ✅ Full CRUD | ✅ Create/Update/View | 👁️ View Only | ❌ | ❌ |
| **Audit Log** | ✅ Full Access | ❌ | ❌ | ❌ | ❌ |

## Security Best Practices

### IMPORTANT - Before Pushing to Git

1. **NEVER commit `.env` files** - They contain sensitive credentials
2. **Always use `.env.example`** - Template files only
3. **Change default SECRET_KEY** - Use a strong, unique key in production
4. **Use strong database passwords** - Never use simple passwords like "1"
5. **Review git status** - Before every commit

### Environment Variables

**Backend (`server/.env`):**
```env
FLASK_ENV=development              # Change to 'production' in prod
SECRET_KEY=<generate-secure-key>   # Use secrets.token_hex(32)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hospital_rbac
DB_USER=postgres
DB_PASSWORD=<your-secure-password>
API_PREFIX=/api
```

**Frontend (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### Check Before Commit

```bash
# 1. Check git status
git status

# 2. Ensure .env files are ignored
git ls-files | grep .env$
# Should return nothing!

# 3. If .env was accidentally tracked:
git rm --cached server/.env
git rm --cached client/.env

# 4. Commit .gitignore first
git add .gitignore
git commit -m "Add .gitignore for security"
```

## API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - System statistics
- `GET /api/dashboard/activities` - Recent activities
- `GET /api/dashboard/role-distribution` - Role distribution data

### Users
- `GET /api/users` - List all users
- `GET /api/users/<id>` - Get user details
- `POST /api/users` - Create new user
- `PUT /api/users/<id>` - Update user
- `DELETE /api/users/<id>` - Delete user

### Roles
- `GET /api/roles` - List all roles
- `POST /api/roles` - Create new role
- `PUT /api/roles/<id>` - Update role
- `DELETE /api/roles/<id>` - Delete role

### Permissions
- `GET /api/permissions/matrix` - Permission matrix
- `POST /api/permissions/grant` - Grant permission
- `POST /api/permissions/revoke` - Revoke permission

### Audit
- `GET /api/audit/logs` - Audit logs (with filters)
- `GET /api/audit/alerts` - Security alerts
- `GET /api/audit/failed-logins` - Failed login attempts

## 🧪 Testing

### Test Default Login
```bash
# Test with different roles
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Test Database Functionality

```bash
# Run test scripts
psql -U postgres -d hospital_rbac -f database/demo/RoleTest.sql
psql -U postgres -d hospital_rbac -f database/demo/MatrixTest.sql
psql -U postgres -d hospital_rbac -f database/demo/test_audit_system.sql
psql -U postgres -d hospital_rbac -f database/demo/audit_failed_login.sql
```

### Test API Endpoints

```bash
# Get JWT token first
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' \
  | jq -r '.token')

# Test protected endpoints
curl http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:5000/api/patients \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:5000/api/appointments \
  -H "Authorization: Bearer $TOKEN"
```

### Manual Testing Checklist

✅ **Authentication**
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (check audit log)
- [ ] Logout functionality
- [ ] Token expiration after 24 hours

✅ **Role-Based Access**
- [ ] Admin can access all modules
- [ ] Doctor can create/edit medical records
- [ ] Nurse can only view medical records
- [ ] Receptionist can manage patients and appointments

✅ **CRUD Operations**
- [ ] Create new patient (as Admin or Receptionist)
- [ ] Update patient information
- [ ] Create appointment for existing patient
- [ ] Create medical record (as Admin or Doctor)
- [ ] Verify audit logs for all operations

✅ **Audit Logging**
- [ ] Successful login creates audit entry
- [ ] Failed login creates audit entry with status='failed'
- [ ] CRUD operations logged with correct event_type
- [ ] Filter audit logs by event type, user, status

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check PostgreSQL is running
pg_isready

# Verify database exists
psql -l | grep hospital_rbac

# Check if port 5000 is already in use (Windows)
netstat -ano | findstr :5000

# Check Python virtual environment is activated
which python  # Should show path to venv
```

**Solutions:**
- Ensure PostgreSQL service is running
- Verify `.env` file has correct DB credentials
- Check virtual environment is activated: `.\venv\Scripts\activate`
- Kill process using port 5000 if needed

### Frontend can't connect to backend
```bash
# Verify backend is running
curl http://localhost:5000/api/dashboard/stats

# Check CORS headers
curl -I http://localhost:5000/api/dashboard/stats
```

**Solutions:**
- Verify backend is running on port 5000
- Check `client/.env` has `VITE_API_URL=http://localhost:5000/api`
- Ensure Flask-CORS is installed: `pip list | grep Flask-CORS`
- Clear browser cache and restart dev server

### Database connection errors
```bash
# Test database connection
psql -U postgres -d hospital_rbac -c "SELECT 1"

# Check PostgreSQL is listening
netstat -an | findstr :5432
```

**Common errors:**
- `psycopg2.OperationalError`: Wrong password or database doesn't exist
- `could not connect to server`: PostgreSQL service not running
- `database "hospital_rbac" does not exist`: Run setup scripts

**Solutions:**
- Check DB_PASSWORD in `server/.env` matches PostgreSQL password
- Ensure PostgreSQL service is running: `pg_ctl status`
- Recreate database if needed: `createdb hospital_rbac`

### "Object of type time is not JSON serializable"
**Fixed in latest version** - The `database.py` utility now automatically converts:
- `date` → ISO format string (YYYY-MM-DD)
- `time` → Time string (HH:MM:SS)
- `datetime` → ISO format string
- `Decimal` → float

### Failed login not showing in audit log
**Fixed** - Ensure:
- Backend has debug logging enabled (check terminal output)
- Status filter in Audit Log UI uses lowercase 'failed'
- Database has audit triggers installed

### Permission denied errors (Windows PowerShell)
```powershell
# Allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Invalid patient_id or doctor_id format"
**Fixed** - Backend now converts string IDs from forms to integers automatically.

If you still see this error:
- Check frontend is sending `patient_id` and `doctor_id` as strings (from select elements)
- Verify backend is running latest code with integer conversion

## 📚 Documentation

- **Database Schema**: See `database/sql/create_schema.sql`
  - Users, Roles, Permissions tables
  - Patients, Appointments, MedicalRecords tables
  - AuditLog table with triggers
  
- **RBAC Design**: See `database/sql/role_permission.sql`
  - Role creation (Admin, Doctor, Nurse, Receptionist, Billing)
  - Permission grants per role and table
  - Row-level security policies
  
- **Audit System**: See `database/sql/create_audit_table.sql`
  - Automatic logging of all CRUD operations
  - Failed login detection and tracking
  - Security alert generation
  
- **API Documentation**: See individual route files in `server/app/routes/`

## 🏗️ Database Schema

### Core Tables
- **users**: User accounts with hashed passwords (bcrypt)
- **roles**: Role definitions (Admin, Doctor, Nurse, etc.)
- **user_roles**: User-role assignments (many-to-many)
- **permissions**: Table-level and operation-level permissions
- **role_permissions**: Role-permission assignments

### Hospital Management Tables
- **patients**: Patient information (name, DOB, gender, contact, email)
- **appointments**: Patient appointments (date, time, status, reason)
- **medicalrecords**: Medical history (diagnosis, treatment, prescription, notes)

### Audit & Security
- **auditlog**: Comprehensive activity logging
  - event_type: LOGIN, LOGOUT, INSERT, UPDATE, DELETE
  - status: 'success' or 'failed'
  - username, table_name, details, event_time

## 🔒 Security Features

1. **Password Security**
   - bcrypt hashing with cost factor 12
   - Passwords never stored in plain text
   - Minimum password requirements enforced

2. **JWT Authentication**
   - 24-hour token expiration
   - Tokens include user_id, username, and role
   - Automatic token refresh on API calls

3. **Role-Based Authorization**
   - Decorator-based permission checks
   - `@token_required` for authentication
   - `@role_required(['Admin'])` for authorization

4. **Audit Logging**
   - All authentication attempts logged
   - CRUD operations tracked with user attribution
   - Failed login detection for security monitoring

5. **Input Validation**
   - Type conversion (string → integer) for IDs
   - Required field validation
   - SQL injection prevention via parameterized queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

**Before submitting:**
- Ensure code follows existing style
- Test all changes thoroughly  
- Update documentation if needed
- Never commit `.env` files
- Add appropriate audit logging for new features


## Author

**lewisMVP**
- GitHub: [@lewisMVP](https://github.com/lewisMVP)

## Acknowledgments

- Apple Design System for UI inspiration
- PostgreSQL documentation
- Flask community
- React community

---

**Security Notice**: This is a demonstration project. For production use, implement additional security measures including:
- HTTPS/TLS encryption
- JWT authentication
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- CSRF tokens
- Regular security audits

