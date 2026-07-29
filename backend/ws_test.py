
import asyncio, websockets
async def test():
    import sys, os
    sys.path.insert(0, os.path.abspath("."))
    from app.database.init_db import init_db
    init_db() # this will import all models properly
    from app.database.engine import SessionLocal
    from app.models.user import User
    from app.core.security import create_access_token
    db = SessionLocal()
    user = db.query(User).filter_by(role="admin").first()
    token = create_access_token(subject=user.id, role=user.role)
    try:
        async with websockets.connect(f"ws://127.0.0.1:8000/api/v1/notifications/ws/{token}") as ws:
            print("Connected successfully!")
            await ws.close()
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(test())

