"""
Database initialization script for the Millet MIS backend.

Local/development helper for creating SQLAlchemy-managed tables.

Production schema changes must use reviewed Alembic migrations. This script is
blocked by default unless the environment is explicitly non-production or
ALLOW_LOCAL_INIT_DB=true is set.
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Add the backend directory to the Python path so ``app`` imports resolve when
# the script is launched directly from the repository.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

environment = (
    os.getenv("APP_ENV")
    or os.getenv("ENVIRONMENT")
    or os.getenv("ENV")
    or "production"
).strip().lower()
allow_local_init = os.getenv("ALLOW_LOCAL_INIT_DB", "").strip().lower() in {"1", "true", "yes"}
if environment not in {"development", "dev", "local", "test", "testing"} and not allow_local_init:
    print("init_db.py is local/dev only. Use Alembic migrations for production schema changes.")
    print("Set APP_ENV=development or ALLOW_LOCAL_INIT_DB=true only for controlled local setup.")
    sys.exit(1)

try:
    from app.database import engine, Base
    from app.models.data_entry import DistrictBlockDataEntry
    from app.models.farmer import Farmer, FarmerSchemeTransaction, LandParcel
    from app.models.infrastructure import StorageProcessing
    from app.models.procurement import Procurement
    from app.models.production import Production
    from app.models.user import User

    managed_tables = [
        User.__tablename__,
        Farmer.__tablename__,
        LandParcel.__tablename__,
        FarmerSchemeTransaction.__tablename__,
        Production.__tablename__,
        Procurement.__tablename__,
        StorageProcessing.__tablename__,
        DistrictBlockDataEntry.__tablename__,
    ]
    
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully!")
    print("\nTables created:")
    for table_name in managed_tables:
        print(f"  - {table_name}")
    
except Exception as e:
    print(f"✗ Error creating tables: {e}")
    sys.exit(1)
