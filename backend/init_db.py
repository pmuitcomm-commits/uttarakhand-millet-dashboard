"""
Database initialization script for the Millet MIS backend.

Run this script during controlled setup to create SQLAlchemy-managed tables.
It is intended for deployment/bootstrap use and exits non-zero when schema
creation fails.
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Add the backend directory to the Python path so ``app`` imports resolve when
# the script is launched directly from the repository.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.database import engine, Base
    from app.models.data_entry import DistrictBlockDataEntry
    from app.models.farmer import Farmer, LandParcel
    from app.models.procurement import Procurement
    from app.models.production import Production
    from app.models.user import User

    managed_tables = [
        User.__tablename__,
        Farmer.__tablename__,
        LandParcel.__tablename__,
        Production.__tablename__,
        Procurement.__tablename__,
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
