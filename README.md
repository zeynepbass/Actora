# Actora

Actora is a fitness community web app. Members share workout and nutrition posts, set a weight goal with a deadline, and follow their progress. The interface is in Turkish.

![Feed on desktop](docs/screenshots/feed-desktop.png)

## What it solves

People working towards a weight goal usually keep their plan in one place and their motivation in another. Actora puts both together: a personal goal with a countdown, and a feed where trainers and members post what they actually did. When a goal period ends, the app prompts the member to share the outcome or quietly close the goal and start a new one.

## Features

- **Accounts** – registration with a role (`Eğitmen` or `Eğitici`), sign-in, sign-out.
- **Feed** – posts with a photo, title and description; search by title, description or author; filter by role; like posts.
- **Your posts** – create posts, pin them to the top of your list, delete them.
- **Saved posts** – bookmark posts from the feed; bookmarks are stored on the device.
- **Profile** – photo, personal details, weight, height, target weight and goal length in days.
- **Goal tracking** – progress bar for the goal period and an analysis dialog with the time elapsed and the planned weight path from current to target weight.
- **Goal completion** – when the period ends, share the result as a post (what you ate, daily steps) or skip; either way the goal is cleared.
- **BMI calculator** – available to the `Eğitmen` role.
- **Account controls** – freeze the account (posts are hidden until the next sign-in) or delete it together with its posts.
- **Light and dark themes** – follows the system preference and remembers a manual choice.

## Screenshots

All images are captures of the running application with demo data.

| Sign in | Feed (dark theme) |
| --- | --- |
| ![Sign-in page](docs/screenshots/login-desktop.png) | ![Feed in dark theme](docs/screenshots/feed-desktop-dark.png) |

| Profile | Goal analysis |
| --- | --- |
| ![Profile page](docs/screenshots/profile-desktop.png) | ![Goal analysis dialog](docs/screenshots/goal-analysis-desktop.png) |

| New post | |
| --- | --- |
| ![Post composer dialog](docs/screenshots/post-composer-desktop.png) | |

Mobile (390 px wide):

| Sign in | Feed | Profile | Goal analysis |
| --- | --- | --- | --- |
| ![Sign-in page on mobile](docs/screenshots/login-mobile.png) | ![Feed on mobile](docs/screenshots/feed-mobile.png) | ![Profile on mobile](docs/screenshots/profile-mobile.png) | ![Goal analysis on mobile](docs/screenshots/goal-analysis-mobile.png) |

## Tech stack

| Area | Technology | Used for |
| --- | --- | --- |
| Web | Next.js 15 (App Router), React 19 | Routing, rendering, image optimisation |
| | Tailwind CSS 3 | Styling, driven by design tokens in `globals.css` |
| | TanStack Query | Server-state caching and mutations |
| | Axios | API client with auth and error handling in one place |
| | Recharts | Goal analysis charts (loaded on demand) |
| | Heroicons | Icons |
| API | Node.js, Express 4 | REST API |
| | MongoDB, Mongoose 7 | Data storage |
| | JSON Web Tokens, bcryptjs | Sessions and password hashing |
| | Multer | Image uploads |
| | express-rate-limit | Throttling sign-in and registration attempts |
| Tooling | ESLint, Vitest, `node:test` | Linting and tests |

## Architecture

The repository holds two independent npm projects.

```
frontend/                 Next.js web client
  src/app/                Routes, root layout, global styles, error and 404 pages
    (app)/                Signed-in pages (feed, saved posts, profile) behind the app shell
  src/components/ui/      Shared building blocks: Button, Field, Dialog, Tabs, Toast, ...
  src/components/layout/  App shell, header, mobile navigation, theme toggle
  src/features/           auth/, posts/, profile/ – screens, API calls and logic per feature
  src/lib/                API client, localStorage store, formatting and media helpers
  tests/                  Unit tests
server/                   Express API
  app.js, index.js        App factory and start-up
  config/                 Environment validation and database connection
  routes/, controllers/   HTTP layer
  middleware/             Authentication, uploads, error handling
  models/                 Mongoose schemas
  utils/                  Validation, serialisation, image type detection
  uploads/                Uploaded images (not committed)
  tests/                  Unit tests
docs/screenshots/         Images used in this README
```

Design decisions worth knowing:

