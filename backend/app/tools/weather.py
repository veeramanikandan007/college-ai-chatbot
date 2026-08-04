import httpx
from langchain_core.tools import tool
from app.core.logging import get_logger

logger = get_logger(__name__)

@tool
def get_weather(location: str) -> str:
    """
    Fetches the current weather for a given city or location.
    Input should be the name of the city (e.g. 'Dubai', 'Chennai').
    """
    try:
        # Step 1: Geocode location to lat/lon using free API
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={location}&count=1&language=en&format=json"
        with httpx.Client() as client:
            geo_response = client.get(geo_url)
            geo_data = geo_response.json()
            
        if not geo_data.get("results"):
            return f"Could not find coordinates for {location}."
            
        lat = geo_data["results"][0]["latitude"]
        lon = geo_data["results"][0]["longitude"]
        
        # Step 2: Fetch weather using Open-Meteo
        weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true"
        with httpx.Client() as client:
            weather_response = client.get(weather_url)
            weather_data = weather_response.json()
            
        current = weather_data.get("current_weather", {})
        temp = current.get("temperature", "Unknown")
        wind = current.get("windspeed", "Unknown")
        
        return f"Current weather in {location}: {temp}°C, Wind Speed: {wind} km/h."
    except Exception as e:
        logger.error(f"Weather tool failed for '{location}': {e}")
        return "Weather service is currently unavailable."
