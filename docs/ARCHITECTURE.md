# Architecture

This document describes the project at a **system-design level**: the major building blocks, how they interact, and the key decisions/tradeoffs.

## System overview

At a high level this is a **single-page React application** that:

- renders an onboarding form
- validates inputs locally and (for some fields) via backend checks
- submits data to an API

The architecture is designed around a few explicit boundaries:

- **Presentation**: React components render UI and handle user events
- **Server-state**: TanStack Query manages async/cached data
- **Networking**: a shared HTTP client performs requests and normalizes errors
- **Runtime safety**: Zod validates untrusted inputs/outputs at runtime

## Component diagram (logical)

```text
┌─────────────────────────────────────────────────────────────┐
│ UI (React)                                                  │
│  - pages/*                                                  │
│  - components/ui/*                                          │
└───────────────┬─────────────────────────────────────────────┘
                │ uses
                ▼
┌─────────────────────────────────────────────────────────────┐
│ Server-state boundary (TanStack Query)                       │
│  - queries/*                                                 │
│  - query keys, caching, retries, mutations                   │
└───────────────┬─────────────────────────────────────────────┘
                │ calls
                ▼
┌─────────────────────────────────────────────────────────────┐
│ Endpoint methods                                             │
│  - api/methods/*                                             │
│  - one file per endpoint: request + response schema          │
└───────────────┬─────────────────────────────────────────────┘
                │ uses
                ▼
┌─────────────────────────────────────────────────────────────┐
│ Shared API client                                            │
│  - api/client.ts                                             │
│  - ky HTTP + Zod response parsing + typed error model        │
└───────────────┬─────────────────────────────────────────────┘
                │ HTTP
                ▼
         Backend API (external)
```

## Repo structure

```text
src/
  api/
    client.ts                # ky wrapper + typed error model + zod response validation
    methods/                 # one file per endpoint (request + response schema)
  queries/                   # tanstack query boundary (queryOptions/hooks)
  pages/                     # route/page-level UI (currently onboarding)
  components/ui/             # shared UI components (shadcn-style + radix primitives)
  test/                      # Vitest/MSW test setup and helpers
e2e/                         # Playwright tests
```

## Core flows

### 1) Read/validate data (server-backed validation)

Some fields are validated via the API (example: corporation number).

- **Why this exists**: local validation can enforce format, but only the backend can confirm validity/availability.
- **How it’s implemented**:
  - the UI requests validation via TanStack Query
  - results are cached by a stable query key to avoid repeated calls

### 2) Write data (submit)

Submitting the form is modeled as a mutation:

- **Why**: mutations provide consistent async state (loading/error/success) and a single place to implement retries or invalidations.
- **How**:
  - UI triggers a `useMutation(...)` hook
  - endpoint method performs the request
  - API client validates the response schema and throws a typed error on failure

## Key design decisions (and tradeoffs)

### Runtime validation with Zod

- **Benefit**: protects the UI from malformed/unknown backend responses (especially valuable in JS runtimes).
- **Tradeoff**: some upfront schema work per endpoint.

### Centralized API client + typed error model

- **Benefit**: consistent failure handling and a single place to evolve HTTP concerns (timeouts, headers, auth).
- **Tradeoff**: requires endpoint methods to follow the pattern (small learning curve).

### Query layer as the “server-state boundary”

- **Benefit**: UI code stays simple; caching and deduplication are standardized.
- **Tradeoff**: developers need to be disciplined about not calling the API client directly from UI.

## Configuration notes

### Environment variables

- **`VITE_API_BASE_URL`**: API base URL used by the shared client (`src/api/client.ts`).
  - Defaults to `http://localhost:3000` if not set.

### Path aliases

- `@` maps to `src` (configured in `vite.config.ts`) to keep imports stable and readable.

## Key dependencies (why they’re here)

### Build/runtime

- **React 19 (`react`, `react-dom`)**: UI rendering and component model.
- **TypeScript**: static typing across UI, network layer, and tests.
- **Vite**: fast dev server + build tooling; good defaults for React + TS.
- **Tailwind CSS v4** + **`@tailwindcss/vite`**: utility-first styling and fast iteration.

### UI primitives

- **Radix UI (`@radix-ui/*`)**: accessible primitives (labels, separators, slots).
- **shadcn-style components** (local `src/components/ui/*`) + **CVA/clsx/tailwind-merge**:
  - composable styling patterns for reusable components
  - deterministic class merging (`tailwind-merge`) and conditional classes (`clsx`)

### Forms + validation

- **react-hook-form**: performant form state management with controlled/uncontrolled inputs.
- **Zod v4**: schema-based validation used both for:
  - form input validation (client-side constraints)
  - API response validation (runtime safety)
- **`@hookform/resolvers`**: bridges Zod schemas into react-hook-form.

### Server state / async coordination

- **TanStack Query (`@tanstack/react-query`)**: caching, deduping, retries, async state.
  - In the onboarding page, async corporation-number validation uses `queryClient.fetchQuery(...)`
    with a stable query key, so repeated validation is cached/deduped.

### Networking

- **ky**: small, modern HTTP client with a clean API and good defaults.
  - Centralized in `src/api/client.ts` to enforce consistent error handling and response parsing.

### Testing

- **Vitest**: unit/integration test runner (fast, Vite-native).
- **Testing Library** + **user-event**: component tests aligned with user behavior.
- **MSW**: mocks HTTP at the network layer to test API code realistically.
- **Playwright**: end-to-end tests against the built app via `vite preview`.
