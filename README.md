[English version](README.en.md)

# OrgaFlow

## Prerequisites

| Tool | Version |
|---|---|
| [.NET SDK](https://dotnet.microsoft.com/download) | 10.0+ |
| [Node.js](https://nodejs.org/) | 18.0+ |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | latest |
| [EF Core CLI](https://learn.microsoft.com/en-us/ef/core/cli/dotnet) | `dotnet tool install -g dotnet-ef` |

---

## Quick start — automated script

Клонируй репо и запусти один скрипт. Он сам:
- проверит все зависимости
- сгенерирует пароли и JWT-секреты
- создаст все конфиги
- поднимет PostgreSQL в Docker
- применит миграции
- запустит все сервисы и фронтенд

```bash
# Git Bash / WSL
bash setup-local.sh
```

Остановить всё:
```bash
bash stop-local.sh
```

Логи сервисов → `.runtime/*.log`

> Скрипт сохраняет сгенерированные секреты в `.secrets.local` (в .gitignore).
> При повторном запуске использует те же секреты — база не пересоздаётся.

---

## Manual setup (step by step)

### 1. Create config files

Файлы `appsettings.Development.json` не хранятся в репозитории — создай вручную:

**`OrgaFlow.API/appsettings.Development.json`**
```json
{
  "Logging": { "LogLevel": { "Default": "Information", "Microsoft.AspNetCore": "Warning" } },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DbConnectionString": "Host=localhost;Port=5433;Username=postgres;Password=secret;Database=OrgaFlowDb"
  }
}
```

**`auth-service/appsettings.Development.json`**
```json
{
  "Logging": { "LogLevel": { "Default": "Information", "Microsoft.AspNetCore": "Warning" } },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DbConnectionString": "Host=localhost;Port=5433;Username=postgres;Password=secret;Database=OrgaFlowDb"
  },
  "Jwt": {
    "Secret": "your-secret-at-least-32-characters-long",
    "Issuer": "OrgaFlow",
    "Audience": "OrgaFlowClient"
  }
}
```

**`task-service/appsettings.Development.json`**
```json
{
  "Logging": { "LogLevel": { "Default": "Information", "Microsoft.AspNetCore": "Warning" } },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DbConnectionString": "Host=localhost;Port=5433;Username=postgres;Password=secret;Database=OrgaFlowDb"
  }
}
```

### 2. Start PostgreSQL

```bash
docker run -d \
  --name orgaflow_postgres \
  -p 5433:5432 \
  -e POSTGRES_DB=OrgaFlowDb \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=secret \
  -v orgaflow_postgres_data:/var/lib/postgresql/data \
  --restart unless-stopped \
  postgres:15
```

### 3. Restore and build

```bash
dotnet restore
dotnet build
```

### 4. Run migrations

```bash
dotnet ef database update -s ./OrgaFlow.API -p ./OrgaFlow.Persistence --context AuthDbContext --no-build
dotnet ef database update -s ./OrgaFlow.API -p ./OrgaFlow.Persistence --context AppDbContext --no-build
dotnet ef database update -s ./OrgaFlow.API -p ./OrgaFlow.Persistence --context TaskDbContext --no-build
```

### 5. Start backend services

```bash
dotnet run --project auth-service   --no-build --environment Development &
dotnet run --project task-service   --no-build --environment Development &
dotnet run --project email-services --no-build --environment Development &
dotnet run --project OrgaFlow.API   --no-build --environment Development &
```

### 6. Start frontend

```bash
cd OrgaFlow.UI/orga-flow-ui
npm install   # first time only
npm run dev
```

---

## Service URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Main API (Swagger) | http://localhost:5023/swagger |
| Auth Service | http://localhost:5095/swagger |
| Task Service | http://localhost:5130/swagger |
| Email Service | http://localhost:5165/swagger |
| PostgreSQL | localhost:5433 |

---

## Docker (full containerized)

```bash
docker-compose up -d
```

First run — apply migrations after containers are up:
```bash
dotnet ef database update -s ./OrgaFlow.API -p ./OrgaFlow.Persistence --context AuthDbContext
dotnet ef database update -s ./OrgaFlow.API -p ./OrgaFlow.Persistence --context AppDbContext
dotnet ef database update -s ./OrgaFlow.API -p ./OrgaFlow.Persistence --context TaskDbContext
```
