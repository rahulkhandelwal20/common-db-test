# common-db-test

Reusable Node.js backend starter for interview practice and live coding. It uses Express 5, Sequelize 6, PostgreSQL, bcrypt, and JWT. The user module demonstrates registration, login, role checks, pagination, password updates, soft deletion, and a registration audit log.

## Quick start

1. Install Node.js 24 with npm and have a PostgreSQL instance available. Create an empty local database, for example `common_db_test`, and use an account with permission to create and alter tables in that database.
2. Open a terminal in the folder containing `package.json` and run:

   ```sh
   npm install
   ```

3. Create or replace your local demo `.env` with the settings below. Use the actual credentials for your local PostgreSQL server. Generate two independent JWT secrets by running `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` twice and paste one value into each secret setting.

   ```dotenv
   NODE_ENV=development
   PORT=3000
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_NAME=common_db_test
   DB_USER=postgres
   DB_PASS=your_local_db_password
   JWT_SECRET=replace_with_generated_access_secret
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_SECRET=replace_with_generated_refresh_secret
   JWT_REFRESH_EXPIRES_IN=7d
   ```

4. Run `npm run dev` for file watching or `npm start` for a normal run. Expect `DB Connected`, `Tables synced`, and a listening message. The server authenticates to PostgreSQL, runs `sequelize.sync({ alter: true })`, and then opens its HTTP port. Point it at a disposable database because startup can modify its schema. The application defaults to port 80 when `PORT` is unset.

The ZIP has no npm lockfile, migration files, seed data, or runnable Jest suite. Use `npm install` for the included snapshot. The `migrate`, `undo`, and test scripts in `package.json` are placeholders for infrastructure absent from the snapshot. Remove the bundled `.env` from anything you share and keep local credentials out of Git.

## API

Base URL for the example configuration is `http://localhost:3000/commonTest/user`. Send `Content-Type: application/json` for requests with a JSON body. Protected routes require the JWT in the **`access-token` header** and a role of `admin` or `super_admin`.

| Method | Path relative to the base URL | Input |
| --- | --- | --- |
| POST | `/register` | JSON `email` and `password`. The current service also accepts model fields such as `role` from the body. |
| POST | `/login` | JSON `email` and `password`. Read `data.result.accessToken` and `data.result.uuid` from the response. |
| GET | `/` | Optional `limit`, `offset`, `sortby`, `sort`, `email`, and `role`. Lists active users and returns a count in `meta.count`. |
| GET | `/:uuid` | UUID of an active user. |
| PUT | `/:uuid` | URL UUID and a JSON body with fields to update. A supplied password is hashed before saving. |
| DELETE | `/` | JSON containing a `uuid` filter. Bulk deletion needs the controller guard described below before using it as the interview starter. |

To try registration and login against a disposable local DB, register with `{"email":"admin@example.test","password":"Demo-password-123","role":"admin"}`, then log in with the same email and password. On the supplied snapshot, role assignment from the registration body is possible. Keep this snapshot local. For the rebuilt starter, create a demo admin through the opt-in seed command and keep public registration at the `member` role.

Try `GET /commonTest/user?limit=10&offset=0` with the returned `access-token`. To test password changes, use `PUT /commonTest/user/<uuid>` with `{"password":"New-demo-password-123"}`, then log in with the new password. `refreshToken` is returned on login. The snapshot has no refresh endpoint.

## Project structure

| Path | Responsibility |
| --- | --- |
| `index.js` | Environment, JSON and URL-encoded request parsing, Helmet, cookies, development CORS, rate limiting, routing, errors, and DB startup |
| `src/configs/` | Sequelize connection and constants including `ACTIVE=1` and `DELETE=0` |
| `src/routes/index.js` | Mounts the user router under `/user` |
| `src/controllers/user/` | Routes, controller functions, and transaction boundaries |
| `src/validator/user/` | Express Validator rules for registration and login |
| `src/middlewares/auth.js` | JWT verification and role authorization |
| `src/services/user/` | User operations, bcrypt, token issuance, SQL listing and detail, and updates |
| `src/models/postgresql/models/` | Sequelize `User` and `Log` models for the `users` and `logs` tables |
| `src/util/` | Async error forwarding, response helpers, and audit record creation |

Requests pass through Express middleware, the router and route checks, the controller, and the service. The service queries PostgreSQL through Sequelize and the controller formats the response. Registration creates the user and an INSERT audit record in a transaction. The current delete route changes matching active rows from status 1 to status 0 through the shared update service.

## Review findings

- **Bulk delete.** The controller destructures `req.body` directly and forwards user-supplied filters. If the body is missing, destructuring can fail. If the UUID filter is absent, the resulting active-status filter can match every active user. The rebuild requires a validated, nonempty `{"uuid":["...","..."]}` body and an explicit Sequelize `Op.in` condition.
- **List and validation.** Search references `username`, which the model lacks. Raw SQL interpolates filter and ordering identifiers from the request. Whitelist fields and sort directions. The registration/login rules currently register checks without consuming `validationResult`. The supplied page calculation also assumes a fixed limit.
- **Authentication and password handling.** Login currently looks up email without checking active status. Registration and update can return password hashes, and registration can write the hash to the audit log. Public registration accepts role input. Address these before exposing the API.
- **Errors.** Update and delete can send a failure and then continue to the success response. Some user service errors still mention unrelated form fields. The rebuild defines consistent error responses and termination paths.

## Start on an interview PC

Open a new project folder in Cursor or another coding agent with workspace and terminal access. Give it [requirement.md](./requirement.md) and say: **Implement and run the starter in this folder. Follow the setup and acceptance checks in the file.**

The agent can generate the project from that file or reuse a supplied checkout. It needs Node/npm, package access, and either Docker or a reachable development PostgreSQL instance. On a managed machine, follow the interviewer's rules for AI tools and installs.
