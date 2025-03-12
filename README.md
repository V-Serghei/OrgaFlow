[English version](README.en.md)
# OrgaFlow Docker Setup

## 1. Создание сети Docker
Создаем сеть `orgaflow-net`, которая будет использоваться для взаимодействия контейнеров:
```bash
docker network create orgaflow-net
```

## 2. Создание volume для PostgreSQL
Создаем volume `postgres_data` для хранения данных базы данных после перезапуска контейнеров:
```bash
docker volume create postgres_data
```

## 3. Создание контейнера с базой данных PostgreSQL
Контейнер настроен для постоянного хранения данных, чтобы избежать повторных миграций:
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

## 4. Сборка и запуск контейнера авторизации
Собираем Docker-образ для сервиса авторизации и запускаем контейнер:
```bash
docker build -t auth-service:dev -f auth-service/Dockerfile .
docker run -d \
  --name auth-service \
  --network orgaflow-net \
  -p 5095:8080 \
  auth-service:dev
```

## 5. Сборка и запуск контейнера микросервиса задач
Создаем образ микросервиса задач и запускаем контейнер:
```bash
docker build -t task-service:dev -f ./task-service/Dockerfile .
docker run -d \
  --name task-service \
  --network orgaflow-net \
  -p 5096:8080 \
  task-service:dev
```

## 6. Сборка и запуск контейнера основного приложения
Собираем образ основного приложения и запускаем контейнер:
```bash
docker build -t main-app:dev -f ./Dockerfile .
docker run -d \
  --name main-app \
  --network orgaflow-net \
  -p 80:8080 \
  main-app:dev
```

## 7. Сборка и запуск контейнера UI
Собираем образ UI приложения и запускаем контейнер:
```bash
docker build -t orgaflow-ui:dev -f ./OrgaFlow.UI/Dockerfile .

docker run -d \
  --name ui-app \
  --network orgaflow-net \
  -p 3000:3000 \
  orgaflow-ui:dev
```

## 8. Первая миграция базы данных
Если приложение запускается в первый раз, необходимо выполнить миграции для всех трех контекстов базы данных.
(Легче запустить собрать и запустить orgaflow_postgres и через IDE сделать миграции, с мониторингом процесса, 
а после перейти к работе над другими контейнерами)
### Миграция для AuthDbContext
```bash
dotnet ef migrations add Init -s ./OrgaFlow.API -p ./OrgaFlow.Persistence --context AuthDbContext
```
Применение миграции:
```bash
dotnet ef database update --verbose -s .\OrgaFlow.API\ -p .\OrgaFlow.Persistence\ --AuthDbContext
```

### Миграция для AppDbContext
```bash
dotnet ef migrations add Init -s ./OrgaFlow.API -p ./OrgaFlow.Persistence --context AppDbContext
```
Применение миграции:
```bash
dotnet ef database update --verbose -s .\OrgaFlow.API\ -p .\OrgaFlow.Persistence\ --AppDbContext
```

### Миграция для TaskDbContext
```bash
dotnet ef migrations add Init -s ./OrgaFlow.API -p ./OrgaFlow.Persistence --context TaskDbContext
```
Применение миграции:
```bash
dotnet ef database update --verbose -s .\OrgaFlow.API\ -p .\OrgaFlow.Persistence\ --TaskDbContext
```

