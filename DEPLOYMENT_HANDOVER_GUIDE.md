this is ai generated
# Deployment and Handover Guide

Project: Uttarakhand Millet MIS / Millet Dashboard

Prepared from read-only repository analysis. No source code, migrations, or tests were changed while preparing this guide.

## 1. Project Overview

### What the project is

This project is a web-based Millet MIS dashboard for public programme information, production and procurement reporting, farmer registration, enrollment status lookup, and role-based officer access for admin, district, and block users.

The application is split into:

- `frontend/`: browser application.
- `backend/`: API service and database access layer.

### Frontend stack

- React application created with Create React App.
- React 19.
- React Router 7.
- Axios for API calls.
- Tailwind CSS for styling.
- Chart.js, React Chart.js 2, and Recharts for charts.
- AOS for page animation.
- Lucide React icons.

### Backend stack

- Python FastAPI application.
- Uvicorn and Gunicorn available for serving.
- SQLAlchemy ORM and SQL text queries.
- Psycopg2 PostgreSQL driver.
- Pydantic validation.
- PyJWT for signed JWT access tokens.
- Passlib with Argon2 password hashing.
- SlowAPI for request rate limiting.

### Database dependency

The backend requires PostgreSQL. The code is not database-agnostic:

- `DATABASE_URL` is required at import/startup time.
- SQLAlchemy uses a PostgreSQL connection string.
- `psycopg2-binary` is installed.
- Farmer records use PostgreSQL `ARRAY` columns.
- Routes use relational SQL queries and transactions.

Supabase is compatible because Supabase provides managed PostgreSQL.

### Current hosting assumptions

Current repository assumptions point to a separately hosted frontend and backend:

- Backend CORS allowlist currently includes:
  - `https://uttarakhand-millet-dashboard.onrender.com`
  - `http://localhost:3000`
  - `http://localhost:5173`
- Frontend defaults API calls to `http://localhost:8000` unless a React build-time API URL is configured.
- No `render.yaml`, `Procfile`, Dockerfile, Netlify config, or Vercel config is checked in for production deployment.
- A root `runtime.txt` pins Python to `python-3.11.9`.

## 2. System Requirements

### Node.js version

To be filled by deployment team.

No Node.js version is pinned in `frontend/package.json`, and no `.nvmrc` or `.node-version` file was found. Use a current Node.js LTS release compatible with Create React App 5. The frontend lockfile is npm lockfile version 3, so use a modern npm version and prefer `npm ci` in deployment.

### Python version

Detected in `runtime.txt`:

```text
python-3.11.9
```

Use Python 3.11.x for the backend unless the deployment team validates a newer runtime with all dependencies.

### PostgreSQL requirement

Required. PostgreSQL version is to be filled by deployment team. Use a supported managed PostgreSQL version. The code enforces SSL mode with:

```text
sslmode=require
```

This means the database endpoint must support SSL. Local self-hosted PostgreSQL without SSL may fail unless SSL is enabled or the code is changed.

### Supabase compatibility

Supabase is compatible as the database provider because it is PostgreSQL. The app does not require Supabase Auth, Supabase Storage, Supabase client libraries, anon keys, or service role keys. It only needs a PostgreSQL connection string.

### Required environment variables

Backend required:

```env
DATABASE_URL=to be filled by deployment team
SECRET_KEY=to be filled by deployment team
```

Backend optional:

```env
ACCESS_TOKEN_EXPIRE_MINUTES=60
SEED_ADMIN_PASSWORD=to be filled by deployment team
SEED_DISTRICT_PASSWORD=to be filled by deployment team
SEED_BLOCK_PASSWORD=to be filled by deployment team
SEED_FARMER_PASSWORD=to be filled by deployment team
```

Frontend build-time variables:

```env
REACT_APP_API_URL=to be filled by deployment team
REACT_APP_API_BASE_URL=to be filled by deployment team
```

Use either `REACT_APP_API_URL` or `REACT_APP_API_BASE_URL`. The frontend checks `REACT_APP_API_URL` first, then `REACT_APP_API_BASE_URL`, then defaults to `http://localhost:8000`.

Notes:

