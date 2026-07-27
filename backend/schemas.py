from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    project: str
    version: str


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


class RebuildResponse(BaseModel):
    status: str
    message: str


class UploadResponse(BaseModel):
    status: str
    message: str
