# Alembic Migrations

Run Alembic commands from the `backend` directory with `DATABASE_URL` set in
the environment or in `backend/.env`.

Create a migration after model changes:

```powershell
alembic revision --autogenerate -m "message"
```

Apply reviewed migrations:

```powershell
alembic upgrade head
```

Rollback the most recent reviewed migration:

```powershell
alembic downgrade -1
```

Do not run migrations directly against the live Supabase database without a
reviewed migration file, backup/rollback plan, and deployment approval. The
initial migration is intentionally non-destructive and does not drop existing
tables.
