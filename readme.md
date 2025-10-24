# Vespa Viewer

## Quickstart

## Dev setup

1. Start the PostgreSQL database:

```bash
docker run --name vespa-viewer-local \
  -e POSTGRES_DB=vespa-viewer \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=vespaviewer \
  -p 5432:5432 \
  -d postgres:17.6
```

2. Install dependencies:

```bash
cd api && npm install
cd ../web && npm install
```

3. Start the API (DB migrations run automatically):

```bash
cd api && npm start
```

4. Start the web app:

```bash
cd web && npm run dev
```

## Database Migrations

Database schema is managed using `node-pg-migrate`. Migrations are located in `sql/migrations/` and run automatically when the API starts.

**Migration files:**

- `001_create_users_table.sql` - User accounts
- `002_create_credentials_table.sql` - Password storage
- `003_create_sessions_table.sql` - Session management

The migrations are idempotent and safe to run multiple times.
