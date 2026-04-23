import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Add the backend app to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.database import engine, Base
    from app.models.user import User, UserRole
    from app.models.procurement import Procurement
    
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully!")
    print("\nTables created:")
    print("  - users")
    print("  - millet_production")
    print("  - procurement")
    
except Exception as e:
    print(f"✗ Error creating tables: {e}")
    sys.exit(1)
