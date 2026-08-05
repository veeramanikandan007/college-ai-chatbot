import httpx
from langchain_core.tools import tool
from app.core.logging import get_logger

logger = get_logger(__name__)

@tool
def get_distance_and_route(origin: str, destination: str) -> str:
    """
    Calculates the driving distance and estimated time between two locations.
    Inputs should be city names or prominent landmarks (e.g., 'Paris', 'Lyon').
    """
    try:
        # Step 1: Geocode Origin
        with httpx.Client() as client:
            geo_org = client.get(f"https://geocoding-api.open-meteo.com/v1/search?name={origin}&count=1").json()
            geo_dest = client.get(f"https://geocoding-api.open-meteo.com/v1/search?name={destination}&count=1").json()
            
        if not geo_org.get("results") or not geo_dest.get("results"):
            return "Could not geocode one or both locations."
            
        lat1, lon1 = geo_org["results"][0]["latitude"], geo_org["results"][0]["longitude"]
        lat2, lon2 = geo_dest["results"][0]["latitude"], geo_dest["results"][0]["longitude"]
        
        # Step 2: Use OSRM for routing
        osrm_url = f"https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=false"
        with httpx.Client() as client:
            route_resp = client.get(osrm_url).json()
            
        if route_resp.get("code") != "Ok":
            return "Could not calculate route."
            
        distance_meters = route_resp["routes"][0]["distance"]
        duration_seconds = route_resp["routes"][0]["duration"]
        
        dist_km = distance_meters / 1000
        dur_hours = duration_seconds / 3600
        
        return f"Driving Distance: {dist_km:.1f} km. Estimated Time: {dur_hours:.1f} hours."
    except Exception as e:
        logger.error(f"Maps tool failed: {e}")
        return "Mapping service is currently unavailable."
