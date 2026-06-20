#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNTIME_DIR="$SCRIPT_DIR/.runtime"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BOLD='\033[1m'; NC='\033[0m'
ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
info() { echo -e "  ${YELLOW}→${NC} $1"; }

echo -e "\n${BOLD}Stopping OrgaFlow...${NC}\n"

# 1. Kill by process name — catches services and Node regardless of PID files
info "Killing by process name..."
powershell.exe -NonInteractive -NoProfile -Command "
    # .NET services
    \$dotnetNames = @('task-service','OrgaFlow.API','auth-service','email-services','notification-service')
    foreach (\$n in \$dotnetNames) {
        Get-Process -Name \$n -ErrorAction SilentlyContinue | ForEach-Object {
            Stop-Process -Id \$_.Id -Force -ErrorAction SilentlyContinue
            Write-Host \"  killed \$n (PID \$(\$_.Id))\"
        }
    }
    # Node / Next.js — kill node processes that reference this project
    Get-WmiObject Win32_Process |
        Where-Object { \$_.Name -eq 'node.exe' -and \$_.CommandLine -like '*OrgaFlow*' } |
        ForEach-Object {
            Stop-Process -Id \$_.ProcessId -Force -ErrorAction SilentlyContinue
            Write-Host \"  killed node.exe (PID \$(\$_.ProcessId))\"
        }
    # Anything running from the project bin folders
    Get-WmiObject Win32_Process |
        Where-Object { \$_.ExecutablePath -like '*OrgaFlow*bin*' } |
        ForEach-Object { Stop-Process -Id \$_.ProcessId -Force -ErrorAction SilentlyContinue }
" 2>/dev/null | tr -d '\r' || true

# 2. Kill by port (frontend :3000 + backends :5023 :5095 :5130 :5165)
info "Killing by port..."
for port in 3000 5023 5095 5130 5165; do
    owning_pid=$(powershell.exe -NonInteractive -NoProfile -Command \
        "(Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess | Select-Object -First 1" \
        2>/dev/null | tr -d '\r\n')
    if [[ "$owning_pid" =~ ^[0-9]+$ ]] && [ "$owning_pid" -gt 0 ]; then
        taskkill.exe /PID "$owning_pid" /F /T > /dev/null 2>&1 \
            && ok "Port :${port} (PID $owning_pid)" || true
    fi
done

# 3. Kill wrapper cmd.exe processes by PID files and clean up
info "Cleaning up PID files..."
for pid_file in "$RUNTIME_DIR"/*.pid; do
    [ -f "$pid_file" ] || continue
    pid=$(tr -d '[:space:]' < "$pid_file")
    [[ "$pid" =~ ^[0-9]+$ ]] && taskkill.exe /PID "$pid" /F /T > /dev/null 2>&1 || true
    rm -f "$pid_file"
done

echo ""
ok "All services stopped"

# Stop PostgreSQL Docker container
CONTAINER="orgaflow_postgres"
if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${CONTAINER}$"; then
    info "Stopping PostgreSQL container..."
    docker stop "$CONTAINER" > /dev/null && ok "PostgreSQL stopped"
else
    info "PostgreSQL container not running"
fi

echo ""
