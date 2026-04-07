from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routes.production import router as production_router
from .routes.dashboard import router as dashboard_router
from .routes.procurement import router as procurement_router

app = FastAPI()

# Create DB tables
Base.metadata.create_all(bind=engine)

# CORS middleware (must be before routes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://millet-dashboard-frontend.up.railway.app",
        "https://millet-dashboard.up.railway.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(production_router)
app.include_router(dashboard_router)
app.include_router(procurement_router)

@app.get("/")
def root():
    return {"message": "Millet Dashboard API Running"}