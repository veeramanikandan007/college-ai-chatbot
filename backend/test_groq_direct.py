import asyncio
import os
from dotenv import load_dotenv
from groq import AsyncGroq

load_dotenv()

async def main():
    api_key = os.getenv('GROQ_API_KEY')
    print("Key exists:", bool(api_key))
    if not api_key:
        print("No API key!")
        return
        
    client = AsyncGroq(api_key=api_key)
    try:
        print("Invoking...")
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful assistant. Greet the user warmly."},
                {"role": "user", "content": "hi"}
            ],
            max_tokens=1000,
            temperature=0.2
        )
        print("Success!", completion.choices[0].message.content)
    except Exception as e:
        print("Failed:", repr(e))

if __name__ == "__main__":
    asyncio.run(main())
