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

# Production stage with Nginx
FROM nginx:alpine AS release

# Install gettext for envsubst
RUN apk add --no-cache gettext

WORKDIR /usr/share/nginx/html

# Copy built assets from the build stage
COPY --from=build /usr/src/app/apps/web/dist ./

# Copy nginx config as a template
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Set default backend URL if not provided
ENV BACKEND_URL=http://server:3000/

# Create a simple entrypoint script
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'sed -i "s|BACKEND_URL_PLACEHOLDER|$BACKEND_URL|g" /etc/nginx/conf.d/default.conf' >> /entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Expose port 80
EXPOSE 80

# Override the default entrypoint
ENTRYPOINT ["/entrypoint.sh"]