# APSL Solutions LLP: website + admin panel

A redesign of apslsolutions.co.in with an interactive 3D hero, scroll animations, a product catalogue fed from a database, and an admin panel where the client adds, edits and deletes products.

## Tech stack (and why)

| Layer | Choice | Why it suits a 3D site |
|---|---|---|
| UI | **React 18 + TypeScript + Vite** | Component model fits 3D scenes; Vite gives fast dev and code-splitting so the heavy 3D bundle loads only when needed. |
| 3D | **Three.js via React Three Fiber + Drei** | The standard WebGL stack for the web. R3F lets the scene be written as React components; Drei adds performance helpers (adaptive DPR, performance monitor). |
| Motion | **Framer Motion** | Scroll-triggered reveals, parallax and 3D-tilt cards; honours the user's reduced-motion setting automatically. |
| Styling | **Tailwind CSS** | Fast, consistent, responsive styling with tiny CSS output. |
| API | **Node.js + Express 5 (TypeScript)** | Same language as the frontend, so one team maintains both; simple to host on any VPS or Node host. |
| Database | **PostgreSQL 16** | Reliable relational store for products, categories, admins and enquiries. |
| Auth | **bcrypt password hash + JWT in an httpOnly, SameSite=Strict cookie** | The token is not readable by page scripts; logins are rate-limited. |
| Images | **Disk storage (`backend/uploads`)** via Multer | Simple for one server. Swap to S3/R2/Cloudinary later by changing `backend/src/uploads.ts`. |

### Performance and accessibility of the 3D hero
- The Three.js bundle (~220 KB gzip) is **lazy-loaded after first paint** (`requestIdleCallback`). The page text and initial JS (~110 KB gzip) render first.
- 3D is **skipped entirely** (a static SVG/gradient backdrop is shown instead) when the user prefers reduced motion, has Data Saver on, has a very low-memory or low-core device, or has no WebGL.
- Point-cloud density is lower on phones and drops automatically if the frame rate falls (`PerformanceMonitor` + `AdaptiveDpr`).
- The scan sweep is a custom GPU shader, so animating ~29k points costs almost no CPU.

## Project layout

```
apsl-website/
├─ docker-compose.yml      Postgres 16 on host port 5434 (container: apsl-postgres)
├─ backend/                Express API
│  ├─ .env.example         copy to .env
│  ├─ migrations/          SQL schema
│  ├─ scripts/migrate.ts   applies migrations
│  ├─ scripts/seed.ts      categories, starting catalogue, admin account
│  ├─ src/                 API source (routes/, auth.ts, uploads.ts)
│  └─ uploads/             product images uploaded from the admin panel
└─ frontend/               React site + admin panel
   └─ src/
      ├─ three/HeroScene.tsx  the 3D scene
      ├─ pages/               Home, Products, ProductDetail
      ├─ admin/               Login, ProductList, ProductForm, Enquiries
      └─ lib/company.ts       phone, GST, address: edit company details here
```

## Run locally (Windows / PowerShell)

Prerequisites: Node.js 20+, Docker Desktop running.

**1. Start the database**

```powershell
cd C:\Users\Rishabh\Downloads\apsl-website
docker compose up -d
```

**2. Configure and start the API** (first time only: copy the env file and set a JWT secret plus an admin email/password)

```powershell
cd C:\Users\Rishabh\Downloads\apsl-website\backend
Copy-Item .env.example .env
notepad .env
```

```powershell
npm install
npm run migrate
npm run seed
npm run dev
```

The API runs on http://127.0.0.1:4000. `npm run seed` creates or updates the admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`, and only stores a bcrypt hash. To change the admin password later, edit `.env` and run `npm run seed` again; products the client has edited are left untouched.

**3. Start the website** (in a second terminal)

```powershell
cd C:\Users\Rishabh\Downloads\apsl-website\frontend
npm install
npm run dev
```

Open http://localhost:5180. The admin panel is at http://localhost:5180/admin.

## Admin panel

- **Products**: list, filter, add, edit and delete. Each product has a name, category (or create a new one inline), brand, short and full description, specification rows, price in ₹ (leave empty for "Price on request"), a "feature on homepage" toggle, and multiple images (upload, reorder, remove; the first image is the main photo).
- **Enquiries**: messages from the website's contact and "Request a quote" forms. Mark as handled or delete.
- Every write endpoint requires a signed-in admin. Deleting a product also deletes its uploaded image files.

