"""
Database configuration for the Uttarakhand Millet MIS backend.

The module centralizes SQLAlchemy engine creation, session management, and the
declarative base used by model classes. API routes consume ``get_db`` so each
request receives an isolated database session that is always closed.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Required deployment setting. The application intentionally fails fast when
# DATABASE_URL is missing so security testing does not run against an implicit
# or accidental local database.
DATABASE_URL = os.environ["DATABASE_URL"]

# Supabase/PostgreSQL connection configuration. SSL is mandatory for hosted
# database traffic, while pool health checks reduce stale-connection failures.
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
    """
    Provide a request-scoped SQLAlchemy session.

    Yields:
        Session: Database session bound to the configured PostgreSQL engine.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
