import os
import socket
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Try to resolve the hostname with Google DNS
print("Resolving Supabase hostname with Google DNS...")
try:
    resolver = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    resolver.connect(("8.8.8.8", 53))
    
    # Extract hostname
    hostname = DATABASE_URL.split('@')[1].split(':')[0]
    print(f"Hostname: {hostname}")
    
    # Resolve with custom DNS (this won't work directly in Python easily)
    # Instead, let's try with the original URL but with socket timeout
    
    socket.setdefaulttimeout(5)
    ip = socket.gethostbyname_ex(hostname)
    print(f"Resolved IP: {ip}")
    
except Exception as e:
    print(f"Resolution attempt: {e}")

print("\nTrying to connect to Supabase...")
try:
    engine = create_engine(
        DATABASE_URL,
        connect_args={
            "connect_timeout": 10,
            "keepalives": 1,
            "keepalives_idle": 30,
        }
    )
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("✓ Connected to Supabase successfully!")
except Exception as e:
    print(f"✗ Connection failed: {e}")