- `backend/.env.example` includes `CORS_ORIGINS`, but the current backend code does not read it. CORS origins are hardcoded in `backend/app/main.py`.
- `backend/.env.example` includes individual `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`, but the active backend app requires `DATABASE_URL`.
- `backend/add_users.py` uses the individual DB variables, but it is a legacy helper and should not be the primary setup path for the current schema.

### Required ports and services

Local development:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- PostgreSQL: usually `localhost:5432`, or a hosted PostgreSQL endpoint

Production:

- Frontend: HTTPS static hosting on port 443.
- Backend: HTTPS API domain exposed by the hosting provider.
- Backend process must bind to `0.0.0.0:$PORT` on platforms such as Render.
- PostgreSQL must be reachable from the backend service.

External browser-loaded assets include Google Fonts, public image URLs, and public scheme document URLs referenced by the frontend. These should be reviewed if deploying in a restricted network.

## 3. Database Setup

### Whether the project requires PostgreSQL

Yes. PostgreSQL is required. SQLite, MySQL, MongoDB, DynamoDB, and other NoSQL databases are not drop-in replacements.

### Supabase setup steps

1. Create a Supabase project.
2. Open Supabase database settings and copy the PostgreSQL connection string.
3. Use a server-side connection string only. Do not put database credentials in the frontend.
4. Set backend `DATABASE_URL` to the Supabase PostgreSQL URI.
5. Confirm the connection string uses SSL or works with `sslmode=require`.
6. Set backend `SECRET_KEY`.
7. From the `backend/` directory, run the schema setup command:

```bash
python init_db.py
```

8. Seed controlled admin/officer accounts:

```bash
python setup_auth.py
```

9. Verify that the backend starts and `GET /health` returns `{"status":"ok"}`.

Important Supabase note:

- Do not expose Supabase service role keys in React environment variables.
- This app does not need Supabase service role keys for normal operation.
- If service role keys are used for separate administrative scripts, store them only in protected backend or CI secret stores.

### Alternative PostgreSQL setup options

#### Self-hosted PostgreSQL

Use when the organization manages its own database server.

Requirements:

- PostgreSQL reachable by the backend.
- SSL enabled, because the current backend always requests `sslmode=require`.
- Database user with permission to create tables during initial setup.
- Production backups and restore procedures owned by the deployment team.

