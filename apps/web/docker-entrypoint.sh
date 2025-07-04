#!/bin/sh

# Replace environment variables in Caddyfile
sed -i "s|\{\\$VITE_SERVER_URL\}|${VITE_SERVER_URL}|g" /etc/caddy/Caddyfile
sed -i "s|\{\\$PORT\}|${PORT}|g" /etc/caddy/Caddyfile

echo "Starting Caddy on port ${PORT}..."

# Start Caddy
exec caddy run --config /etc/caddy/Caddyfile 