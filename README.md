# TRISTAR Driver Assessment System

TRISTAR is a responsive driver evaluation dashboard for managing driver records and reviewing recruitment assessments. It provides a branded login experience, dashboard summaries, assessment-specific driver lists, detailed driver records, and forms for recording interview and in-cab evaluations.

## Features

- Local demo authentication with login persistence
- Driver performance dashboard with assessment summaries and charts
- Initial, interview, and in-cab assessment workflows
- Driver detail views with reassessment support
- Assessment scoring, pass/fail status, assessor details, remarks, and signatures
- Responsive UI with animated page transitions and toast notifications
- Sample driver records for immediate demonstration

## Technology

- React 18 with TypeScript
- Vite
- Tailwind CSS 4
- Radix UI and shadcn-style components
- Recharts for data visualization
- Motion for transitions and animation
- `localStorage` for demo authentication and driver data

## Getting started

### Prerequisites

- Node.js
- pnpm

### Install dependencies

```bash
pnpm install
```

### Start the development server

```bash
pnpm dev
```

The Vite server runs on the configured host and port. Open the URL shown in the terminal.

### Build for production

```bash
pnpm build
```

### Preview the production build

```bash
pnpm preview
```

## Demo credentials

The current demo authentication service uses hardcoded accounts:

| Email | Password | Role |
| --- | --- | --- |
| `admin@tristar.com` | `tristar123` | Admin User |
| `test@tristar.com` | `test123` | Test User |

These credentials are for local demonstration only and must be replaced with a secure authentication provider before production use.

## Data storage

Authentication state and driver records are stored in the browser's `localStorage`:

- `tristar_auth_user` stores the signed-in demo user.
- `tristar_drivers` stores driver records and assessment data.

The database service seeds sample records when no driver data exists. Clearing browser storage resets the local demo data.

## Project structure

```text
src/
├── main.tsx                 # Application entry point
├── app/
│   ├── App.tsx              # Authentication and page routing state
│   ├── components/          # Dashboard, login, assessment, and UI components
│   └── lib/
│       ├── auth-service.ts  # Demo authentication service
│       └── database-service.ts
└── styles/                  # Global and theme styles
```

The repository also includes Figma Make configuration under `.figma/` and uses `vite.figma.config.ts` for the development and build scripts.

## Production considerations

Before deploying this application for real driver evaluations:

- Replace hardcoded authentication with a secure identity provider.
- Move driver and assessment data to a protected backend database.
- Add authorization rules and audit logging.
- Review the handling of personally identifiable information and assessment records.
