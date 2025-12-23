# Submission Checklist

This document maps the take-home task requirements to the implementation.

**Live demo**: [loonie.shajahan.me](https://loonie.shajahan.me)

---

## Technical Requirements

| Requirement          | Status | Implementation                                            |
| -------------------- | ------ | --------------------------------------------------------- |
| Git repository       | ✅     | GitHub                                                    |
| TypeScript           | ✅     | Strict mode, type-checked ESLint                          |
| React with hooks     | ✅     | `useForm`, `useQueryClient`, custom hooks                 |
| Vite or Next.js      | ✅     | Vite                                                      |
| ESLint configuration | ✅     | `eslint.config.js` with strict type-checking              |
| External libraries   | ✅     | Zod, React Hook Form, TanStack Query, Tailwind, shadcn/ui |
| Integration tests    | ✅     | React Testing Library + Vitest                            |
| Standard patterns    | ✅     | See [ARCHITECTURE.md](./ARCHITECTURE.md)                  |

---

## Form Fields

| Field              | Validation Rules                                                        | Status |
| ------------------ | ----------------------------------------------------------------------- | ------ |
| First Name         | Required, max 50 characters                                             | ✅     |
| Last Name          | Required, max 50 characters                                             | ✅     |
| Phone Number       | Required, Canadian format (`+1XXXXXXXXXX`), no special chars except `+` | ✅     |
| Corporation Number | Required, exactly 9 digits, async API validation                        | ✅     |

---

## Behavior Requirements

| Requirement                               | Status | Where                                                 |
| ----------------------------------------- | ------ | ----------------------------------------------------- |
| Validate on blur                          | ✅     | `mode: "onBlur"` in `useForm` config                  |
| Corporation number async validation (GET) | ✅     | `src/api/methods/validateCorporationNumber.ts`        |
| Error messages under fields               | ✅     | `<FieldError>` component                              |
| Submit validates all fields               | ✅     | Zod schema + React Hook Form                          |
| POST on successful submit                 | ✅     | `src/api/methods/createProfileDetails.ts`             |
| Handle 400 errors from API                | ✅     | `HttpError` extracted and displayed via `<FormError>` |
| Display backend error messages            | ✅     | `setError("root")` + `<FormError>` component          |

---

## Test Coverage

| Scenario                                      | Status | File                                                                |
| --------------------------------------------- | ------ | ------------------------------------------------------------------- |
| All fields render                             | ✅     | `page.test.tsx`                                                     |
| Required field validation                     | ✅     | `page.test.tsx`                                                     |
| Max length validation (50 chars)              | ✅     | `page.test.tsx`                                                     |
| Phone format validation                       | ✅     | `page.test.tsx`                                                     |
| Corporation number format (9 digits)          | ✅     | `page.test.tsx`                                                     |
| Corporation number async validation (valid)   | ✅     | `page.test.tsx`                                                     |
| Corporation number async validation (invalid) | ✅     | `page.test.tsx`                                                     |
| Corporation number API error handling         | ✅     | `page.test.tsx`                                                     |
| No duplicate API calls (query caching)        | ✅     | `page.test.tsx`                                                     |
| Form submission with valid data               | ✅     | `page.test.tsx`                                                     |
| Submit button disabled during submission      | ✅     | `page.test.tsx`                                                     |
| Backend 400 error displayed in form           | ✅     | `page.test.tsx`                                                     |
| Generic error for unexpected failures         | ✅     | `page.test.tsx`                                                     |
| Error cleared on resubmit                     | ✅     | `page.test.tsx`                                                     |
| API method unit tests                         | ✅     | `validateCorporationNumber.test.ts`, `createProfileDetails.test.ts` |
| E2E: Form rendering and validation            | ✅     | `e2e/onboarding.spec.ts`                                            |
| E2E: Backend 400 error display                | ✅     | `e2e/onboarding.spec.ts`                                            |
| E2E: Successful form submission               | ✅     | `e2e/onboarding.spec.ts`                                            |
| E2E: Async validation indicator               | ✅     | `e2e/onboarding.spec.ts`                                            |

---

## Extras (Beyond Requirements)

| Feature                         | Why                                        |
| ------------------------------- | ------------------------------------------ |
| **E2E tests (Playwright)**      | Production-ready confidence                |
| **Lighthouse CI audits**        | Performance, accessibility, SEO checks     |
| **GitHub Actions CI/CD**        | Automated lint, test, e2e, deploy          |
| **GitHub Pages deployment**     | Live demo for reviewers                    |
| **MSW for API mocking**         | Realistic network layer testing            |
| **Query caching**               | Prevents duplicate validation API calls    |
| **Accessible form**             | ARIA attributes, labels, landmarks         |
| **Validation status indicator** | Visual feedback during async validation    |
| **Numeric-only input**          | Strips non-digits for corporation number   |
| **Comprehensive documentation** | Architecture, testing strategy, onboarding |

---

## Project Structure

```
src/
├── api/
│   ├── client.ts                 # Typed API client with error handling
│   └── methods/
│       ├── validateCorporationNumber.ts
│       ├── validateCorporationNumber.test.ts
│       ├── createProfileDetails.ts
│       └── createProfileDetails.test.ts
├── components/ui/                # Reusable UI components
├── pages/onboarding/
│   ├── page.tsx                  # Onboarding form
│   └── page.test.tsx             # Integration tests
├── queries/                      # TanStack Query hooks
└── test/                         # Test utilities and MSW mocks
e2e/
├── onboarding.spec.ts            # Playwright E2E tests
└── lighthouse/                   # Lighthouse audit tests
```

---

## Running the Project

```bash
# Install dependencies
npm ci

# Start dev server
npm run dev

# Run unit/integration tests
npm test

# Run E2E tests
npm run test:e2e

# Run Lighthouse audits
npm run test:lighthouse
```

---

## API Endpoints Used

| Method | Endpoint                      | Purpose                     |
| ------ | ----------------------------- | --------------------------- |
| GET    | `/corporation-number/:number` | Validate corporation number |
| POST   | `/profile-details`            | Submit onboarding form      |

Base URL: `https://fe-hometask-api.qa.vault.tryvault.com`
