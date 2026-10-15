# Pages and flows

This university project uses the existing Vue feature folders and Spring Boot API. Registration
and administration changes persist in PostgreSQL. The QR payment demonstration is intentionally
simulated; real payment integration is outside the project scope.

## Public and participant pages

| Page | Route | Current behavior |
| --- | --- | --- |
| Home | `/` | Published highlights from the API |
| Events | `/events` | Published catalogue with client-side search and date/status filters |
| Event detail | `/events/:slug` | API event details, registration window, and remaining seats |
| Create account | `/register` | API account registration |
| Sign in | `/login` | Cookie session, refresh, and role-aware redirect |
| Choose role | `/select-role` | API selection of one assigned role |
| Forgot password | `/forgot-password` | API request; reset link sent through configured SMTP |
| Reset password | `/reset-password` | API token consumption and password change |
| Profile | `/profile` | API text fields and password change; avatar stays in localStorage |
| Register for event | `/events/:slug/register` | API registration; paid events show the classroom QR simulation |
| Registration success | `/events/:slug/registration-success` | Saved registration and mock transaction reference |
| My registrations | `/my-registrations` | API list, invitations and cancellation; browser-generated QR ticket |

## Administration

| Page | Route | Current behavior |
| --- | --- | --- |
| Admin dashboard | `/admin/dashboard` | Scoped event/category totals and recent registrations |
| Admin events | `/admin/all-events` | Search/filter, edit, withdraw, cancel, and participant navigation |
| Create event | `/admin/create-event` | Partial drafts, image upload, participant invitations, submission for review |
| Edit event | `/admin/events/:eventId/edit` | Draft/rejected editing; published changes require a review request |
| Participants | `/admin/events/:id/participants` and `/super-admin/all-events/:id/participants` | API participant list with pagination |
| Super-admin dashboard | `/super-admin/dashboard` | Pending reviews/changes, user totals and security activity |
| Global events | `/super-admin/all-events` | Global event list, filters, and admin assignment |
| Event approvals | `/super-admin/event-approvals` | Approve or reject submitted events |
| Change requests | `/super-admin/change-requests` | Compare field changes, approve or reject |
| Audit logs | `/super-admin/audit-logs` | Audit/sign-in/session views, filtering and spreadsheet export |
| Users | `/super-admin/user-management` | User status and assigned roles |
| Roles | `/super-admin/role-management` | Role details, permissions and deletion subject to backend rules |
| Create role | `/super-admin/role-management/new` | Persist a custom role and permissions |

Backend permissions and event ownership enforce access. Vue route guards control navigation only.
User/role changes revoke affected sessions. Event updates carry an optimistic version, and published
data remains unchanged until a super admin approves the change request.

## Registration and classroom payment flow

1. A signed-in participant loads a published event from the API.
2. A free registration is saved as `CONFIRMED`, with capacity checked by the backend.
3. A paid demo registration is saved as `PENDING_PAYMENT`; the page shows its simulated QR flow.
4. The mock confirmation endpoint saves `CONFIRMED`. The `MOCK-` reference is not a bank transaction.
5. Success and My Registrations read saved API records. Cancellation persists through the API.

The `local` profile enables mock payments by default. No payment provider or webhook is required.
Profile avatar storage, signed/scannable attendance tickets, admin cancellation of an individual
registration, and participant export are optional future work, not required by the course checklist.

## Browser test cases

The Cypress suite follows Lab Week 7's `cypress/e2e` and `cypress/support` structure. Tests reset
isolated API fixtures before each case and select controls through `data-test` attributes.

| Case | Steps | Expected result |
| --- | --- | --- |
| EVENT-001 | Save draft, reload, submit, approve as super admin | Event appears in the public catalogue |
| EVENT-002 | Save draft while API returns a version conflict | Error shown; entered title retained |
| CHANGE-001 | Request a published title change, approve it | Old title remains until approval; new title then appears |
| CHANGE-002 | Reject a published change with a reason | Request rejected; original title preserved |
| ROLE-001 | Create a role with permissions and assign it | Role and assignment survive page reload |
| USER-001 | Disable and re-enable a participant | Account status updates and persists |
| ACCESS-001 | Participant opens super-admin URL | Redirected out of the protected console |
| REG-003 | Register, display QR, dismiss cancellation, then confirm it | Cancellation persists; cancelled ticket is unavailable |

Existing specs also cover sign-in/out, invalid credentials, protected routes, event discovery,
free registration and the paid QR simulation. These are browser tests with fixture responses;
backend business rules are tested separately with PostgreSQL integration tests.

## Remaining course dependency

The Week 9 deployment of another team's application/database in a separate namespace is pending
that team's repository and setup information. Our own Ingress manifests live in the backend's `k8s/`.
