# Hospital RBAC System

A modern, secure Role-Based Access Control (RBAC) system for hospital management with React frontend, Flask backend, and PostgreSQL database.

## Features

- **Modern UI**: React-based interface with Apple-inspired design system
- **RBAC Implementation**: Secure role-based access control (Admin, Doctor, Nurse, Receptionist, Billing)
- **Real-time Dashboard**: Statistics, activities, and role distribution monitoring
- **User Management**: Complete CRUD operations for users and roles
- **Permission Matrix**: Visual permission management interface
- **Audit Logging**: Comprehensive tracking of all system activities
- **Security Alerts**: Failed login detection and unauthorized access monitoring
- **PostgreSQL Backend**: Robust database with triggers and stored procedures

## Tech Stack

### Frontend
- **React 19.1.1** - UI framework
- **Vite 7.1.14** - Build tool
- **React Router 7.1.1** - Navigation
- **Lucide React** - Icons
- **Apple Design System** - Glassmorphism, SF Pro fonts

### Backend
- **Flask 3.0.0** - Python web framework
- **PostgreSQL 14+** - Database
- **psycopg2-binary 2.9.9** - Database adapter
- **Flask-CORS 4.0.0** - Cross-origin support

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

## Testing

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
# Using curl (backend must be running)
curl http://localhost:5000/api/dashboard/stats
curl http://localhost:5000/api/users
curl http://localhost:5000/api/roles
```

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `pg_isready`
- Verify database exists: `psql -l | grep hospital_rbac`
- Check `.env` file has correct credentials
- Ensure virtual environment is activated

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check `client/.env` has correct `VITE_API_URL`
- Check browser console for CORS errors
- Ensure Flask-CORS is installed

### Database connection errors
- Verify PostgreSQL service is running
- Check DB_PASSWORD in `server/.env`
- Ensure `hospital_rbac` database exists
- Check PostgreSQL is listening on port 5432

### Permission denied errors
```bash
# Windows PowerShell execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Documentation

- **Database Schema**: See `database/sql/create_schema.sql`
- **RBAC Design**: See `database/sql/role_permission.sql`
- **Audit System**: See `database/sql/create_audit_table.sql`
- **API Documentation**: See `server/README.md`

## Contributing

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

