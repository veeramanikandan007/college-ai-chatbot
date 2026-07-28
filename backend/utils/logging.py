import logging
import sys
from logging import Formatter, Logger


def get_logger(name: str) -> Logger:
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger

    logger.setLevel(logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        Formatter('%(asctime)s | %(levelname)s | %(name)s | %(message)s')
    )

    logger.addHandler(handler)
    logger.propagate = False
    return logger
