# Repository Guidelines

## Project Overview

This repository is the frontend for AlCambio.

The application is built with:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios or the existing API client
- App Router if already configured in the project

Application code typically lives under:

- `app/`
- `components/`
- `lib/`
- `types/`

Shared frontend utilities should live under:

- `lib/`
- or the existing shared helper directory if one already exists

Do not create new architecture unnecessarily. Prefer existing project conventions.

---

## Coding Style

Use TypeScript and React conventions.

Prefer:

- functional components
- typed props
- reusable helpers
- existing API client
- existing formatting utilities
- existing component patterns

Do not duplicate logic that already exists elsewhere.

Use the existing formatting and linting configuration.

Do not change unrelated business logic.

---

## Domain Language

Use the existing Spanish domain terminology:

- operacion
- cliente
- cuenta
- entrada
- salida
- deuda
- moneda
- cartera
- movimiento
- saldo
- utilidad

Do not rename domain concepts unnecessarily.

---

# Timezone Policy

Timezone handling is a GLOBAL frontend concern.

The source of truth for business timezone is:

`ConfiguracionOrganizacion.zonaHoraria`

Use IANA timezone identifiers such as:

- `America/Caracas`
- `America/Bogota`

Do not use the browser timezone as the business timezone.

Do not infer timezone from:

- user physical location
- browser settings
- machine timezone
- system locale

A user physically located in Colombia may be working with an organization configured as:

`America/Caracas`

In that case, all business timestamps must be displayed according to `America/Caracas`.

---

## UTC Timestamp Rule

Backend timestamps such as:

- `creadoEn`
- `actualizadoEn`

are real timestamps stored in UTC.

The frontend must NOT modify those values before sending or receiving them.

Example backend value:

`2026-08-11T20:32:00.000Z`

Display:

For `America/Caracas`:

`11/08/2026 4:32 p. m.`

For `America/Bogota`:

`11/08/2026 3:32 p. m.`

The backend timestamp remains exactly the same.

Only its presentation changes.

---

## Organization Timezone

The frontend must obtain:

`ConfiguracionOrganizacion.zonaHoraria`

from the backend configuration.

Do not hardcode `America/Caracas` in components except as a temporary defensive fallback if the project already uses such fallback behavior.

Preferred fallback:

```ts
const DEFAULT_TIME_ZONE = 'America/Caracas';