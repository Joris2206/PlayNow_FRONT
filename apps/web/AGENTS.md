# AGENTS.md — PlayNow Web

These instructions supplement the repository-root `AGENTS.md` for work inside
`apps/web`.

## Current state

`apps/web` is the public storefront and is substantially less developed than
Admin. Much of its current catalog, store, and cart content is static or mock
data.

Do not assume Web already has authentication, React Query, an API client,
services, persistent cart state, or complete domain models. Do not create that
infrastructure speculatively; introduce only what an explicit feature requires.

## Storefront responsibility

Keep Web focused on the public/storefront experience. Do not import Admin
architecture or implementation directly merely because it exists in
`apps/admin`. Share code only when there is demonstrated reuse and a stable
cross-application contract.

## API integration

When connecting a feature to PlayNow API, follow the root API-contract rules and
establish a consistent HTTP access strategy for Web. Do not blindly copy Admin's
authentication flow if the storefront has different requirements, and do not
create multiple incompatible HTTP clients.

## UI and shared components

Maintain visual coherence within the storefront. Before creating a reusable
component, inspect the existing Web components for an appropriate equivalent.

Do not automatically move Web components to `packages/ui`. Extract them only
when real reuse between applications exists and the shared interface is stable.

## Mock data

Current mock data is temporary. When a specific feature is integrated with the
API, replace or remove only the mocks belonging to that feature. Do not perform
unrelated mass cleanup of mock data.

## Routes

Verify that a route exists before adding links to it. Existing links to missing
routes do not prove that the corresponding functionality has been implemented.
Do not add placeholder pages unless explicitly requested.

## Dependencies

Every dependency imported by Web must be declared directly in
`apps/web/package.json`. Do not depend on packages made available accidentally
from the repository root or another workspace.

## Tailwind

Web uses Tailwind CSS 4. Before changing configuration or adding custom tokens,
verify how the configuration is actually loaded. Do not assume that a
`tailwind.config.ts` file is applied automatically in Tailwind 4.
