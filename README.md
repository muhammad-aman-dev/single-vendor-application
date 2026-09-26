# Rebel Watches

Full-stack ecommerce storefront and admin console for **Rebel Watches**, a curated luxury watch shop. The repository is split into two independent npm packages:

- `frontend/` — Next.js App Router storefront and admin UI (`rebel-watches`)
- `backend/` — Express API, MongoDB models, authentication, and order processing

There is no root `package.json`. Install and run each app from its own directory.

---

## 1. Project overview

Rebel Watches is a cookie-authenticated ecommerce application. Customers browse products, collections, and search; they can register with email (OTP) or Google OAuth, manage a cart, and place orders with **cash on delivery** or **online** payment. Admins (and super admins) manage products, categories, homepage carousels, shipping fees, orders, refunds, and other admins.

Store metadata in the frontend names the brand **Rebel Watches** and uses `https://rebelwatches.com` as a fallback site URL when `NEXT_PUBLIC_SITE_URL` is unset.

---

## 2. Features

### Storefront

- Home page with ISR (`revalidate = 3600`) and cached homepage API data (`tags: ["homepage"]`)
- Product catalog (`/products`) with client-side catalog fetching
- Product detail pages by slug (`/products/[slug]`)
- Collections listing (`/collections`) and dynamic collection pages (`/collections/[type]`)
- Product search (`/search`)
- About and contact pages
- Cart with server-side cart validation and checkout (`/cart`)
- Customer login, signup (email OTP + register), and Google OAuth
- Forgot / reset password
- Profile: orders, approved refunds, logout, update password
- Public order tracking (`/track?orderId=...`)
- Redux store for auth, admin auth, cart, and shipping
- Image hosting via Cloudinary URLs (Next.js `images.remotePatterns` includes `res.cloudinary.com`)

### Admin console (`/admin`)

- Admin login (`/admin/login`) using username/password against the `Admin` collection
- Dashboard
- Products: list, status toggle, add, edit
- Categories
- Homepage carousels (stored as `Carousel` documents; routes use the spelling **crousels**)
- Orders list and order detail (status, payment verification, refunds)
- Shipping fee CRUD and activate-one-active-config
- Refund request marking
- Super-admin: list / create / delete admins
- Change admin password

### Backend capabilities

- JWT in HTTP-only cookies (`token` for customers, `adminToken` for admins)
- Google OAuth 2.0 via Passport
- Gmail Nodemailer (welcome, OTP, password recovery, order emails)
- Cloudinary image upload/delete for products, categories, and carousels
- Multer uploads (disk `/tmp`, 5 MB limit; product routes accept up to 6 images)
- On-demand Next.js cache revalidation from the API (`CLIENT_URL` + `REVALIDATE_SECRET`)
- MongoDB connection with automatic reconnect every 5 seconds on failure

---

## 3. Tech stack

### Frontend (`frontend/package.json`)

| Area | Technology |
| --- | --- |
| Framework | Next.js `^16.3.4` (App Router) |
| UI | React `^19.2.8`, Tailwind CSS `^4`, PostCSS (`@tailwindcss/postcss`) |
| State | Redux Toolkit, React Redux |
| HTTP | Axios (`withCredentials: true`) |
| Forms / UX | react-hook-form, react-toastify, sweetalert2, framer-motion, lucide-react, react-icons |
| Editors | react-quill-new, react-simplemde-editor |
| Other UI | react-slick / slick-carousel, recharts, @react-pdf/renderer, browser-image-compression |
| Auth package listed | `next-auth` is in `dependencies` but is **not imported** anywhere in the source |
| Lint | ESLint 9 with `eslint-config-next` (core-web-vitals) |
| Compiler | `reactCompiler: true` in `next.config.mjs`; `babel-plugin-react-compiler` in devDependencies |

### Backend (`backend/package.json`)

| Area | Technology |
| --- | --- |
| Runtime | Node.js, ES modules (`"type": "module"`) |
| HTTP | Express `^5.2.1` |
| Database | MongoDB via Mongoose `^9.9.4` |
| Auth | jsonwebtoken, cookie-parser, passport, passport-google-oauth20, bcryptjs |
| Uploads | multer, cloudinary, streamifier (listed; **not imported** in source) |
| Email | nodemailer (`service: "gmail"`) |
| Other listed deps | axios, cors, dotenv, uuid, bcrypt (native `bcrypt` is listed but source uses **bcryptjs**), express-fileupload (**not imported**), node-cron (**not imported**) |

