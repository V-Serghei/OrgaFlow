#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

ok()      { echo -e "${GREEN}✓${NC} $1"; }
info()    { echo -e "${YELLOW}→${NC} $1"; }
err()     { echo -e "${RED}✗ ERROR:${NC} $1"; exit 1; }
section() { echo -e "\n${BOLD}${BLUE}── $1 ──${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNTIME_DIR="$SCRIPT_DIR/.runtime"
SECRETS_FILE="$SCRIPT_DIR/.secrets.local"
mkdir -p "$RUNTIME_DIR"

# Prefer user-level .NET install (%USERPROFILE%\.dotnet) — winget installs SDK per-user
# This ensures .NET 10 is used even when the system dotnet is an older version
if [ -x "$HOME/.dotnet/dotnet" ]; then
    export DOTNET_ROOT="$HOME/.dotnet"
    export PATH="$HOME/.dotnet:$HOME/.dotnet/tools:$PATH"
fi

echo -e "${BOLD}${CYAN}"
echo "  ╔═══════════════════════════════╗"
echo "  ║   OrgaFlow — Local Setup      ║"
echo "  ╚═══════════════════════════════╝"
echo -e "${NC}"

# ── Prerequisites ─────────────────────────────────────────────────────────
section "Checking prerequisites"

require() { command -v "$1" &>/dev/null || err "$1 not found. $2"; }
require dotnet "Install .NET 10 SDK: winget install Microsoft.DotNet.SDK.10"
require docker "Install Docker Desktop: https://www.docker.com/products/docker-desktop/"
require node   "Install Node.js 18+: https://nodejs.org/"
require npm    "Install Node.js 18+: https://nodejs.org/"

DOTNET_MAJOR=$(dotnet --version | cut -d'.' -f1)
[ "$DOTNET_MAJOR" -ge 10 ] || err ".NET 10+ required (found $(dotnet --version)). Run: winget install Microsoft.DotNet.SDK.10"

if ! dotnet ef --version &>/dev/null; then
    info "Installing dotnet-ef tool..."
    dotnet tool install --global dotnet-ef 2>/dev/null || dotnet tool update --global dotnet-ef 2>/dev/null || true
fi

docker info &>/dev/null || err "Docker is not running. Start Docker Desktop first."
ok "All prerequisites satisfied (.NET $(dotnet --version), Node $(node --version))"

# ── Secrets ───────────────────────────────────────────────────────────────
section "Secrets"

gen_secret() { node -e "process.stdout.write(require('crypto').randomBytes($1).toString('base64url'))"; }

if [ -f "$SECRETS_FILE" ]; then
    # shellcheck source=/dev/null
    source "$SECRETS_FILE"
    ok "Loaded existing secrets from .secrets.local"
else
    info "Generating new secrets..."
    DB_PASSWORD=$(gen_secret 18)
    JWT_SECRET=$(gen_secret 32)
    DB_USER="orgaflow"
    DB_NAME="OrgaFlowDb"
    DB_PORT=5433
    JWT_ISSUER="OrgaFlow"
    JWT_AUDIENCE="OrgaFlowClient"
    cat > "$SECRETS_FILE" <<EOF
DB_PASSWORD=$DB_PASSWORD
DB_USER=$DB_USER
DB_NAME=$DB_NAME
DB_PORT=$DB_PORT
JWT_SECRET=$JWT_SECRET
JWT_ISSUER=$JWT_ISSUER
JWT_AUDIENCE=$JWT_AUDIENCE
EOF
    ok "Secrets generated and saved to .secrets.local"
fi

# ── Config files ──────────────────────────────────────────────────────────
section "Config files"

write_appsettings() {
    local file="$1"
    local extra="${2:-}"
    cat > "$file" <<EOF
{
  "Logging": { "LogLevel": { "Default": "Information", "Microsoft.AspNetCore": "Warning" } },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DbConnectionString": "Host=localhost;Port=${DB_PORT};Username=${DB_USER};Password=${DB_PASSWORD};Database=${DB_NAME}"
  }${extra}
}
EOF
}

