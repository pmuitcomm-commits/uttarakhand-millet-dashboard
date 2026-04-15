-- Agent Generated File --

# Authentication System - Quick Start Guide

## ✅ Feature Summary

Your Millet Dashboard now includes **secure, role-based authentication** with:

### 🔐 Security Features
- **Password Hashing**: Bcrypt encryption for secure password storage
- **JWT Tokens**: Stateless authentication using JSON Web Tokens
- **Bearer Authentication**: Standard Authorization headers
- **Token Expiration**: 8-hour token validity period
- **Role-Based Access Control**: Four distinct user roles

### 👥 User Roles

| Role | Access Level | Use Case |
|------|-------------|----------|
| **Admin** | System-wide | System administrators, manage all users |
| **District Officer** | District-level | Regional coordinators, view district data |
| **Block Officer** | Block-level | Local coordinators, manage block data |
| **Farmer** | Personal | End users, personal procurement data |

---

## 🚀 Getting Started

### Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Create Test Users
```bash
python add_users.py
```

### Step 3: Start Backend
```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Step 4: Start Frontend
```bash
cd frontend
npm start
```

---

## 📝 Test Accounts

| Username | Password | Role |
|----------|----------|------|
| `admin_uttarakhand` | `Admin@123` | Admin |
| `district_nainital` | `District@123` | District Officer (Nainital) |
| `block_nainital` | `Block@123` | Block Officer (Nainital) |
| `farmer_john` | `Farmer@123` | Farmer |

---

## 🔑 Login Flow

### 1. Navigate to Login (`http://localhost:3000`)

### 2. Login with Credentials
- Select user type (Farmer or Department Login)
- For Department Login, choose role:
  - Admin
  - District Officer
  - Block Officer
- Enter username and password
- Complete CAPTCHA
- Click Login

### 3. Dashboard Access
- Token stored in browser localStorage
- Automatic redirect to dashboard
- User role determines accessible features

---

## 📡 API Endpoints

### Public Endpoints
```
POST /auth/login
  Input: { username, password }
  Response: { access_token, token_type, user }

POST /auth/register
  Input: { username, password, email, role_id, district }
  Response: { access_token, token_type, user }
```

### Protected Endpoints (require Bearer token)
```
GET /auth/me
  Returns: Current user info

GET /auth/admin/users
  Returns: All users (admin only)

PUT /auth/admin/users/{user_id}/role
  Updates user role (admin only)

GET /auth/district/users
  Returns: Users in same district

GET /auth/block/users
  Returns: Users in same block
```

### Token Usage
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

---

## 🎨 Frontend Features

### Login Page Updates
✅ **Login Mode**
- Username/password fields
- CAPTCHA verification
- Forgot Password link
- Enrollment Status link

✅ **Registration Mode**
- Create new account
- Role selection
- District/Block assignment
- Email field (optional)

✅ **Department/Officer Login**
- Separate role selection dropdown
- District field (for district/block officers)
- Dynamic block selection

### Protected Routes
```jsx
<ProtectedRoute requiredRoles={["admin"]}>
  <AdminPanel />
</ProtectedRoute>
```

### Auth Context
```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, hasRole, logout } = useAuth();
  
  if (hasRole('admin')) {
    // Show admin features
  }
}
```

---

## 🔄 Architecture Diagram

```
┌─────────────┐
│   Browser   │
│  (React)    │
└──────┬──────┘
       │ Username/Password
       │
       ▼
┌─────────────────────┐
│   Login Component   │  ← Registration/Login Forms
│                     │
└──────┬──────────────┘
       │
       │ POST /auth/login
       │ POST /auth/register
       │
       ▼
┌─────────────────────────┐
│   FastAPI Backend       │
│   ┌─────────────────┐   │
│   │ Auth Routes     │   │  ← JWT generation
│   │ (app/routes)    │   │
│   └────────┬────────┘   │
│            │            │
│   ┌────────▼────────┐   │
│   │   Database      │   │  ← User storage
│   │  (PostgreSQL)   │   │
│   └─────────────────┘   │
└─────────────────────────┘
```

---

## 🔐 Security Best Practices

### ✅ Implemented
- Bcrypt password hashing
- JWT token-based auth
- Role-based access control
- Token expiration (8 hours)
- Bearer token in Authorization header

### 🚧 Recommended for Production
- Use HTTPS only (not HTTP)
- Change SECRET_KEY in `.env`
- Implement refresh tokens
- Add rate limiting on auth endpoints
- Enable CORS specifically (don't use "*")
- Add email verification
- Implement 2-Factor Authentication (2FA)

---

## 📂 Files Created/Modified

### Backend
```
✅ app/routes/auth.py          - Authentication endpoints
✅ app/security.py             - JWT & password utilities
✅ app/main.py                 - Auth router integration
✅ requirements.txt            - New dependencies
✅ .env                        - SECRET_KEY configuration
✅ add_users.py                - User creation script
```

### Frontend
```
✅ src/pages/Login.js          - Updated login/registration UI
✅ src/context/AuthContext.jsx - Auth state management
✅ src/components/ProtectedRoute.jsx - Route protection
✅ src/services/api.js         - Auth API functions + interceptor
✅ src/styles/login.css        - New form styles
```

---

## 🐛 Troubleshooting

### "Invalid username or password"
- Verify credentials match test accounts
- Check username spelling
- Confirm backend is running

### "Invalid token" / "Expired token"
- Re-login to get new token
- Check token expiration (8 hours)
- Clear localStorage and login again

### "Access Denied" error
- Verify user has required role
- Check role assignment in database
- Admin can reassign roles

### Backend not starting
- Check Python dependencies: `pip list`
- Verify database connection in `.env`
- Run `python check_db.py` to diagnose DB issues

---

## 📚 Documentation

See **`AUTHENTICATION.md`** for:
- Detailed API documentation
- Role permission matrix
- Advanced configuration
- Database schema details
- Extension guide for custom roles

---

## ✨ Next Steps

1. **Test All Roles**: Login with each test account
2. **Verify Permissions**: Test role-based features
3. **Customize**: Extend roles/permissions as needed  
4. **Production**: Update SECRET_KEY and security settings
5. **Monitor**: Add audit logging for auth events

---

## 💡 Quick Tips

| Task | Command |
|------|---------|
| Create new user | POST /auth/register |
| View all users | GET /auth/admin/users (admin only) |
| Change user role | PUT /auth/admin/users/{id}/role (admin only) |
| Logout | Clear localStorage and navigate to login |
| Reset password | Use Forgot Password link (coming soon) |

---

**System Status**: ✅ Ready for Testing
**Last Updated**: April 7, 2026

For issues or questions, check logs in:
- **Backend**: Terminal running uvicorn
- **Frontend**: Browser console (F12)
- **Database**: PostgreSQL logs