Deployment value:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<database>
```

#### AWS RDS PostgreSQL

Use Amazon RDS for managed PostgreSQL.

Steps:

1. Create an RDS PostgreSQL instance.
2. Enable public access only if required; otherwise keep it private and deploy backend in a network that can reach it.
3. Configure security groups to allow backend outbound/inbound database traffic.
4. Use the RDS endpoint in `DATABASE_URL`.
5. Keep SSL enabled and verify the connection works with `sslmode=require`.
6. Configure automated backups, retention, snapshots, and monitoring.

#### Azure Database for PostgreSQL

Use Azure Database for PostgreSQL Flexible Server.

Steps:

1. Create a PostgreSQL Flexible Server.
2. Configure firewall or private networking so the backend can connect.
3. Create the application database and user.
4. Use the Azure PostgreSQL host in `DATABASE_URL`.
5. Keep SSL enabled.
6. Configure backups, retention, alerts, and monitoring.

#### Render PostgreSQL

Use Render PostgreSQL when hosting the backend on Render and a simple managed database is preferred.

Steps:

1. Create a Render PostgreSQL database.
2. Use the external or internal connection string as appropriate for the backend service.
3. Set backend `DATABASE_URL` from the Render database connection string.
4. Run schema and seed commands from a secure one-off environment or trusted local machine with production env vars.
5. Use a paid PostgreSQL plan for production.

Render provider note:

- Render's official free-tier documentation says free web services spin down after 15 minutes without inbound traffic, and free Render PostgreSQL databases expire after 30 days and do not include backups. Verify current limits before choosing a plan: https://render.com/docs/free

### Required schema and setup scripts

The repo does not contain Alembic migrations or a SQL schema dump. The detected setup scripts are:

- `backend/init_db.py`: creates SQLAlchemy-managed tables.
- `backend/setup_auth.py`: creates the current `users` table shape and inserts representative admin, district, block, and farmer users.
- `backend/add_users.py`: legacy seeding helper for an older users schema. Do not use this for a fresh current deployment unless the schema is confirmed to match.

Detected tables from active models and routes:

- `users`
- `farmers`
- `land_parcels`
- `production`
- `procurement`

The backend also runs `Base.metadata.create_all(bind=engine)` at startup. This can create missing tables, but it is not a migration system and will not safely alter existing tables after schema changes.

Recommended production practice:

1. Run setup against a staging database first.
2. Export and review the resulting SQL schema.
3. Store an approved schema dump or migration baseline for the receiving organization.
4. Do not rely on startup table creation as the long-term production migration process.

### Seed and admin user setup

Use `backend/setup_auth.py` for the current auth schema.

Before running it, set explicit seed passwords:

```env
SEED_ADMIN_PASSWORD=to be filled by deployment team
SEED_DISTRICT_PASSWORD=to be filled by deployment team
SEED_BLOCK_PASSWORD=to be filled by deployment team
SEED_FARMER_PASSWORD=to be filled by deployment team
```

If these variables are not set, the script generates temporary passwords for the run. That is not suitable for handover because credentials can be lost.

Default seeded usernames include:

- `admin_uttarakhand`
- `district_nainital`
- `district_almora`
- `block_nainital_city`
- `farmer_uttarakhand`

Admin credentials must be transferred out of band, rotated after handover, and never committed.

### What will not work without code rewrite

The following databases are unsupported without a backend rewrite:

- MongoDB
- DynamoDB
- Firebase/Firestore
- Cassandra
- Redis as primary database
- Other NoSQL document, key-value, graph, or wide-column stores

Reason:

- The app uses SQLAlchemy relational models.
- The app uses raw SQL queries.
- The app requires relational tables.
- The app uses PostgreSQL-specific `ARRAY` type.
- Auth, role checks, farmer lookup, reporting, and seeding scripts all assume SQL tables.

## 4. Backend Deployment

### Local backend setup

From the repository root:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Create a local `backend/.env` file:

```env
DATABASE_URL=to be filled by deployment team
SECRET_KEY=to be filled by deployment team
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Initialize tables:

```bash
python init_db.py
```

Seed users:

```bash
python setup_auth.py
```

Run the API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check:

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{"status":"ok"}
```

Local auth note:

- The backend sets the auth cookie with `Secure` and `SameSite=None`.
- Production must use HTTPS.
- Local HTTP browser testing of login cookies can vary by browser policy. If sessions do not persist locally, test through HTTPS or a local HTTPS proxy.

### Production backend setup

Recommended production server command:

```bash
gunicorn app.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
```

Required:

- Python 3.11.x.
- Install dependencies from `backend/requirements.txt`.
- Set backend environment variables in the hosting platform.
- Ensure backend service can reach PostgreSQL.
- Ensure frontend origin is in backend CORS allowlist.
- Ensure HTTPS is enabled.

### Render deployment steps

This repository has no `render.yaml`, so deployment is currently a dashboard/manual setup unless the deployment team adds infrastructure-as-code later.

Backend Render Web Service:

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. In Render, create a new Web Service from the repo.
3. Set root directory to:

```text
backend
```

4. Set runtime to Python.
5. Set build command:

```bash
pip install -r requirements.txt
```

6. Set start command:

```bash
gunicorn app.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
```

7. Set environment variables:

```env
DATABASE_URL=to be filled by deployment team
SECRET_KEY=to be filled by deployment team
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

8. Set Python version to `3.11.9` in Render settings if Render does not pick up the root `runtime.txt`.
9. Deploy.
10. Verify:

```text
https://<backend-service>.onrender.com/health
```

11. Run database setup and seeding from a secure environment with production env vars.

Render notes:

- Render web services must bind to `0.0.0.0:$PORT`.
- Free web services can sleep after idle periods and cause cold starts. For production, use a paid instance.
- If a free tier is used for demo or staging, expect delayed first requests after idle. Mitigations include upgrading to a paid plan or using an external uptime monitor for non-production environments.
- Do not use Render free PostgreSQL for production because of expiry and backup limitations noted in Render's official docs.

