import os
from langchain_core.messages import HumanMessage
from app.core.logging import get_logger

logger = get_logger(__name__)

class VisionAgent:
    def __init__(self):
        # We try to initialize Gemini for vision tasks.
        self.gemini_llm = None
        gemini_key = os.getenv('GEMINI_API_KEY')
        if gemini_key:
            try:
                from langchain_google_genai import ChatGoogleGenerativeAI
                self.gemini_llm = ChatGoogleGenerativeAI(
                    model="gemini-2.0-flash",
                    google_api_key=gemini_key,
                    temperature=0.2
                )
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini for Vision Agent: {e}")

    def process(self, state: dict) -> dict:
        """
        Processes images if provided in the state. Extracts details and provides context to the main generator.
        """
        image_url = state.get("image_url")
        query = state.get("messages", [])[-1].content
        
        logger.info("Vision Agent activated.")
        
        if not image_url:
            return {"context": "Vision Agent activated but no image URL was provided.", "agent_used": "vision"}
            
        if not self.gemini_llm:
            return {"context": "Vision processing is currently unavailable.", "agent_used": "vision"}

        try:
            # Langchain Google GenAI supports passing image URLs or base64 directly in the content array.
            message = HumanMessage(
                content=[
                    {"type": "text", "text": f"Analyze this image and answer the query: {query}"},
                    {"type": "image_url", "image_url": image_url}
                ]
            )
            response = self.gemini_llm.invoke([message])
            vision_context = f"Image Analysis Results:\n{response.content}"
            return {"context": vision_context, "agent_used": "vision"}
        except Exception as e:
            logger.error(f"Vision Agent failed to process image: {e}")
            return {"context": "Error analyzing the image.", "agent_used": "vision"}
