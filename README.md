# Expense Tracker

A modern expense tracking application built with React, TypeScript, tRPC, and Drizzle ORM. Track, categorize, and manage your expenses with an intuitive user interface and robust backend.

## Features

- **User Authentication**: Secure sign-up and sign-in functionality
- **Expense Categories**: Categorize expenses (Travel, Utility, Grocery, etc.)
- **Expense Approval Workflow**: Submit expenses for approval with pending/approved/rejected statuses
- **Dashboard**: View expense statistics, charts, and recent transactions
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend

- **Runtime**: [Bun](https://bun.sh/)
- **API**: [tRPC](https://trpc.io/) with [Hono](https://hono.dev/)
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [better-auth](https://github.com/betterauth/better-auth)

### Frontend

- **Framework**: [React 19](https://react.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (built on Radix UI)
- **Charts**: [Recharts](https://recharts.org/)

### DevOps

- **Containerization**: Docker and Docker Compose
- **Build Tool**: [Turbo](https://turbo.build/)
- **Package Manager**: [Bun](https://bun.sh/)
- **Linting**: [Biome](https://biomejs.dev/)

## Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- A PostgreSQL database (local or cloud-based like Neon Postgres)

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
VITE_SERVER_URL=http://localhost:4000
```

### Running with Docker

1. Build and start the containers:

```bash
docker-compose up --build
```

2. Access the applications:
   - Web UI (served by Caddy): http://localhost:4001
   - API Server: http://localhost:4000

## Development Setup

For local development without Docker:

1. Install dependencies:

```bash
bun install
```

2. Set up environment variables as described above

3. Start the development server:

```bash
# Start both frontend and backend
bun run dev

# Start only the backend
bun run dev:server

# Start only the frontend
bun run dev:web
```

4. Database commands:

```bash
# Push schema changes to the database
bun run db:push

# Generate migrations
bun run db:generate

# Apply migrations
bun run db:migrate

# Open Drizzle Studio to manage database
bun run db:studio

# Seed the database with initial data
cd apps/server && bun run db:seed
```

## Deployment Options

### Railway Deployment

1. Create two services in Railway:
   - `expense-tracker-server`: For the backend API
   - `expense-tracker-web`: For the frontend

2. Configure environment variables for the server service:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `BETTER_AUTH_SECRET`: Authentication secret key
   - `BETTER_AUTH_URL`: Authentication URL
   - `CORS_ORIGIN`: The URL of your web service
   - `NODE_ENV`: production

3. Configure environment variables for the web service:
   - `BACKEND_URL`: The URL of your server service
   - `VITE_SERVER_URL`: Same as BACKEND_URL (for build-time configuration)

Railway will automatically deploy your services based on your Dockerfiles.

### Other Cloud Providers

The application can be deployed to any cloud provider that supports Docker containers, such as:

- Vercel
- Netlify
- AWS
- Google Cloud
- Azure

## Project Structure

```
expense-tracker/
  ├── apps/
  │   ├── server/             # Backend API
  │   │   ├── src/
  │   │   │   ├── db/         # Database configuration and schema
  │   │   │   │   ├── migrations/  # Database migrations
  │   │   │   │   └── schema/      # Database schema definitions
  │   │   │   ├── lib/        # Utilities and helpers
  │   │   │   └── routers/    # tRPC routers
  │   │   └── ...
  │   └── web/                # Frontend application
  │       ├── src/
  │       │   ├── components/ # React components
  │       │   │   ├── dashboard/  # Dashboard-specific components
  │       │   │   ├── expense/    # Expense-specific components
  │       │   │   ├── layout/     # Layout components
  │       │   │   └── ui/         # UI components
  │       │   ├── hooks/      # Custom React hooks
  │       │   ├── lib/        # Utilities and constants
  │       │   ├── pages/      # Page components
  │       │   └── routes/     # Route definitions
  │       └── ...
  ├── packages/               # Shared packages
  └── ...
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.
