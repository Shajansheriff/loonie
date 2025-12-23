# Testing

This repo uses multiple complementary layers so we can balance **speed**, **confidence**, and **debuggability**.

- **Unit / integration (Vitest)**: fast feedback on logic and the API layer (with MSW).
- **Component tests (Vitest + Testing Library)**: verify UI behavior and accessibility at the DOM level.
- **E2E (Playwright)**: validate critical user flows in a real browser against the built app.

## Testing philosophy (intent)

We write tests to reduce risk, not to “maximize coverage”.

- **Catch regressions early**: most bugs should be caught by unit/component tests (fast).
- **Prove integrations**: use MSW-backed API tests to verify request/response handling realistically.
- **Protect critical flows**: use E2E sparingly for the highest-value journeys.
- **Prefer behavior over implementation**: tests should break when user-visible behavior breaks, not when refactors happen.

## Types of testing (what they mean here)

### Unit tests

**Intent**: verify a small piece of logic in isolation with minimal setup.

- **Benefits**: fastest, easiest to debug, high signal when they fail.
- **Tradeoffs**: can miss wiring issues between modules.
- **What to test**: pure functions, helpers, schema edge cases, formatting logic.

### Integration tests (in this repo: “API integration” with MSW)

**Intent**: verify multiple pieces work together (client → request → response parsing → errors) without a real backend.

- **Benefits**: realistic network behavior, exercises the shared API client and Zod parsing, still fast and deterministic.
- **Tradeoffs**: slightly more setup than pure unit tests.
- **Where**: API method tests in `src/api/methods/*.test.ts` using MSW `server.use(...)`.

### Component tests

**Intent**: verify a component/page behaves correctly from the user’s perspective (DOM, events, async UI states).

- **Benefits**: validates accessibility queries, form behavior, validation messages, button disabled states.
- **Tradeoffs**: can get slower/flakier if they rely on too many async layers; keep them focused.
- **Where**: colocated `*.test.tsx` (e.g. `src/pages/onboarding/page.test.tsx`).

### End-to-end (E2E) tests

**Intent**: verify the real app bundle works in a real browser (routing, rendering, assets, real event loop).

- **Benefits**: highest confidence that “a user can do the thing”.
- **Tradeoffs**: slowest and most brittle; failures can be harder to debug; keep the suite small.
- **Where**: `e2e/*.spec.ts` using Playwright.

## Running tests

### Unit + component tests (Vitest)

- Watch mode:

```bash
npm test
```

- CI mode (single run):

```bash
npm run test:run
```

### E2E tests (Playwright)

- Headless:

```bash
npm run test:e2e
```

- UI mode:

```bash
npm run test:e2e:ui
```

Notes:

- E2E runs `npm run build` first, then starts `vite preview` via Playwright `webServer`.
- The Playwright base URL is `http://localhost:4173` (see `playwright.config.ts`).

## Mocking strategy

### MSW for network-layer realism (Vitest)

Vitest tests boot an MSW server in `src/test/setup.ts`:

- `beforeAll`: `server.listen({ onUnhandledRequest: "error" })`
- `afterEach`: `server.resetHandlers()`
- `afterAll`: `server.close()`

Default request handlers live in `src/test/mocks/handlers.ts`. Individual tests can override behavior with:

- `server.use(http.get(...))`
- `server.use(http.post(...))`

This style is used heavily by the API method tests in `src/api/methods/*.test.ts`.

### Module mocking for UI tests (component isolation)

The onboarding page component tests (`src/pages/onboarding/page.test.tsx`) mock endpoint functions directly:

- `vi.mock("@/api/methods/validateCorporationNumber", ...)`
- `vi.mock("@/api/methods/createProfileDetails", ...)`

This keeps UI tests focused on validation, interaction, and submission behavior without exercising the network stack.

## How to choose the right test (thought process)

Use the cheapest test that gives the needed confidence:

- **Is it pure logic?**
  - Write a **unit test**.
- **Does it involve HTTP request/response handling, parsing, or error mapping?**
  - Write an **API integration test with MSW** (it exercises `src/api/client.ts` + the endpoint method).
- **Does it involve form validation, user interaction, and UI state (disabled/loading/errors)?**
  - Write a **component test** with Testing Library.
  - Mock API methods to keep the test focused on UI behavior.
- **Is it a critical happy-path flow that must work in production (smoke/regression)?**
  - Add/extend an **E2E test**.

Rule of thumb:

- **Many unit/component tests**, **some MSW integration tests**, **few E2E tests**.

## Conventions

### Where to put tests

- API method tests: `src/api/methods/<method>.test.ts`
- Page/component tests: colocated as `<file>.test.tsx`
- E2E tests: `e2e/*.spec.ts`

### Keep tests deterministic

- Prefer MSW overrides (`server.use(...)`) over hitting real APIs.
- Use stable query clients in tests (see `createTestQueryClient()` in the onboarding page tests).
- Avoid relying on timing; use `waitFor(...)` for async state changes.

### What to assert (practical guidance)

- **Prefer accessible queries**:
  - `getByRole`, `getByLabelText`, `getByText` (in that order, generally).
- **Assert user-visible outcomes**:
  - error text rendered, button disabled/enabled, input value sanitized, etc.
- **Avoid over-mocking internals**:
  - in UI tests, mock “the boundary” (API methods), not internal component functions.
  - in API tests, mock “the network” (MSW), not `api.get/post` internals.


