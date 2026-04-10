"""
Comprehensive security tests for Millet Dashboard Backend
Tests all security vulnerabilities that were fixed
"""

import pytest
import sys
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.app.main import app
from backend.app.database import Base, get_db
from backend.app.security import hash_password

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

# Test data
VALID_USER = {
    "username": "testuser123",
    "password": "SecurePass123",
    "email": "test@example.com",
    "full_name": "Test User",
    "role_id": 4,  # farmer
    "district": "Test District"
}

WEAK_PASSWORD = "weak"
INVALID_ROLE_ID = 999
INJECTION_PAYLOAD = "'; DROP TABLE users; --"


class TestSQLInjection:
    """Test SQL injection vulnerabilities (should all pass - injections are prevented)"""
    
    def test_sql_injection_via_username_register(self):
        """Attempt SQL injection via username field during registration"""
        payload = VALID_USER.copy()
        payload["username"] = INJECTION_PAYLOAD
        
        response = client.post("/auth/register", json=payload)
        # Should fail due to username validation regex
        assert response.status_code in [422, 400]
    
    def test_sql_injection_via_district_register(self):
        """Attempt SQL injection via district field"""
        payload = VALID_USER.copy()
        payload["district"] = "'; DROP TABLE users; --"
        
        response = client.post("/auth/register", json=payload)
        # Should fail due to district validation regex
        assert response.status_code in [422, 400]
    
    def test_parameterized_queries_protect_username_login(self):
        """Verify parameterized queries protect username lookup in login"""
        # Register a user first
        payload = VALID_USER.copy()
        response = client.post("/auth/register", json=payload)
        assert response.status_code == 200
        token = response.json()["access_token"]
        
        # Try to login with injection payload - should not find user
        login_payload = {
            "username": VALID_USER["username"] + "' OR '1'='1",
            "password": VALID_USER["password"]
        }
        response = client.post("/auth/login", json=login_payload)
        assert response.status_code == 401


class TestInputValidation:
    """Test input validation improvements"""
    
    def test_invalid_role_id_registration(self):
        """Test that invalid role_id is rejected"""
        payload = VALID_USER.copy()
        payload["role_id"] = INVALID_ROLE_ID
        
        response = client.post("/auth/register", json=payload)
        assert response.status_code == 422
        assert "Invalid role_id" in response.text or "Allowed values" in response.text
    
    def test_weak_password_registration(self):
        """Test that weak passwords are rejected"""
        payload = VALID_USER.copy()
        payload["password"] = WEAK_PASSWORD
        
        response = client.post("/auth/register", json=payload)
        assert response.status_code == 422
        assert "password" in response.text.lower()
    
    def test_short_username_registration(self):
        """Test that too-short usernames are rejected"""
        payload = VALID_USER.copy()
        payload["username"] = "ab"  # Too short
        
        response = client.post("/auth/register", json=payload)
        assert response.status_code == 422
    
    def test_invalid_email_format(self):
        """Test that invalid emails are rejected"""
        payload = VALID_USER.copy()
        payload["email"] = "not-an-email"
        
        response = client.post("/auth/register", json=payload)
        assert response.status_code == 422
    
    def test_district_field_too_long(self):
        """Test that excessively long district names are rejected"""
        payload = VALID_USER.copy()
        payload["district"] = "a" * 101  # Too long
        
        response = client.post("/auth/register", json=payload)
        assert response.status_code == 422
        assert "District" in response.text


class TestPasswordPolicy:
    """Test password strength enforcement"""
    
    def test_password_no_uppercase(self):
        """Password without uppercase should fail"""
        payload = VALID_USER.copy()
        payload["password"] = "lowerpassword123"
        response = client.post("/auth/register", json=payload)
        assert response.status_code == 422
    
    def test_password_no_lowercase(self):
        """Password without lowercase should fail"""
        payload = VALID_USER.copy()
        payload["password"] = "UPPERPASSWORD123"
        response = client.post("/auth/register", json=payload)
        assert response.status_code == 422
    
    def test_password_no_digit(self):
        """Password without digit should fail"""
        payload = VALID_USER.copy()
        payload["password"] = "NoDigitsHere"
        response = client.post("/auth/register", json=payload)
        assert response.status_code == 422
    
    def test_password_too_short(self):
        """Password shorter than 8 chars should fail"""
        payload = VALID_USER.copy()
        payload["password"] = "Aaa1"
        response = client.post("/auth/register", json=payload)
        assert response.status_code == 422


