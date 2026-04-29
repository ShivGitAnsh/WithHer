# ForHer Backend

Production-ready Node.js backend scaffold using TypeScript, Express, Prisma, and PostgreSQL with a clean architecture baseline.

## Quick start

1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env`
3. Generate the Prisma client with `npm run prisma:generate`
4. Start the server in development with `npm run dev`

## Scripts

- `npm run dev` - start the API in watch mode
- `npm run build` - compile TypeScript to `dist`
- `npm run start` - run the compiled server
- `npm run lint` - run ESLint
- `npm run prisma:generate` - generate the Prisma client
- `npm run prisma:migrate:dev` - create and apply local migrations

## Folder structure

```text
.
├── docs
├── prisma
│   └── schema.prisma
├── src
│   ├── app.ts
│   ├── server.ts
│   ├── config
│   │   ├── env.ts
│   │   └── logger.ts
│   ├── infrastructure
│   │   ├── database
│   │   │   └── prisma
│   │   │       └── client.ts
│   │   └── http
│   │       ├── middlewares
│   │       │   ├── error-handler.ts
│   │       │   └── not-found-handler.ts
│   │       └── routes
│   │           └── index.ts
│   ├── modules
│   │   └── health
│   │       ├── health.controller.ts
│   │       ├── health.prisma.repository.ts
│   │       ├── health.repository.ts
│   │       ├── health.routes.ts
│   │       ├── health.service.ts
│   │       └── health.types.ts
│   └── shared
│       └── errors
│           └── app-error.ts
├── .env.example
├── eslint.config.mjs
├── package.json
└── tsconfig.json
```
