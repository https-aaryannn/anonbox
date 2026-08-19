# AnonBox - Public Multi-User Anonymous Confession Platform

AnonBox is a public, multi-tenant anonymous confession platform. Anyone can create an account and instantly
become the admin of their own confession page and dashboard. Submissions stay isolated per account, and
each account can generate a private, live API key to pull their latest confessions.

## Features

- **Public Interface**: Beautiful, dark-themed confession box with animations.
- **Multi-user accounts**: Create an account, log in, log out — no shared admin panel.
- **Per-user confession pages**: Each account owns a public page (`#/u/<uid>`) where others submit anonymous confessions.
- **Private dashboards**: Each user only sees, manages, archives, and deletes the confessions submitted to *their* page.
- **Live API**: `GET /api/confessions` authenticated with a per-account API key, returns the newest confessions with pagination.
- **API key management**: Generate, copy, regenerate, and revoke keys from the dashboard. Keys are stored as SHA-256 hashes only.
- **Data Export**: Export your confessions to CSV.
- **Responsive**: Mobile-first design using Tailwind CSS.

## Quick Start

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configure Firebase**:
    *   Copy `.env.example` to `.env` and fill in your Firebase web SDK config
        (see `README_FIREBASE.md` for creating the project).
    *   Deploy the security rules from `firestore.rules` to your Firestore
        (Rules tab in the console, or `firebase deploy --only firestore:rules`).

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Create an account** and use your dashboard.

> Note: Anonymous submission to a *specific account's* page no longer requires
> the visitor to be logged in — the page URL (containing the owner `uid`)
> scopes the write and Firestore rules enforce the `ownerUid` on create.

## Running the Live API (Vercel Serverless Functions)

The API runs as Vercel Serverless Functions in `api/confessions.ts` and `api/health.ts`.

### Local Development

You have two options:

**Option A — Vercel CLI (recommended, matches production):**
```bash
npm i -g vercel
vercel dev
```
This runs the SPA (via Vite) and the API functions together with the same routing as production.

**Option B — Local Express server (legacy, still works):**
```bash
# Requires serviceAccount.json in project root
node server/index.js
```
In this mode, `vite.config.ts` proxies `/api` to `localhost:3001`.

### Production Deployment (Vercel)

1. **Push to Git** (GitHub/GitLab/Bitbucket).
2. **Import project in Vercel**.
3. **Add Environment Variables** in Vercel Project Settings:
   - `FIREBASE_SERVICE_ACCOUNT_JSON` — paste the **entire service account JSON** as a single-line value
     (Project Settings → Service Accounts → Generate new private key → copy all content).
   - `CORS_ORIGIN` — (optional) your Vercel deployment URL, e.g. `https://your-app.vercel.app`
   - All `VITE_FIREBASE_*` variables from your `.env`.
4. **Deploy** — Vercel detects the `api/` folder and deploys the functions automatically.

### API Example

```text
GET /api/confessions?limit=10
Authorization: Bearer anbx_<your_api_key>
```

```json
{
  "confessions": [
    {
      "id": "123",
      "content": "I have a crush on someone here...",
      "created_at": "2026-08-19T14:30:00Z"
    }
  ],
  "count": 1
}
```

Query options: `?limit=` (1–50, default 10), `?offset=` (pagination),
`?archived=true|false` (filter). Non-existent/invalid keys get `401`.

## Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS.
- **Backend**: Vercel Serverless Functions (`api/confessions.ts`, `api/health.ts`) + Firebase Admin.
- **AI**: Removed (was Gemini for sentiment analysis).
- **Database**: Firestore.
  - `confessions/{id}` → `ownerUid` scopes each doc to the owning account.
  - `apiKeys/{id}` → ownerUID + SHA-256 `keyHash` (never raw).
  - Security rules enforce tenant isolation at the database level.

## Security

- **Tenant isolation**: Confessions are only readable/writable by their `ownerUid`
  (enforced by both Firestore rules and the API query).
- **API keys**: Stored hashed (SHA-256), shown once at generation, revocable/regenerable.
- **Rate limiting**: Basic per-instance in-memory limit; for stricter limits add Upstash Redis.
- **No cross-tenant leakage**: The API authenticates each request by key hash and
  queries only that owner's confessions.
- **Sanitization**: Inputs are rendered safely in React to prevent XSS.

## Deployment Summary

| Target | Command / Config |
|--------|------------------|
| **SPA (Vercel)** | Auto on git push; `vite build` → `dist/` |
| **API (Vercel)** | Auto via `api/*.ts`; requires `FIREBASE_SERVICE_ACCOUNT_JSON` env var |
| **Firestore Rules** | `firebase deploy --only firestore:rules` or Console |
| **Local Dev** | `vercel dev` (preferred) or `npm run dev` + `node server/index.js` |