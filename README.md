# Eventsss Frontend

Vue 3 / Vite frontend for public event discovery, participant registration, event administration,
and system governance.

## Current scope

Connected to the Spring Boot API:

- Register, login, refresh, logout, and authentication initialization
- Cookie/CSRF request handling
- Participant profile text fields and password change
- Role-aware navigation for USER, ADMIN, and SUPER_ADMIN

Still backed by mock JavaScript data or `localStorage`:

- Public event catalogue/detail
- Registrations, cancellation, and QR tickets
- Admin/super-admin events, participants, approvals, change requests, users, roles, audit logs, and
  dashboards
- Profile avatar
- Forgot/reset password submission

The PromptPay UI is a simulation only and must not represent a real successful payment.

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
```

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
- Workspace [`PLAN.md`](../PLAN.md): cross-repository implementation order

## Security

- Do not store auth tokens in localStorage or JavaScript-readable cookies.
- Do not treat Vue route guards as authorization; the API must enforce access.
- Do not commit `.env`, `node_modules`, `dist`, personal data, or provider credentials.
- Never mark a payment successful from a frontend timer or browser-supplied value.