JWT_BLOCK=',
  "Jwt": {
    "Secret": "'"${JWT_SECRET}"'",
    "Issuer": "'"${JWT_ISSUER}"'",
    "Audience": "'"${JWT_AUDIENCE}"'"
  }'

write_appsettings "$SCRIPT_DIR/OrgaFlow.API/appsettings.Development.json" "$JWT_BLOCK"
write_appsettings "$SCRIPT_DIR/auth-service/appsettings.Development.json" "$JWT_BLOCK"
write_appsettings "$SCRIPT_DIR/task-service/appsettings.Development.json"

cat > "$SCRIPT_DIR/OrgaFlow.UI/orga-flow-ui/.env.local" <<EOF
NEXT_PUBLIC_API_URL=http://localhost:5023
NEXT_PUBLIC_AUTH_URL=http://localhost:5095
NEXT_PUBLIC_TASK_URL=http://localhost:5130
NEXT_PUBLIC_EMAIL_URL=http://localhost:5165
EOF
ok "appsettings.Development.json created for all services"
ok ".env.local created for frontend"

# ── PostgreSQL ────────────────────────────────────────────────────────────
section "PostgreSQL"

CONTAINER="orgaflow_postgres"
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
    if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
        info "Restarting existing container..."
        docker start "$CONTAINER" > /dev/null
    else
        ok "Container already running"
    fi
else
    info "Creating PostgreSQL container..."
    docker run -d \
        --name "$CONTAINER" \
        -p "${DB_PORT}:5432" \
        -e POSTGRES_DB="$DB_NAME" \
        -e POSTGRES_USER="$DB_USER" \
        -e POSTGRES_PASSWORD="$DB_PASSWORD" \
        -v orgaflow_postgres_data:/var/lib/postgresql/data \
        --restart unless-stopped \
        postgres:15 > /dev/null
    ok "Container created"
fi

info "Waiting for PostgreSQL to accept connections..."
for i in $(seq 1 30); do
    if docker exec "$CONTAINER" pg_isready -U "$DB_USER" -d "$DB_NAME" &>/dev/null; then
        ok "PostgreSQL is ready"; break
    fi
    [ "$i" -lt 30 ] || err "PostgreSQL did not start in 30 seconds"
    sleep 1
done

# ── Stop existing services (release DLL locks before build) ───────────────
section "Stopping existing services"

# 1. Kill by process name — most reliable; catches executables regardless of port
powershell.exe -NonInteractive -NoProfile -Command "
    \$names = @('task-service','OrgaFlow.API','auth-service','email-services','notification-service')
    foreach (\$n in \$names) {
        Get-Process -Name \$n -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    }
    # Catch anything running from the project bin folders
    Get-WmiObject Win32_Process |
        Where-Object { \$_.ExecutablePath -like '*OrgaFlow*bin*' } |
        ForEach-Object { Stop-Process -Id \$_.ProcessId -Force -ErrorAction SilentlyContinue }
" 2>/dev/null | tr -d '\r' || true

# 2. Kill by port as fallback (services might not be fully started yet)
for port in 5023 5095 5130 5165; do
    owning_pid=$(powershell.exe -NonInteractive -NoProfile -Command \
        "(Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess | Select-Object -First 1" \
        2>/dev/null | tr -d '\r\n')
    if [[ "$owning_pid" =~ ^[0-9]+$ ]] && [ "$owning_pid" -gt 0 ]; then
        taskkill.exe /PID "$owning_pid" /F /T &>/dev/null \
            && echo -e "  ${GREEN}✓${NC} Stopped :${port} (PID $owning_pid)" || true
    fi
done

