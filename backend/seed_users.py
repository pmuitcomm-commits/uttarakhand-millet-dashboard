"""
Seed script to create initial users for testing
Run: python seed_users.py
"""

import os
from dotenv import load_dotenv
from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.security import hash_password

load_dotenv()

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Check if users already exist
    admin_exists = db.query(User).filter(User.username == "admin_uttarakhand").first()
    
    if not admin_exists:
        print("Creating test users...")
        
        # Admin user
        admin = User(
            username="admin_uttarakhand",
            email="admin@uttarakhand.gov.in",
            hashed_password=hash_password("Admin@123"),
            full_name="System Administrator",
            role=UserRole.ADMIN,
            is_active=1
        )
        db.add(admin)
        print("✓ Created Admin: admin_uttarakhand / Admin@123")
        
        # District officer - Nainital
        district_officer = User(
            username="district_nainital",
            email="nainital@uttarakhand.gov.in",
            hashed_password=hash_password("District@123"),
            full_name="District Officer - Nainital",
            role=UserRole.DISTRICT_OFFICER,
            district="Nainital",
            is_active=1
        )
        db.add(district_officer)
        print("✓ Created District Officer: district_nainital / District@123")
        
        # District officer - Almora
        district_officer_2 = User(
            username="district_almora",
            email="almora@uttarakhand.gov.in",
            hashed_password=hash_password("District@123"),
            full_name="District Officer - Almora",
            role=UserRole.DISTRICT_OFFICER,
            district="Almora",
            is_active=1
        )
        db.add(district_officer_2)
        print("✓ Created District Officer: district_almora / District@123")
        
        # Block officer
        block_officer = User(
            username="block_nainital_city",
            email="nainital_city@uttarakhand.gov.in",
            hashed_password=hash_password("Block@123"),
            full_name="Block Officer - Nainital City",
            role=UserRole.BLOCK_OFFICER,
            district="Nainital",
            block="Nainital",
            is_active=1
        )
        db.add(block_officer)
        print("✓ Created Block Officer: block_nainital_city / Block@123")
        
        # Farmer user
        farmer = User(
            username="farmer_uttarakhand",
            email="farmer@example.com",
            hashed_password=hash_password("Farmer@123"),
            full_name="John Farmer",
            role=UserRole.FARMER,
            is_active=1
        )
        db.add(farmer)
        print("✓ Created Farmer: farmer_uttarakhand / Farmer@123")
        
        db.commit()
        print("\n✓ All test users created successfully!")
        print("\nYou can now login with these credentials:")
        print("  Admin:             admin_uttarakhand / Admin@123")
        print("  District Officer:  district_nainital / District@123")
        print("  Block Officer:     block_nainital_city / Block@123")
        print("  Farmer:            farmer_uttarakhand / Farmer@123")
    else:
        print("Users already exist. Skipping creation.")
        
except Exception as e:
    print(f"Error creating users: {e}")
    db.rollback()
finally:
    db.close()
