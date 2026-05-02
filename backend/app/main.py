"""
FastAPI application entry point for the Uttarakhand Millet MIS backend.

This module wires together database initialization, CORS policy, rate-limit
handling, and all public API routers used by the React dashboard. It is the
primary runtime surface reviewed during deployment, NIC handover, and API
security testing.
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv
from sqlalchemy import text

from .database import engine, Base
from .rate_limit import limiter
from .routes.production import router as production_router
from .routes.dashboard import router as dashboard_router
from .routes.procurement import router as procurement_router
from .routes.auth import router as auth_router
from .routes.farmer import router as farmer_router
from .routes.data_entries import router as data_entries_router
from .routes.monitoring import router as monitoring_router

load_dotenv()

app = FastAPI()


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/ready")
def readiness_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception:
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "database": "disconnected"},
        )


# Frontend origins allowed to call this API. Keep this list narrow in
# production so browser-based access is restricted to approved MIS hosts.
allowed_origins = [
    "https://uttarakhand-millet-dashboard.onrender.com",
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    """
    Optionally create database tables during local bootstrap only.

    Production schema changes must be performed with reviewed Alembic
    migrations. Set AUTO_CREATE_TABLES=true only for controlled local setup.
    """
    if os.getenv("AUTO_CREATE_TABLES", "").strip().lower() not in {"1", "true", "yes"}:
        print("Skipping automatic table creation. Use Alembic migrations for schema changes.")
        return

    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tables created")
    except Exception as e:
        print("❌ DB connection failed:", e)


app.state.limiter = limiter

app.add_exception_handler(
    RateLimitExceeded,
    lambda request, exc: JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Too many requests."}
    )
)

# Route registration keeps each government MIS domain in its own router.
app.include_router(production_router)
app.include_router(dashboard_router)
app.include_router(procurement_router)
app.include_router(auth_router)
app.include_router(farmer_router, prefix="/farmers", tags=["Farmers"])
app.include_router(data_entries_router)
app.include_router(monitoring_router)


@app.get("/")
def root():
    """
    Return a lightweight health message for uptime checks.

    Returns:
        dict: Static service status message for load balancers and operators.
    """
    return {"message": "Millet Dashboard API Running"}
