# Blog Management Backend

A Node.js backend for managing blog content, built with [Hono](https://hono.dev/), [Prisma](https://www.prisma.io/), PostgreSQL, Zod, JWT authentication, and Upstash Redis.

## Overview

This project provides a REST API for user authentication and blog management. It includes:

- User signup and login with password hashing using Argon2
- JWT-based authentication middleware
- Blog create, read, update, and delete operations
- Request validation with Zod
- Redis-backed caching and rate limiting using Upstash Redis
- PostgreSQL database access through Prisma
- Docker and Docker Compose support for local development

### Design

![Architecture Diagram](./images/architecture.png)

## Architecture

The project is designed around two main entities, `Users` and `Blogs`, with authentication protecting write access and blog listing endpoints.

### Functional Requirements

- Blogs are the core resource of the application.
- Users can register, log in, write blogs, and read blogs.
- Users can update and delete only their own blogs.
- Users must authenticate before seeing the full blog list, similar to a private publishing platform.




### Request Flow

1. A user registers or logs in.
2. The backend issues a JWT token.
3. Authenticated users can create, update, and delete their own blogs.
4. Blog reads can be cached in Redis for faster access.
5. Rate limiting protects the API from abuse.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Hono
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod
- **Auth:** JWT, Argon2
- **Cache / Rate Limiting:** Upstash Redis
- **Containerization:** Docker, Docker Compose

## Features

- Authentication endpoints for signup, login, and profile lookup
- Blog management endpoints with ownership checks
- Slug-based blog lookup
- Redis cache for blog reads
- Rate limiting for API protection
- Local PostgreSQL container for development

## Project Structure

```text
images/
src/
  common/
  helper/
  infrastructure/
  middleware/
  modules/
  types/
prisma/
  schema.prisma
docker-compose.yml
Dockerfile
```


## Environment Variables

Create a `.env` file in the project root with:

```dotenv
DATABASE_URL="postgresql://postgres:password@localhost:5432/blogdb"
PORT=3000
JWT_SECRET="your-secret"
UPSTASH_REDIS_REST_URL="https://your-upstash-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
```

## Getting Started

### Prerequisites

- Node.js 22+
- npm
- PostgreSQL or Docker
- Upstash Redis account

### Setup

1. **Clone and install:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/BlogManagementBackend.git
   cd BlogManagementBackend
   npm install
   ```

2. **Set up `.env`:**
   ```dotenv
   DATABASE_URL="postgresql://postgres:password@localhost:5432/blogdb"
   PORT=3000
   JWT_SECRET="your-secret-key"
   UPSTASH_REDIS_REST_URL="https://your-upstash-url"
   UPSTASH_REDIS_REST_TOKEN="your-token"
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

4. **Start the app:**
   ```bash
   npm run dev
   ```

   Or with Docker:
   ```bash
   docker compose up --build
   ```

The API runs on `http://localhost:3000`.

## API Overview

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`

### Blogs

- `POST /blogs`
- `GET /blogs`
- `GET /blogs/slug/:slug`
- `PUT /blogs/:slug`
- `DELETE /blogs/:slug`

## Scripts

- `npm run dev` - start the app in watch mode
- `npm run build` - compile TypeScript
- `npm run test` - placeholder script

## Notes

- Blog update and delete routes require authentication.
- Redis is used for blog caching and rate limiting.
- The project is currently optimized for backend development and local Docker-based workflows.
