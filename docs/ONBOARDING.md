# Dev onboarding

This guide is intentionally practical: where to start reading, how to run the app, and where to make common changes.

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

### Configure API base URL

The API client uses `VITE_API_BASE_URL` (defaults to `http://localhost:3000`).

Create `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

## Project tour (where to start)

- **App entry**: `src/main.tsx` (React root + QueryClientProvider)
- **App shell**: `src/App.tsx` (what page renders)
- **Main page**: `src/pages/onboarding/page.tsx`
- **Server-state layer**: `src/queries/*`
- **API endpoint methods**: `src/api/methods/*`
- **Shared HTTP client**: `src/api/client.ts`
- **UI primitives**: `src/components/ui/*`

If you want the system-level view, read [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Common workflows

### Add a new page

- Create a new page in `src/pages/<name>/page.tsx`
- Render it from `src/App.tsx` (or add routing later if/when needed)

### Add a new API endpoint

Recommended pattern:

1. **Create an endpoint method** in `src/api/methods/<method>.ts`
   - define a Zod schema for the response
   - call `api.get/post/...` with that schema
2. **Expose it via the query layer** in `src/queries/`
   - reads: `queryOptions(...)`
   - writes: `useMutation(...)`
3. **Use the query/hook from the UI**
   - avoid calling `api` directly from page/components unless there’s a strong reason

### Change global HTTP behavior

Edit `src/api/client.ts`:

- `VITE_API_BASE_URL` / base URL logic
- timeouts
- error mapping (`HttpError`, `NetworkError`, `ValidationError`, `UnknownError`)

### Update UI components

Shared UI primitives are in `src/components/ui/*` (shadcn-style + Radix primitives).

## Testing (what to run)

See [`TESTING.md`](./TESTING.md) for the full testing philosophy and strategy.

- Unit/component tests:

```bash
npm test
```

- E2E tests:

```bash
npm run test:e2e
```

## Quality checks

- Lint:

```bash
npm run lint
```

- Format:

```bash
npm run format
```