### Backend environment variables needed

```env
DATABASE_URL=to be filled by deployment team
SECRET_KEY=to be filled by deployment team
ACCESS_TOKEN_EXPIRE_MINUTES=60
SEED_ADMIN_PASSWORD=to be filled by deployment team
SEED_DISTRICT_PASSWORD=to be filled by deployment team
SEED_BLOCK_PASSWORD=to be filled by deployment team
SEED_FARMER_PASSWORD=to be filled by deployment team
```

Only `DATABASE_URL` and `SECRET_KEY` are required for normal runtime. Seed variables are needed for controlled account setup.

### CORS configuration

Current CORS configuration is hardcoded in `backend/app/main.py`.

Allowed origins currently include:

```text
https://uttarakhand-millet-dashboard.onrender.com
http://localhost:3000
http://localhost:5173
```

Production requirement:

- Add the final frontend HTTPS origin to the CORS allowlist before production launch.
- Keep CORS explicit. Do not use `*` with credentials.
- Because `allow_credentials=True` is enabled, the browser requires an exact origin match.

Important limitation:

- `CORS_ORIGINS` exists in `backend/.env.example`, but the app currently does not read it. Changing CORS through environment variables requires a code change.

### Cookie, JWT, and session notes

Authentication behavior:

- Login endpoint: `POST /auth/login`.
- Current user endpoint: `GET /auth/me`.
- Logout endpoint: `POST /auth/logout`.
- JWT is signed with `SECRET_KEY` using HS256.
- JWT expiry defaults to 60 minutes unless `ACCESS_TOKEN_EXPIRE_MINUTES` is set.
- Token is stored in an HttpOnly cookie named `access_token`.
- Cookie settings:
  - `HttpOnly`
  - `Secure`
  - `SameSite=None`
  - `Path=/`

There is no server-side session table. Session validity depends on the JWT and the user still existing and being active in the database.

### Health endpoint usage

Use the following endpoints for health checks:

- `GET /health`: returns `{"status":"ok"}`.
- `GET /`: returns `{"message":"Millet Dashboard API Running"}`.

Recommended load balancer or uptime check path:

```text
/health
```

### Logging and security recommendations

- Use hosting platform logs for startup, runtime exceptions, and health checks.
- Do not log request bodies containing farmer PII, bank details, passwords, JWTs, or database URLs.
- Add structured logging before production if central observability is required.
- Use error monitoring appropriate for the organization.
- Keep `SECRET_KEY` high entropy and rotate it during handover.
- Use least-privilege database credentials.
- Enable database backups and test restore.
- Restrict database network access to backend infrastructure.
- Review rate limits before production traffic. Current rate limiting is in process and per IP; it is not a distributed rate limit across multiple backend instances.

## 5. Frontend Deployment

### Local frontend setup

From the repository root:

```bash
cd frontend
npm ci
```

Create `frontend/.env` for local development if the backend is not on the default URL:

```env
REACT_APP_API_URL=http://localhost:8000
```

Run the frontend:

```bash
npm start
```

Default local URL:

```text
http://localhost:3000
```

### Production build

From `frontend/`:

```bash
npm ci
npm run build
```

Output directory:

```text
frontend/build
```

React environment variables are compiled at build time. If `REACT_APP_API_URL` changes, rebuild and redeploy the frontend.

### Render deployment option

Use a Render Static Site.

1. Create a new Static Site from the repo.
2. Set root directory:

```text
frontend
```

3. Set build command:

```bash
npm ci && npm run build
```

4. Set publish directory:

```text
build
```

5. Set environment variable:

```env
REACT_APP_API_URL=https://<backend-api-domain>
```

6. Deploy.
7. Verify public routes load.
8. Verify login after backend CORS includes the frontend domain.

### Netlify deployment option

1. Create a Netlify site from the repo.
2. Set base directory:

```text
frontend
```

3. Set build command:

```bash
npm ci && npm run build
```

4. Set publish directory:

```text
frontend/build
```

5. Set environment variable:

```env
REACT_APP_API_URL=https://<backend-api-domain>
```

