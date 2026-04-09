"""
Seed millet production data with 5 specific millet varieties
Run: python seed_millet_varieties.py
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
    
    # 13 Uttarakhand districts with 5 millet varieties each
    districts = [
        "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun",
        "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh",
        "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"
    ]
    
    millet_varieties = ["Mandua", "Jhangora", "Ramdana", "Cheena", "Kauni"]
    
    blocks = {
        "Almora": ["Almora", "Dwarahat"],
        "Bageshwar": ["Bageshwar", "Chhiplakot"],
        "Chamoli": ["Chamoli", "Karnaprayag"],
        "Champawat": ["Champawat", "Pantnagar"],
        "Dehradun": ["Dehradun", "Vikasnagar"],
        "Haridwar": ["Haridwar", "Khimsar"],
        "Nainital": ["Nainital", "Ramnagar", "Bhimtal"],
        "Pauri Garhwal": ["Pauri", "Srinagar"],
        "Pithoragarh": ["Pithoragarh", "Munsiyari"],
        "Rudraprayag": ["Rudraprayag"],
        "Tehri Garhwal": ["Tehri", "Ghansali"],
        "Udham Singh Nagar": ["Udham Singh Nagar", "Khatima"],
        "Uttarkashi": ["Uttarkashi", "Purola"],
    }
    
    production_data = []
    
    for district in districts:
        district_blocks = blocks.get(district, [district])
        for block in district_blocks:
            for idx, millet in enumerate(millet_varieties):
                # Vary production based on millet type
                base_production = 300 + (idx * 100)
                variation = (ord(district[0]) + ord(millet[0])) % 200
                production = base_production + variation
                
                production_data.append({
                    "district": district,
                    "block": block,
                    "village": f"{block} Village",
                    "millet_type": millet,
                    "production_quintal": production,
                    "year": 2024,
                    "farmer_count": 30 + (idx * 10),
                })
    
    db = SessionLocal()
    
    # Clear existing data to avoid duplicates
    existing_count = db.query(MilletProduction).count()
    if existing_count > 0:
        print(f"Clearing {existing_count} existing production records...")
        db.query(MilletProduction).delete()
    
    # Add all production records
    for data in production_data:
        record = MilletProduction(**data)
        db.add(record)
    
    db.commit()
    db.close()
    
    print(f"✓ Successfully seeded {len(production_data)} production records!")
    print(f"✓ Data seeded for 13 districts × 5 millet varieties")
    print("\nMillet Varieties Added:")
    for millet in millet_varieties:
        count = len([d for d in production_data if d["millet_type"] == millet])
        print(f"  - {millet}: {count} records")
    
    print("\nDistricts Included:")
    for i, district in enumerate(districts, 1):
        print(f"  {i:2d}. {district}")
    
except Exception as e:
    print(f"✗ Error seeding data: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
