import psycopg2
import os

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'uttarakhand_millet_dashboard')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', '9326')

conn_string = f"host={DB_HOST} port={DB_PORT} dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD}"

try:
    conn = psycopg2.connect(conn_string)
    cursor = conn.cursor()
    
    print("=" * 80)
    print("MILLET_PRODUCTION TABLE STRUCTURE & SAMPLE DATA")
    print("=" * 80)
    print()
    
    # Get table schema
    print("TABLE COLUMNS:")
    print("-" * 80)
    cursor.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'millet_production'
        ORDER BY ordinal_position;
    """)
    
    columns = cursor.fetchall()
    if columns:
        for col_name, col_type in columns:
            print(f"  - {col_name}: {col_type}")
    
    print()
    print("=" * 80)
    print("TOTAL RECORD COUNT:")
    print("-" * 80)
    cursor.execute("SELECT COUNT(*) FROM millet_production;")
    total = cursor.fetchone()[0]
    print(f"Total records: {total}")
    
    print()
    print("=" * 80)
    print("SAMPLE RECORD(S):")
    print("-" * 80)
    
    if total > 0:
        cursor.execute("SELECT * FROM millet_production LIMIT 1;")
        sample = cursor.fetchone()
        if sample:
            col_names = [desc[0] for desc in cursor.description]
            for i, (col_name, value) in enumerate(zip(col_names, sample), 1):
                print(f"  {col_name}: {value}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")
