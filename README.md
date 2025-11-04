# AGENDOS — Task Management API

A clean, layered backend API for a Task Management app built with Node.js and TypeScript.

This repository implements a layered architecture (Controller → Service → Repository) with an Express API, Knex.js for database access, MySQL migrations & seeders, Redis caching, JWT authentication and common production-ready practices such as rate-limiting, structured logging, and centralized error handling.

---

## Key Technologies

- Node.js + TypeScript
- Express.js (HTTP server)
- Knex.js (query builder & migrations)
- MySQL (database)
- Redis (caching / token storage)
- JWT (jsonwebtoken)
- bcrypt (password hashing)
- Joi (validation)
- Winston (logging)

---

## Architecture Overview

The project follows a layered / clean architecture to separate concerns and make the codebase maintainable and testable:

- Controllers — HTTP handlers (src/controllers)
- Services — Business logic & orchestration (src/services)
- Repositories — Data access via Knex (src/repository)
- Database — Migrations & seeders (src/database)
- Utilities — Logging, caching, token utilities, error classes (src/utils)
- Middlewares — Validation, rate-limiting, error handling (src/middlewares)

Request flow: Client → Controller → Service → Repository → Database

---

## Quick Start (development)

Requirements:

- Node.js 18+ (or compatible)
- pnpm
- MySQL
- Redis

1. Install dependencies

```powershell
pnpm install
```

2. Copy the example env (create a `.env` file at the project root) and set the values for your environment. See the `Environment variables` section below for required keys.

3. Run migrations and seed providers

```powershell
npx knex migrate:latest
npx knex seed:run
```

4. Start the development server

```powershell
npm run dev
```

The API will be available at the `BASE_URL` you set in `.env` (default in repo: `http://localhost:3200/api/v1`).

---

## Environment variables

Create a `.env` file and configure the following variables. Do NOT commit secrets.

Required (used in code):

- NODE_ENV (development | production)
- PORT
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
- SALT_ROUNDS
- SECRET_KEY
- REFRESH_SECRET
- EMAIL_SECRET
- TOKEN_EXPIRY
- REFRESH_TOKEN_EXPIRY_DAYS
- RATE_LIMIT_WINDOW_MS
- RATE_LIMIT_MAX_REQUESTS
- SMTP_EMAIL
- SMTP_PASSWORD
- REDIS_URL
- BASE_URL (e.g. http://localhost:3200/api/v1)

Example (DO NOT use these keys in production):

```text
NODE_ENV=development
PORT=3200
BASE_URL=http://localhost:3200/api/v1
REDIS_URL=redis://127.0.0.1:6379
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=local_todo_db
SALT_ROUNDS=12
SECRET_KEY=your_jwt_secret
REFRESH_SECRET=your_refresh_secret
EMAIL_SECRET=your_email_secret
TOKEN_EXPIRY=2h
REFRESH_TOKEN_EXPIRY_DAYS=7
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SMTP_EMAIL=your-smtp-email
SMTP_PASSWORD=your-smtp-password
```

---

## Scripts

You can run the following npm scripts defined in `package.json`:

- `npm run dev` — start development server (nodemon + ts-node)
- `npm run start` — run compiled `dist` server (after build)
- `npm run migrate` — run knex migrations (via package script aliases)
- `npm run seed` — run knex seeds

Note: migrations & seed commands use the `knexfile.js` in repo which loads the TypeScript knex config.

---

## Database

Knex configuration is in `src/config/knexfile.ts`. Migrations are located in `src/database/migrations` and seeds are in `src/database/seeds`.

Run migrations:

```powershell
npx knex migrate:latest
```

Run seeds:

```powershell
npx knex seed:run
```

The repo includes migrations for users, providers, auth, and tasks tables, and a seed for core providers.

---

## Redis

Redis is used for caching and storing refresh tokens. Configure the connection with `REDIS_URL` in `.env`. The Redis client is configured in `src/config/redis.ts` and utilities are in `src/utils/caching.ts`.

---

## Testing

Tests are written with Jest and are located inside the `src/tests` directory. You can run the test suite using the `pnpm test` command.

---

## API Endpoints (examples)

Base URL: `{{BASE_URL}}` (e.g. `http://localhost:3200/api/v1`)

Auth:

- POST /auth/signup — register a new user
- GET /auth/verify-email?token=... — verify email with token
- POST /auth/login — login and receive tokens

Example signup request (PowerShell curl style):

```powershell
curl -X POST "http://localhost:3200/api/v1/auth/signup" -H "Content-Type: application/json" -d '{
  "email": "test@example.com",
  "password": "S3cure!Pass",
  "confirm_password": "S3cure!Pass",
  "fullname": "Test User",
  "phone": "08031234567"
}'
```

Login example:

```powershell
curl -X POST "http://localhost:3200/api/v1/auth/login" -H "Content-Type: application/json" -d '{
  "email": "test@example.com",
  "password": "S3cure!Pass"
}'
```

Verify email (the verification email contains a link with a token):

```powershell
# GET request performed by a browser or via curl
curl "http://localhost:3200/api/v1/auth/verify-email?token=<TOKEN_HERE>"
```

---

## Error handling & logging

- Centralized error handler: `src/middlewares/error_handler.ts` (custom `AppError` subclasses in `src/utils/errors.ts`).
- Logging: Winston configured in `src/utils/logger.ts` (writes to `logs/error.log` and `logs/combined.log`).

---

## Development tips & troubleshooting

- If you see database connection problems: check `DB_*` env variables and ensure MySQL is reachable.
- If Redis connection fails: check `REDIS_URL` and make sure Redis server is running.
- For migrations, ensure `ts-node` is available and the repo's `knexfile.js` loads the TypeScript config.
- Use `npm run dev` to run nodemon and get live reloads for development.

---

## Contributing

Contributions are welcome. Follow the existing layered structure when adding features:

- Add new business logic in `src/services`.
- Add DB access code to `src/repository` and update/create migrations.
- Keep controllers thin — only handle validation and HTTP concerns.

---

## Notes

- This repo already includes a `docs/` folder with architecture notes, API docs and service responsibilities.
- Be mindful of storing secrets — use environment variables or a secret manager in production.

---

## License

This project has no license file in the repository. Add a `LICENSE` file if you plan to open-source it.

---