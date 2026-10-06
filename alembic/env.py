import os
import sys
from pathlib import Path
from logging.config import fileConfig

from alembic import context
from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool

# 1. Projekt gyökerének hozzáadása a Python keresési útvonalhoz (sys.path)
BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR))

# 2. A .env fájl betöltése a projekt gyökeréből
load_dotenv(BASE_DIR / ".env")

# 3. Modell és Base importálása az autogenerate funkcióhoz
from src.backend.database.connection import Base
import src.backend.database.models  # Betölti az összes SQLAlchemy modellt

# Alembic Config objektum
config = context.config

# Loggolás beállítása
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 4. A DATABASE_URL felülírása a .env-ből olvasott értékkel
database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise ValueError("A DATABASE_URL nem található a .env fájlban!")

config.set_main_option("sqlalchemy.url", database_url)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()