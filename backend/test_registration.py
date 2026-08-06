import requests
import json
import sqlalchemy
import os
from dotenv import load_dotenv

def main():
    print("--- 1. Testing POST /api/v1/auth/register ---")
    
    url = "http://127.0.0.1:8000/api/v1/auth/register"
    payload = {
        "name": "Live Test User",
        "email": "livetest@campusmate.edu",
        "password": "password123",
        "role": "student"
    }
    
    print(f"2. Request Payload:\n{json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"\n3. Response Status: {response.status_code}")
        print(f"Response Body: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return

    print("\n--- 5 & 6. Verifying Database Commit ---")
    load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), '.env')))
    db_url = os.environ.get("DATABASE_URL")
    if db_url is None:
        print("Error: DATABASE_URL not found in .env")
        return
    
    try:
        engine = sqlalchemy.create_engine(db_url)
        with engine.connect() as conn:
            query = sqlalchemy.text("SELECT id, email, role FROM chatbot.users ORDER BY id DESC LIMIT 5;")
            result = conn.execute(query).fetchall()
            print("SQL Results (SELECT id, email, role FROM chatbot.users ORDER BY id DESC LIMIT 5):")
            for row in result:
                print(f"ID: {row[0]}, Email: {row[1]}, Role: {row[2]}")
                
            # Verify if our user is in the result
            if any(row[1] == "livetest@campusmate.edu" for row in result):
                print("\nSUCCESS: The db.commit() executed successfully and the user was inserted!")
            else:
                print("\nFAILURE: The user was NOT inserted into the database.")
    except Exception as e:
        print(f"Database query failed: {type(e).__name__}: {e}")

if __name__ == "__main__":
    main()
