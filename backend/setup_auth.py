"""
Authentication schema and seed user setup for the Millet MIS backend.

This script creates the current users table shape and inserts representative
admin, district, block, and farmer accounts for controlled
setup/testing environments.
"""

import os
import secrets
import sys
from dotenv import load_dotenv
from sqlalchemy import text

load_dotenv()

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.database import SessionLocal
    from app.security import hash_password
    
    db = SessionLocal()

    def seed_password(env_name: str) -> str:
        """
        Read a seed password from the environment or generate a temporary one.

        Args:
            env_name (str): Environment variable name to inspect.

        Returns:
            str: Password value used for the seeded account.
        """
        return os.getenv(env_name) or secrets.token_urlsafe(18)

    admin_password = seed_password("SEED_ADMIN_PASSWORD")
    district_password = seed_password("SEED_DISTRICT_PASSWORD")
    block_password = seed_password("SEED_BLOCK_PASSWORD")
    farmer_password = seed_password("SEED_FARMER_PASSWORD")
    
    print("Creating users table with SQL...")
    
    # Create the authentication table expected by the active API routes.
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
    
    # Existing admin detection keeps repeated setup runs idempotent.
    result = db.execute(text("SELECT COUNT(*) FROM users WHERE username = 'admin_uttarakhand'"))
    if result.scalar() == 0:
        print("\nCreating test users...")
        
        # Create representative users for each MIS role and scope level.
        admin_pw = hash_password(admin_password)
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
        print("✓ Created Admin user admin_uttarakhand")
        
        # District user - Nainital
        dist_pw = hash_password(district_password)
        db.execute(text("""
            INSERT INTO users (username, email, hashed_password, full_name, role, district, is_active)
            VALUES (:username, :email, :hashed_password, :full_name, :role, :district, :is_active)
        """), {
            "username": "district_nainital",
            "email": "nainital@uttarakhand.gov.in",
            "hashed_password": dist_pw,
            "full_name": "District Officer - Nainital",
            "role": "district",
            "district": "Nainital",
            "is_active": 1
        })
        print("✓ Created District Officer user district_nainital")
        
        # District user - Almora
        db.execute(text("""
            INSERT INTO users (username, email, hashed_password, full_name, role, district, is_active)
            VALUES (:username, :email, :hashed_password, :full_name, :role, :district, :is_active)
        """), {
            "username": "district_almora",
            "email": "almora@uttarakhand.gov.in",
            "hashed_password": dist_pw,
            "full_name": "District Officer - Almora",
            "role": "district",
            "district": "Almora",
            "is_active": 1
        })
        print("✓ Created District Officer user district_almora")
        
        # Block user
        block_pw = hash_password(block_password)
        db.execute(text("""
            INSERT INTO users (username, email, hashed_password, full_name, role, district, block, is_active)
            VALUES (:username, :email, :hashed_password, :full_name, :role, :district, :block, :is_active)
        """), {
            "username": "block_nainital_city",
            "email": "nainital_city@uttarakhand.gov.in",
            "hashed_password": block_pw,
            "full_name": "Block Officer - Nainital City",
            "role": "block",
            "district": "Nainital",
            "block": "Nainital",
            "is_active": 1
        })
        print("✓ Created Block Officer user block_nainital_city")
        
        # Farmer
        farmer_pw = hash_password(farmer_password)
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
        print("✓ Created Farmer user farmer_uttarakhand")
        
        db.commit()
        print("\n✓✓✓ All test users created successfully!")
        print("Passwords were read from SEED_*_PASSWORD env vars or generated for this run.")
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
