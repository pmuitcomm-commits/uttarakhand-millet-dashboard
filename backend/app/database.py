import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# REQUIRED: must be set in Render
DATABASE_URL = os.environ["DATABASE_URL"]

# Supabase requires SSL
engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "require"},
    pool_pre_ping=True,
    pool_recycle=300,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()