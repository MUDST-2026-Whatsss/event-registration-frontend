# API integration

## Development transport

The browser calls relative `/api` paths. Vite proxies them to the backend configured in `.env`:

```dotenv
VITE_API_PROXY_TARGET=http://localhost:8080
```

This preserves same-origin cookie behavior during local development. Production should route the
frontend and `/api` through the same trusted origin/reverse proxy where possible.

## API client

`src/shared/lib/apiClient.js` provides:

- `/api/v1` prefixing
- `credentials: include`
- JSON serialization/parsing
- CSRF initialization for unsafe methods
- one CSRF refresh/retry only when the API returns `CSRF_TOKEN_INVALID`
- stable `ApiError` objects containing status, code, and field errors

Domain code should call `apiRequest('/events')`, not use `fetch` directly and not repeat the API
prefix.

## Authentication flow

1. Load `GET /api/v1/auth/me`.
2. If access is expired, concurrent requests share one `POST /api/v1/auth/refresh` operation.
3. Login/register/logout and every unsafe request first obtain `/auth/csrf`.
4. Tokens stay in HTTP-only cookies and never enter Vue state or localStorage.
5. Public routes render without waiting for auth initialization; protected routes await it.
6. On final 401, clear user state and redirect protected navigation to login.

## Error handling

Branch on stable error codes such as `VALIDATION_FAILED`, `UNAUTHENTICATED`, `ACCESS_DENIED`, or
`CSRF_TOKEN_INVALID`. An authorization denial must never be treated as an expired CSRF token.
Map `fieldErrors` to inputs. Present a retry action for network/5xx failures and a conflict/reload
action for stale-version HTTP 409 responses.

## Migration away from mocks

Replace one complete flow at a time:

1. Add backend DTO/endpoint and integration tests.
2. Add a frontend service/composable and unit tests.
3. Connect the corresponding views and states.
4. Remove only the mock exports no longer referenced.
5. Run `npm test` and `npm run build`.

Do not load API data and silently fall back to mock records; that can make server failures look like
successful operations.
