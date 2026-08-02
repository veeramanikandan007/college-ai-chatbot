import os
from dotenv import load_dotenv
from google import genai

# Load env variables from backend/.env
load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Add your college context details here
COLLEGE_CONTEXT = """
You are the official AI assistant for CollegeMate AI.
Answer student questions accurately using these details:

- College Name: ABC Engineering College
- Courses Offered: B.Tech (CSE, AI & DS, ECE, Mechanical), M.Tech, MCA, MBA
- Eligibility: 60%+ in 10+2 with PCM for undergraduate engineering.
- Campus Facilities: Digital Library, Sports Complex, Wi-Fi Campus, Boys & Girls Hostel.
- Contact Details: admissions@collegemate.edu | Phone: +91 9876543210
"""

def get_llm_response(user_query: str) -> str:
    prompt = f"""
    Context Information:
    {COLLEGE_CONTEXT}

    User Question: {user_query}

    Instructions: Answer the question accurately using only the provided college context. 
    If the context doesn't contain the answer, say "I don't have that specific information."
    """
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"Error connecting to AI: {str(e)}"