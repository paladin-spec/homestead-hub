# Homestead Manager

A mobile-friendly web app for managing your homestead — plants, chickens, firewood, and equipment — with a PostgreSQL database for cross-device sync.

---

## Features

- **Dashboard** — Customizable homestead name, location, and description with at-a-glance stats
- **Plants** — Track varieties, locations, planting dates, and log watering/fertilizing activity
- **Chickens** — Manage your flock, log egg collections, and record feeding/watering care
- **Firewood** — Cord calculator (diameter × length), BTU estimates by species, and running totals
- **Equipment** — Maintenance logger with type, cost, performed-by, and next-due-date tracking
- **Dark mode** — System-aware with manual toggle

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL (Neon serverless) |
| ORM | Drizzle ORM |
| Runtime | Bun |

---

## Prerequisites

- [Bun](https://bun.sh) v1.0+
- A [Neon](https://neon.tech) account (or any PostgreSQL provider)
- Node.js 18+ (for tooling compatibility)

---

## Local Development

### 1. Clone and install

```bash
git clone <your-repo-url>
cd homestead-manager
bun install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
```

### 3. Run database migrations

```bash
bun run db:migrate
```

### 4. Start the development server

```bash
bun run dev --port 4000
```

The app will be available at `http://localhost:4000`.

---

## Database Scripts

| Command | Description |
|---|---|
| `bun run db:generate` | Generate migration files from schema changes |
| `bun run db:migrate` | Apply pending migrations to the database |
| `bun run db:studio` | Open Drizzle Studio (visual DB browser) |

### Making schema changes

1. Edit `src/lib/schema.ts`
2. Run `bun run db:generate` to create a new migration file
3. Run `bun run db:migrate` to apply it

---

## Deployment

### Vercel (recommended)

1. Push your repository to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add the environment variable:
   - `DATABASE_URL` — your Neon (or other PostgreSQL) connection string
4. Deploy — Vercel auto-detects Next.js and builds correctly

> **Note:** Run `bun run db:migrate` once against your production database before the first deploy, or add it as a build step.

### Other platforms (Railway, Render, Fly.io)

1. Set the `DATABASE_URL` environment variable in your platform dashboard
2. Set the build command to `bun run build`
3. Set the start command to `bun run start`
4. Run migrations manually or via a release command: `bun run db:migrate`

---

## Project Structure

```
src/
  app/
    api/                  # REST API routes
      homestead/
      plants/[id]/logs/
      chickens/[id]/
      eggs/
      chicken-logs/
      firewood/[id]/
      equipment/[id]/
      maintenance/[id]/
    chickens/             # Chickens page
    equipment/            # Equipment page
    firewood/             # Firewood page
    plants/               # Plants page
    layout.tsx            # Root layout (sidebar + theme)
    page.tsx              # Dashboard
  components/
    ui/                   # shadcn/ui components
    app-sidebar.tsx       # Desktop sidebar nav
    mobile-nav.tsx        # Mobile top nav
    theme-provider.tsx    # next-themes wrapper
    theme-toggle.tsx      # Dark/light mode button
  lib/
    db.ts                 # Drizzle database connection
    schema.ts             # Database schema & types
    utils.ts              # Utility functions
drizzle/                  # Migration files (auto-generated)
drizzle.config.ts         # Drizzle Kit config
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |

---

## Type Checking

```bash
bun run typecheck
```
