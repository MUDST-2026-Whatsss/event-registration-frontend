# Eventsss Frontend

Vue 3 frontend for the Eventsss event registration platform. The current user flow includes event discovery, event details, mock authentication, profile management, registration confirmation, QR tickets, and registration cancellation.

## Requirements

- Node.js `22.18.0` or `24.12.0` and newer
- npm (included with Node.js)

## Setup

```sh
npm install
npm run dev
```

Vite serves the application at `http://localhost:5173` by default.

## Available Commands

```sh
npm run dev      # Start the development server
npm run build    # Create the production build in dist/
npm run preview  # Preview the production build locally
```

## Project Structure

- `src/views/`: routed pages
- `src/components/`: shared UI components
- `src/composables/`: authentication, profile, registration, and toast state
- `src/data/events.js`: mock event catalogue and registration rules
- `src/assets/`: styles, fonts, and event images

## Current Scope

The frontend currently uses browser storage and mock data; it is not connected to the Spring Boot API yet. Demo sign-in credentials are:

```text
Email: demo@eventsss.com
Password: password123
```

Do not commit `.env` files, `node_modules/`, or `dist/`. Add documented environment placeholders to `.env.example` when API configuration is introduced.
