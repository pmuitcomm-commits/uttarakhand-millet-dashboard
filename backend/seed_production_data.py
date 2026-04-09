"""
Seed millet production data for all Uttarakhand districts
Run: python seed_production_data.py
"""

import os
import sys
from dotenv import load_dotenv
from sqlalchemy.orm import Session

load_dotenv()

# Add the backend app to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.database import engine, SessionLocal
    from app.models.millet_production import MilletProduction
    
    # Uttarakhand districts with sample production data
    districts_data = [
        {"district": "Almora", "block": "Almora", "village": "Almora City", "millet_type": "Ragi", "production_quintal": 450, "year": 2024, "farmer_count": 150},
        {"district": "Almora", "block": "Dwarahat", "village": "Dwarahat", "millet_type": "Ragi", "production_quintal": 320, "year": 2024, "farmer_count": 95},
        
        {"district": "Bageshwar", "block": "Bageshwar", "village": "Bageshwar City", "millet_type": "Ragi", "production_quintal": 380, "year": 2024, "farmer_count": 110},
        {"district": "Bageshwar", "block": "Chhiplakot", "village": "Chhiplakot", "millet_type": "Jowar", "production_quintal": 280, "year": 2024, "farmer_count": 75},
        
        {"district": "Chamoli", "block": "Chamoli", "village": "Chamoli City", "millet_type": "Ragi", "production_quintal": 500, "year": 2024, "farmer_count": 160},
        {"district": "Chamoli", "block": "Karnaprayag", "village": "Karnaprayag", "millet_type": "Ragi", "production_quintal": 420, "year": 2024, "farmer_count": 130},
        
        {"district": "Champawat", "block": "Champawat", "village": "Champawat City", "millet_type": "Ragi", "production_quintal": 290, "year": 2024, "farmer_count": 85},
        {"district": "Champawat", "block": "Pantnagar", "village": "Pantnagar", "millet_type": "Jowar", "production_quintal": 310, "year": 2024, "farmer_count": 95},
        
        {"district": "Dehradun", "block": "Dehradun", "village": "Dehradun City", "millet_type": "Ragi", "production_quintal": 120, "year": 2024, "farmer_count": 35},
        {"district": "Dehradun", "block": "Vikasnagar", "village": "Vikasnagar", "millet_type": "Jowar", "production_quintal": 180, "year": 2024, "farmer_count": 50},
        
        {"district": "Haridwar", "block": "Haridwar", "village": "Haridwar City", "millet_type": "Ragi", "production_quintal": 410, "year": 2024, "farmer_count": 120},
        {"district": "Haridwar", "block": "Khimsar", "village": "Khimsar", "millet_type": "Jowar", "production_quintal": 350, "year": 2024, "farmer_count": 100},
        
        {"district": "Nainital", "block": "Nainital", "village": "Nainital City", "millet_type": "Ragi", "production_quintal": 560, "year": 2024, "farmer_count": 180},
        {"district": "Nainital", "block": "Ramnagar", "village": "Ramnagar", "millet_type": "Ragi", "production_quintal": 480, "year": 2024, "farmer_count": 140},
        {"district": "Nainital", "block": "Bhimtal", "village": "Bhimtal", "millet_type": "Jowar", "production_quintal": 320, "year": 2024, "farmer_count": 90},
        
        {"district": "Pauri Garhwal", "block": "Pauri", "village": "Pauri City", "millet_type": "Ragi", "production_quintal": 540, "year": 2024, "farmer_count": 170},
        {"district": "Pauri Garhwal", "block": "Srinagar", "village": "Srinagar", "millet_type": "Ragi", "production_quintal": 460, "year": 2024, "farmer_count": 135},
        
        {"district": "Pithoragarh", "block": "Pithoragarh", "village": "Pithoragarh City", "millet_type": "Ragi", "production_quintal": 470, "year": 2024, "farmer_count": 145},
        {"district": "Pithoragarh", "block": "Munsiyari", "village": "Munsiyari", "millet_type": "Ragi", "production_quintal": 390, "year": 2024, "farmer_count": 115},
        
        {"district": "Rudraprayag", "block": "Rudraprayag", "village": "Rudraprayag City", "millet_type": "Ragi", "production_quintal": 430, "year": 2024, "farmer_count": 125},
        
        {"district": "Tehri Garhwal", "block": "Tehri", "village": "Tehri City", "millet_type": "Ragi", "production_quintal": 520, "year": 2024, "farmer_count": 165},
        {"district": "Tehri Garhwal", "block": "Ghansali", "village": "Ghansali", "millet_type": "Jowar", "production_quintal": 380, "year": 2024, "farmer_count": 110},
        
        {"district": "Udham Singh Nagar", "block": "Udham Singh Nagar", "village": "Udham Singh Nagar City", "millet_type": "Ragi", "production_quintal": 340, "year": 2024, "farmer_count": 100},
        {"district": "Udham Singh Nagar", "block": "Khatima", "village": "Khatima", "millet_type": "Jowar", "production_quintal": 290, "year": 2024, "farmer_count": 85},
        
        {"district": "Uttarkashi", "block": "Uttarkashi", "village": "Uttarkashi City", "millet_type": "Ragi", "production_quintal": 480, "year": 2024, "farmer_count": 150},
        {"district": "Uttarkashi", "block": "Purola", "village": "Purola", "millet_type": "Ragi", "production_quintal": 360, "year": 2024, "farmer_count": 105},
    ]
    
    db = SessionLocal()
    
    # Clear existing data to avoid duplicates
    existing_count = db.query(MilletProduction).count()
    if existing_count > 0:
        print(f"Clearing {existing_count} existing production records...")
        db.query(MilletProduction).delete()
    
    # Add all production records
    for data in districts_data:
        record = MilletProduction(**data)
        db.add(record)
    
    db.commit()
    db.close()
    
    print(f"✓ Successfully seeded {len(districts_data)} production records!")
    print(f"✓ Data seeded for all 13 Uttarakhand districts")
    print("\nDistricts added:")
    districts_list = list(set(d["district"] for d in districts_data))
    for district in sorted(districts_list):
        count = len([d for d in districts_data if d["district"] == district])
        print(f"  - {district}: {count} records")
    
except Exception as e:
    print(f"✗ Error seeding data: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
