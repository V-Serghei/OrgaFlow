[Русская версия](README.md)

# OrgaFlow Docker Setup

## 1. Create Docker Network

Create the `orgaflow-net` network for container interaction:

```bash
docker network create orgaflow-net
```

## 2. Create Volume for PostgreSQL

Create the `postgres_data` volume to store database data after container restarts:

```bash
docker volume create postgres_data
```

## 3. Create PostgreSQL Database Container

The container is configured for persistent data storage to avoid repeated migrations:

```bash
docker run -d \
  --name orgaflow_postgres \
  --network orgaflow-net \
  -p 5433:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  -e POSTGRES_DB=OrgaFlowDb \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=secret \
  --restart always \
  postgres:15
```

## 4. Build and Run Authorization Service Container

Build the Docker image for the authorization service and start the container:

```bash
docker build -t auth-service:dev -f auth-service/Dockerfile .
docker run -d \
  --name auth-service \
  --network orgaflow-net \
  -p 5095:8080 \
  auth-service:dev
```

## 5. Build and Run Task Service Container

Create the task microservice image and start the container:

```bash
docker build -t task-service:dev -f ./task-service/Dockerfile .
docker run -d \
  --name task-service \
  --network orgaflow-net \
  -p 5096:8080 \
  task-service:dev
```

## 6. Build and Run Main Application Container

Build the image for the main application and start the container:

```bash
docker build -t main-app:dev -f ./Dockerfile .
docker run -d \
  --name main-app \
  --network orgaflow-net \
  -p 80:8080 \
  main-app:dev
```

## 7. Initial Database Migration

If running the application for the first time, apply migrations for all three database contexts.

### Migration for AuthDbContext

```bash
dotnet ef migrations add Init -s ./OrgaFlow.API -p ./OrgaFlow.Persistence --context AuthDbContext
```

Apply the migration:

```bash
dotnet ef database update --verbose -s .\OrgaFlow.API\ -p .\OrgaFlow.Persistence\ --AuthDbContext
```

### Migration for AppDbContext

```bash
dotnet ef migrations add Init -s ./OrgaFlow.API -p ./OrgaFlow.Persistence --context AppDbContext
```

Apply the migration:

```bash
dotnet ef database update --verbose -s .\OrgaFlow.API\ -p .\OrgaFlow.Persistence\ --AppDbContext
```

### Migration for TaskDbContext

```bash
dotnet ef migrations add Init -s ./OrgaFlow.API -p ./OrgaFlow.Persistence --context TaskDbContext
```

Apply the migration:

```bash
dotnet ef database update --verbose -s .\OrgaFlow.API\ -p .\OrgaFlow.Persistence\ --TaskDbContext
```

