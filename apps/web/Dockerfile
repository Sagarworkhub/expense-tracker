# Build stage
FROM oven/bun:1 AS build
WORKDIR /usr/src/app

# Copy package.json files for all workspaces
COPY package.json ./
COPY apps/web/package.json ./apps/web/
COPY turbo.json ./

# Install dependencies in the web directory
WORKDIR /usr/src/app/apps/web
RUN rm -rf node_modules && rm -f bun.lockb && bun install --force

# Copy the web source code
COPY apps/web ./

# Build the web app
ENV NODE_ENV=production
RUN bun run build

# Production stage with Caddy
FROM caddy:2-alpine AS release

# Install dependencies for the entrypoint script
RUN apk add --no-cache bash sed

WORKDIR /usr/share/caddy

# Copy built assets from the build stage
COPY --from=build /usr/src/app/apps/web/dist /usr/share/caddy

# Copy Caddyfile
COPY apps/web/Caddyfile /etc/caddy/Caddyfile

# Copy entrypoint script
COPY apps/web/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Set default backend URL if not provided
ENV BACKEND_URL=http://localhost:3000
# Set default PORT if not provided by Railway
ENV PORT=80

# Expose the PORT that Railway will use
EXPOSE ${PORT}

# Use the entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]