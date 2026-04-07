import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Connecting to: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'unknown'}")

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
        tables = result.fetchall()
        print(f"\n✓ Connected to Supabase successfully!")
        print(f"\nTables found:")
        for table in tables:
            print(f"  - {table[0]}")
except Exception as e:
    print(f"✗ Connection failed: {e}")
