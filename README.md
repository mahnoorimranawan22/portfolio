# Mahnoor Imran — Portfolio

A premium, responsive portfolio built with **React + Vite**, powered by a custom
**design system** (`src/index.css`) — a single source of truth for every visual
decision on the site.

## Quick start

```bash
npm install
npm run dev:all   # frontend (Vite, :5173) + API (Express, :4000) together
npm run dev       # frontend only
npm run server    # API only
npm run build     # production build
npm run lint      # oxlint
npm run preview   # preview the production build
```

## Backend REST API (Node.js + Express)

The frontend and backend are fully separated:

- `src/` — React + Vite frontend (served by Vite in dev, static files in prod)
- `server/` — Express API (`server/index.js`), environment-driven via `.env`
- `data/` — shared single-source-of-truth JSON (projects, skills, experience),
  bundled into the frontend for offline fallback AND served by the API

In development, Vite proxies `/api` → `http://localhost:4000` (see
`vite.config.js`), so the frontend calls same-origin paths and CORS is a
non-issue. The frontend always renders bundled data first and upgrades it from
the API when reachable — the site never depends on the backend being up.

### Endpoints

Public (no auth):

| Method | Path              | Description                                      |
| ------ | ----------------- | ------------------------------------------------ |
| GET    | `/api/health`     | Health check (`status`, `env`, `time`)           |
| GET    | `/api/projects`   | All projects; `?category=ai\|fullstack\|frontend\|all&limit=1..50` |
| GET    | `/api/skills`     | Skills grouped by category                       |
| GET    | `/api/experience` | Education & journey timeline                     |
| POST   | `/api/contact`    | Submit a contact message (validated + rate-limited) |

Admin (JWT-protected via `Authorization: Bearer <token>`):

| Method | Path                                  | Description                        |
| ------ | ------------------------------------- | ---------------------------------- |
| POST   | `/api/admin/auth/login`               | Login → JWT token                  |
| GET    | `/api/admin/overview`                 | Dashboard stats & recent activity  |
| GET/POST | `/api/admin/projects`               | List (search/category/featured) / create |
| PUT/DELETE | `/api/admin/projects/:id`        | Update / delete project            |
| GET/POST | `/api/admin/skills`                | List (search) / add skill          |
| PUT/DELETE | `/api/admin/skills/:id`          | Update / delete skill              |
| POST/DELETE | `/api/admin/skills/categories`  | Add / remove skill categories      |
| GET/POST | `/api/admin/experience`           | List / add timeline entries        |
| PUT/DELETE | `/api/admin/experience/:id`      | Update / delete entry              |
| GET/DELETE | `/api/admin/messages`             | List (search/read filter) / delete |
| PATCH | `/api/admin/messages/:id/read`        | Mark read/unread                   |

All responses use a consistent envelope: `{ data, meta }` for success and
`{ error: { code, message, details? } }` for failures. Unknown routes return
JSON 404; validation failures return 400 with per-field `details`.

### Private admin dashboard

Open `#/admin` on the deployed site (or `http://localhost:5174/#/admin` in dev)
and log in with the admin account from `.env`. The dashboard is a code-split
React app (`src/admin/`) themed charcoal + warm-white + emerald + coral:

- **Overview** — counts, projects-by-category, recent messages
- **Projects / Skills / Experience** — searchable, filterable tables with
  add / edit / delete modals
- **Messages** — inbox with read/unread states, detail view, delete

### Configuration (`.env`)

Copy `.env.example` to `.env` and adjust:

- `PORT` — API port (default `4000`)
- `CLIENT_ORIGIN` — comma-separated allowed CORS origins
- `CONTACT_RATE_LIMIT_MAX` / `CONTACT_RATE_LIMIT_WINDOW_MS` — per-IP contact rate limit
- `MAX_MESSAGES` — contact messages kept in the file store
- `MESSAGES_FILE` — where contact messages are persisted (gitignored)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — the dashboard's single admin account
- `JWT_SECRET` — long random secret for signing sessions
- `JWT_EXPIRES_IN` — session lifetime (default `12h`)

