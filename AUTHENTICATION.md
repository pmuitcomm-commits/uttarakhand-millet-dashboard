# Authentication & Role-Based Access Control System

## Overview
This document describes the complete authentication and role-based access control (RBAC) system implemented in the Millet Dashboard application.

## Features Implemented

### 1. **Secure Authentication**
- **Password Hashing**: Uses bcrypt for secure password storage
- **JWT Tokens**: JSON Web Token-based authentication for stateless sessions
- **Token Expiration**: Configurable token expiration (default: 480 minutes / 8 hours)
- **Bearer Token Authentication**: Standard HTTP Bearer token in Authorization header

### 2. **Role-Based Access Control**
Four user roles implemented:
- **Admin**: Full system access, can manage all users and domains
- **District Officer**: Access to district-level data and operations
- **Block Officer**: Access to block-level data within assigned district
- **Farmer**: Limited access to personal procurement and production data

### 3. **User Roles & Permissions**

| Feature | Admin | District Officer | Block Officer | Farmer |
|---------|-------|------------------|---------------|--------|
| View all data | ✓ | ✓ (own district) | ✓ (own block) | ✓ (own) |
| Manage users | ✓ | - | - | - |
| Create reports | ✓ | ✓ | ✓ | ✓ |
| Update roles | ✓ | - | - | - |
| View all districts | ✓ | - | - | - |

## Backend Implementation

### Database Models

#### User Model (`app/models/user.py`)
```python
- id: Primary key
- username: Unique username
- email: Optional email
- hashed_password: Bcrypt hashed password
- full_name: User's full name
- role: enum (admin, district_officer, block_officer, farmer)
- district: District assignment (for officers)
- block: Block assignment (for block officers)
- is_active: Account status (1=active, 0=inactive)
```

### Authentication Routes (`app/routes/auth.py`)

#### Public Endpoints
- **POST /auth/register** - Register new user
  - Returns: `{access_token, token_type, user}`
  - Input: username, password, email, full_name, role, district, block

- **POST /auth/login** - Login user
  - Returns: `{access_token, token_type, user}`
  - Input: username, password

#### Protected Endpoints
- **GET /auth/me** - Get current user info (requires auth)
- **GET /auth/admin/users** - List all users (admin only)
- **GET /auth/admin/users/{user_id}** - Get specific user (admin only)
- **PUT /auth/admin/users/{user_id}/role** - Update user role (admin only)
- **GET /auth/district/users** - Get users in same district
- **GET /auth/block/users** - Get users in same block

### Security Utilities (`app/security.py`)

Functions:
- `hash_password(password)` - Hash password using bcrypt
- `verify_password(plain, hashed)` - Verify password against hash
- `create_access_token(data)` - Create JWT token
- `decode_token(token)` - Validate and decode JWT

## Frontend Implementation

### Authentication Context (`src/context/AuthContext.jsx`)

Provides:
- `user` - Current logged-in user object
- `isAuthenticated` - Authentication status
- `loading` - Loading state
- `logout()` - Logout function
- `hasRole(roles)` - Check if user has role(s)
- `canAccessDistrict(district)` - Check district access
- `canAccessBlock(block)` - Check block access

### Protected Route Component (`src/components/ProtectedRoute.jsx`)

Usage:
```jsx
<ProtectedRoute requiredRoles={['admin', 'district_officer']}>
  <AdminPanel />
</ProtectedRoute>
```

### Updated Login Page (`src/pages/Login.js`)

Features:
- **Dual Mode**: Login and Registration forms
- **Role Selection**: Choose role during registration
- **Dynamic Fields**: Role-specific fields (district, block for officers)
- **Form Validation**: Required field checking
- **Error Handling**: Display Auth errors
- **Token Management**: Automatic token storage and retrieval

### API Service (`src/services/api.js`)

New functions:
- `loginUser(username, password)` - Login
- `registerUser(userData)` - Register new user
- `getCurrentUser()` - Fetch current user info
- `logoutUser()` - Clear session
- **Interceptor**: Auto-adds Bearer token to all requests

## Setup Instructions

### 1. Backend Setup

**Install dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

**New packages added:**
- PyJWT==2.8.1 - JWT token handling
- passlib==1.7.4.1 - Password hashing utilities
- python-multipart==0.0.6 - Form data parsing
- bcrypt==4.1.1 - Password hashing

**Configure .env:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=uttarakhand_millet_dashboard
DB_USER=postgres
DB_PASSWORD=9326

