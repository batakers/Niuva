# Production deployment

Deploy frontend and backend as separate services. The frontend is a React SPA; its host must return `index.html` for unknown application routes such as `/about` and `/orders/:id`. Do not rewrite `/api/*` to the SPA.

## 1. Configure secrets

Copy the examples to environment variables in the deployment provider; do not commit `.env` files.

- Frontend: `REACT_APP_PUBLIC_SITE_URL`, `REACT_APP_BACKEND_URL`, and `GENERATE_SOURCEMAP=false`.
- Backend: all values in `backend/.env.example`, especially a strong `JWT_SECRET`, MongoDB connection, exact `CORS_ORIGINS`, admin credentials, Resend sender/key, and `EMERGENT_LLM_KEY`.

`CORS_ORIGINS` must be the exact public frontend origin, for example `https://www.niuva.co.id`. Wildcards are rejected.

## 2. Build commands

Frontend:

```sh
cd frontend
npm ci
npm run build
```

Deploy the `frontend/build` directory to a static host, with SPA fallback enabled.

Backend:

```sh
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8000
```

Alternatively build each supplied Dockerfile. The backend is exposed on port 8000 and the frontend container on port 80.

When using the frontend Dockerfile, pass the public values at build time because Create React App embeds them into the static bundle:

```sh
docker build frontend \
  --build-arg REACT_APP_PUBLIC_SITE_URL=https://www.example.com \
  --build-arg REACT_APP_BACKEND_URL=https://api.example.com \
  -t niuva-frontend
```

## 3. Release checks

- Confirm frontend requests target the production API, never localhost.
- Verify direct page load/refresh for public, dashboard, and admin routes.
- Verify `GET /api/`, admin login, contact form, database writes, and an authenticated file download.
- Confirm TLS is enabled, `CORS_ORIGINS` is exact, MongoDB is persistent, and all secrets exist only in the provider's secret store.
- Test the contact and internship rate limits from staging, not production.