Security: `helmet` headers, CORS restricted to `CLIENT_ORIGIN`, `express.json`
body-size cap, per-IP rate limiting on contact **and** login, bcrypt password
hashing, JWT sessions, HTML/control-char sanitization, and a central error
handler that never leaks stack traces to clients.

## ✦ Design system

The whole site is styled from design tokens defined in `:root` inside
`src/index.css`. Components only ever reference tokens — no hardcoded colors or
spacings.

### Color palette

| Token           | Hex       | Role                          |
| --------------- | --------- | ----------------------------- |
| `--brand-500`   | `#3b82f6` | Primary (royal blue)          |
| `--violet-500`  | `#8b5cf6` | Secondary (electric violet)   |
| `--emerald-500` | `#10b981` | Accent (success / terminal)   |
| `--cyan-400`    | `#22d3ee` | Diagram / code highlights     |
| `--surface-0`   | `#04060c` | Page background (deep navy)   |
| `--text-hi`     | `#f8fafc` | Headings                      |
| `--text-lo`     | `#8fa3bd` | Secondary text                |

Semantic aliases (`--primary`, `--secondary`, `--accent`) plus `-rgb` variants
are available for building translucent fills, e.g.
`rgba(var(--primary-rgb), 0.12)`.

### Typography

- **Display:** Outfit — headings, buttons, badges
- **Body:** Inter — paragraphs, forms
- **Mono:** JetBrains Mono — flow diagrams, API terminal

Type scale is fluid via `clamp()` (`--fs-display` → `--fs-caption`), with
tight display line-heights and balanced text wrapping on headings.

### Spacing & layout

- 4px-based scale: `--space-1` … `--space-24`
- Section padding: `--section-pad` (fluid `clamp`)
- Page gutter: `--gutter` · max content width: `--container-max`

### Components & utilities

- `.btn` + `.btn-primary` / `.btn-secondary` / `.btn-ghost` and `.btn-sm` / `.btn-lg`
- `.glass-panel` — frosted glass card with blur, gradient fill and hover glow
- `.chip` (+ `.chip-emerald`, `.chip-violet`) — tags & badges
- `.field` — form inputs with focus rings
- `.section-head` + `.eyebrow` — consistent section headers
- `.gradient-text` — brand gradient text
- `.reveal` — scroll-reveal animation (driven by `IntersectionObserver` in `App.jsx`)
- `.container`, `.grid`, spacing helpers (`.mt-*`, `.mb-*`)

### Motion

All transitions use the shared easing curves `--ease-out` / `--ease-spring`.
Keyframes (caret blink, orb drift, halo pulse, toast, fade-up) live in the
motion section of the stylesheet.

### Accessibility

- High-contrast text scale against the dark surfaces
- Visible `:focus-visible` rings on interactive elements
- `prefers-reduced-motion` support disables animations and reveals
- Semantic landmarks, ARIA labels on icons, `aria-live` for the typewriter and terminal

## Structure

```
src/
├── App.jsx                  # Page composition + global effects (progress, reveal, toast)
├── main.jsx                 # React entry
├── index.css                # ✦ THE DESIGN SYSTEM
└── components/
    ├── CanvasPlexus.jsx     # Animated particle-network background
    ├── Navbar.jsx           # Sticky glass nav + scroll-spy + mobile drawer
    ├── Hero.jsx             # Typewriter headline + avatar halo
    ├── About.jsx            # Profile grid + info chips
    ├── Skills.jsx           # Animated progress cards
    ├── Projects.jsx         # Project cards
    ├── FullStackShowcase.jsx# Architecture tabs + ASCII diagrams + API terminal
    ├── Contact.jsx          # Contact list + form (toast feedback)
    └── Footer.jsx
```
