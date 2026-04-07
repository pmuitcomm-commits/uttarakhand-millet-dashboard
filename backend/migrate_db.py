"""
Database migration - drops and recreates users table
Run: python migrate_db.py
"""

import os
import sys
from dotenv import load_dotenv
from sqlalchemy import text

load_dotenv()

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.database import engine, Base, SessionLocal
    from app.models.user import User, UserRole
    
    print("Dropping existing users table...")
    with engine.connect() as conn:
        # Drop users table if exists
        conn.execute(text("DROP TABLE IF EXISTS users"))
        conn.commit()
        print("✓ Dropped users table")
    
    print("\nCreating users table from model...")
    Base.metadata.create_all(bind=engine, tables=[User.__table__])
    print("✓ Users table created")
    
    # Verify table exists
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'users'
        """))
        columns = [row[0] for row in result.fetchall()]
        print(f"\n✓ Users table columns: {columns}")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
