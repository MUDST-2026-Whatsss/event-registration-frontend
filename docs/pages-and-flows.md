# Pages and flows

This document is the current inventory of frontend routes, access rules, data sources, and
unfinished API work. Update it whenever a route or vertical flow changes.

## Status legend

- **Live API** — the screen reads or writes backend data through `src/shared/lib/apiClient.js`.
- **Partial API** — some fields use the API, while explicitly documented UI-only state remains.
- **Prototype** — the screen uses feature-owned mock data, browser storage, or simulated actions.

## Public and participant pages

| Page | Route | Access | Feature owner | Current state | Next backend integration |
| --- | --- | --- | --- | --- | --- |
| Home | `/` | Public | `features/events` | Prototype event catalogue | Public event highlights |
| Events | `/events` | Public | `features/events` | Prototype catalogue and filters | Paginated event search |
| Event detail | `/events/:id` | Public | `features/events` | Prototype detail and availability | Event detail and authoritative availability |
| Create account | `/register` | Public | `features/auth` | **Live API**: account registration | Complete |
| Sign in | `/login` | Public | `features/auth` | **Live API**: login, cookie session, refresh, role redirect | Complete |
| Forgot password | `/forgot-password` | Public | `features/auth` | Prototype browser-only confirmation | Password-reset request API |
| Reset password | `/reset-password` | Public | `features/auth` | Prototype client validation | Reset-token validation and consumption API |
| Profile | `/profile` | Authenticated | `features/auth` | **Partial API**: profile fields live; avatar in localStorage | Media upload/removal API |
| Register for event | `/events/:id/register` | Authenticated | `features/registrations` | Prototype registration and simulated PromptPay | Atomic registration hold plus payment intent |
| Registration success | `/events/:id/registration-success` | Authenticated | `features/registrations` | Prototype localStorage lookup | Registration/payment detail API |
| My registrations | `/my-registrations` | Authenticated | `features/registrations` | Prototype localStorage list, cancellation, and QR | Current-user registrations, cancellation, and signed QR |

Public event data currently comes from `features/events/data/events.js`. Registration state comes
from `features/registrations/composables/useRegistrations.js`; it is device-local and is not an
authoritative reservation.

## Admin console

The `/admin/**` parent route uses `features/console-shell/ConsoleLayout.vue` and requires the
`ADMIN` role. Its business pages do not live in the shell feature.

| Page | Route | Feature owner | Current state | Next backend integration |
| --- | --- | --- | --- | --- |
| Dashboard | `/admin/dashboard` | `features/dashboards` | Prototype aggregates | Scoped admin dashboard API |
| All events | `/admin/all-events` | `features/events/management` | Prototype event table | Scoped admin event list and filters |
| Create event | `/admin/create-event` | `features/events/management` | Prototype; builds and logs payload | Create draft and submit-for-review APIs |

Editing an existing event is not routed yet. Add it only with an API-backed event detail/update
contract, optimistic version field, and permission rules.

## Super-admin console

The `/super-admin/**` parent route uses the same console shell and requires the `SUPER_ADMIN` role.

| Page | Route | Feature owner | Current state | Next backend integration |
| --- | --- | --- | --- | --- |
| Dashboard | `/super-admin/dashboard` | `features/dashboards` | Prototype aggregates | System dashboard API |
| All events | `/super-admin/all-events` | `features/events/management` | Prototype local mutations | Global event list, status, and admin assignment APIs |
| Participants | `/super-admin/all-events/:id/participants` | `features/registrations/management` | Prototype; selected-event context and changes use localStorage | Event registrations, check-in, cancellation, and export APIs |
| Change requests | `/super-admin/change-requests` | `features/governance/change-requests` | Prototype decisions | Change-request queue and decision APIs |
| Event approvals | `/super-admin/event-approvals` | `features/governance/approvals` | Prototype decisions | Event review queue and decision APIs |
| Audit logs | `/super-admin/audit-logs` | `features/governance/audit` | Prototype records | Paginated audit-log API |
| User management | `/super-admin/user-management` | `features/access-control/users` | Prototype users and statistics | User search, status, and role-assignment APIs |
| Role management | `/super-admin/role-management` | `features/access-control/roles` | Prototype roles | Role and permission APIs |
| Create role | `/super-admin/role-management/new` | `features/access-control/roles` | Prototype; does not persist | Create/update role APIs |

## Runtime flows

### Guest browsing and authentication

1. Guests can browse `/`, `/events`, and `/events/:id` without waiting for auth initialization.
2. Opening a protected route runs the global guard in `app/router/index.js`.
3. The guard initializes the session with `GET /api/v1/auth/me` and attempts one cookie-based
   refresh when the access session has expired.
4. An unauthenticated visitor is sent to `/login?redirect=<original-route>`.
5. After login, the app accepts that redirect only when it belongs to the authenticated role's
   area; otherwise it sends the user to the correct role home.

### Account creation

1. `/register` validates the form in the browser.
2. It sends `POST /api/v1/auth/register` through the shared API client.
3. Validation errors are mapped back to fields.
4. Success redirects to `/login` with the registered email prefilled; registration does not
   silently create a signed-in session.

### Authenticated profile

1. The authenticated user is loaded from the backend session.
2. Profile text changes use `PATCH /api/v1/auth/me`.
3. Password changes use `POST /api/v1/auth/change-password` and clear the local auth state.
4. Avatar data remains in per-user localStorage until the media API exists.

### Event registration and payment prototype

1. A signed-in user opens `/events/:id/register` using prototype event data.
2. A free event writes a local registration immediately.
3. A paid event generates a browser-side QR and timers simulate payment checking and success.
4. The success and My Registrations screens read the same localStorage record.

This flow is demonstration-only. The frontend must not confirm capacity, registration, or payment
in production. The target flow is backend-created reservation/hold, transactional capacity
control, provider payment intent, idempotent provider callback, then backend-confirmed registration.

### Administrative flows

Admin and super-admin routes are grouped in `app/router/consoleRoutes.js`, but route guards are only
a navigation convenience. Every backend endpoint must independently authenticate the session,
authorize the role and event scope, validate state transitions, and audit privileged writes.

## Route ownership

- `features/auth/routes.js` owns authentication and profile routes.
- `features/events/routes.js` owns public events and admin/super-admin event management routes.
- `features/registrations/routes.js` owns participant registration and participant-management routes.
- `features/dashboards/routes.js` owns both console dashboards.
- `features/governance/routes.js` owns approvals, change requests, and audit logs.
- `features/access-control/routes.js` owns users, roles, and permissions screens.
- `app/router/consoleRoutes.js` composes role-specific console trees.
- `app/router/index.js` composes the application router and owns the global auth guard.

## Delivery order

Follow the workspace `PLAN.md`: public events, admin event lifecycle, super-admin review, free
registration with concurrency control, participant operations, users/roles/audit/dashboards,
account recovery, media, then real payments. Replace one complete vertical slice at a time and do
not silently fall back to mock records after an API failure.
