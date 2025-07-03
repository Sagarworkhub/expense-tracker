# Expense Tracker

## Docker Setup

### Prerequisites

- Docker and Docker Compose installed
- A Neon Postgres database (or any PostgreSQL database)

### Environment Variables

Before running the application, create environment files:

1. For the server (`apps/server/.env`):

```
# Database
DATABASE_URL=postgres://username:password@hostname:port/database

# Authentication
BETTER_AUTH_SECRET=your_auth_secret_key
BETTER_AUTH_URL=your_auth_url

# CORS
CORS_ORIGIN=http://localhost:4001

# Node environment
NODE_ENV=production
```

2. For the web app (`apps/web/.env`):

```
# API URL (used during build time)
VITE_API_URL=http://localhost:4000
```

### Running with Docker

1. Build and start the containers:

```bash
docker-compose up --build
```

2. Access the applications:
   - Web UI (served by Nginx): <http://localhost:4001>
   - API Server: <http://localhost:4000>

### Development Setup

For local development without Docker:

1. Install dependencies:

```bash
bun install
```

2. Start the development server:

```bash
bun run dev
```

## Project Structure

- `apps/server`: Backend API built with Bun, TRPC, and Hono
- `apps/web`: Frontend built with React and Vite, served in production by Nginx
