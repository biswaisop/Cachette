import logging
from contextlib import asynccontextmanager
from sqlalchemy import text
from fastapi import FastAPI

from app.db import engine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

log = logging.getLogger("cachette")


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Startup: verifying DB connection...")
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
    log.info("Startup complete: DB connection verified.")

    yield

    await engine.dispose()
    log.info("Shutdown complete: DB engine disposed.")


app = FastAPI(title="Cachette API", version="0.1.0", lifespan=lifespan)


@app.get("/health", tags=["health"])
async def health_check():
    log.info("Health check hit")
    return {"status": "ok"}


# -----------API ENDPOINTS--------------------#

from app.routes.auth import router as authRouter

app.include_router(authRouter, prefix="/api/v1")

