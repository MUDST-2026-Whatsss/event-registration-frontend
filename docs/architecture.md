# Frontend architecture

The frontend uses feature-based modules because it already has several distinct domains. This
keeps a change predictable: its page, components, state/API layer, tests, and routes live together.
The structure follows the large-application guidance in the
[Vue School feature-based architecture article](https://vueschool.io/articles/vuejs-tutorials/how-to-structure-a-large-scale-vue-js-application/).

## Directory map

```text
src/
├── app/
│   ├── components/          # application chrome that may compose features
│   ├── router/              # root router and global guards
│   └── App.vue
├── features/
│   ├── auth/
│   ├── events/
│   ├── registrations/
│   ├── console-shell/
│   ├── dashboards/
│   ├── governance/
│   └── access-control/
├── shared/
│   ├── composables/         # domain-agnostic cross-feature behavior
│   ├── lib/                 # HTTP client and generic infrastructure
│   └── ui/                  # reusable domain-agnostic UI
├── assets/
└── main.js
```

Small feature slices colocate their page, components, data/API module, and composable directly. A
feature adds `pages/`, `components/`, `composables/`, `api/`, `stores/`, or `data/` only once the
number of files makes the flat form harder to scan. Do not create directories pre-emptively.

## Dependency rules

1. A file used by only one feature stays inside that feature.
2. A domain-agnostic file used by multiple features may move to `shared/`.
3. `shared/` must not import from `features/`.
4. Cross-feature imports go through the target feature's `public.js`; they do not reach into its
   internal components, composables, or data folders.
5. `app/` may compose feature routes and feature public APIs, but contains no domain business logic.
6. Each domain exports route records; `app/router/index.js` and `app/router/consoleRoutes.js` combine
   them and own global navigation guards/wiring.

## Application areas

| Feature | Routes | Access |
| --- | --- | --- |
| Events | `/`, `/events`, `/events/:id` | Guest |
| Auth/profile | auth recovery pages and `/profile` | Guest or authenticated user |
| Registrations | registration, success, `/my-registrations` | Authenticated user |
| Admin console | `/admin/**` | ADMIN |
| Super-admin console | `/super-admin/**` | SUPER_ADMIN |

`features/console-shell/ConsoleLayout.vue` serves both administrative areas. Business pages live in
`events`, `registrations`, `dashboards`, `governance`, or `access-control`; the shell does not own
their state. Frontend role checks control navigation only, while the backend remains responsible for
authorization.

## State and API boundaries

- `features/auth/composables/useAuth.js` is the current source of truth for the API-backed user.
- `features/auth/composables/useProfile.js` maps authenticated user data to profile UI state.
- `features/registrations/composables/useRegistrations.js` is temporary localStorage state and will
  be replaced by the registration API.
- `shared/lib/apiClient.js` owns `/api/v1`, credentialed cookies, JSON errors, and CSRF handling.
- Mock files live inside the feature that consumes them and are removed one vertical API slice at a
  time.
- Pinia should be introduced when event and registration server state needs shared caching or more
  complex transitions; adding it only to wrap the current small singleton state adds little value.

## Component rules

- Pages orchestrate data fetching and route behavior.
- Reusable components receive data through props and emit user intent.
- Network calls belong in feature API/composable modules, not table rows or modals.
- Remote pages handle loading, empty, validation, unauthorized, forbidden, conflict, and network
  failure states.
- Route guards use only auth/role state. Event availability belongs to API-backed domain flows.

## Responsive layout

- Public pages use shared width and spacing tokens from `theme.css`.
- Console pages use the console layout/sidebar/topbar and horizontal scrolling for wide tables.
- New pages are checked at mobile, tablet, desktop, and wide-desktop widths.
- Dialogs need focus management, Escape behavior, backdrop handling, and reduced-motion support.