# 3. Kill by PID files from previous run (wrapper cmd processes)
for pid_file in "$RUNTIME_DIR"/*.pid; do
    [ -f "$pid_file" ] || continue
    pid=$(cat "$pid_file" 2>/dev/null | tr -d '\r\n')
    [[ "$pid" =~ ^[0-9]+$ ]] && taskkill.exe /PID "$pid" /F /T &>/dev/null || true
done

# Wait for Windows to fully release file handles before the build starts
sleep 3
ok "Services stopped"

# ── Build ─────────────────────────────────────────────────────────────────
section "Build"

info "Restoring NuGet packages..."
dotnet restore "$SCRIPT_DIR" --verbosity quiet
ok "NuGet packages restored"

info "Building solution..."
dotnet build "$SCRIPT_DIR" --no-restore --configuration Debug --verbosity quiet
ok "Build successful"

# ── Migrations ────────────────────────────────────────────────────────────
section "Database migrations"

# $1 = DbContext name, $2 = output-dir relative to OrgaFlow.Persistence
run_migration() {
    local ctx="$1"
    local output_dir="$2"

    # Detect model changes not yet covered by any migration
    local pending=0
    ASPNETCORE_ENVIRONMENT=Development dotnet ef migrations has-pending-model-changes \
        -s "$SCRIPT_DIR/OrgaFlow.API" \
        -p "$SCRIPT_DIR/OrgaFlow.Persistence" \
        --context "$ctx" \
        --no-build &>/dev/null || pending=1

    if [ "$pending" -eq 1 ]; then
        local name="Auto_$(date +%Y%m%d%H%M%S)"
        info "$ctx: model changes detected — creating migration '$name'..."
        local add_out
        if add_out=$(ASPNETCORE_ENVIRONMENT=Development dotnet ef migrations add "$name" \
            -s "$SCRIPT_DIR/OrgaFlow.API" \
            -p "$SCRIPT_DIR/OrgaFlow.Persistence" \
            --context "$ctx" \
            --output-dir "$output_dir" \
            --no-build 2>&1); then
            ok "$ctx: migration '$name' created"
        else
            echo -e "  ${RED}✗ Failed to create migration for $ctx${NC}"
            echo "$add_out" | tail -5
        fi
    else
        info "$ctx: no model changes"
    fi

    # Apply all pending migrations to the database
    local update_out
    if update_out=$(ASPNETCORE_ENVIRONMENT=Development dotnet ef database update \
        -s "$SCRIPT_DIR/OrgaFlow.API" \
        -p "$SCRIPT_DIR/OrgaFlow.Persistence" \
        --context "$ctx" \
        --no-build 2>&1); then
        ok "$ctx: database up to date"
    else
        echo -e "  ${YELLOW}⚠ $ctx: migration apply failed${NC}"
        echo "$update_out" | tail -3
    fi
}

run_migration AuthDbContext "Migrations/AuthDb"
run_migration AppDbContext  "Migrations/AppDb"
run_migration TaskDbContext "Migrations"

# ── npm ───────────────────────────────────────────────────────────────────
section "Frontend packages"

UI_DIR="$SCRIPT_DIR/OrgaFlow.UI/orga-flow-ui"
if [ ! -d "$UI_DIR/node_modules" ]; then
    info "Installing npm packages..."
    npm install --prefix "$UI_DIR" --silent
    ok "npm packages installed"
else
    ok "node_modules already present"
fi

# ── Start services ─────────────────────────────────────────────────────────
section "Starting services"

# Each service is started via a wrapper .bat (handles output redirect)
# launched with -WindowStyle Hidden → own console group, NOT killed by terminal close.
start_svc() {
    local name="$1"
    local project="$2"
    local port="$3"
    local log_file="$RUNTIME_DIR/${name}.log"
    local wrapper="$RUNTIME_DIR/start-${name}.bat"
    local pid_file="$RUNTIME_DIR/${name}.pid"
    info "Starting ${name} on :${port}..."

    local win_project win_log win_wrapper win_pid
    win_project="$(cygpath -w "$project")"
    win_log="$(cygpath -w "$log_file")"
    win_wrapper="$(cygpath -w "$wrapper")"
    win_pid="$(cygpath -w "$pid_file")"

    # Wrapper bat: sets user-level .NET path, redirects output (WindowStyle Hidden + Redirect can't coexist)
    printf '@echo off\r\nif exist "%%USERPROFILE%%\\.dotnet\\dotnet.exe" (\r\n    set "PATH=%%USERPROFILE%%\\.dotnet;%%PATH%%"\r\n    set "DOTNET_ROOT=%%USERPROFILE%%\\.dotnet"\r\n)\r\ndotnet run --project "%s" --no-build --environment Development --urls "http://localhost:%s" >> "%s" 2>&1\r\n' \
        "$win_project" "$port" "$win_log" > "$wrapper"

    # WindowStyle Hidden = new console group → survives parent terminal close / Ctrl+C
    powershell.exe -NonInteractive -NoProfile -Command \
        "\$p = Start-Process cmd -ArgumentList '/c','${win_wrapper}' -WindowStyle Hidden -PassThru; \$p.Id | Out-File '${win_pid}' -Encoding ascii -NoNewline" \
        || echo -e "  ${YELLOW}⚠ Could not start ${name}${NC}"
}

start_svc "auth-service"  "$SCRIPT_DIR/auth-service"    5095
start_svc "task-service"  "$SCRIPT_DIR/task-service"    5130
start_svc "email-service" "$SCRIPT_DIR/email-services"  5165

info "Waiting for auth-service to be ready (up to 60s)..."
for i in $(seq 1 30); do
    if curl -sf "http://localhost:5095/swagger/index.html" &>/dev/null; then
        ok "Auth-service is ready"; break
    fi
    if [ "$i" -eq 30 ]; then
        echo -e "  ${YELLOW}⚠ Auth-service not responding — check .runtime/auth-service.log${NC}"
    fi
    sleep 2
done

start_svc "api"           "$SCRIPT_DIR/OrgaFlow.API"    5023

info "Waiting for API to be ready (up to 60s)..."
for i in $(seq 1 30); do
    if curl -sf "http://localhost:5023/swagger/index.html" &>/dev/null; then
        ok "API is ready"; break
    fi
    if [ "$i" -eq 30 ]; then
        echo -e "  ${YELLOW}⚠ API not responding — check .runtime/api.log${NC}"
    fi
    sleep 2
done

# Frontend — same wrapper pattern
info "Starting frontend (Next.js)..."
FE_WRAPPER="$RUNTIME_DIR/start-frontend.bat"
WIN_UI_DIR="$(cygpath -w "$UI_DIR")"
WIN_FE_LOG="$(cygpath -w "$RUNTIME_DIR/frontend.log")"
WIN_FE_WRAPPER="$(cygpath -w "$FE_WRAPPER")"
WIN_FE_PID="$(cygpath -w "$RUNTIME_DIR/frontend.pid")"

printf '@echo off\r\ncd /d "%s"\r\nnpm run dev >> "%s" 2>&1\r\n' \
    "$WIN_UI_DIR" "$WIN_FE_LOG" > "$FE_WRAPPER"

powershell.exe -NonInteractive -NoProfile -Command \
    "\$p = Start-Process cmd -ArgumentList '/c','${WIN_FE_WRAPPER}' -WindowStyle Hidden -PassThru; \$p.Id | Out-File '${WIN_FE_PID}' -Encoding ascii -NoNewline" \
    || echo -e "  ${YELLOW}⚠ Could not start frontend${NC}"

# ── Done ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}  OrgaFlow is running!${NC}"
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e ""
echo -e "  ${BOLD}Frontend${NC}   →  ${CYAN}http://localhost:3000${NC}"
echo -e "  ${BOLD}API${NC}        →  ${CYAN}http://localhost:5023/swagger${NC}"
echo -e "  ${BOLD}Auth${NC}       →  ${CYAN}http://localhost:5095/swagger${NC}"
echo -e "  ${BOLD}Task${NC}       →  ${CYAN}http://localhost:5130/swagger${NC}"
echo -e "  ${BOLD}Email${NC}      →  ${CYAN}http://localhost:5165/swagger${NC}"
echo -e ""
echo -e "  ${BOLD}Logs${NC}       →  .runtime/*.log"
echo -e "  ${BOLD}Stop all${NC}   →  ${YELLOW}stop-local.bat${NC}"
echo -e ""