6. Configure SPA fallback to `index.html` for React Router routes.
7. Deploy and test direct navigation to routes such as `/login`, `/dashboard`, and `/procurement`.

### Vercel deployment option

1. Import the repo in Vercel.
2. Set root directory:

```text
frontend
```

3. Use framework preset: Create React App.
4. Build command:

```bash
npm run build
```

5. Output directory:

```text
build
```

6. Set environment variable:

```env
REACT_APP_API_URL=https://<backend-api-domain>
```

7. Deploy and test React Router routes.

### Frontend environment variables needed

Use one of:

```env
REACT_APP_API_URL=https://<backend-api-domain>
```

or:

```env
REACT_APP_API_BASE_URL=https://<backend-api-domain>
```

Preferred:

```env
REACT_APP_API_URL=https://<backend-api-domain>
```

### How frontend connects to backend

The frontend uses Axios from `frontend/src/services/api.js`.

Behavior:

- Base URL comes from `REACT_APP_API_URL`, then `REACT_APP_API_BASE_URL`, then `http://localhost:8000`.
- Trailing slashes are removed from the API base URL.
- `withCredentials: true` is enabled, so browser requests include the backend auth cookie.

This means:

- Backend CORS must allow the exact frontend origin.
- Backend must allow credentials.
- Backend and frontend should both use HTTPS in production.
- Login cookies are set by the backend API domain and sent on later API requests.

## 6. Domain Setup

### Buying or using a custom domain

The receiving organization can use:

- An existing domain.
- A new domain purchased from a registrar.
- Provider-generated subdomains for staging.

Recommended production pattern:

```text
app.example.org     -> frontend
api.example.org     -> backend API
```

### DNS records needed

Exact DNS records depend on the hosting provider.

Common patterns:

- Frontend static host: `CNAME app.example.org` to provider target.
- Backend API host: `CNAME api.example.org` to provider target.
- Apex/root domain: provider-specific `A`, `AAAA`, `ALIAS`, or `ANAME` record.

To be filled by deployment team:

```text
Frontend DNS record: to be filled by deployment team
Backend DNS record: to be filled by deployment team
Registrar/DNS provider: to be filled by deployment team
```

### Frontend domain setup

1. Add the custom frontend domain in the static hosting provider.
2. Configure DNS as instructed by the provider.
3. Wait for DNS propagation.
4. Ensure HTTPS certificate is active.
5. Set frontend build variable:

```env
REACT_APP_API_URL=https://api.example.org
```

6. Rebuild and redeploy the frontend.

### Backend API domain setup

1. Add the custom API domain in the backend hosting provider.
2. Configure DNS as instructed by the provider.
3. Wait for DNS propagation.
4. Ensure HTTPS certificate is active.
5. Verify:

```text
https://api.example.org/health
```

### HTTPS requirement

HTTPS is required for production because the backend auth cookie is set with `Secure` and `SameSite=None`.

Do not deploy production authentication over plain HTTP.

### CORS update after domain change

After choosing the final frontend domain, update backend CORS allowlist to include it exactly, for example:

```text
https://app.example.org
```

Then redeploy the backend.

Current limitation:

- CORS is hardcoded in source, not driven by `CORS_ORIGINS`.
- The deployment team must either update the source allowlist or implement environment-driven CORS before final production handover.

## 7. Authentication and Roles

### Login flow

1. User opens `/login`.
2. User submits username and password.
3. Frontend calls `POST /auth/login`.
4. Backend validates credentials against the `users` table.
5. Backend signs a JWT and sets it in the HttpOnly `access_token` cookie.
6. Frontend redirects based on role:
   - `admin` -> `/admin`
   - `district` -> `/district`
   - `block` -> `/block`
   - default/farmer -> `/procurement`
7. On page load, frontend calls `GET /auth/me` to hydrate session state from the cookie.

### Admin, district, and block behavior

Detected roles:

- `admin`
- `district`
- `block`
- `farmer`

Role behavior:

- Admin users can access admin routes and broad user lists.
- District users require a `district` assignment and are scoped to their district.
- Block users require `district` and `block` assignments and are scoped to their block.
- Public registration creates only farmer accounts.
- Public users cannot self-register as admin, district, or block users.

