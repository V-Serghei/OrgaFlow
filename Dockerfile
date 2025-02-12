# Базовый образ для запуска
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Образ для сборки
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Копируем и восстанавливаем зависимости
COPY ["OrgaFlow.API/OrgaFlow.API.csproj", "OrgaFlow.API/"]
RUN dotnet restore "OrgaFlow.API/OrgaFlow.API.csproj"

# Копируем остальные файлы и компилируем
COPY . .
WORKDIR "/src/OrgaFlow.API"
RUN dotnet build "OrgaFlow.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Публикация
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "OrgaFlow.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Финальный образ
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Используем некорневой порт
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "OrgaFlow.API.dll"]
