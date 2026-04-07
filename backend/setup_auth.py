"""
Create test users directly using SQL
Run: python setup_auth.py
"""

import os
import sys
from dotenv import load_dotenv
from sqlalchemy import text

load_dotenv()

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.database import SessionLocal
    from app.security import hash_password
    
    db = SessionLocal()
    
    print("Creating users table with SQL...")
    
    # Create users table with correct schema
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR UNIQUE NOT NULL,
            email VARCHAR UNIQUE,
            hashed_password VARCHAR NOT NULL,
            full_name VARCHAR,
            role VARCHAR DEFAULT 'farmer',
            district VARCHAR,
            block VARCHAR,
            is_active INTEGER DEFAULT 1
        )
    """))
    db.commit()
    print("✓ Users table created")
    
    # Check if admin exists
    result = db.execute(text("SELECT COUNT(*) FROM users WHERE username = 'admin_uttarakhand'"))
    if result.scalar() == 0:
        print("\nCreating test users...")
        
        # Create admin
        admin_pw = hash_password("Admin@123")
        db.execute(text("""
            INSERT INTO users (username, email, hashed_password, full_name, role, is_active)
            VALUES (:username, :email, :hashed_password, :full_name, :role, :is_active)
        """), {
            "username": "admin_uttarakhand",
            "email": "admin@uttarakhand.gov.in",
            "hashed_password": admin_pw,
            "full_name": "System Administrator",
            "role": "admin",
            "is_active": 1
        })
        print("✓ Created Admin: admin_uttarakhand / Admin@123")
        
        # District officer - Nainital
        dist_pw = hash_password("District@123")
        db.execute(text("""
            INSERT INTO users (username, email, hashed_password, full_name, role, district, is_active)
            VALUES (:username, :email, :hashed_password, :full_name, :role, :district, :is_active)
        """), {
            "username": "district_nainital",
            "email": "nainital@uttarakhand.gov.in",
            "hashed_password": dist_pw,
            "full_name": "District Officer - Nainital",
            "role": "district_officer",
            "district": "Nainital",
            "is_active": 1
        })
        print("✓ Created District Officer: district_nainital / District@123")
        
        # District officer - Almora
        db.execute(text("""
            INSERT INTO users (username, email, hashed_password, full_name, role, district, is_active)
            VALUES (:username, :email, :hashed_password, :full_name, :role, :district, :is_active)
        """), {
            "username": "district_almora",
            "email": "almora@uttarakhand.gov.in",
            "hashed_password": dist_pw,
            "full_name": "District Officer - Almora",
            "role": "district_officer",
            "district": "Almora",
            "is_active": 1
        })
        print("✓ Created District Officer: district_almora / District@123")
        
        # Block officer
        block_pw = hash_password("Block@123")
        db.execute(text("""
            INSERT INTO users (username, email, hashed_password, full_name, role, district, block, is_active)
            VALUES (:username, :email, :hashed_password, :full_name, :role, :district, :block, :is_active)
        """), {
            "username": "block_nainital_city",
            "email": "nainital_city@uttarakhand.gov.in",
            "hashed_password": block_pw,
            "full_name": "Block Officer - Nainital City",
            "role": "block_officer",
            "district": "Nainital",
            "block": "Nainital",
            "is_active": 1
        })
        print("✓ Created Block Officer: block_nainital_city / Block@123")
        
        # Farmer
        farmer_pw = hash_password("Farmer@123")
        db.execute(text("""
            INSERT INTO users (username, email, hashed_password, full_name, role, is_active)
            VALUES (:username, :email, :hashed_password, :full_name, :role, :is_active)
        """), {
            "username": "farmer_uttarakhand",
            "email": "farmer@example.com",
            "hashed_password": farmer_pw,
            "full_name": "John Farmer",
            "role": "farmer",
            "is_active": 1
        })
        print("✓ Created Farmer: farmer_uttarakhand / Farmer@123")
        
        db.commit()
        print("\n✓✓✓ All test users created successfully!")
    else:
        print("Users already exist!")
    
    # List all users
    print("\n--- All Users ---")
    result = db.execute(text("SELECT username, full_name, role FROM users"))
    for row in result:
        print(f"  {row[0]:25} | {row[1]:35} | {row[2]}")
    
    db.close()
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
