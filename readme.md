# Vespa Viewer

## Quickstart

## Dev setup

```
  docker run --name vespa-viewer-local \
  -e POSTGRES_DB=vespa-viewer \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=vespaviewer \
  -p 5432:5432 \
  -d postgres:17.6
```
