# Kawsay Scheduling Frontend

This Vite + React application powers the Kawsay scheduling and academic-structure console. The UI relies on a typed API service layer (`src/services`) and MSW-backed mocks (`src/mocks`) when `VITE_DEMO_MODE=true`.

## Getting started

```bash
npm install
npm run dev
```

Set `VITE_API_BASE_URL` to the backend host (without the `/kawsay` suffix). When omitted, enabling `VITE_DEMO_MODE=true` will proxy all requests to the in-browser MSW server.

## End-of-Module API contract

Bulk CSV ingestion has been removed. The EOM workflow now synchronizes data on-demand through these endpoints:

| Endpoint | Method | Description | Body |
| --- | --- | --- | --- |
| `/kawsay/eom/:timetableId/sync-grades` | `POST` | Fetches LMS grade snapshots, returning `GradeSyncReportDto` with `processedCount`, `failedCount`, `retakeDemand`, and `advancingCohorts`. | _none_ |
| `/kawsay/eom/:timetableId/prepare-enrollments` | `POST` | Builds enrollment proposals for the next module and returns `EnrollmentProposalResultDto`. | `{ "destinationTimetableId": string }` |

See `src/interfaces/eomDtos.ts` for the full TypeScript definitions used throughout the app.

## Mock data

When running in demo mode, `src/mocks/eomHandlers.ts` responds with deterministic data seeded from `src/mocks/data/mockEomReports.ts`. The mock DB stores the latest grade sync report and a rolling history of generated enrollment proposals so UI flows behave like the production API.
