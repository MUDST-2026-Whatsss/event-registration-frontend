# Eventsss Frontend

Vue 3 / Vite frontend for public event discovery, participant registration, event administration,
and system governance.

## Current scope

Connected to the Spring Boot API:

- Register, login, refresh, logout, and authentication initialization
- Cookie/CSRF request handling
- Participant profile text fields and password change
- Role-aware navigation for USER, ADMIN, and SUPER_ADMIN
- Published event catalogue, event search/filtering, and event detail
- Admin event lifecycle and Super Admin governance/access-control screens

Also connected to the API:

- Event registration, cancellation, seat availability, and participant lists
- Event invitations, partial drafts, and recent registration activity
- Password recovery with an emailed reset token
- Audit, sign-in, and session activity with spreadsheet export

Profile avatars remain in per-user `localStorage`. QR tickets display the saved registration
number; attendance scanning/check-in is outside the current classroom scope.

The QR payment flow is an intentional university demonstration. The backend saves the simulated
confirmation when `MOCK_PAYMENTS_ENABLED=true`; no real money is collected. A payment provider is
not required for this project.

## Requirements

- Node.js `22.18.0` or `24.12.0` and newer
- npm

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Vite runs at `http://localhost:5173`. Browser requests remain same-origin under `/api`; the local
development proxy forwards them to `VITE_API_PROXY_TARGET`, defaulting to
`http://localhost:8080`.

## Commands

```bash
npm run dev
npm test
npm run build
npm run preview
npm run test:e2e
npm run test:e2e:open
```

Cypress tests intercept the API with isolated fixtures; they do not log into the shared database.
The suite covers navigation, authentication, free registration, the QR payment demonstration,
cancellation, event submission/approval, published-event change approval/rejection, and user/role
administration. Controls use `data-test` attributes and `cy.getByTestId`, following Lab Week 7.
These browser tests complement the backend's PostgreSQL integration tests; they do not replace them.

To run one browser spec:

```bash
npx start-server-and-test dev http://127.0.0.1:5173 "node scripts/cypress-runner.js --spec cypress/e2e/governance.cy.js"
```

## Docker

The production image builds the Vite application and serves it with Nginx. Nginx also proxies
same-origin `/api` requests to the Compose service named `api`.

When this repository is cloned beside the backend repository, start the complete local stack from
the backend directory:

```bash
docker compose --env-file .env.local up -d --build
```

Open `http://localhost:5173`. Set `FRONTEND_PORT` in the backend environment file when another host
port is required. `npm run dev` remains the recommended workflow while actively editing frontend
code because it provides Vite hot reload.

## Structure

| Directory | Responsibility |
| --- | --- |
| `src/app/` | Application shell, global navigation UI, and root router composition |
| `src/features/auth/` | Authentication, profile, auth pages, and feature routes |
| `src/features/events/` | Public event catalogue/detail, event components, and event data/API boundary |
| `src/features/registrations/` | Registration flow, tickets, and participant registrations |
| `src/features/console-shell/` | Shared admin/super-admin layout and navigation chrome |
| `src/features/dashboards/` | Admin and super-admin dashboard screens |
| `src/features/governance/` | Approvals, change requests, and audit logs |
| `src/features/access-control/` | User and role administration |
| `src/shared/ui/` | Domain-agnostic UI used by more than one feature |
| `src/shared/composables/` | Cross-feature browser/application behavior |
| `src/shared/lib/` | API transport, cookie credentials, CSRF, and generic errors |

Small feature slices colocate their files directly. Larger features may add `components/`, `pages/`,
`api/`, or `composables/` only when needed. Cross-feature imports use a public entry point or exported
route records instead of reaching into implementation folders.

## Documentation

- [`docs/architecture.md`](docs/architecture.md): frontend structure and state boundaries
- [`docs/api-integration.md`](docs/api-integration.md): API, cookie, CSRF, and error conventions
- [`docs/pages-and-flows.md`](docs/pages-and-flows.md): page inventory and live/mock status
- The course Labs in the Docs folder define the coursework; this repository follows the existing feature architecture.

## Security

- Do not store auth tokens in localStorage or JavaScript-readable cookies.
- Do not treat Vue route guards as authorization; the API must enforce access.
- Do not commit `.env`, `node_modules`, `dist`, personal data, or provider credentials.
- Never mark a payment successful from a frontend timer or browser-supplied value.
