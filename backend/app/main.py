import os
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

load_dotenv()

app = FastAPI()


@app.on_event("startup")
def startup():
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

# CORS
cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Routes
app.include_router(production_router)
app.include_router(dashboard_router)
app.include_router(procurement_router)
app.include_router(auth_router)
app.include_router(farmer_router, prefix="/farmers", tags=["Farmers"])


@app.get("/")
def root():
    return {"message": "Millet Dashboard API Running"}
