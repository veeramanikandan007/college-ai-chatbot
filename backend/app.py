from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from config import APP_NAME, ENV, HOST, PORT
from routes.auth import router as auth_router

app = FastAPI(title=APP_NAME, debug=(ENV == 'development'))

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth_router, prefix='/auth', tags=['Auth'])


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
