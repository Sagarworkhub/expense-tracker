# use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json ./
RUN bun install --force

# Copy source code and build
COPY . .
ENV NODE_ENV=production
ENV DATABASE_URL='postgresql://neondb_owner:npg_AQ4bchwyUF7n@ep-shy-union-a291qvfj.eu-central-1.aws.neon.tech/neondb?sslmode=require'
ENV CORS_ORIGIN=http://localhost:3001
ENV BETTER_AUTH_SECRET=skjqUTlcFnqiv7ytqOf7J8hnoelRksHu
ENV BETTER_AUTH_URL=http://localhost:3000
RUN bun run build

# Clean up dev dependencies
RUN bun install --production --force

# Start the application
USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["bun", "run", "start"]