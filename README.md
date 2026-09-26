# Rebel Watches

Full-stack ecommerce store for **Rebel Watches** — a curated luxury watch shop with a customer storefront and an admin console.

| | |
| --- | --- |
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS 4, Redux Toolkit |
| **Backend** | Express 5, MongoDB (Mongoose), JWT cookies, Passport Google OAuth |
| **Services** | Cloudinary (images), Gmail / Nodemailer (email) |

There is no root `package.json`. Install and run `frontend/` and `backend/` separately.

## Features

**Storefront**
- Home, catalog, product pages, collections, and search
- Cart, checkout (cash on delivery or online), and order tracking
- Email/password auth with OTP signup, Google login, and password reset
- Customer profile (orders and refunds)

**Admin** (`/admin`)
- Products, categories, and homepage carousels
- Orders, payment verification, and refunds
- Shipping fees
- Super-admin user management

## Project structure

```
frontend/     Next.js storefront + admin UI
backend/      Express API, models, and auth
```

## Prerequisites

- Node.js and npm
- MongoDB
- Cloudinary account (image uploads)
- Gmail credentials for Nodemailer
- Google OAuth credentials (Google login)

## Setup

```bash
git clone <your-repo-url>
cd Ecommerce

cd frontend && npm install
cd ../backend && npm install
```

Create env files (see below). Then run two terminals:

```bash
# terminal 1
cd backend
npm start          # node server.js
# or: npm run dev  # nodemon server.js (nodemon is not in package.json)

# terminal 2
cd frontend
npm run dev        # http://localhost:3000
```

`NEXT_PUBLIC_API_URL` and `API_URL` must include the `/api` prefix (routers are mounted under `/api`). Example: `http://localhost:5000/api`.

`CLIENT_URL` must match the frontend origin (default CORS fallback is `http://localhost:3000`).

There is no admin seed script. Insert the first admin in MongoDB (`username`, hashed `password`, `role`: `admin` or `super admin`).

## Environment variables

Do not commit real secrets. `.env*` files are gitignored.

### Backend — `backend/.env`

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

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default `5000`) |
| `NODE_ENV` | Cookie / error behavior (`production` vs `development`) |
| `CLIENT_URL` | CORS, Google redirects, emails, cache revalidation |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Customer and admin JWTs |
| `JWT_EXPIRES_IN` | Customer token lifetime (default `7d`) |
| `EMAIL_USER` / `EMAIL_PASS` | Gmail SMTP |
| `GOOGLE_*` | Google OAuth |
| `CLOUDINARY_*` | Image uploads |
| `REVALIDATE_SECRET` | Shared secret with the Next.js revalidate routes |

### Frontend — `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
API_URL=http://localhost:5000/api
BACKEND_URL=http://localhost:5000/api
REVALIDATE_SECRET=
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Browser API base (Axios + Google login) |
| `NEXT_PUBLIC_SITE_URL` | Canonical / Open Graph URLs |
| `API_URL` | Server-side fetches (home and product pages) |
| `BACKEND_URL` | Fallback for collections fetch |
| `REVALIDATE_SECRET` | Must match the backend value |

## Scripts

**Frontend**

| Command | Description |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve the build |
| `npm run lint` | ESLint |

**Backend**

| Command | Description |
| --- | --- |
| `npm start` | `node server.js` |
| `npm run dev` | `nodemon server.js` |

## API (overview)

| Prefix | Role |
| --- | --- |
| `GET /` · `GET /health` | Health check |
| `/api/auth` | Customer and admin auth, Google OAuth |
| `/api/general` | Public catalog, search, shipping |
| `/api/admin/product` | Admin products and categories |
| `/api/admin/crousels` | Homepage banners |
| `/api/admin/pror` | Shipping configs |
| `/api/order` | Checkout, tracking, admin order ops |

Customer sessions use an HTTP-only `token` cookie. Admin sessions use `adminToken` (or `Authorization: Bearer`). Axios is configured with `withCredentials: true`.

## Production

```bash
cd frontend && npm run build && npm start
cd backend && npm start
```

Set `NODE_ENV=production` on the API. `NEXT_PUBLIC_*` values must be available at frontend **build** time. This repo has no Docker or host-specific deploy config.

## License

Backend package license: ISC. Frontend package is private.
