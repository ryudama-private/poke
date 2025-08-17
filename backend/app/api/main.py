from fastapi import APIRouter
import logging
import sys

from app.api.routes import items, login, private, users, utils, bgm, pokemon

# Uvicorn の logger を利用
logger = logging.getLogger("uvicorn")
logger.setLevel(logging.INFO)
# 標準出力にも流すハンドラーを追加
if not logger.handlers:
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setLevel(logging.INFO)
    formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)

    
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(bgm.router, prefix="/bgms", tags=["bgms"])
api_router.include_router(pokemon.router, prefix="/pokemons", tags=["pokemons"])

# chat ルーターを安全に読み込む
try:
    from app.api.routes import chat
    api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
    logger.info("chat.router successfully imported and registered")
except Exception as e:
    # ログストリーム用
    logger.error("chat.router import failed", exc_info=True)
    # HTTPLOGS用（赤字で表示される）
    print(f"chat.router import failed: {e}", file=sys.stderr)
    chat = None
    
    
if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
