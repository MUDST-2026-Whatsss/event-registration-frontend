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
| Choose role | `/select-role` | Authenticated multi-role account | `features/auth` | **Live API**: selects one active role and permission scope | Complete |
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
| Dashboard | `/admin/dashboard` | `features/dashboards` | **Partial API**: scoped event totals and recent events | Registration trends/activity after their APIs exist |
| All events | `/admin/all-events` | `features/events/management` | **Live API**: scoped list, search, status filter, withdraw and cancel | Complete for event lifecycle |
| Create event | `/admin/create-event` | `features/events/management` | **Live API**: image upload, draft creation and submit for review | Complete for event lifecycle |
| Edit/request changes | `/admin/events/:eventId/edit` | `features/events/management` | **Live API**: DRAFT/REJECTED edit; PUBLISHED field-diff request | Super Admin decision UI is Phase 3 |

Admin event writes carry an optimistic version. Published edits create a field-level change request
and leave the active event unchanged until a later Super Admin decision.

## Super-admin console

The `/super-admin/**` parent route uses the same console shell and requires the `SUPER_ADMIN` role.

| Page | Route | Feature owner | Current state | Next backend integration |
| --- | --- | --- | --- | --- |
| Dashboard | `/super-admin/dashboard` | `features/dashboards` | **Live API**: event lifecycle totals, recent reviews, and change-request summary | User/admin totals after access-control API |
| All events | `/super-admin/all-events` | `features/events/management` | **Live API**: global event list/search/status filters and admin assignments | Participant operations after registration API |
| Participants | `/super-admin/all-events/:id/participants` | `features/registrations/management` | Prototype; selected-event context and changes use localStorage | Event registrations, check-in, cancellation, and export APIs |
| Change requests | `/super-admin/change-requests` | `features/governance/change-requests` | **Live API**: queue, field diff, approve and reject | Complete for event governance |
| Event approvals | `/super-admin/event-approvals` | `features/governance/approvals` | **Live API**: queue/detail, approve and reject | Complete for event governance |
| Audit logs | `/super-admin/audit-logs` | `features/governance/audit` | **Live API**: search, target filter and pagination | Complete for current audit fields |
| User management | `/super-admin/user-management` | `features/access-control/users` | **Live API**: users, stats, status and role assignment | Invitation flow remains |
| Role management | `/super-admin/role-management` | `features/access-control/roles` | **Live API**: roles, permissions, usage and editing | Complete for create/update |
| Create role | `/super-admin/role-management/new` | `features/access-control/roles` | **Live API**: persists custom role and permissions | Complete |

## Runtime flows

### Guest browsing and authentication

1. Guests can browse `/`, `/events`, and `/events/:id` without waiting for auth initialization.
2. Opening a protected route runs the global guard in `app/router/index.js`.
3. The guard initializes the session with `GET /api/v1/auth/me` and attempts one cookie-based
   refresh when the access session has expired.
4. An unauthenticated visitor is sent to `/login?redirect=<original-route>`.
5. A single-role account continues directly. A multi-role account is sent to `/select-role` and
   must choose one role before entering a protected area.
6. Role selection issues a new access cookie containing only that role and its permissions. The
   selected role is kept in tab-scoped session storage only to preserve scope during refresh; auth
   tokens remain HttpOnly cookies.
7. The app accepts the original redirect only when it belongs to the selected role's area;
   otherwise it sends the user to the correct role home. Multi-role console users can switch role
   from the header without signing out.

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
