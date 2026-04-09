import psycopg2
import os

# Database connection details from .env file
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'uttarakhand_millet_dashboard')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', '9326')

# Create connection string using proper psycopg2 parameter names
conn_string = f"host={DB_HOST} port={DB_PORT} dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD}"

try:
    # Connect to the database
    conn = psycopg2.connect(conn_string)
    cursor = conn.cursor()
    
    print("=" * 60)
    print("QUERYING MILLET PRODUCTION DATABASE")
    print("=" * 60)
    print()
    
    # Query 1: Get distinct districts
    print("DISTINCT DISTRICTS:")
    print("-" * 60)
    cursor.execute("SELECT DISTINCT district FROM millet_production ORDER BY district;")
    districts = cursor.fetchall()
    
    if districts:
        for idx, (district,) in enumerate(districts, 1):
            print(f"{idx}. {district}")
    else:
        print("No districts found in the database.")
    
    print()
    print("=" * 60)
    print("RECORD COUNT PER DISTRICT:")
    print("-" * 60)
    
    # Query 2: Get count of records per district
    cursor.execute("""
        SELECT district, COUNT(*) as record_count 
        FROM millet_production 
        GROUP BY district 
        ORDER BY district;
    """)
    
    district_counts = cursor.fetchall()
    total_records = 0
    
    if district_counts:
        for district, count in district_counts:
            print(f"{district}: {count} records")
            total_records += count
        print("-" * 60)
        print(f"Total records: {total_records}")
    else:
        print("No data found.")
    
    cursor.close()
    conn.close()
    
    print()
    print("=" * 60)
    print("Query completed successfully!")
    print("=" * 60)
    
except Exception as e:
    print(f"Error connecting to database: {e}")