# Authentication
SECRET_KEY=your-secret-key-uttarakhand-millet-2024-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=480
```

**Create test users:**
```bash
python seed_users.py
```

**Start backend:**
```bash
python -m uvicorn app.main:app --reload
```

### 2. Frontend Setup

No new npm packages needed. Update is handled through existing dependencies.

**Start frontend:**
```bash
npm start
```

## Test Credentials

Run `python seed_users.py` to create these test users:

| Role | Username | Password | Notes |
|------|----------|----------|-------|
| Admin | admin_uttarakhand | Admin@123 | Full system access |
| District Officer | district_nainital | District@123 | Nainital district |
| District Officer | district_almora | District@123 | Almora district |
| Block Officer | block_nainital_city | Block@123 | Nainital block |
| Farmer | farmer_uttarakhand | Farmer@123 | Farmer access |

## API Documentation

### Login Flow
```
1. POST /auth/login
   - Username: admin_uttarakhand
   - Password: Admin@123
   
2. Response:
   {
     "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
     "token_type": "bearer",
     "user": {
       "id": 1,
       "username": "admin_uttarakhand",
       "role": "admin",
       "email": "admin@uttarakhand.gov.in",
       "full_name": "System Administrator",
       "district": null,
       "block": null
     }
   }

3. Store token in localStorage:
   localStorage.setItem('authToken', access_token)
   localStorage.setItem('userInfo', JSON.stringify(user))
```

### Token Usage
All subsequent requests include:
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

## Security Best Practices

1. **Production Setup**:
   - Change SECRET_KEY in .env (use strong random string)
   - Use HTTPS only (not HTTP)
   - Set httpOnly flag on token cookies
   - Implement refresh tokens for better security
   - Add rate limiting on auth endpoints

2. **Password Requirements**:
   - Minimum 8 characters (can be increased in validation)
   - Currently accepts any characters (can add complexity requirements)

3. **Token Security**:
   - Tokens expire after 480 minutes
   - Invalid tokens are rejected
   - Token validation happens on every protected endpoint

4. **User Management**:
   - Users can be deactivated (is_active = 0)
   - Inactive users cannot login
   - Admin can manage all user roles and permissions

## Role-Based Features

### Admin Dashboard
- View all users
- Manage user roles and permissions
- Access all district and block data
- System administration

### District Officer Dashboard
- View all users in their district
- Access procurement and production data for their district
- Generate district-level reports
- Manage block officers in their district

### Block Officer Dashboard
- View all users in their block
- Access detailed block-level data
- Generate block reports
- Coordinate with farmers in their block

### Farmer Portal
- View personal procurement records
- Access production data for their plots
- Submit farmer information
- View scheme information

## Extending the System

### Adding New Roles
1. Add role to `UserRole` enum in `app/models/user.py`
2. Create permission checks in auth routes
3. Update role selector in frontend Login.js
4. Add role-specific UI components

### Adding Permission Checks
```python
# In auth routes:
@router.get("/some-endpoint")
def some_endpoint(current_user: User = Depends(require_role("admin", "district_officer"))):
    # Only admin and district officers can access
    return {"data": "..."}
```

### Frontend Role-Based UI
```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { hasRole, canAccessDistrict } = useAuth();
  
  if (hasRole('admin')) {
    return <AdminView />;
  }
  
  if (hasRole('district_officer')) {
    return <DistrictView />;
  }
  
  return <FarmerView />;
}
```

## Troubleshooting

### "Invalid token" error
- Token has expired (8-hour expiration)
- Re-login to get new token
- Check SECRET_KEY matches between requests

### "User not found" after login
- User account was deleted
- Username was changed
- Check active status (is_active = 1)

### Role restrictions not working
- Clear browser cache
- Verify token contains correct role
- Check route requires correct role

## Files Modified/Created

### Backend
- ✓ `app/models/user.py` - User model with roles
- ✓ `app/security.py` - JWT and password utilities
- ✓ `app/routes/auth.py` - Authentication endpoints
- ✓ `app/main.py` - Added auth router
- ✓ `backend/.env` - Added SECRET_KEY
- ✓ `requirements.txt` - Added auth libraries
- ✓ `seed_users.py` - User seeding script

### Frontend
- ✓ `src/pages/Login.js` - Updated with registration & roles
- ✓ `src/context/AuthContext.jsx` - Auth state management
- ✓ `src/components/ProtectedRoute.jsx` - Route protection
- ✓ `src/services/api.js` - Auth API + interceptor
- ✓ `src/styles/login.css` - New form styles

## Next Steps

1. ✓ Test all authentication flows
2. ✓ Verify role-based access works
3. Implement token refresh mechanism
4. Add password reset functionality
5. Implement email verification
6. Add audit logging for admin actions
7. Setup Two-Factor Authentication (2FA)
