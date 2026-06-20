[English version](README.en.md)

# OrgaFlow

## Предварительные требования

| Инструмент | Версия |
|---|---|
| [.NET SDK](https://dotnet.microsoft.com/download) | 8.0+ |
| [Node.js](https://nodejs.org/) | 18.0+ |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | последняя |
| [EF Core CLI](https://learn.microsoft.com/en-us/ef/core/cli/dotnet) | `dotnet tool install -g dotnet-ef` |

---

## Быстрый старт после клонирования

Файлы `appsettings.Development.json` не хранятся в репозитории — их нужно создать вручную в каждом сервисе.

### 1. Создать файлы конфигурации

Создай следующие файлы с указанным содержимым:

**`OrgaFlow.API/appsettings.Development.json`**
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

**`auth-service/appsettings.Development.json`**
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

**`task-service/appsettings.Development.json`**
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

> **Важно:** Для продакшена замени `Password=secret` и JWT-секрет в `auth-service/appsettings.json` на реальные значения. Никогда не коммить реальные пароли.

---

## Запуск через Docker (рекомендуется)

### 1. Создание сети и volume

```bash
docker network create orgaflow-net
docker volume create postgres_data
```

### 2. Запуск всех сервисов

```bash
docker-compose up -d
```

Или пошагово:

```bash
# База данных
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

# Auth-сервис
docker build -t auth-service:dev -f auth-service/Dockerfile .
docker run -d --name auth-service --network orgaflow-net -p 5095:8080 auth-service:dev

# Task-сервис
docker build -t task-service:dev -f ./task-service/Dockerfile .
docker run -d --name task-service --network orgaflow-net -p 5096:8080 task-service:dev

# Основное приложение
docker build -t main-app:dev -f ./Dockerfile .
docker run -d --name main-app --network orgaflow-net -p 80:8080 main-app:dev

# UI
docker build -t orgaflow-ui:dev -f ./OrgaFlow.UI/Dockerfile .
docker run -d --name ui-app --network orgaflow-net -p 3000:3000 orgaflow-ui:dev
```

---

## Запуск через IDE (без Docker)

Если нужно запустить сервисы напрямую без контейнеров, сервисные URL в `appsettings.json` уже настроены на `localhost`. Убедись что файлы `appsettings.Development.json` созданы (см. [Быстрый старт](#быстрый-старт-после-клонирования)).

PostgreSQL всё равно нужен — запусти только его через Docker:
```bash
docker run -d \
  --name orgaflow_postgres \
  -p 5433:5432 \
  -e POSTGRES_DB=OrgaFlowDb \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=secret \
  --restart always \
  postgres:15
```

### Установка зависимостей frontend

```bash
cd OrgaFlow.UI/orga-flow-ui
npm install
npm run dev
```

---

## Миграции базы данных

Выполняется один раз при первом запуске (рекомендуется через IDE для контроля процесса).

```bash
# AuthDbContext
dotnet ef migrations add Init -s ./OrgaFlow.API -p ./OrgaFlow.Persistence --context AuthDbContext
dotnet ef database update --verbose -s .\OrgaFlow.API\ -p .\OrgaFlow.Persistence\ --context AuthDbContext

# AppDbContext
dotnet ef migrations add Init -s ./OrgaFlow.API -p ./OrgaFlow.Persistence --context AppDbContext
dotnet ef database update --verbose -s .\OrgaFlow.API\ -p .\OrgaFlow.Persistence\ --context AppDbContext

# TaskDbContext
dotnet ef migrations add Init -s ./OrgaFlow.API -p ./OrgaFlow.Persistence --context TaskDbContext
dotnet ef database update --verbose -s .\OrgaFlow.API\ -p .\OrgaFlow.Persistence\ --context TaskDbContext
```

---

## Порты сервисов

| Сервис | Порт |
|---|---|
| UI (Next.js) | 3000 |
| Main API | 80 |
| Auth Service | 5095 |
| Task Service | 5096 / 5130 |
| Email Service | 5165 |
| PostgreSQL | 5433 |