### JWT, cookie, and session handling

- JWT claim uses `sub` for username.
- JWT secret comes from `SECRET_KEY`.
- JWT expiration defaults to 60 minutes.
- Cookie name is `access_token`.
- Cookie is HttpOnly, Secure, and SameSite=None.
- Frontend does not store the token in local storage. It clears legacy local storage auth keys.

### Admin seed/setup requirement

A fresh database needs at least one admin account. Use:

```bash
cd backend
python setup_auth.py
```

Set `SEED_ADMIN_PASSWORD` first. Rotate the admin password after handover.

## 8. Deployment Flow

Fresh deployment checklist:

1. Clone repo.

```bash
git clone <repo-url>
cd <repo-directory>
```

2. Create database.

Create PostgreSQL through Supabase, self-hosted PostgreSQL, AWS RDS, Azure PostgreSQL, Render PostgreSQL, or another managed PostgreSQL provider.

3. Apply schema.

```bash
cd backend
python init_db.py
```

4. Seed admin users.

Set seed password variables, then run:

```bash
python setup_auth.py
```

5. Configure backend env.

```env
DATABASE_URL=to be filled by deployment team
SECRET_KEY=to be filled by deployment team
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

6. Deploy backend.

Use a Python web service with:

```bash
pip install -r requirements.txt
gunicorn app.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
```

7. Configure frontend env.

```env
REACT_APP_API_URL=https://<backend-api-domain>
```

8. Deploy frontend.

Use a static host with:

```bash
npm ci && npm run build
```

Publish:

```text
frontend/build
```

9. Configure domain.

Point frontend and backend custom domains to their hosting providers, enable HTTPS, and update backend CORS for the final frontend origin.

10. Test login and major flows.

Minimum smoke test:

- `GET /health` returns OK.
- Frontend home/about page loads.
- `/login` loads.
- Admin login succeeds.
- District login succeeds and redirects to `/district`.
- Block login succeeds and redirects to `/block`.
- `/procurement` loads and calls backend.
- `/dashboard` loads production KPI calls.
- Farmer registration submits to `/farmers/register`.
- Enrollment status lookup calls `/farmers/status/{mobile}`.
- Logout clears session.

## 9. Security Checklist

- Never commit `.env` files.
- Never commit database URLs, passwords, JWT secrets, service role keys, or seed credentials.
- Rotate `SECRET_KEY` during handover and after any suspected exposure.
- Use HTTPS only in production.
- Keep CORS origins explicit and narrow.
- Do not use wildcard CORS with credentials.
- Use Secure, HttpOnly cookies in production.
- Protect database credentials in hosting secret stores.
- Use least-privilege database users.
- Restrict database network access where possible.
- Do not expose Supabase service role keys to the frontend.
- Do not use Supabase anon or service keys unless a future code change requires them.
- Configure automated database backups.
- Test database restore.
- Rotate seeded admin passwords after setup.
- Transfer admin credentials out of band.
- Review logs for accidental PII exposure.
- Add monitoring and alerting for backend errors and database failures.
- Use paid production-grade hosting plans for production workloads.

## 10. Handover Checklist

### Files and access the receiving organization needs

- Source repository URL.
- Deployment branch or release tag.
- Backend deployment service access.
- Frontend deployment service access.
- PostgreSQL provider access.
- DNS provider access.
- Final frontend domain.
- Final backend API domain.
- Approved production environment variable values.
- Database backup and restore instructions.
- Admin credential transfer record.
- Contact owner for future schema changes.

### Environment variables template

Backend:

```env
DATABASE_URL=to be filled by deployment team
SECRET_KEY=to be filled by deployment team
ACCESS_TOKEN_EXPIRE_MINUTES=60
SEED_ADMIN_PASSWORD=to be filled by deployment team
SEED_DISTRICT_PASSWORD=to be filled by deployment team
SEED_BLOCK_PASSWORD=to be filled by deployment team
SEED_FARMER_PASSWORD=to be filled by deployment team
```

Frontend:

```env
REACT_APP_API_URL=to be filled by deployment team
```

Optional frontend fallback:

```env
REACT_APP_API_BASE_URL=to be filled by deployment team
```

### Database schema file requirement

No migration directory or formal SQL schema file was found in the repository.

For organizational handover, the deployment team should produce and store one of the following after schema review:

- A SQL schema dump from the initialized PostgreSQL database.
- An approved migration baseline created by the receiving organization.
- A documented database setup runbook using `backend/init_db.py` and `backend/setup_auth.py`.

Recommended:

- Treat `backend/init_db.py` as bootstrap only.
- Introduce formal migrations before long-term multi-environment operation.

### Admin credentials handling

- Set seed passwords before running `setup_auth.py`.
- Store initial admin credentials in the organization's password manager.
- Share credentials only through approved secure channels.
- Rotate initial passwords immediately after handover.
- Disable or rename demo users if they are not needed in production.

### Post-deployment verification checklist

- Backend `/health` returns 200.
- Backend logs show successful database connection.
- Tables exist in PostgreSQL.
- Admin user exists and can log in.
- Frontend uses the production API URL.
- Browser network calls go to the production backend.
- CORS does not block authenticated requests.
- Auth cookie is set with Secure, HttpOnly, and SameSite=None.
- Login persists across page refresh.
- Logout clears the session.
- Public farmer registration works.
- Enrollment status lookup works.
- Production dashboard API calls work.
- Procurement dashboard API calls work.
- DNS and HTTPS are active for both frontend and backend.
- Database backup job is enabled.
- Error logs contain no secrets or PII.

## 11. Limitations and Assumptions

### PostgreSQL required

PostgreSQL is required. The current backend is not compatible with NoSQL databases without a rewrite.

### NoSQL unsupported without rewrite

MongoDB, DynamoDB, and other NoSQL databases will not work as replacements for PostgreSQL. Replacing PostgreSQL would require rewriting:

- SQLAlchemy models.
- Raw SQL queries.
- Auth lookups.
- Farmer registration transactions.
- Dashboard reporting queries.
- Setup and seed scripts.

### Placeholder flows found

The following placeholder or incomplete flows were found:

- OTP login UI exists, but frontend API functions reject because backend OTP endpoints are not implemented.
- Forgot password modal is a frontend placeholder; no backend password reset endpoint is connected.
- Admin, district, and block dashboard pages render role-specific placeholder feature lists rather than full management workflows.
- Login notifications are static placeholder messages.
- Farmer registration accepts consent, but backend has a TODO noting consent fields are not persisted until database columns/migrations are added.

### Hardcoded or demo data found

- Backend CORS origins are hardcoded in `backend/app/main.py`.
- Frontend overview dashboard includes page-local placeholder/fallback data in `frontend/src/pages/overviewDashboardData.js`.
- Production dashboard displays a notice and uses page-local fallback data where needed when live production APIs are unavailable.
- Procurement regional chart helper initializes regional values with built-in baseline numbers before adding live rows.
- Seed scripts create representative users such as `admin_uttarakhand`, `district_nainital`, and `block_nainital_city`.
- Public content references external document and image URLs.

### Known deployment risks

- No formal migration system is present.
- Startup `create_all` can create missing tables but will not manage schema evolution.
- CORS cannot currently be changed through environment variables.
- Secure cookies require HTTPS; local HTTP auth testing may be unreliable.
- Cross-domain cookie auth requires exact CORS origin and credentials support.
- Free hosting tiers can sleep and cause cold starts.
- Render free PostgreSQL is not suitable for production because of expiry and backup limitations.
- `DATABASE_URL` and `SECRET_KEY` are required at backend import time, so missing env vars can prevent service startup.
- PostgreSQL SSL is required by the current database engine configuration.
- Production and procurement dashboards require database rows; no production data import script was found.
- Rate limiting is process-local and may not be sufficient for scaled production deployments.

## Appendix: Key Commands

Backend local:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python init_db.py
python setup_auth.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend production start:

```bash
gunicorn app.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
```

Frontend local:

```bash
cd frontend
npm ci
npm start
```

Frontend production build:

```bash
cd frontend
npm ci
npm run build
```

