from app.database import SessionLocal
from app.models.procurement import Procurement

db = SessionLocal()

# Sample procurement data
procurement_data = [
    {"s_no": 1, "district": "Udham Singh Nagar", "crop": "Millet", "nos_of_centre": 25, "target_in_mt": 5000, "no_of_farmers_shgs": 1200, "procurement_quantity_in_mt": 4500, "procurement_in_percent": 85.5, "procurement_by_pvt_agencies_in_mt": 225},
    {"s_no": 2, "district": "Almora", "crop": "Millet", "nos_of_centre": 30, "target_in_mt": 6000, "no_of_farmers_shgs": 1500, "procurement_quantity_in_mt": 5200, "procurement_in_percent": 86.7, "procurement_by_pvt_agencies_in_mt": 260},
    {"s_no": 3, "district": "Bageshwar", "crop": "Millet", "nos_of_centre": 20, "target_in_mt": 4000, "no_of_farmers_shgs": 1000, "procurement_quantity_in_mt": 3600, "procurement_in_percent": 90.0, "procurement_by_pvt_agencies_in_mt": 180},
    {"s_no": 4, "district": "Champawat", "crop": "Millet", "nos_of_centre": 15, "target_in_mt": 3000, "no_of_farmers_shgs": 800, "procurement_quantity_in_mt": 2700, "procurement_in_percent": 90.0, "procurement_by_pvt_agencies_in_mt": 135},
    {"s_no": 5, "district": "Nainital", "crop": "Millet", "nos_of_centre": 22, "target_in_mt": 4500, "no_of_farmers_shgs": 1100, "procurement_quantity_in_mt": 4000, "procurement_in_percent": 88.9, "procurement_by_pvt_agencies_in_mt": 200},
]

for item in procurement_data:
    record = Procurement(**item)
    db.add(record)

db.commit()
print(f"✓ Inserted {len(procurement_data)} procurement records successfully")
db.close()
