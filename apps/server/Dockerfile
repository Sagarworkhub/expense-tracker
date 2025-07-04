# use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Copy package.json files for all workspaces
COPY package.json ./
COPY apps/server/package.json ./apps/server/
COPY turbo.json ./

# Install dependencies in the server directory
WORKDIR /usr/src/app/apps/server
RUN rm -rf node_modules && rm -f bun.lockb && bun install --force

# Copy the server source code
COPY apps/server ./

# Build the server
ENV NODE_ENV=production
ENV DATABASE_URL='postgresql://neondb_owner:npg_AQ4bchwyUF7n@ep-shy-union-a291qvfj.eu-central-1.aws.neon.tech/neondb?sslmode=require'
ENV CORS_ORIGIN=https://steady-chaja-bf5ffb.netlify.app/
ENV BETTER_AUTH_SECRET=skjqUTlcFnqiv7ytqOf7J8hnoelRksHu
ENV BETTER_AUTH_URL=http://localhost:3000
RUN bun run build

# Clean up dev dependencies
RUN rm -rf node_modules && bun install --production --force

# Start the application
USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["bun", "run", "start"]