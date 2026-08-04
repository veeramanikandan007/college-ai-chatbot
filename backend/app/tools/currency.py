import httpx
from langchain_core.tools import tool
from app.core.logging import get_logger

logger = get_logger(__name__)

@tool
def get_currency_conversion(base_currency: str, target_currency: str, amount: float = 1.0) -> str:
    """
    Converts currency using real-time exchange rates.
    Inputs: 
    - base_currency: 3-letter currency code (e.g., 'USD', 'INR')
    - target_currency: 3-letter currency code (e.g., 'EUR', 'AED')
    - amount: Float amount to convert.
    """
    try:
        # Free currency API
        url = f"https://api.exchangerate-api.com/v4/latest/{base_currency.upper()}"
        with httpx.Client() as client:
            response = client.get(url)
            data = response.json()
            
        rates = data.get("rates", {})
        target = target_currency.upper()
        if target not in rates:
            return f"Currency code {target} not supported."
            
        rate = rates[target]
        converted = float(amount) * rate
        return f"{amount} {base_currency.upper()} = {converted:.2f} {target} (Rate: {rate})"
    except Exception as e:
        logger.error(f"Currency tool failed: {e}")
        return "Currency conversion service is currently unavailable."
