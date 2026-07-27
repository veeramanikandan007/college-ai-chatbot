import logging


def setup_logging() -> None:
    """Configure structured logging for the application."""
    log_format = (
        '%(asctime)s | %(levelname)s | %(name)s | %(message)s'
    )
    logging.basicConfig(level=logging.INFO, format=log_format)
    logging.getLogger("uvicorn").handlers = logging.getLogger().handlers
    logging.getLogger("uvicorn.error").handlers = logging.getLogger().handlers
    logging.getLogger("uvicorn.access").handlers = logging.getLogger().handlers


logger = logging.getLogger("college-mate-ai")
