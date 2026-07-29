import asyncio
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
import os
from dotenv import load_dotenv

load_dotenv()

async def main():
    api_key = os.getenv('GROQ_API_KEY')
    print("Key exists:", bool(api_key))
    if not api_key:
        print("No API key!")
        return
        
    llm = ChatGroq(
        temperature=0.2,
        groq_api_key=api_key,
        model_name='llama-3.3-70b-versatile',
        max_tokens=1000
    )
    try:
        # Instead of ainvoke, use to_thread + invoke
        messages = [
            SystemMessage(content="You are a helpful assistant. Greet the user warmly."),
            HumanMessage(content="hi")
        ]
        print("Invoking...")
        response = await asyncio.to_thread(llm.invoke, messages)
        print("Success!", response.content)
    except Exception as e:
        print("Failed:", repr(e))

if __name__ == "__main__":
    asyncio.run(main())
