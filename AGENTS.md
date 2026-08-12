# AGENTS.md — PlayNow Front

## Scope and precedence

These instructions apply to the entire repository. More specific `AGENTS.md`
files may supplement them inside an application. Follow both the root and the
nearest applicable instructions; do not treat application-specific guidance as
permission to bypass repository-wide safety or scope rules.

## Project identity

This repository is exclusively **PlayNow Front**.

PlayNow Front is independent from the Django backend known as **PlayNow** or
**PlayNow API**. Never bring backend implementation details into this
repository, including Django project structure, models, serializers, views,
migrations, or database responsibilities.

Treat the backend only through its HTTP/API contract. Backend business and
authorization rules remain authoritative; frontend validation and visibility
are user-experience concerns, not replacements for backend enforcement.

## Monorepo boundaries

This is a pnpm/Turborepo monorepo containing:

- `apps/admin`: the administrative application;
- `apps/web`: the public storefront;
- `packages/*`: potential shared workspaces.

Keep administrative functionality in `apps/admin` and public/storefront
functionality in `apps/web`. Do not import application-specific implementation
directly from one app into the other.

Do not assume a package is production-ready or should be used merely because it
exists. In particular, `packages/api` and `packages/ui` are currently stubs
without real application consumers. Do not migrate code to them or require the
apps to use them without concrete reuse, a stable contract, and user approval.

## Package manager and dependencies

Use `pnpm` exclusively. Do not use npm or yarn.

Do not install, remove, or update dependencies unless the task clearly requires
it. Do not add dependencies unnecessarily. If a task requires a new dependency that was not explicitly requested, explain why the existing stack is insufficient before installing it.

Each application or package must directly declare every dependency it imports.
Do not rely on a dependency being available accidentally from the repository
root or another workspace.

Do not change major framework or dependency versions as part of an unrelated
task.

## Scope discipline

Before modifying code:

1. inspect the related files and surrounding flow;
2. understand the existing conventions and available equivalents;
3. check `git status`;
4. identify and preserve pending user changes.

Make small, focused, maintainable changes. Do not perform unrelated refactors,
broad cleanup, mass formatting, or unnecessary folder reorganization. Do not
modify a file solely because another possible improvement was discovered.

Before creating a component, hook, service, helper, utility, type, or
abstraction, search for an existing equivalent and reuse or extend it when
appropriate. Avoid speculative abstractions and duplicate ways of solving the
same problem.

If an out-of-scope issue is discovered, report it at the end instead of fixing
it automatically. If ambiguity could affect architecture or the API contract,
explain it rather than inventing a convention.

## Git safety

Never assume existing changes were produced by Codex. Preserve all pre-existing
user work.

Do not automatically run destructive or work-discarding Git operations,
including:

- `git reset`;
- `git restore`;
- `git checkout --`;
- `git clean`;
- rebase;
- force push.

Do not commit or stash unless explicitly requested. Do not push, pull, merge, or
rewrite history unless explicitly requested and within the task's scope.

For a task that changes files:

1. record the initial state with `git status`;
2. when finished, run `git status` again;
3. review a diff limited to the task's files whenever possible;
4. confirm only requested changes were made;
5. report the files changed and any pre-existing changes that remain.

## PlayNow API contract

Do not invent endpoint contracts or silently rename request/response fields.
Inspect the current frontend contract and, when necessary, verify it against
PlayNow API before implementing behavior.

Follow these conventions:

- public resources use `public_id` rather than internal database IDs;
- general/list requests use `business_public_id` when the endpoint is
  business-scoped and requires it;
- every public relationship represented by another resource's `public_id` uses
  `<relation>_public_id` in requests and responses;
- PUT/PATCH/DELETE identify the target resource by its `public_id`;
- choices and enums retain their semantic field names and must not be renamed
  to `*_public_id` merely because a field such as `status` has that name;
- special endpoints such as authentication, business creation, and `/api/me/`
  may have different contracts.

Keep field names consistent between endpoints and frontend types. For related
data displayed in the UI, prefer readable fields supplied by the API, such as:

- `status_name`;
- `product_name`;
- `category_name`;
- `supplier_name`;
- `customer_name`;
- `employee_name`;
- `payment_method_name`.

Do not create aliases such as `product_title` when they represent exactly the
same relationship concept as an established `product_name`. A product's own
domain field may still be named `title` when that is the actual API field.

Do not show relational UUIDs/public IDs to users when an appropriate readable
field exists.

## Authenticated business context

General business information must come from the authenticated `/api/me/`
context. Do not add or request `business_name` repeatedly in resource models,
tables, cards, or rows merely to display the same active business.

Use the authenticated `business_public_id` for business-scoped operations when
the API contract requires it. Never hardcode business IDs.

## TypeScript

Maintain strict TypeScript. Prefer useful explicit types and avoid `any`,
especially when it is used only to silence an error. Do not suppress type errors
without understanding their cause, and avoid unnecessary assertions.

Derive types from the real API contract. Do not add properties the backend does
not return. Keep response types, request/DTO types, and query parameter types
separate when they represent different contracts.

## Shared code

Do not extract code to `packages/*` prematurely. Share code only when there is
real reuse across applications and the contract is stable enough to justify the
dependency. Do not create a shared package for a tiny or speculative use case.

Before adding shared code, verify that no equivalent implementation already
exists and that sharing will not couple the distinct application concerns.

## Security

Never:

- print or log access/refresh tokens;
- expose tokens in user-visible errors;
- place credentials or secrets in source code;
- commit real secrets;
- expose private configuration through `NEXT_PUBLIC_*`;
- display sensitive `.env` values.

Future `.env.example` files may contain only variable names and safe example
values, never real credentials.

JWT durations and policies belong to the backend and must not become frontend
security rules. Do not unilaterally change token storage or authentication
architecture without considering the PlayNow API contract and obtaining user
approval.

## Validation

Choose validation in proportion to the task and follow any stricter user
instruction. Do not automatically run tests, builds, lint, or formatters when
they are unnecessary. Do not start persistent development servers unless the
task requires them.

Do not assume a validation command works merely because it appears in the root
`package.json`. In particular, `check-types` currently needs review because the
workspaces do not yet implement that task consistently; do not present it as a
guaranteed validation until it is fixed.

When validation is performed, report the exact command and result. If it fails
because of a pre-existing unrelated issue, report that fact rather than changing
unrelated code.

## Completion report

At the end of a meaningful task, summarize:

- files changed;
- important behavior changed;
- validation performed and its result;
- validation failures, if any;
- pre-existing changes preserved;
- anything that still requires user attention.