- **Sessions** are bearer tokens. The web client keeps the session in `localStorage` and sends the token on every request; a `401` response ends the session and returns the user to the sign-in page.
- **Authorisation is enforced on the server.** Every route except sign-in and registration requires a token. Account routes only work for the account in the token; posts can only be changed by their author. The author of a new post comes from the session, not the request body.
- **API responses are shaped explicitly.** Password hashes, author e-mail addresses and the list of users who liked a post never leave the server; posts carry `benim` (mine) and `begendi` (liked) flags instead.
- **Design tokens** for colour are CSS variables in `frontend/src/app/globals.css`, exposed to Tailwind in `tailwind.config.js`. Light and dark themes only swap variable values.
- **Dialogs** use the native `<dialog>` element, which provides the focus trap, Escape handling and inert background.
- **Pure logic is separated from components** (BMI, goal progress, pinning, search, validation) so it can be unit-tested without a browser or database.

### API overview

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/kayit` | Register |
| POST | `/login` | Sign in; reactivates a frozen account |
| GET | `/kullanici/:id` | Own profile |
| PUT | `/hesap/:id` | Update profile (JSON or multipart with `resim`), or freeze the account |
| DELETE | `/kullanici/:id` | Delete account and its posts |
| GET | `/post` | Feed, newest first (latest 200 posts) |
| POST | `/post` | Create a post (multipart with `resim`) |
| GET / PUT / DELETE | `/post/:id` | Read, edit or delete a post (edit and delete: author only) |
| POST | `/post/:id/begen` | Like or unlike a post |

## Getting started

Requirements: Node.js 20 or newer and a MongoDB database.

### 1. API

```bash
cd server
npm install
cp .env.example .env    # then fill in the values
npm run dev
```

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Secret for signing session tokens, at least 32 characters |
| `PORT` | no | Port to listen on (default `5233`) |
| `CLIENT_ORIGIN` | no | Comma-separated web origins allowed by CORS (default `http://localhost:3000`) |
| `TRUST_PROXY` | no | Number of reverse proxies in front of the API (default `0`) |

The server refuses to start if a required variable is missing.

### 2. Web client

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_BASE_PATH` | yes | Base URL of the API, e.g. `http://localhost:5233` |

Open <http://localhost:3000>.

## Scripts

| Location | Command | Description |
| --- | --- | --- |
| `frontend` | `npm run dev` | Development server |
| | `npm run build` / `npm run start` | Production build and server |
| | `npm run lint` | ESLint |
| | `npm test` | Unit tests (Vitest) |
| `server` | `npm run dev` | API with automatic restart on changes |
| | `npm start` | API |
| | `npm test` | Unit tests (`node:test`) |

## Testing

```bash
cd frontend && npm run lint && npm test && npm run build
cd server && npm test
```

The unit tests cover input validation, token and ownership checks, upload type detection, response serialisation, environment validation, BMI and goal calculations, pinning, search, media URL handling and error messages. There are no automated component or end-to-end tests in the repository yet.

## Deployment

- **API** – `server/Procfile` starts the API with `node index.js` on platforms that read Procfiles. Set the environment variables above, set `CLIENT_ORIGIN` to the deployed web origin and `TRUST_PROXY` to the number of proxies in front of the app. Uploaded images are written to `server/uploads` on local disk, so the host needs persistent storage (see limitations).
- **Web client** – a standard Next.js application: `npm run build` then `npm run start`, or any host that supports Next.js. `NEXT_PUBLIC_BASE_PATH` must be set at build time because it is compiled into the client and used to allow the API host for image optimisation.

## Security, accessibility and performance

- Passwords are hashed with bcrypt; sign-in failures do not reveal whether an e-mail exists; sign-in and registration are rate-limited.
- Uploads are limited to JPEG, PNG, WebP and GIF up to 5 MB, checked by file signature, stored under generated names and served with `nosniff` and a restrictive Content-Security-Policy.
- Request bodies are validated and only whitelisted profile fields can be changed.
- Forms use labelled native controls with inline errors, dialogs manage focus, interactive targets are at least 44 px on touch layouts, a skip link is provided and reduced-motion preferences are respected.
- The charting library is loaded only when the analysis dialog opens, and post images go through `next/image` with fixed aspect ratios to avoid layout shift.

## Known limitations

- The session token is kept in `localStorage`, so it would be readable by injected scripts if an XSS flaw were ever introduced. There is no refresh token; sessions last one day.
- No Content-Security-Policy is set for the web client itself.
- Uploaded images live on the API server's local disk; there is no object storage or CDN integration.
- The feed returns the latest 200 posts without pagination.
- Saved and pinned posts are stored per device and do not sync between devices. Saved posts are snapshots and do not update if the original changes.
- There is no password reset, e-mail verification, post editing UI or commenting.
- `npm audit` for the web client still reports advisories in build-time tooling that can only be cleared by major upgrades (Next.js 16 and Tailwind CSS 4).
- "Actora" is a working product name; trademark and domain availability have not been checked.

## License

The repository does not include a license file. `server/package.json` declares `ISC`; add a `LICENSE` file to make the terms explicit.
