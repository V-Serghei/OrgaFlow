[Русская версия](README.md)

# OrgaFlow — Local Development

## Quick Start

Run everything (PostgreSQL, all services, frontend) with a single script:

```bash
bash setup-local.sh
```

The script:
1. Checks prerequisites (.NET 10, Docker, Node.js)
2. Generates secrets and writes `appsettings.Development.json` for each service
3. Starts the PostgreSQL container
4. Stops any previously running service processes (releases DLL locks)
5. Builds the .NET solution
6. **Automatically detects model changes and creates EF migrations if needed**
7. Applies all pending migrations to the database
8. Starts all backend services and the Next.js frontend

Services after startup:

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| API      | http://localhost:5023/swagger |
| Auth     | http://localhost:5095/swagger |
| Task     | http://localhost:5130/swagger |
| Email    | http://localhost:5165/swagger |

Logs: `.runtime/*.log` · Stop all: `stop-local.bat`

---

## Database Migrations

> **When you run `setup-local.sh`, migrations are created and applied automatically.**
> The script uses `dotnet ef migrations has-pending-model-changes` to detect if your
> entity models have changed since the last migration. If they have, it creates a new
> migration named `Auto_YYYYMMDDHHMMSS` and immediately applies it.
> You do not need to do anything manually during normal development.

### Manual migration (when needed)

Use manual migrations when you want a descriptive name (e.g. before committing to git):

**AuthDbContext**
```bash
dotnet ef migrations add <MigrationName> \
  -s OrgaFlow.API -p OrgaFlow.Persistence \
  --context AuthDbContext --output-dir Migrations/AuthDb

dotnet ef database update \
  -s OrgaFlow.API -p OrgaFlow.Persistence \
  --context AuthDbContext
```

**AppDbContext**
```bash
dotnet ef migrations add <MigrationName> \
  -s OrgaFlow.API -p OrgaFlow.Persistence \
  --context AppDbContext --output-dir Migrations/AppDb

dotnet ef database update \
  -s OrgaFlow.API -p OrgaFlow.Persistence \
  --context AppDbContext
```

**TaskDbContext**
```bash
dotnet ef migrations add <MigrationName> \
  -s OrgaFlow.API -p OrgaFlow.Persistence \
  --context TaskDbContext --output-dir Migrations

dotnet ef database update \
  -s OrgaFlow.API -p OrgaFlow.Persistence \
  --context TaskDbContext
```

### Rollback a migration

```bash
dotnet ef database update <PreviousMigrationName> \
  -s OrgaFlow.API -p OrgaFlow.Persistence \
  --context <DbContext>

dotnet ef migrations remove \
  -s OrgaFlow.API -p OrgaFlow.Persistence \
  --context <DbContext>
```

> **Tip:** Auto-generated migrations (`Auto_*`) created by `setup-local.sh` are real
> migration files in `OrgaFlow.Persistence/Migrations/`. Commit them to git along with
> your model changes so other developers get them when they pull and re-run the script.

---

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

## 7. Building and running the UI container

Build the UI application image and run the container:

```bash
docker build -t orgaflow-ui:dev -f ./OrgaFlow.UI/Dockerfile .
docker run -d \
  --name ui-app \
  --network orgaflow-net \
  -p 3000:3000 \
  orgaflow-ui:dev

```

## 8. Initial Database Migration

If running the application for the first time, apply migrations for all three database contexts.
(It’s often easier to build and run the orgaflow_postgres container first, then use an IDE to run migrations while monitoring the process, and only after that move on to working with the other containers.)
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


## Alternative Startup via IDE

If you need to run the application without containers, you need to make changes to several configuration files.

### 1. Updating `appsettings.json` in `OrgaFlow.API`
Before:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "AuthService": {
    "BaseUrl": "http://auth-service:8080/api/auth/"
  },
  "TaskService": {
    "BaseUrl": "http://task-service:8080/api/Task/"
  }
}
```
After:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "AuthService": {
    "BaseUrl": "http://localhost:5095/api/auth/"
  },
  "TaskService": {
    "BaseUrl": "http://localhost:5130/api/Task/"
  }
}
```

### 2. Updating `appsettings.json` in `task-service`
Before:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "AuthService": {
    "BaseUrl": "http://auth-service:8080/api/auth/"
  }
}
```
After:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "AuthService": {
    "BaseUrl": "http://localhost:5095/api/auth/"
  }
}
```

### 3. Updating `appsettings.Development.json` in `task-service`, `auth-service`, `OrgaFlow.API`
Before:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DbConnectionString": "Host=orgaflow_postgres;Port=5432;Username=postgres;Password=secret;Database=OrgaFlowDb"
  }

}

```
After:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DbConnectionString": "Host=localhost;Port=5433;Username=postgres;Password=secret;Database=OrgaFlowDb"
  }

}

```
After making these changes, the application can be run directly from an IDE.

