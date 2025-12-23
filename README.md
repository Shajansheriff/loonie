# Loonie

Small React app that renders a **registration form** and demonstrates:

- client-side validation with **Zod** + **react-hook-form**
- server-state validation via **TanStack Query**
- typed API layer using **ky** + Zod response parsing
- tests with **Vitest/Testing Library/MSW** and **Playwright**

## Quickstart

### Prerequisites

- Node.js (recommend latest LTS)
- npm

### Install

```bash
npm ci
```

### Run the app

```bash
npm run dev
```

Vite will print the local dev URL.

### Configure API base URL

The API client uses `VITE_API_BASE_URL` (defaults to `http://localhost:3000`).

- **Dev**: create `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

## Scripts

- **dev**: `npm run dev`
- **build**: `npm run build`
- **preview**: `npm run preview`
- **tests (watch)**: `npm test`
- **tests (CI)**: `npm run test:run`
- **e2e**: `npm run test:e2e`
- **lint**: `npm run lint`
- **format**: `npm run format`

## Docs

- Architecture: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- Dev onboarding: [`docs/ONBOARDING.md`](./docs/ONBOARDING.md)
- Testing: [`docs/TESTING.md`](./docs/TESTING.md)
