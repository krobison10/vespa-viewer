# Vespa Viewer

A fully contained application for viewing and querying Vespa data sources.

## Quick Run

To run the app you need to build the Docker image and run it with database connection details.

First, navigate to the project root

Build the Docker image:

```bash
docker build -t vespa-viewer .
```

Identify the credentials of the database you would like to connect to. If you don't have one, you can run one on the same machine in another Docker container:

```bash
docker run --name vespa-viewer-db \
  -e POSTGRES_DB=vespa-viewer \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=vespaviewer \
  -p 5432:5432 \
  -d postgres:17.6
```

Note that `host.docker.internal` resolves to the host machine's localhost. This is how the container connects to the database.

Run the container (example uses the above credentials, but replace with yours if needed):

```bash
docker run -d --name vespa-viewer -p 80:80 \
  -e DB_HOST=host.docker.internal \
  -e DB_USER=postgres \
  -e DB_PASSWORD=vespaviewer \
  -e DB_NAME=vespa-viewer \
  vespa-viewer
```

Access it at http://localhost. If you want to set up TLS, your best bet is a basic nginx reverse proxy and certbot.

## Dev setup

Identify your PostgreSQL database details and create a `.env` file in the `/api` directory. It should contain the connection details like so (example for a local PostgreSQL instance):

```
# PostgreSQL
DB_USER='postgres'
DB_PASSWORD='vespaviewer'
DB_HOST='localhost'
DB_PORT=5432
DB_NAME='vespa-viewer'
```

Most likely though, you want to run a database locally in a Docker container:

```bash
docker run --name vespa-viewer-local \
  -e POSTGRES_DB=vespa-viewer \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=vespaviewer \
  -p 5432:5432 \
  -d postgres:17.6
```

Using those example credentials, the Express API will now connect to the local instance!

Install dependencies:

```bash
cd api && npm install
cd ../web && npm install
```

Start the API (DB migrations run automatically):

```bash
cd api && npm run dev
```

Start the web app:

```bash
cd web && npm run dev
```

## Database Migrations

Database schema is managed using `node-pg-migrate`. Migrations are located in `sql/migrations/` and run automatically when the API starts. To add changes, create a new migration file. It's safest to stop the API before doing this to prevent it from running incomplete migrations.
