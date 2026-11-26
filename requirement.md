# common-db-test implementation requirements

## Instructions for the coding agent

Implement a runnable Node.js/PostgreSQL starter in the open workspace. This is a standalone specification. An empty folder and this file are sufficient input to generate the source. If a working copy of `common-db-test` is present, inspect it first, keep its folder layout and public route paths, and apply the requirements below to it. Write the source files, run setup using the available terminal, and verify the API. If terminal or file access is unavailable, provide complete files by path and identify the steps you could not execute.

Use CommonJS JavaScript, Node.js 24, Express 5, Sequelize 6, PostgreSQL, bcrypt, jsonwebtoken, dotenv, and express-validator. Use Helmet, cookie parsing, development CORS, and basic rate limiting as in the existing starter. Use npm and generate a lockfile. Keep this as a single API and a single PostgreSQL database. Preserve `/commonTest/user` and the `access-token` header on protected routes.

## File and folder structure

| Path | Required implementation |
| --- | --- |
| `package.json`, `package-lock.json` | Dependencies and runnable scripts for `start`, `dev`, `setup`, `seed:demo`, and `test:smoke`. |
| `.env.example`, `.gitignore`, `compose.yaml` | Documented config, ignored local secrets and dependencies, optional local PostgreSQL container with a health check and named volume. |
| `index.js` | Load environment, build Express app, register middleware and routes, authenticate and initialize DB, and start listening. |
| `src/configs/db.pg.config.js`, `general.config.js` | Sequelize connection and status constants. |
| `src/routes/index.js` | Compose router and mount user router. |
| `src/controllers/user/index.js`, `user.controller.js` | Route definitions, controller handlers, and transaction boundaries. |
| `src/validator/user/index.js` | Body, UUID, and query validation plus handling of `validationResult(req)`. |
| `src/middlewares/auth.js` | Access-token verification, active-user check and role middleware. |
| `src/services/index.js`, `src/services/user/index.js`, `user.service.js` | Export service, implement registration, login, listing, detail, update, and bulk soft deletion. |
| `src/models/postgresql/models/index.js` | Load/export models before schema initialization. |
| `src/models/postgresql/models/auth/user.js`, `auditLog/log.js` | Sequelize definitions for `users` and `logs`. |
| `src/util/asyncHandler.js`, `src/util/helpers/response/{response,globalErrorHandler}.js`, `src/util/auditLog/index.js` | Async forwarding, common responses, central error translation, and audit writes. |
| `scripts/setup.js`, `scripts/seed-demo.js`, `scripts/smoke.js` | Portable Node scripts for local bootstrap, opt-in admin creation, and end-to-end checks. |
| `README.md` | Exact bootstrap commands, environment settings, routes, examples, and troubleshooting. |

Paths abbreviated after a comma are relative to the preceding file's directory unless they start with `src/`. Empty legacy folders and unused legacy form-builder methods can be skipped in fresh generation.

## Database

Use Sequelize models with `createdAt` and `updatedAt`.

| Table | Fields |
| --- | --- |
| `users` | Integer auto-increment `id` primary key, unique UUID v4 `uuid`, required unique `email`, required bcrypt hash in `password`, `role` default `member`, integer `status` default `1` |
| `logs` | Integer auto-increment `id` primary key, unique UUID v4 `uuid`, required `table_name`, `module_name`, `submodule_name`, integer `record_id`, JSONB `records`, required `operation_type`, integer `status` default `1` |

Use roles `member`, `admin`, and `super_admin`. Use status `1` for active and `0` for soft-deleted. Use model sync to initialize the blank demo database after connection. Avoid forced sync and automatic schema alteration of existing databases. Keep writes and any required audit insert in the same transaction. At minimum log registration as INSERT. Store only allowlisted audit data and omit password hashes and tokens. The demo admin seed must be repeatable and must preserve existing accounts. Use a distinct configured demo email.

## Request and response flow

JSON parser → router → route validation and authentication/role checks as applicable → controller → service → Sequelize/PostgreSQL → response helper. Forward errors to one global handler and end the request after sending an error. Use the same success keys as the current starter, including `success`, `responseCode`, and `data` or `message`. Keep login data nested under `data.result` and list pagination under `meta`.

Protected requests read the JWT from `access-token`. Verify signature and expiry, load the user by token ID, and authorize the current database role and active status. Return 401 for missing, invalid, expired, or inactive-user credentials and 403 for an active user without a permitted role. Never return hashes in registration, detail, listing, or update responses.

