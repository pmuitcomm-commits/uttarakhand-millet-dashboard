"""
FastAPI application entry point for the Uttarakhand Millet MIS backend.

This module wires together database initialization, CORS policy, rate-limit
handling, and all public API routers used by the React dashboard. It is the
primary runtime surface reviewed during deployment, NIC handover, and API
security testing.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

from .database import engine, Base
from .rate_limit import limiter
from .routes.production import router as production_router
from .routes.dashboard import router as dashboard_router
from .routes.procurement import router as procurement_router
from .routes.auth import router as auth_router
from .routes.farmer import router as farmer_router
from .routes.data_entries import router as data_entries_router

load_dotenv()

app = FastAPI()


@app.get("/health")
def health_check():
    return {"status": "ok"}


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
    Create database tables during application startup.

    SQLAlchemy metadata creation keeps the small MIS schema available in hosted
    deployments where migrations may not yet be configured. Exceptions are
    logged to the service console for deployment diagnostics.
    """
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


@app.get("/")
def root():
    """
    Return a lightweight health message for uptime checks.

    Returns:
        dict: Static service status message for load balancers and operators.
    """
    return {"message": "Millet Dashboard API Running"}