## API overview

| Method | Path | Auth |
|---|---|---|
| GET | `/api/products?category=&q=&featured=true` | public |
| GET | `/api/products/:slug` (includes related products) | public |
| GET | `/api/categories` | public |
| POST | `/api/enquiries` | public, rate-limited, honeypot |
| POST | `/api/auth/login`, `/api/auth/logout`; GET `/api/auth/me` | login is rate-limited |
| GET | `/api/products/admin/all`, `/api/products/admin/:id` | admin |
| POST / PUT / DELETE | `/api/products`, `/api/products/:id` (multipart: `data` JSON + `images` files) | admin |
| POST / DELETE | `/api/categories`, `/api/categories/:id` | admin |
| GET / PATCH / DELETE | `/api/enquiries`, `/api/enquiries/:id` | admin |

## Deploying to production

1. `cd frontend; npm run build` creates `frontend/dist`. The API automatically serves it (with SPA fallback) when that folder exists, so a single Node process serves both site and API.
2. On the server, set `COOKIE_SECURE=true`, a fresh `JWT_SECRET`, a strong admin password and a production `DATABASE_URL`, then `npm run migrate` and `npm run seed`.
3. Run `npm start` in `backend/` under a process manager (PM2 or a Windows service) behind Nginx/Caddy with HTTPS. Back up `backend/uploads/` and the database.
4. Fix the live domain's TLS certificate: apslsolutions.co.in currently serves a self-signed certificate, which browsers block. A free Let's Encrypt certificate via Caddy or Certbot solves it.

## Content, branding and the catalogue

All content now comes from the client's own live site, **apslsolutions.co.in** (a
WordPress/WooCommerce site). The certificate is self-signed, so it has to be read
with TLS verification disabled, but the site itself is reachable.

**Brand.** The palette and typefaces are the ones the client uses in their own
`wp-custom-css`: orange `#F5660A` (primary/CTA), navy `#0A2D48`, near-black
`#111111`, body `#444444`, warm border `#EADFD7`, cream `#FFF1E8`; Montserrat for
headings, Inter for body. They are defined once in `frontend/tailwind.config.js` as the
`ink` / `signal` / `beam` / `mist` / `sand` / `cream` tokens, so changing a value
there re-skins the whole site. The real logo is `frontend/public/apsl-logo.png` (plus
the wide `apsl-logo-wide.png`); because its lettering is black it sits on a white
chip in the navbar so it stays legible on the navy.

**Catalogue.** `backend/scripts/catalogue.json` holds 32 products in 9 categories,
generated from the live site's WooCommerce API: names, categories, short and full
descriptions, specification tables and the featured flags. Product photos were
downloaded into `backend/uploads/` and are referenced as `/uploads/<slug>.png`.
Industry photos are in `frontend/public/industries/`.

- `npm run seed` — upserts categories and the admin; products are inserted only
  when the table is empty, so client edits are preserved.
- `npm run seed -- --replace` — wipes the products table and re-seeds from
  `catalogue.json`. Client edits are lost.

Notes on the imported content:

- Every product on the live site is listed without a price, so all 32 seed as
  **"Price on request"**. Enter a price per product in the admin panel to show one.
- The live site's spec tables use "Get in touch with us" as a placeholder value in
  62 rows; those rows are dropped on import. Every product still keeps at least two
  real specifications.
- Typos in the client's marketing copy ("dta", "Accurte", "Continiously", "lsting",
  "Possibilites") have been corrected in the React copy.
- Contact details are taken from the live contact page and are now in
  `frontend/src/lib/company.ts`: **+91-7942706158**, **Info@apslsolutions.co.in**,
  Ground Floor, 4A, Hasanpur, New Delhi - 110092, Mon–Sat 09:30–18:30.
- Still worth confirming: whether `+91-7942706158` is a direct line or an IndiaMART
  call-forwarding number, and the headline figures on the live site (10+ years,
  1000+ clients, 5000+ projects, 50+ professionals), which sit oddly against an LLP
  established in 2022.
