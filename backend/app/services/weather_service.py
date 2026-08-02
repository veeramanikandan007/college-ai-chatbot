import httpx
from typing import Optional, Tuple
from app.core.logging import get_logger

logger = get_logger(__name__)

class WeatherService:
    def __init__(self):
        self.geocoding_api_url = "https://geocoding-api.open-meteo.com/v1/search"
        self.weather_api_url = "https://api.open-meteo.com/v1/forecast"
        
    async def get_weather(self, location_name: str = "Pudukkottai") -> str:
        """Fetch current weather for a location string."""
        try:
            logger.info("Fetching weather for location: %s", location_name)
            # Step 1: Geocode the location
            lat, lon, resolved_name = await self._geocode_location(location_name)
            if lat is None or lon is None:
                return f"Sorry, I couldn't find the location: {location_name}"

            # Step 2: Fetch weather data
            async with httpx.AsyncClient() as client:
                params = {
                    "latitude": lat,
                    "longitude": lon,
                    "current_weather": "true",
                    "timezone": "auto"
                }
                response = await client.get(self.weather_api_url, params=params)
                response.raise_for_status()
                data = response.json()

            current = data.get("current_weather", {})
            if not current:
                return f"Could not retrieve weather data for {resolved_name}."

            temp = current.get("temperature")
            weathercode = current.get("weathercode")
            windspeed = current.get("windspeed")
            
            condition = self._interpret_weathercode(weathercode)
            
            return (
                f"**Today's weather in {resolved_name}:**\n"
                f"- Temperature: {temp}°C\n"
                f"- Condition: {condition}\n"
                f"- Wind Speed: {windspeed} km/h"
            )
        except Exception as e:
            logger.exception("Weather fetch failed")
            return "Sorry, I couldn't fetch the weather right now due to an API issue."

    async def _geocode_location(self, name: str) -> Tuple[Optional[float], Optional[float], str]:
        """Convert a location name to lat/lon using Open-Meteo Geocoding API."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self.geocoding_api_url, params={"name": name, "count": 1})
                response.raise_for_status()
                data = response.json()
                results = data.get("results")
                if results and len(results) > 0:
                    city = results[0]
                    resolved_name = f"{city.get('name')}, {city.get('country', '')}".strip(', ')
                    return city.get("latitude"), city.get("longitude"), resolved_name
        except Exception as e:
            logger.error("Geocoding failed for %s: %s", name, e)
        return None, None, name

    def _interpret_weathercode(self, code: int) -> str:
        """Map WMO weather codes to readable strings."""
        weather_codes = {
            0: "Clear sky ☀️",
            1: "Mainly clear 🌤️",
            2: "Partly cloudy ⛅",
            3: "Overcast ☁️",
            45: "Fog 🌫️",
            48: "Depositing rime fog 🌫️",
            51: "Light drizzle 🌧️",
            53: "Moderate drizzle 🌧️",
            55: "Dense drizzle 🌧️",
            61: "Slight rain 🌧️",
            63: "Moderate rain 🌧️",
            65: "Heavy rain 🌧️",
            71: "Slight snow fall ❄️",
            73: "Moderate snow fall ❄️",
            75: "Heavy snow fall ❄️",
            95: "Thunderstorm ⛈️",
            96: "Thunderstorm with slight hail ⛈️",
            99: "Thunderstorm with heavy hail ⛈️",
        }
        return weather_codes.get(code, "Unknown 🤷")
