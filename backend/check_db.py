"""
Diagnostic script to check database state
Run: python check_db.py
"""

import os
from dotenv import load_dotenv
from sqlalchemy import text, inspect

load_dotenv()

db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")
db_name = os.getenv("DB_NAME")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")

password_part = f":{db_password}" if db_password else ""
port_part = f":{db_port}" if db_port else ""
DATABASE_URL = f"postgresql://{db_user}{password_part}@{db_host}{port_part}/{db_name}"

print(f"Connecting to: {db_host}:{db_port}/{db_name}")

try:
    from sqlalchemy import create_engine
    engine = create_engine(DATABASE_URL)
    
    # Check tables
    with engine.connect() as conn:
        print("\n=== Tables in Database ===")
        result = conn.execute(text("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema='public'
        """))
        tables = [row[0] for row in result.fetchall()]
        for table in tables:
            print(f"  - {table}")
        
        # Check users table specifically
        if 'users' in tables:
            print("\n=== Columns in 'users' table ===")
            result = conn.execute(text("""
                SELECT column_name, data_type FROM information_schema.columns 
                WHERE table_name = 'users'
                ORDER BY ordinal_position
            """))
            for col_name, data_type in result:
                print(f"  - {col_name}: {data_type}")
        else:
            print("\n⚠️  'users' table does NOT exist")
            
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
