from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from config import APP_NAME, ENV, HOST, PORT
from database import init_db
from routes.auth import router as auth_router
from routes.chat import router as chat_router
from routes.health import router as health_router
from routes.rebuild import router as rebuild_router
from routes.upload import router as upload_router
from routes.student import router as student_router

app = FastAPI(title=APP_NAME, debug=(ENV == 'development'))

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Include all routers
app.include_router(auth_router, prefix='/auth', tags=['Auth'])
app.include_router(health_router, prefix='/health', tags=['Health'])
app.include_router(chat_router, tags=['Chat'])
app.include_router(student_router, prefix='/student', tags=['Student'])
app.include_router(upload_router, prefix='/admin', tags=['Admin'])
app.include_router(rebuild_router, prefix='/admin', tags=['Admin'])


@app.on_event('startup')
async def startup_event():
    """Initialize database on startup."""
    init_db()


@app.get('/')
async def root():
    return {'status': 'running', 'project': APP_NAME}


@app.get('/health')
async def health():
    return {'status': 'running', 'project': APP_NAME}


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={'detail': 'Internal server error', 'error': str(exc)},
    )


if __name__ == '__main__':
    import uvicorn

    uvicorn.run(app, host=HOST, port=PORT)
