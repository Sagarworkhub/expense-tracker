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
WORKDIR /usr/share/nginx/html

# Copy built assets from the build stage
COPY --from=build /usr/src/app/apps/web/dist ./

# Copy custom Nginx config
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]