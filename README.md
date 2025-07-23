# DeFi Full-Stack Monorepo

Ultra-slick, fully-typed, production-ready starter.

## Quick Start

```bash
# 1. install deps
pnpm install

# 2. start dev servers (frontend + backend)
pnpm dev

# 3. open http://localhost:3000
```

## Scripts

| command | description |
| ------- | ----------- |
| `pnpm dev` | run frontend & backend in watch mode |
| `pnpm build` | build all apps |
| `pnpm start` | start production builds |
| `pnpm test` | unit & integration tests |
| `pnpm e2e` | Playwright end-to-end tests |

## Environment Variables

Copy `.env.example` → `.env` and fill in any secrets.

## Deployment

Deploy `apps/frontend` to Vercel (or similar) and `apps/backend` to Fly.io/Render.