import os
from dotenv import load_dotenv
import sqlalchemy
from urllib.parse import urlparse
import traceback
import sys
import socket

def test_connection(name, db_url):
    print(f"\n--- Testing {name} ---")
    parsed = urlparse(db_url)
    print(f"Host: {parsed.hostname}")
    print(f"Port: {parsed.port}")
    
    # Try DNS resolution
    try:
        ip = socket.gethostbyname(parsed.hostname)
        print(f"DNS Resolution: Success ({ip})")
    except Exception as e:
        print(f"DNS Resolution: FAILED ({e})")
    
    try:
        engine = sqlalchemy.create_engine(db_url, connect_args={"connect_timeout": 5})
        with engine.connect() as conn:
            result = conn.execute(sqlalchemy.text("SELECT 1;")).scalar()
            print(f"Connection: SUCCESS! (SELECT 1 -> {result})")
    except Exception as e:
        print(f"Connection: FAILED! ({type(e).__name__})")
        if "Name or service not known" in str(e):
            print("  -> Root Cause: DNS Resolution failed (Host does not exist on this network/IPv4).")
        elif "timeout" in str(e).lower():
            print("  -> Root Cause: Connection Timed Out.")
        else:
            print(f"  -> Error details: {str(e)[:200]}")

def main():
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '.env'))
    load_dotenv(env_path)
    
    db_url_env = os.environ.get("DATABASE_URL")
    if not db_url_env:
        print("DATABASE_URL not found in .env")
        sys.exit(1)
        
    print(f"Loaded DATABASE_URL from .env: {db_url_env}")
    
    # Test 1: Direct (from .env)
    test_connection("Direct (from .env)", db_url_env)
    
    # Test 2: Same host but pooler port (6543)
    parsed = urlparse(db_url_env)
    pooler_url = db_url_env.replace(f":{parsed.port}/", ":6543/")
    test_connection("Pooler (Same Host, Port 6543)", pooler_url)

if __name__ == "__main__":
    main()
