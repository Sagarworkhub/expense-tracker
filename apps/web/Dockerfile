# Build stage
FROM oven/bun:1 AS build
WORKDIR /usr/src/app

# Install dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source code and build the app
COPY . .
ENV NODE_ENV=production
RUN bun run build

# Production stage with Nginx
FROM nginx:alpine AS release
WORKDIR /usr/share/nginx/html

# Copy built assets from the build stage
COPY --from=build /usr/src/app/dist ./

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 