import requests
import json
import time

BASE_URL = 'http://127.0.0.1:8000/api/v1'

def run_tests():
    print("--- STARTING TESTS ---")
    
    # 1. Register
    print("\\n[1] Testing POST /auth/register...")
    test_user = f"test_{int(time.time())}@collegemate.edu"
    test_pass = "password123"
    try:
        r = requests.post(f"{BASE_URL}/auth/register", json={
            "name": "Test User",
            "email": test_user,
            "password": test_pass,
            "role": "student"
        })
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text[:200]}")
    except Exception as e:
        print("Error:", e)

    # 2. Login
    print("\\n[2] Testing POST /auth/login...")
    token = None
    try:
        # FastAPI OAuth2PasswordRequestForm expects form data, not json
        r = requests.post(f"{BASE_URL}/auth/login", data={
            "username": test_user,
            "password": test_pass
        })
        print(f"Status: {r.status_code}")
        if r.status_code == 200:
            token = r.json().get("access_token")
            print("Login successful! Token acquired.")
        else:
            print(f"Response: {r.text}")
    except Exception as e:
        print("Error:", e)

    if not token:
        print("Cannot continue without token.")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Get Me
    print("\\n[3] Testing GET /users/me (Wait, route is not defined in instructions? let's see...)")
    try:
        # Assuming /auth/me or similar based on typical fastapi
        r = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        if r.status_code == 404:
            r = requests.get(f"{BASE_URL}/users/me", headers=headers)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text[:200]}")
    except Exception as e:
        print("Error:", e)

    # 4. Create Chat Session
    print("\\n[4] Testing POST /chat/sessions...")
    session_id = None
    try:
        r = requests.post(f"{BASE_URL}/chat/sessions", json={"title": "Test Chat"}, headers=headers)
        print(f"Status: {r.status_code}")
        if r.status_code == 200:
            session_id = r.json().get("id")
            print(f"Session created with ID: {session_id}")
        else:
            print(f"Response: {r.text}")
    except Exception as e:
        print("Error:", e)

    # 5. List Chat Sessions
    print("\\n[5] Testing GET /chat/sessions...")
    try:
        r = requests.get(f"{BASE_URL}/chat/sessions", headers=headers)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text[:200]}")
    except Exception as e:
        print("Error:", e)

    # 6. Send Message
    if session_id:
        print("\\n[6] Testing POST /chat...")
        try:
            r = requests.post(f"{BASE_URL}/chat", json={
                "message": "Hello, CollegeMate AI!",
                "session_id": session_id
            }, headers=headers)
            print(f"Status: {r.status_code}")
            print(f"Response: {r.text[:200]}")
        except Exception as e:
            print("Error:", e)

if __name__ == '__main__':
    run_tests()