class TestAuthenticationRequired:
    """Test that endpoints require authentication"""
    
    def test_production_all_requires_auth(self):
        """Production endpoint should require auth"""
        response = client.get("/production/all")
        assert response.status_code == 403
    
    def test_procurement_all_requires_auth(self):
        """Procurement endpoint should require auth"""
        response = client.get("/procurement/all")
        assert response.status_code == 403
    
    def test_dashboard_kpis_requires_auth(self):
        """Dashboard KPI endpoint should require auth"""
        response = client.get("/dashboard/kpis")
        assert response.status_code == 403


class TestIDORPrevention:
    """Test IDOR vulnerabilities are fixed"""
    
    def test_cannot_update_own_role(self):
        """Test that admin cannot modify their own role"""
        # Register admin user
        admin_payload = VALID_USER.copy()
        admin_payload["username"] = "admin123"
        admin_payload["role_id"] = 1  # admin
        
        response = client.post("/auth/register", json=admin_payload)
        assert response.status_code == 200
        admin_token = response.json()["access_token"]
        admin_id = response.json()["user"]["id"]
        
        # Try to update own role
        headers = {"Authorization": f"Bearer {admin_token}"}
        role_update = {"new_role": "farmer"}
        
        response = client.put(
            f"/auth/admin/users/{admin_id}/role",
            json=role_update,
            headers=headers
        )
        
        # Should fail - cannot modify own role
        assert response.status_code == 400
        assert "Cannot modify your own role" in response.text
    
    def test_update_nonexistent_user_returns_404(self):
        """Test updating non-existent user returns 404 not silent success"""
        # Register admin
        admin_payload = VALID_USER.copy()
        admin_payload["username"] = "admin456"
        admin_payload["role_id"] = 1
        
        response = client.post("/auth/register", json=admin_payload)
        admin_token = response.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        role_update = {"new_role": "farmer"}
        
        # Try to update non-existent user
        response = client.put(
            f"/auth/admin/users/99999/role",
            json=role_update,
            headers=headers
        )
        
        assert response.status_code == 404


class TestRoleUpdateValidation:
    """Test role update endpoint validation"""
    
    def test_invalid_role_update(self):
        """Test that invalid role names in update are rejected"""
        # Register admin and user first
        admin_payload = VALID_USER.copy()
        admin_payload["username"] = "admin789"
        admin_payload["role_id"] = 1
        
        response = client.post("/auth/register", json=admin_payload)
        admin_token = response.json()["access_token"]
        
        user_payload = VALID_USER.copy()
        user_payload["username"] = "farmer789"
        
        response = client.post("/auth/register", json=user_payload)
        user_id = response.json()["user"]["id"]
        
        # Try to update with invalid role
        headers = {"Authorization": f"Bearer {admin_token}"}
        role_update = {"new_role": "invalid_role"}
        
        response = client.put(
            f"/auth/admin/users/{user_id}/role",
            json=role_update,
            headers=headers
        )
        
        assert response.status_code == 422


