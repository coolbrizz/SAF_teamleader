# SAF Teamleader

App hangar H145 / H135 — Next.js + **MySQL** (Hostinger). Plus de Docker / Postgres.

## Hostinger Business Web Hosting (prod)

hPanel → **Websites → Add Website → Node.js web app**. MySQL **uniquement** (`127.0.0.1`, pas `localhost`).

1. **MySQL** (hPanel → Bases de données)
   - Crée une base + un user
   - Note : host (souvent `localhost` **sur le serveur**, ou `mysqlXX.hostinger.com`), nom, user, mot de passe

2. **Node.js** (hPanel → Avancé → Node.js)
   - Version **20** (pas 22 / 24)
   - Application root = dossier du projet (`SAF_teamleader`)
   - **Build command** (obligatoire) : `npm run build`  
     Si le preset Next force `next build`, remplace par : `npx next build --webpack`  
     (`next build` seul = Turbopack → crash PostCSS sur `globals.css`)
   - Startup : `npm start`
   - Variables d’environnement :

```
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DBNAME
AUTH_SECRET=colle-ici-une-longue-chaine-aleatoire
NODE_ENV=production
PORT=3000
```

   Sur Hostinger le `HOST` MySQL est celui indiqué dans hPanel, **pas** `127.0.0.1` si l’app Node n’est pas sur la même machine. En général Node + MySQL sont sur le même compte → `localhost`.

3. Upload du code (Git ou File Manager), puis **SSH / terminal hPanel** dans le dossier :

```bash
npm install
npx prisma migrate deploy
npx prisma db seed
npx next build --webpack
```

4. Démarre l’app Node dans hPanel. Domaine / sous-domaine pointé sur cette app.

Comptes seed :

- `chef@saf.local` / `Chef123!`
- `meca@saf.local` / `Meca123!`

Change les mdp après le 1er login.

## Local (Windows)

MySQL/MariaDB (XAMPP, ou la base Hostinger avec **accès distant** activé).

```powershell
Set-ExecutionPolicy -Scope Process Bypass
cd C:\Users\omont\SAF_teamleader
# édite .env : DATABASE_URL mysql://...
npx.cmd prisma migrate deploy
npx.cmd prisma db seed
npm.cmd run dev
```

http://127.0.0.1:3000
