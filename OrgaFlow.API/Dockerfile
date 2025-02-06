FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["OrgaFlow.Application/OrgaFlow.Application.csproj", "OrgaFlow.Application/"]
RUN dotnet restore "OrgaFlow.Application/OrgaFlow.Application.csproj"
COPY . .
WORKDIR "/src/OrgaFlow.Application"
RUN dotnet build "OrgaFlow.Application.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "OrgaFlow.Application.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "OrgaFlow.Application.dll"]
