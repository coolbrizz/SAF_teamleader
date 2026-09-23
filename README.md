# SAF Teamleader

App hangar (H145 / H135) : inventaires caisses, commandes pièces, remarques de visite.

## Stack

Next.js 16 (App Router) · Tailwind 4 · Prisma · Postgres · Docker · JWT cookie.

## Local

```bash
docker compose up db -d
copy .env.example .env
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Comptes seed :

- Chef : `chef@saf.local` / `Chef123!` (trigramme ADU)
- Mécano : `meca@saf.local` / `Meca123!` (trigramme JMA)

http://localhost:3000

## Docker app complète

Mettre `AUTH_SECRET` dans l’environnement, puis `docker compose up --build`.
