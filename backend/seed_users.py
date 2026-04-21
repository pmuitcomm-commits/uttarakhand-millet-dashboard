"""
Seed script to create initial users for testing
Run: python seed_users.py
"""

import os
import secrets
from dotenv import load_dotenv
from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.security import hash_password

load_dotenv()

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

def seed_password(env_name: str) -> str:
    return os.getenv(env_name) or secrets.token_urlsafe(18)


admin_password = seed_password("SEED_ADMIN_PASSWORD")
district_password = seed_password("SEED_DISTRICT_PASSWORD")
block_password = seed_password("SEED_BLOCK_PASSWORD")
farmer_password = seed_password("SEED_FARMER_PASSWORD")

try:
    # Check if users already exist
    admin_exists = db.query(User).filter(User.username == "admin_uttarakhand").first()
    
    if not admin_exists:
        print("Creating test users...")
        
        # Admin user
        admin = User(
            username="admin_uttarakhand",
            email="admin@uttarakhand.gov.in",
            hashed_password=hash_password(admin_password),
            full_name="System Administrator",
            role=UserRole.ADMIN,
            is_active=1
        )
        db.add(admin)
        print("? Created Admin user admin_uttarakhand")
        
        # District officer - Nainital
        district_officer = User(
            username="district_nainital",
            email="nainital@uttarakhand.gov.in",
            hashed_password=hash_password(district_password),
            full_name="District Officer - Nainital",
            role=UserRole.DISTRICT_OFFICER,
            district="Nainital",
            is_active=1
        )
        db.add(district_officer)
        print("? Created District Officer user district_nainital")
        
        # District officer - Almora
        district_officer_2 = User(
            username="district_almora",
            email="almora@uttarakhand.gov.in",
            hashed_password=hash_password(district_password),
            full_name="District Officer - Almora",
            role=UserRole.DISTRICT_OFFICER,
            district="Almora",
            is_active=1
        )
        db.add(district_officer_2)
        print("? Created District Officer user district_almora")
        
        # Block officer
        block_officer = User(
            username="block_nainital_city",
            email="nainital_city@uttarakhand.gov.in",
            hashed_password=hash_password(block_password),
            full_name="Block Officer - Nainital City",
            role=UserRole.BLOCK_OFFICER,
            district="Nainital",
            block="Nainital",
            is_active=1
        )
        db.add(block_officer)
        print("? Created Block Officer user block_nainital_city")
        
        # Farmer user
        farmer = User(
            username="farmer_uttarakhand",
            email="farmer@example.com",
            hashed_password=hash_password(farmer_password),
            full_name="John Farmer",
            role=UserRole.FARMER,
            is_active=1
        )
        db.add(farmer)
        print("? Created Farmer user farmer_uttarakhand")
        
        db.commit()
        print("\n? All test users created successfully!")
        print("Passwords were read from SEED_*_PASSWORD env vars or generated for this run.")
    else:
        print("Users already exist. Skipping creation.")
        
except Exception as e:
    print(f"Error creating users: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
