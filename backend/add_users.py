"""
Legacy user seeding helper for existing database schemas.

This script creates sample government users for local or controlled test
environments. Passwords should be supplied through SEED_*_PASSWORD variables in
shared environments so generated credentials are not lost after execution.
"""

import os
import secrets
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import text

load_dotenv()

db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")
db_name = os.getenv("DB_NAME")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")

password_part = f":{db_password}" if db_password else ""
port_part = f":{db_port}" if db_port else ""
DATABASE_URL = f"postgresql://{db_user}{password_part}@{db_host}{port_part}/{db_name}"

try:
    from sqlalchemy import create_engine
    from app.security import hash_password

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
    
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        print("Creating test users in existing schema...")
        
        # Existing seed detection keeps repeated setup runs idempotent.
        result = conn.execute(text("SELECT COUNT(*) FROM users WHERE email = 'admin@uttarakhand.gov.in'"))
        if result.scalar() > 0:
            print("✓ Users already exist!")
        else:
            # Insert representative users for each MIS role.
            admin_pw = hash_password(admin_password)
            conn.execute(text("""
                INSERT INTO users (name, email, password, role_id, district, created_at)
                VALUES (:name, :email, :password, :role_id, :district, :created_at)
            """), {
                "name": "admin_uttarakhand",
                "email": "admin@uttarakhand.gov.in",
                "password": admin_pw,
                "role_id": 1,
                "district": None,
                "created_at": datetime.now()
            })
            print("✓ Created Admin user admin_uttarakhand")
            
            # Insert district officer
            dist_pw = hash_password(district_password)
            conn.execute(text("""
                INSERT INTO users (name, email, password, role_id, district, created_at)
                VALUES (:name, :email, :password, :role_id, :district, :created_at)
            """), {
                "name": "district_nainital",
                "email": "nainital@uttarakhand.gov.in",
                "password": dist_pw,
                "role_id": 2,
                "district": "Nainital",
                "created_at": datetime.now()
            })
            print("✓ Created District Officer user district_nainital")
            
            # Insert block officer
            block_pw = hash_password(block_password)
            conn.execute(text("""
                INSERT INTO users (name, email, password, role_id, district, created_at)
                VALUES (:name, :email, :password, :role_id, :district, :created_at)
            """), {
                "name": "block_nainital",
                "email": "block@nainital.gov.in",
                "password": block_pw,
                "role_id": 3,
                "district": "Nainital",
                "created_at": datetime.now()
            })
            print("✓ Created Block Officer user block_nainital")
            
            # Insert farmer
            farmer_pw = hash_password(farmer_password)
            conn.execute(text("""
                INSERT INTO users (name, email, password, role_id, created_at)
                VALUES (:name, :email, :password, :role_id, :created_at)
            """), {
                "name": "farmer_john",
                "email": "farmer@example.com",
                "password": farmer_pw,
                "role_id": 4,
                "created_at": datetime.now()
            })
            print("✓ Created Farmer user farmer_john")
            
            conn.commit()
            print("\n✓✓✓ Users created successfully!")
            print("Passwords were read from SEED_*_PASSWORD env vars or generated for this run.")
        
        # List all users
        print("\n--- All Users ---")
        result = conn.execute(text("SELECT name, email, role_id FROM users LIMIT 10"))
        for row in result:
            roles = {1: 'Admin', 2: 'District Officer', 3: 'Block Officer', 4: 'Farmer', None: 'Unknown'}
            print(f"  {row[0]:25} | {row[1]:35} | {roles.get(row[2], 'Unknown')}")
        
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
