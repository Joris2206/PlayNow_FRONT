# AGENTS.md — PlayNow Admin

These instructions supplement the repository-root `AGENTS.md` for work inside
`apps/admin`.

## Current architecture

Respect the responsibilities already established in Admin:

- `src/app`: App Router pages, route layouts, and feature composition;
- `src/components`: reusable UI plus admin-, auth-, and feature-specific
  components;
- `src/hooks`: reusable client hooks and React Query coordination;
- `src/lib`: cross-cutting infrastructure such as HTTP, token storage,
  permissions, query strings, and utilities;
- `src/providers`: application-level React contexts/providers;
- `src/services`: domain API operations;
- `src/types`: API, request, domain, authentication, and role types.

Pages should coordinate existing features rather than absorb HTTP,
authentication, or reusable presentation logic. Reuse these layers and do not
create new ones when the current separation is sufficient.

## HTTP and API access

The primary Admin HTTP client is `src/lib/http.ts`. Domain services must reuse
it rather than introducing ad hoc `fetch` calls, Axios, or another parallel
client. Do not implement refresh separately in each service.

Admin currently reads the API base URL from `NEXT_PUBLIC_API_URL`. Keep that name
consistent and do not add alternate API base variables without a concrete need.

Follow the root API-contract rules, and keep business scoping and public
identifiers in services/types rather than duplicating request construction in
pages.

## Authentication

`/api/me/` is the source of the authenticated user, business memberships,
active business information, and role. Keep token storage, refresh, logout, and
authentication state centralized. Do not duplicate authentication logic in
individual pages or feature components.

An invalid session must eventually leave protected areas. When logout or session
reset is explicitly implemented or corrected, account for all of:

- access and refresh tokens;
- authenticated user state;
- the cached `/api/me/` query;
- business-scoped queries.

Known authentication/session issues already exist. These instructions do not
authorize fixing them during unrelated tasks.

Do not change the current `localStorage` strategy unilaterally. Moving refresh
tokens to HttpOnly cookies or another mechanism is a coordinated architecture
decision with PlayNow API and requires explicit approval.

## React Query

TanStack React Query is Admin's current server-state solution. Use it for remote
data where appropriate; do not duplicate server data unnecessarily in context or
local component state, and do not introduce another fetching/state library
without a clear approved need.

Query keys must contain every parameter or scope that changes the result.
Business-scoped data must remain isolated when the active business or
authenticated session changes. Mutations should update or invalidate the
relevant queries rather than forcing unrelated page reloads.

## RBAC and authorization

Admin already has an initial role-based navigation implementation. Do not expand
hardcoded role matrices inside components. The intended direction is centralized
permissions/capabilities that can later support concepts such as:

- `can(permission)`;
- authorization metadata;
- route guards;
- action permissions;
- route permissions.

Do not implement that full architecture unless explicitly requested. Hiding a
sidebar entry is neither route protection nor security; PlayNow API remains the
final authorization authority.

The currently recognized roles are:

- `owner`;
- `admin`;
- `cashier`;
- `seller`;
- `inventory`;
- `viewer`.

Do not invent roles or permission mappings without an API/product contract.

## UI and domain presentation

Reuse appropriate components from `src/components/ui`. Do not create duplicate
Button, Input, Dialog, Table, Card, or equivalent primitives without a concrete
need. Maintain the established Admin visual language, responsive behavior, and
consistent loading, empty, error, and status states.

Tables should prioritize useful readable API fields. Use appropriate `*_name`
fields instead of technical relation IDs when available. Do not repeat the
active business name in every row unless the screen genuinely compares multiple
businesses.

## Routes and navigation

Do not assume a sidebar entry means its page exists. Confirm the actual App
Router structure before linking to or composing a route. Do not create
placeholder pages merely to satisfy existing navigation unless explicitly
requested.
