# CMS API

A Content Management System REST API with Authors and Articles, backed by PostgreSQL.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod + `drizzle-zod`
- Build: esbuild (ESM bundle)

## Where things live

- `lib/db/src/schema/authors.ts` — Authors table, insert schema, types
- `lib/db/src/schema/articles.ts` — Articles table (FK → authors), insert schema, types
- `artifacts/api-server/src/routes/authors.ts` — Authors CRUD routes
- `artifacts/api-server/src/routes/articles.ts` — Articles CRUD routes

## Architecture decisions

- All input validation uses Zod schemas derived from the Drizzle table definitions via `drizzle-zod`, keeping the schema as the single source of truth.
- Author existence is checked before inserting or updating an article's `author_id`, returning 404 rather than letting the DB throw a FK violation.
- PUT endpoints use `.partial()` on the insert schema so any subset of fields can be updated.
- Route files import directly from `@workspace/db` — no separate service layer for this CRUD-only API.

## Product

Full CRUD for **Authors** (`/api/authors`) and **Articles** (`/api/articles`) with a 1:N relationship. Data persists in PostgreSQL.

## API — curl examples

### Authors

```bash
# Create an author
curl -X POST http://localhost:80/api/authors \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Smith","email":"jane@example.com","bio":"Tech writer"}'

# List all authors
curl http://localhost:80/api/authors

# Get one author
curl http://localhost:80/api/authors/1

# Update an author (any subset of fields)
curl -X PUT http://localhost:80/api/authors/1 \
  -H "Content-Type: application/json" \
  -d '{"bio":"Senior tech writer"}'

# Delete an author
curl -X DELETE http://localhost:80/api/authors/1
```

### Articles

```bash
# Create an article
curl -X POST http://localhost:80/api/articles \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello World","content":"My first post.","publishedDate":"2025-06-04","authorId":1}'

# List all articles
curl http://localhost:80/api/articles

# Get one article
curl http://localhost:80/api/articles/1

# Update an article (any subset of fields)
curl -X PUT http://localhost:80/api/articles/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello World — Updated"}'

# Delete an article
curl -X DELETE http://localhost:80/api/articles/1
```

## Gotchas

- Always run `pnpm run typecheck:libs` after editing `lib/db/src/schema/` so downstream packages pick up the new declarations before running `pnpm --filter @workspace/api-server run typecheck`.
- Run `pnpm --filter @workspace/db run push` after any schema change to apply it to the database.
- Deleting an author while they still have articles will fail with a FK constraint error (cascading deletes are not configured — delete the articles first).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
