"""
Alembic environment for the Millet MIS backend.

This file wires Alembic to the same SQLAlchemy Base and DATABASE_URL used by
the FastAPI application. Credentials must come from environment configuration;
they are never stored in alembic.ini or migration scripts.
"""

from logging.config import fileConfig
import os
from pathlib import Path
import sys

from alembic import context
from dotenv import load_dotenv
from sqlalchemy import create_engine, pool


config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))
load_dotenv(BACKEND_DIR / ".env")

database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise RuntimeError("DATABASE_URL is required to run Alembic migrations")

from app.database import Base  # noqa: E402
from app import models as _models  # noqa: F401,E402 - registers model metadata


target_metadata = Base.metadata


def _ssl_connect_args() -> dict:
    """Use the app's hosted PostgreSQL SSL default, with local override support."""
    sslmode = os.getenv("DB_SSLMODE", "require").strip()
    return {"sslmode": sslmode} if sslmode else {}


def run_migrations_offline() -> None:
    """Run migrations without opening a database connection."""
    context.configure(
        url=database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations with a live database connection."""
    connectable = create_engine(
        database_url,
        connect_args=_ssl_connect_args(),
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
