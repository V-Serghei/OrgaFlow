FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Копируем файл проекта API
COPY ["OrgaFlow.API/OrgaFlow.API.csproj", "OrgaFlow.API/"]
# Восстанавливаем зависимости для OrgaFlow.API
RUN dotnet restore "OrgaFlow.API/OrgaFlow.API.csproj"

# Копируем все файлы
COPY . .

# Переходим в папку проекта API
WORKDIR "/src/OrgaFlow.API"
RUN dotnet build "OrgaFlow.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "OrgaFlow.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "OrgaFlow.API.dll"]
