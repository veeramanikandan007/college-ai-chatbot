from pathlib import Path
from typing import BinaryIO

from fastapi import HTTPException

SUPPORTED_UPLOAD_EXTENSIONS = {'.pdf', '.docx', '.txt'}
MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB
UPLOAD_DIR = Path(__file__).resolve().parent.parent / 'uploads'
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def validate_upload_filename(filename: str) -> None:
    """Validate the uploaded file extension."""
    suffix = Path(filename).suffix.lower()
    if suffix not in SUPPORTED_UPLOAD_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail='Only PDF, DOCX, and TXT uploads are allowed.',
        )


def validate_upload_size(file: BinaryIO) -> None:
    """Validate the uploaded file size does not exceed the maximum."""
    file.seek(0, 2)
    size = file.tell()
    file.seek(0)
    if size > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail='Uploaded file size exceeds the 20 MB limit.',
        )


def save_upload(file: BinaryIO, filename: str) -> Path:
    """Save the uploaded file to the uploads directory."""
    target_path = UPLOAD_DIR / filename
    with target_path.open('wb') as writer:
        writer.write(file.read())
    return target_path
