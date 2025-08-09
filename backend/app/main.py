import os # 環境変数を読み込むために必要
import sentry_sdk
from fastapi import FastAPI, Depends
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware
from sqlmodel import create_engine, Session, SQLModel
from typing import Generator

from app.api.main import api_router
from app.core.config import settings

# -----------------
# データベース接続設定の追加
# -----------------
# 環境変数から DATABASE_URL を取得します。
# Azure Web Appのアプリケーション設定で定義した DATABASE_URL がここで読み込まれます。
DATABASE_URL = os.environ.get("DATABASE_URL")

# DATABASE_URL が設定されていない場合はエラーを発生させます。
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# データベースエンジンを作成します。
# `echo=True`は、開発中に実行されるSQLをコンソールに出力してデバッグに役立ちます。
engine = create_engine(DATABASE_URL, echo=True)

# -----------------
# データベースセッションの依存性注入のための関数
# -----------------
# 各APIエンドポイントにデータベースセッションを提供するためのジェネレーター関数です。
def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

# -----------------
# アプリケーション初期設定
# -----------------
def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
)

# Set all CORS enabled origins
if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

# -----------------
# データベースの初期化
# -----------------
# アプリケーション起動時に、すべてのテーブルを作成します。
# 既存のテーブルは変更されないため安全です。
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

