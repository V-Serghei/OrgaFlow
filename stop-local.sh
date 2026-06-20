#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNTIME_DIR="$SCRIPT_DIR/.runtime"

echo "Stopping OrgaFlow services..."

stopped=0
for pid_file in "$RUNTIME_DIR"/*.pid; do
    [ -f "$pid_file" ] || continue
    name=$(basename "$pid_file" .pid)
    pid=$(tr -d '[:space:]' < "$pid_file")
    if [ -n "$pid" ]; then
        # taskkill /T also kills child processes (e.g. the app spawned by dotnet run)
        if taskkill /PID "$pid" /F /T > /dev/null 2>&1; then
            echo "  ✓ Stopped $name (PID $pid)"
            stopped=$((stopped + 1))
        else
            echo "  - $name (PID $pid) already stopped"
        fi
    fi
    rm -f "$pid_file"
done

[ "$stopped" -gt 0 ] || echo "  No running services found."

# Stop PostgreSQL Docker container
CONTAINER="orgaflow_postgres"
if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${CONTAINER}$"; then
    echo "Stopping PostgreSQL container..."
    docker stop "$CONTAINER" > /dev/null && echo "  ✓ PostgreSQL stopped"
else
    echo "  PostgreSQL container not running."
fi

echo "Done."