No Node.js engine version is declared in either `package.json`.

---

## 4. Architecture

```
Browser (Next.js :3000 by default)
    │  Axios / fetch  (credentials)
    ▼
Express API  (PORT or 5000)
    │
    ├── MongoDB (MONGO_URI)
    ├── Cloudinary (product / category / carousel images)
    ├── Gmail SMTP (EMAIL_USER / EMAIL_PASS)
    └── Google OAuth
            │
            └── redirects back to CLIENT_URL
```

- CORS is restricted to `process.env.CLIENT_URL` or `http://localhost:3000`, with `credentials: true`.
- Customer session: JWT cookie name `token` (7-day `maxAge` in `setAuthCookie.js`; JWT `expiresIn` from `JWT_EXPIRES_IN` or `"7d"`).
- Admin session: JWT cookie name `adminToken` (1 day expiry on the token; cookie `maxAge` 24 hours). Admin login currently sets `secure: true` and `sameSite: "none"` unconditionally.
- After catalog/homepage mutations, the API POSTs to Next.js routes under `/api/revalidate/*` with header `x-revalidate-secret`.
- `backend/server.js` builds the Express app, registers routes, connects to MongoDB, and **exports the app**. It does **not** call `app.listen`. See [Troubleshooting](#20-troubleshooting).

---

## 5. Project structure

```
Ecommerce/
├── README.md                 # this file
├── .gitignore
├── frontend/
│   ├── app/                  # Next.js App Router pages and route handlers
│   │   ├── (home)/page.js    # storefront home
│   │   ├── about/, contact/, cart/, login/, signup/, profile/, search/, track/
│   │   ├── products/, collections/
│   │   ├── admin/            # admin login and dashboard
│   │   └── api/revalidate/   # homepage, productPage, collections
│   ├── components/
│   ├── lib/axiosInstance.js  # Axios baseURL = NEXT_PUBLIC_API_URL
│   ├── store/                # Redux slices
│   ├── public/
│   ├── next.config.mjs
│   ├── package.json
│   └── README.md             # default create-next-app notes
└── backend/
    ├── server.js             # Express entry (npm scripts)
    ├── config/               # cloudinary, mailer, passport
    ├── controllers/
    ├── lib/                  # dbConnect, cloudinaryUploader, revalidateFunc
    ├── middleware/           # user JWT, admin JWT, multer
    ├── models/               # User, Admin, Product, Category, Order, Shipping, Crousel
    ├── routes/
    ├── utils/                # generateToken, setAuthCookie
    └── package.json
```

`backend/package.json` lists `"main": "index.js"`, but **there is no `index.js`**. Scripts run `server.js`.

---

## 6. Prerequisites

- **Node.js** and **npm** (versions are not pinned in this repo)
- **MongoDB** reachable at `MONGO_URI`
- **Cloudinary** cloud name, API key, and API secret (image uploads)
- **Gmail** account credentials for Nodemailer (`EMAIL_USER`, `EMAIL_PASS`)
- **Google Cloud OAuth** client ID, secret, and callback URL (Google login)

---

## 7. Installation

From the repository root:

```bash
cd frontend
npm install

cd ../backend
npm install
```

The backend `dev` script is `nodemon server.js`, but **nodemon is not listed** in `backend/package.json` dependencies or lockfile. Install it globally or as a local dev dependency, or use `npm start` (`node server.js`) instead.

---

## 8. Frontend setup

1. `cd frontend`
2. Create environment files (see [Environment variables](#10-environment-variables) and [.env.example instructions](#11-envexample-instructions)).
3. `npm install` if you have not already.
4. Run with `npm run dev` (Next.js default: [http://localhost:3000](http://localhost:3000)).

`NEXT_PUBLIC_API_URL` is used as Axios `baseURL`. Storefront calls look like `/auth/me` and `/general/...`, while Express mounts those routers at `/api/auth` and `/api/general`. In practice the public API URL must include the `/api` prefix (for example `http://localhost:5000/api`) so those paths line up.

Server-side fetches on the home and product pages use `API_URL` the same way (`${API_URL}/general/homepagedata/all`, `${API_URL}/general/products/...`).

---

## 9. Backend setup

1. `cd backend`
2. Create a `.env` file (see below).
3. `npm install`
4. Ensure MongoDB is running and `MONGO_URI` is valid.
5. Run `npm run dev` or `npm start`.

`PORT` defaults to **5000** if unset.

Admins are stored in the `Admin` collection. There is **no seed script** in this repository; you must create the first admin document in MongoDB (or via a super-admin once one exists). Super-admin routes require `role: "super admin"`.

---

## 10. Environment variables

Do not commit real secrets. Root and package `.gitignore` files ignore `.env*` files.

### Backend (`backend/.env`)

| Variable | Used for |
| --- | --- |
| `PORT` | Assigned in `server.js` (`process.env.PORT` or `5000`). Not passed to `app.listen` in the current file (see Troubleshooting). |
| `NODE_ENV` | `"development"` enables error stacks; `"production"` sets customer cookie `secure` and `sameSite: "none"` |
| `CLIENT_URL` | CORS origin; Google success/failure redirects; email links; Next.js revalidation base URL |
| `MONGO_URI` | MongoDB connection string (required; connect throws if missing) |
| `JWT_SECRET` | Customer and admin JWTs, password-reset tokens |
| `JWT_EXPIRES_IN` | Customer JWT lifetime; defaults to `"7d"` |
| `EMAIL_USER` | Gmail / Nodemailer user and From address |
| `EMAIL_PASS` | Gmail / Nodemailer password |
| `GOOGLE_CLIENT_ID` | Passport Google strategy |
| `GOOGLE_CLIENT_SECRET` | Passport Google strategy |
| `GOOGLE_CALLBACK_URL` | Passport Google `callbackURL` (must match the Google Cloud console) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary config |
| `CLOUDINARY_API_KEY` | Cloudinary config |
| `CLOUDINARY_API_SECRET` | Cloudinary config |
| `REVALIDATE_SECRET` | Sent as `x-revalidate-secret` to the frontend revalidate routes |

`orderController.js` also reads `process.env.client_url` (lowercase) in one email template. `CLIENT_URL` is the name used everywhere else.

### Frontend (`frontend/.env.local` or `frontend/.env`)

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Axios `baseURL`; Google OAuth browser redirects (`…/auth/google`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical / Open Graph URLs; fallback `https://rebelwatches.com` on several pages |
| `API_URL` | Server-side fetch for homepage and product-by-slug |
| `BACKEND_URL` | Fallback only on `app/collections/page.js` if `NEXT_PUBLIC_API_URL` is missing |
| `REVALIDATE_SECRET` | Must match the backend value; checked on `POST /api/revalidate/*` |

---

## 11. `.env.example` instructions

The root `.gitignore` is written to **keep** `frontend/.env.example` and `backend/.env.example`, but **those example files are not present** in the repository. Create them locally (and optionally commit them with empty values) using the keys above.

**`backend/.env.example`**

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGO_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
EMAIL_USER=
EMAIL_PASS=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
REVALIDATE_SECRET=
```

**`frontend/.env.example`**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
API_URL=http://localhost:5000/api
BACKEND_URL=http://localhost:5000/api
REVALIDATE_SECRET=
```

Copy to `.env` / `.env.local` and fill in values. Do not put real credentials in committed example files.

---

## 12. How to run the frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (Next.js default; this repo does not override the port).

Production-style local run after a build:

```bash
cd frontend
npm run build
npm start
```

---

## 13. How to run the backend

```bash
cd backend
npm run dev
```

or:

```bash
cd backend
npm start
```

Scripts:

- `dev` → `nodemon server.js`
- `start` → `node server.js`

Health checks defined in `server.js` (once the process is actually listening):

- `GET /` → `Server is running`
- `GET /health` → `{ "status": "OK", "message": "Server is running smoothly" }`

---

## 14. Available npm scripts

### `frontend/`

| Script | Command |
| --- | --- |
| `npm run dev` | `next dev` |
| `npm run build` | `next build` |
| `npm start` | `next start` |
| `npm run lint` | `eslint` |

### `backend/`

| Script | Command |
| --- | --- |
| `npm run dev` | `nodemon server.js` |
| `npm start` | `node server.js` |
| `npm test` | `echo "Error: no test specified" && exit 1` |

---

## 15. API documentation

Base path prefixes are mounted in `backend/server.js`.

Unless noted, JSON bodies and `credentials` cookies are expected. Admin routes accept `adminToken` cookie or `Authorization: Bearer <token>`. Customer routes use the `token` cookie only (`userAuthCheck`).

### Root

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | Public | Plain text health |
| GET | `/health` | Public | JSON health |
| GET | `/favicon.ico`, `/favicon.png` | Public | `204` empty |

### Auth — `/api/auth`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/register` | Public | Create customer (`name`, `email`, `password`); sets `token` cookie |
| POST | `/login` | Public | Email/password login |
| POST | `/request-otp` | Public | Email 6-digit OTP for signup (response currently includes `otp`) |
| POST | `/logout` | Public | Clears customer `token` cookie |
| GET | `/me` | Customer | Current user from cookie |
| GET | `/admin` | Admin | Same `getMe` handler; used by admin session check |
| POST | `/admin/login` | Public | Admin login; body field is `email` but lookup is **username** |
| POST | `/admin/logout` | Public | Clears `adminToken` |
| PUT | `/admin/change-password` | Admin | Change current admin password |
| GET | `/admin/manage` | Super admin | List admins |
| POST | `/admin/create` | Super admin | Body: `name`, `username`, `password`, optional `role` (`"super admin"` or defaults to `"admin"`) |
| DELETE | `/admin/:id` | Super admin | Delete admin |
| POST | `/forgot-password` | Public | Email recovery OTP; returns `resetToken` |
| POST | `/reset-password` | Public | `email`, `otp`, `newPassword`, `resetToken` |
| PUT | `/update-password` | Customer | Set new password while logged in |
| GET | `/google` | Public | Start Google OAuth; optional `?redirect=/path` (stored in `googleRedirect` cookie) |
| GET | `/google/callback` | Google | Sets `token` cookie and redirects to `CLIENT_URL` |

### User — `/api/user`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/check` | Public | Debug: logs `CLIENT_URL` and responds with the string `process.env.CLIENT_URL` |

### Public catalog — `/api/general`

| Method | Path | Auth | Query / notes |
| --- | --- | --- | --- |
| GET | `/category/all` | Public | All categories |
| GET | `/homepagedata/all` | Public | Homepage payload |
| GET | `/catalog` | Public | `page`, `limit` (default 24, max 100), `seed`, `minPrice`, `maxPrice` |
| GET | `/search` | Public | `query`, `page`, `limit` (default 24, max 48); MongoDB text search |
| GET | `/collections/dynamic` | Public | `type` (required), `page`, `limit`. Special types: `featured-articles`, `men-articles`, `women-articles`, `childrens-articles`, `unisex-articles`. Other types treated as category slugs (`…-articles` suffix stripped) |
| GET | `/products/:slug` | Public | Single product |
| POST | `/cart/validate` | Public | Validate cart contents |
| GET | `/shipping/get-active` | Public | Active shipping config |

### Admin products — `/api/admin/product`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/category/add` | Admin | Multipart field `image` |
| DELETE | `/category/delete/:id` | Admin | Delete category |
| POST | `/add-product` | Admin | Multipart `images` (max 6) |
| PUT | `/edit/update/:slug` | Admin | Multipart `images` (max 6) |
| DELETE | `/:slug` | Admin | Delete product |
| GET | `/admin/all` | Admin | Query: `search`, `status`, `category`, `page` (default 1), `limit` (default 20) |
| PATCH | `/status/:id` | Admin | Update product status |
| GET | `/get-product-edit/:slug` | Admin | Product for edit form |

### Admin carousels — `/api/admin/crousels`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/all` | Public | List banners |
| POST | `/add` | Admin | Multipart field `image` |
| DELETE | `/delete/:id` | Admin | Delete banner |

### Admin shipping — `/api/admin/pror`

(The mount path is `/api/admin/pror` as written in `server.js`.)

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/create-shipping` | Admin | Create shipping config |
| GET | `/all-shipping` | Admin | List all |
| PUT | `/update-shipping/:id` | Admin | Update |
| DELETE | `/del-shipping/:id` | Admin | Delete |
| PATCH | `/activate-shipping/:id/activate` | Admin | Activate (only one `isActive: true` allowed) |

### Orders — `/api/order`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/create-order` | Customer | Body includes `items`, `shippingAddress`, `paymentMethod` (`cod` \| `online`), optional `idempotencyKey`. COD fee is hardcoded `100` in `orderController.js` |
| GET | `/my` | Customer | Current user orders |
| GET | `/my/:id` | Customer | One of current user orders |
| GET | `/my-refunds` | Customer | Approved refunds |
| PATCH | `/:id/received` | Customer | Mark received |
| POST | `/request-refund` | Admin | Create refund request (`userAuthCheck` refund route is commented out) |
| GET | `/orders` | Admin | All orders |
| GET | `/status/:orderId` | Public | Tracking by order id / number |
| GET | `/:id` | Admin | Order by Mongo id |
| PATCH | `/:id/payment-verification` | Admin | Verify/reject payment |
| PATCH | `/:id/status` | Admin | Order status |
| PATCH | `/:id/refund` | Admin | Update refund |

Unknown API paths return `{ "message": "Route not found" }` with status 404.

### Next.js revalidate routes (frontend)

All require header `x-revalidate-secret` matching `REVALIDATE_SECRET`. GET on homepage/collections returns 405.

| Method | Path | Body |
| --- | --- | --- |
| POST | `/api/revalidate/homepage` | none; `revalidateTag("homepage")` and `revalidatePath("/")` |
| POST | `/api/revalidate/productPage` | JSON `{ "tag": "product:<slug>" }` |
| POST | `/api/revalidate/collections` | none; `revalidatePath("/collections")` |

---

## 16. Database setup

- Driver: **Mongoose**, URI from `MONGO_URI`.
- Connection lives in `backend/lib/dbConnect.js`. Options: `bufferCommands: false`, `serverSelectionTimeoutMS: 5000`.
- There are **no migrations, seed files, or Docker Compose** in this repo. Create the database yourself and insert an initial super admin if you need the admin UI.

### Collections / models

| Model file | Collection notes | Main fields |
| --- | --- | --- |
| `User.js` | default `users` | `name`, `email`, `password` (hashed, `select: false`), `googleId`, `avatar`, `role` (`customer` \| `admin`), `authProvider` (`local` \| `google` \| `both`), `isActive`, `isEmailVerified`, `isFreeShippingApplied`, `lastLoginAt` |
| `Admin.js` | default `admins` | `name`, `username` (unique, lowercase), `password`, `role` (`admin` \| `super admin`), `isActive` |
| `Product.js` | explicit collection `"Product"` | `productId`, `name`, `slug`, descriptions, `category`, `gender` (`Men` \| `Women` \| `Unisex` \| `Kids` \| `All`), `images[]`, `price`, `comparePrice`, `stock`, `variations`, `status` (`Active` \| `Out Of Stock` \| `Inactive`), `featured`, `views`, `salesCount`, `seo` |
| `Category.js` | default | `name`, `image` |
| `Order.js` | default | `orderNumber`, `idempotencyKey`, `user`, `items`, `shippingAddress`, `paymentMethod`, `paymentVerification`, `orderStatus`, amounts, refund fields |
| `Shipping.js` | default | `name`, `fee`, `isActive` (partial unique index: only one active) |
| `Crousel.js` | model name `Carousel` | `title`, `imageUrl`, `redirectUrl` |

Product indexes include `{ status, category }`, text search on name/description/category, and homepage sorting fields.

---

## 17. Authentication

### Customers

1. **Email/password**: `POST /api/auth/register` or `/login`. Password min length 8. Google-only accounts without a password are told to use Google.
2. **Signup OTP**: `POST /api/auth/request-otp` emails a 6-digit code. The handler does **not** persist the OTP; it returns `otp` in the JSON (used by the current frontend).
3. **Google**: browser navigates to `{NEXT_PUBLIC_API_URL}/auth/google`. Passport uses `GOOGLE_*` env vars. On success, a customer JWT cookie is set and the user is redirected to `CLIENT_URL` + safe internal path.
4. **Session**: `AuthInitializer` calls `GET /api/auth/me` with cookies.
5. **Password recovery**: forgot-password JWT (`expiresIn: "10m"`) embeds email + OTP; reset requires that token plus OTP.

Customer middleware (`userAuthCheck`) reads `req.cookies.token` only.

### Admins

- Separate `Admin` model (not the User `role: "admin"` field used for customers).
- Login: `POST /api/auth/admin/login` with `{ email, password }` where `email` is treated as **username**.
- JWT payload: `{ id, username, role }`, expires in `1d`.
- `adminAuthCheck` allows `role` `admin` or `super admin`.
- `superAdminAuthCheck` requires `super admin` for manage/create/delete admins.

---

## 18. Build and production instructions

### Frontend

```bash
cd frontend
npm run build
npm start
```

Set production env vars (`NEXT_PUBLIC_*` must be present at **build** time for client bundles). `NODE_ENV` is set by Next.js during `next build` / `next start`.

### Backend

```bash
cd backend
npm start
```

Set `NODE_ENV=production` so customer cookies use `secure: true` and `sameSite: "none"` (required for cross-site cookies). Admin login already forces `secure: true` and `sameSite: "none"`.

There is no production process manager, Docker image, or start script at the repo root.

---

## 19. Deployment instructions

This repository does **not** include `Dockerfile`, `docker-compose`, `vercel.json`, `Procfile`, `render.yaml`, or similar.

What can be inferred:

- Frontend is a standard Next.js app. `frontend/.gitignore` and the root `.gitignore` ignore `.vercel`. The stock `frontend/README.md` from create-next-app mentions Vercel; that is not a project-specific config.
- Backend is a Node Express process started with `node server.js`. Hosting must supply the backend env vars, a MongoDB instance, and a public URL for `CLIENT_URL` / Google callback / CORS.
- Next.js image config allows `https` hosts: `res.cloudinary.com`, `lh3.googleusercontent.com`, `encrypted-tbn0.gstatic.com`, `images.unsplash.com`.
- Multer writes uploads to `/tmp` (typical on Linux hosts).

Exact platform steps are not defined in the codebase.

---

## 20. Troubleshooting

| Symptom | What the code actually does |
| --- | --- |
| Backend process does not accept HTTP | `server.js` never calls `app.listen`. `npm start` / `nodemon` will load the app and connect MongoDB, but nothing in-repo binds a port. |
| `nodemon` not found | `npm run dev` requires nodemon; it is not in `package.json`. Use `npm start` or install nodemon. |
| `MONGO_URI is not defined` | `dbConnect.js` throws if the variable is missing; it retries every 5 seconds after errors. |
| CORS / cookies fail | CORS origin is `CLIENT_URL` or `http://localhost:3000`. Axios uses `withCredentials: true`. Mismatched origins or missing `CLIENT_URL` will block cookies. |
| Admin login fails on `http://localhost` | Admin cookie is always `secure: true` and `sameSite: "none"` (browsers typically require HTTPS). |
| Google OAuth fails | Needs `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, and `CLIENT_URL`. Failure redirects to `{CLIENT_URL}/login?error=google`. |
| Images missing / upload fails | Cloudinary env vars; multer 5 MB limit; product max 6 files. |
| Emails not sending | Nodemailer Gmail `EMAIL_USER` / `EMAIL_PASS`. Signup OTP and order mail depend on this. |
| Homepage empty | Server component requires `API_URL`; logs `API_URL is not configured.` if missing. |
| Axios 404 on `/auth/...` | `NEXT_PUBLIC_API_URL` should include `/api` because routers are mounted under `/api`. |
| Cache stale after admin edits | Backend and frontend `REVALIDATE_SECRET` must match; `CLIENT_URL` must be the Next origin. |
| Collection pages empty for men/women | Frontend labels include `male-articles` / `female-articles`; API special filters are `men-articles` / `women-articles`. |
| `npm test` in backend | Always exits with code 1 (`Error: no test specified`). |

---

## 21. Development workflow

1. Start MongoDB and fill both env files.
2. Terminal A: `cd backend && npm run dev` (or `npm start`).
3. Terminal B: `cd frontend && npm run dev`.
4. Storefront: `http://localhost:3000`. API default port: `5000`.
5. Keep `CLIENT_URL` aligned with the Next origin and `NEXT_PUBLIC_API_URL` / `API_URL` aligned with the Express `/api` base.
6. Edit React/Next files under `frontend/`; edit Express under `backend/`. There is no shared TypeScript, no monorepo tooling, and no CI config in this repo.
7. Frontend lint: `cd frontend && npm run lint`.
8. Admin UI lives under `/admin`; customer auth under `/login` and `/signup`.

---

## Existing documentation

- `frontend/README.md` — default Next.js create-next-app getting started (not project-specific).
- No other markdown docs, OpenAPI spec, or Postman collection are in the repository.

## License

`backend/package.json` sets `"license": "ISC"`. The frontend package is `"private": true`. There is no root `LICENSE` file.
