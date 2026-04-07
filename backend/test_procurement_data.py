import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")
    db_name = os.getenv("DB_NAME")
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")

    if db_host and db_name and db_user:
        password_part = f":{db_password}" if db_password else ""
        port_part = f":{db_port}" if db_port else ""
        DATABASE_URL = f"postgresql://{db_user}{password_part}@{db_host}{port_part}/{db_name}"

print(f"Connecting to: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else DATABASE_URL}")

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        # Check if procurement table exists
        result = conn.execute(text("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema='public' AND table_name='procurement'
        """))
        table_exists = result.fetchone()
        
        if not table_exists:
            print("✗ Procurement table does not exist!")
        else:
            print("✓ Procurement table exists!")
            
            # Count records
            count_result = conn.execute(text("SELECT COUNT(*) FROM procurement"))
            record_count = count_result.scalar()
            print(f"  Total records: {record_count}")
            
            if record_count > 0:
                # Show first few records
                data_result = conn.execute(text("SELECT * FROM procurement LIMIT 3"))
                rows = data_result.fetchall()
                print("\n  Sample data:")
                for row in rows:
                    print(f"    {row}")
            else:
                print("  ⚠️  Table is empty!")
                
except Exception as e:
    print(f"✗ Connection failed: {e}")