| Method and path | Behavior |
| --- | --- |
| `POST /commonTest/user/register` | Public. Validate normalized email and nonempty password subject to bcrypt's 72-byte input limit. Use a unique email constraint to also handle concurrent duplicates. Set role to `member`, hash once with bcrypt cost 10, then write user and audit in one transaction. Return 200, 400 for invalid body or 409 for duplicate email. |
| `POST /commonTest/user/login` | Public. Validate email/password, find an active account, compare with bcrypt, and return `uuid`, `email`, `accessToken`, and `refreshToken` in `data.result`. Sign access payload containing `id`, `email`, and `role`. Sign refresh payload containing `id` with a separate secret. Return the same 401 message for unknown account or incorrect password. No refresh route in this starter. |
| `GET /commonTest/user` | Admin or super_admin. List active users with total count, default limit 10 and offset 0, validated limit 1–100 and offset ≥0. Support `email`, `role`, and email search, with documented sort fields and directions. Default to updatedAt descending with a stable ID tie-breaker. Use Sequelize or bound values and fixed SQL identifiers. Compute page as `Math.floor(offset / limit) + 1`. |
| `GET /commonTest/user/:uuid` | Admin or super_admin. Validate UUID, return active user's public fields, 400 for malformed UUID and 404 for missing/inactive UUID. |
| `PUT /commonTest/user/:uuid` | Admin or super_admin. Require an active target and allow only email and password changes in the starter. Validate supplied values, hash changed password once, and leave stored hash when password is omitted. Return sanitized output and handle duplicate email. |
| `DELETE /commonTest/user` | Admin or super_admin. Require JSON body `{"uuid":["valid-uuid-1","valid-uuid-2"]}` with real UUID strings. Reject missing, empty, non-array, or malformed UUID lists with 400 before touching the DB. Deduplicate and update only `{ uuid: { [Op.in]: uuid }, status: ACTIVE }` to deleted status. Return 200 and number changed if at least one matched, or 404 when zero are changed. Existing inactive or missing UUIDs are skipped in mixed requests. |

List and detail public fields are UUID, email, role, status, and timestamps. Route business failures use clear user-specific messages. Treat unknown request fields according to explicit allowlists and keep role and status out of public registration and normal update input.

## Bootstrap on a new computer

1. Check `node --version`, `npm --version`, current folder, and whether Docker Compose or PostgreSQL is available. Follow the host's tool and installation restrictions. Use an existing authorized demo PostgreSQL instance when configured.
2. Generate dependencies and a lockfile with `npm install` in a fresh project. Use `npm ci` for an existing matching lockfile.
3. Implement and run `npm run setup`. It must create a local `.env` if missing using `.env.example`, generate distinct random access and refresh secrets and a local DB password when needed, preserve existing config, select the Docker Compose path if no existing DB is configured, wait for confirmed DB readiness, and initialize the schema. Use portable Node filesystem and child-process APIs. Compose should bind a loopback DB port and use the same values as the environment file. Handle port conflicts with an actionable message or a configurable local port. No destructive database resets. On later runs, preserve the configured data and credentials.
4. Implement an opt-in `npm run seed:demo` that uses local-only `DEMO_ADMIN_EMAIL` and `DEMO_ADMIN_PASSWORD` values. Read or generate these for the disposable test run without echoing passwords or tokens into logs. Run the seed for smoke testing.
5. Start the API and run `npm run test:smoke`. Capture actual results. If required dependencies, permissions, or a reachable PostgreSQL instance are unavailable, complete the files and identify the exact blocked checks.

Environment keys and suggested defaults are `NODE_ENV=development`, `PORT=3000`, `DB_HOST=127.0.0.1`, `DB_PORT=5432`, `DB_NAME=common_db_test`, `DB_USER=postgres`, `DB_PASS`, `JWT_SECRET`, `JWT_EXPIRES_IN=15m`, `JWT_REFRESH_SECRET`, and `JWT_REFRESH_EXPIRES_IN=7d`. Keep placeholder values in the tracked template and actual secrets in the ignored `.env`. Bind the demo server to loopback. Preserve the historical route and header contract in both local modes.

## Acceptance checks

- Boot against a blank demo DB and confirm both tables exist. Run bootstrap again and confirm config and data are preserved.
- Register distinct users, check duplicate email and malformed input, and verify registration and the audit record omit the hash. Log in as both the demo admin and a member. Confirm invalid credentials return 401 and the member gets 403 on the admin list.
- Verify list pagination, email search and UUID detail. Validate unknown sort fields and verify status filters exclude soft-deleted users.
- Change a demo user's password and verify only the new password works. Update email alone and verify the existing password still works.
- Send a DELETE with no body, an empty UUID array and a malformed UUID. Confirm 400 and unchanged rows. Delete two active users in one valid request and verify both are inactive, a third user remains active, and deleted users cannot authenticate. Confirm retry with only inactive UUIDs gives 404.
- Run smoke checks against a disposable database using uniquely named test accounts. Report changed files, folder tree, exact run commands, API URL, pass/fail results, and any remaining blockers.

## Prompt to use with this file

> Read this file and implement the starter in the current workspace. Use the existing repository if present, or generate the project if the folder is empty. Run the local bootstrap and smoke checks with the available tools. Show me the API URL, what passed, and any setup step blocked by this computer.

prompt :
Read requirement.md. Build the project in this folder, run the local setup and smoke tests, and show me the API URL and any blockers.