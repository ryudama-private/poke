from fastapi import APIRouter

from app.api.routes import items, login, private, users, utils, bgm, pokemon

try:
    from app.api.routes import chat
except Exception as e:
    print("chat.router import failed:", e)
    chat = None
    
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(bgm.router, prefix="/bgms", tags=["bgms"])
api_router.include_router(pokemon.router, prefix="/pokemons", tags=["pokemons"])

if chat:
    api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
else:
    print("chat.router not included due to import failure")



if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