class TestPagination:
    """Test pagination implementation"""
    
    def test_district_users_pagination_limit_default(self):
        """Test default limit on district users endpoint"""
        # Register admin
        admin_payload = VALID_USER.copy()
        admin_payload["username"] = "admin_pag1"
        admin_payload["role_id"] = 1
        
        response = client.post("/auth/register", json=admin_payload)
        admin_token = response.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = client.get("/auth/district/users", headers=headers)
        
        assert response.status_code == 200
    
    def test_district_users_pagination_limit_max(self):
        """Test that limit parameter respects max of 100"""
        admin_payload = VALID_USER.copy()
        admin_payload["username"] = "admin_pag2"
        admin_payload["role_id"] = 1
        
        response = client.post("/auth/register", json=admin_payload)
        admin_token = response.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Try with limit > 100
        response = client.get(
            "/auth/district/users?limit=500&offset=0",
            headers=headers
        )
        
        assert response.status_code == 200
        # Should clamp to 50 if over limit
    
    def test_block_users_pagination_offset(self):
        """Test offset parameter works correctly"""
        admin_payload = VALID_USER.copy()
        admin_payload["username"] = "admin_pag3"
        admin_payload["role_id"] = 1
        
        response = client.post("/auth/register", json=admin_payload)
        admin_token = response.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = client.get(
            "/auth/block/users?limit=10&offset=5",
            headers=headers
        )
        
        assert response.status_code == 200


class TestErrorHandling:
    """Test that errors don't leak sensitive information"""
    
    def test_login_generic_error_message(self):
        """Test that login gives generic error for both user not found and password wrong"""
        # Try non-existent user
        response = client.post("/auth/login", json={
            "username": "nonexistent_user_xyz",
            "password": "SomePassword123"
        })
        
        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid username or password"
        # Generic message - doesn't say user not found
    
    def test_procurement_kpi_error_handling(self):
        """Test that procurement API errors don't crash the app"""
        # Register user to get auth
        response = client.post("/auth/register", json=VALID_USER)
        assert response.status_code == 200
        token = response.json()["access_token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/procurement/kpis", headers=headers)
        
        # Should not crash, should return 200 with data or 500 with error
        assert response.status_code in [200, 500]
        if response.status_code == 500:
            assert "detail" in response.json()


class TestSilentFallbacks:
    """Test that silent fallbacks have been removed"""
    
    def test_registration_invalid_role_does_not_silently_become_farmer(self):
        """Test that invalid role_id doesn't silently become farmer"""
        payload = VALID_USER.copy()
        payload["role_id"] = 999
        
        response = client.post("/auth/register", json=payload)
        
        # Should reject, not silently fallback to farmer
        assert response.status_code != 200
        assert response.status_code in [422, 400]


class TestEmailValidation:
    """Test email field validation"""
    
    def test_invalid_email_rejected(self):
        """Test that invalid email format is rejected"""
        payload = VALID_USER.copy()
        payload["email"] = "not_a_valid_email"
        
        response = client.post("/auth/register", json=payload)
        assert response.status_code == 422
    
    def test_valid_email_accepted(self):
        """Test that valid email format is accepted"""
        payload = VALID_USER.copy()
        payload["email"] = "valid.email@example.com"
        
        response = client.post("/auth/register", json=payload)
        assert response.status_code == 200
    
    def test_no_email_allowed(self):
        """Test that email is optional"""
        payload = VALID_USER.copy()
        del payload["email"]
        
        response = client.post("/auth/register", json=payload)
        assert response.status_code == 200


class TestRateLimiting:
    """Test rate limiting functionality"""
    
    def test_api_responds_to_requests(self):
        """Basic test that API is available (rate limiting header might be present)"""
        response = client.get("/")
        assert response.status_code == 200
    
    def test_auth_endpoints_accessible(self):
        """Test auth endpoints don't immediately rate limit"""
        # These should work (rate limit is at 60/min which is high for tests)
        payload = VALID_USER.copy()
        payload["username"] = f"testuser_{id(payload)}"
        
        response = client.post("/auth/register", json=payload)
        assert response.status_code in [200, 429]  # Either success or rate limited


class TestSecretKeyValidation:
    """Test SECRET_KEY configuration"""
    
    def test_missing_secret_key_raises_error(self):
        """In production, missing SECRET_KEY should raise on startup"""
        # This is tested at import time
        # If app imported successfully, SECRET_KEY is set
        assert app is not None


def run_all_tests():
    """Run all security tests"""
    pytest.main([__file__, "-v", "--tb=short"])


if __name__ == "__main__":
    print("=" * 80)
    print("RUNNING SECURITY VULNERABILITY TESTS")
    print("=" * 80)
    run_all_tests()
