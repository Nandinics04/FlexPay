# 1Fi Product EMI App

Full-stack product page for shopping smartphones on EMI, similar to Snapmint. Product details, variants, prices, images, and EMI plans are loaded from MongoDB through NestJS APIs. Nothing is hardcoded in the UI.

## Tech stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, React Router
- **Backend:** NestJS, Mongoose
- **Database:** MongoDB (local Docker or MongoDB Atlas)
- **Hosting:** Vercel (frontend) and Render (API)

## Project structure

```
1Fi/
  backend/     NestJS API
  frontend/    React app
  docker-compose.yml
  README.md
```

## Schema

Each `products` document stores the catalog item, its buyable variants, and EMI rules.

```
Product
  slug            unique URL key, e.g. iphone-17-pro
  name
  brand
  category          smartphones | laptops | tablets
  description
  highlights[]
  variants[]
    sku
    color
    storage
    mrp
    sellingPrice
    imageUrl
  emiPlans[]
    id
    tenureMonths
    interestRate
    cashbackAmount
    cashbackLabel
    backingFund
```

Monthly EMI is **not stored**. The API (and UI) compute it from the selected variant price:

`monthly = round(sellingPrice * (1 + interestRate/100 * tenureMonths/12) / tenureMonths)`

Seeded catalog:

| Slug | Product | Variants |
|---|---|---|
| `iphone-17-pro` | Apple iPhone 17 Pro | Silver / Cosmic Orange × 256 GB / 512 GB |
| `samsung-s24-ultra` | Samsung Galaxy S24 Ultra | Titanium Black / Titanium Gray × 256 GB / 512 GB |
| `oneplus-13` | OnePlus 13 | Midnight / Arctic × 256 GB / 512 GB |

Each product has three EMI plans: 3 months 0%, 6 months 0% + ₹1,500 cashback, 12 months 10.5%.

## Setup and run

### 1. Database

**Option A — Docker (local)**

```bash
docker compose up -d
```

Uses `mongodb://127.0.0.1:27017/onefi`.

**Option B — Local MongoDB already installed**

If MongoDB is running as a Windows service on port 27017, you can skip Docker. The default URI is `mongodb://127.0.0.1:27017/onefi`.

**Option C — MongoDB Atlas**

1. Create a free cluster.
2. Add a database user.
3. Network Access: allow your IP, or `0.0.0.0/0` for a demo.
4. Copy the connection string.

### 2. Backend

```bash
cd backend
copy .env.example .env
```

Set `MONGODB_URI` in `.env` if you use Atlas. Set `JWT_SECRET` to any long random string. Google sign-in also needs `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` (see `.env.example`).

```bash
npm install
npm run seed
npm run start:dev
```

`npm run seed` loads [backend/seed/products.json](backend/seed/products.json) into MongoDB. Each color has its own product photo (for example Cosmic Orange vs Black on iPhone 17 Pro Max). After that, `GET /api/products` and `GET /api/products/:slug` only read from the `products` collection.

Search: `GET /api/products?q=iphone`

The API starts on `http://localhost:3000`. In Compass, open database `onefi` → collection `products`. Change a price there and refresh the page — the UI updates from the database.

### 3. Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

The Vite app starts on `http://localhost:5173` and proxies `/api` to the NestJS server.

Open:

- http://localhost:5173/
- http://localhost:5173/products/iphone-17-pro
- http://localhost:5173/products/samsung-s24-ultra
- http://localhost:5173/products/oneplus-13

## API endpoints

Base URL (local): `http://localhost:3000/api`

### `GET /api/health`

```json
{ "status": "ok", "service": "1fi-api" }
```

### `GET /api/products`

Returns the catalog for the home page.

```json
[
  {
    "slug": "iphone-17-pro",
    "name": "Apple iPhone 17 Pro",
    "brand": "Apple",
    "startingPrice": 134900,
    "mrp": 139900,
    "imageUrl": "https://images.unsplash.com/..."
  }
]
```

### Auth

The home catalog is public. Product details and EMI plans require a JWT.

- `POST /api/auth/register` — `{ name, email, password }`
- `POST /api/auth/login` — `{ email, password }`
- `GET /api/auth/me` — `Authorization: Bearer <token>`
- `POST /api/auth/logout`
- `GET /api/auth/google` — starts Google OAuth (`?next=/products/iphone-16`)
- `GET /api/auth/google/callback` — Google returns here, then redirects to the frontend with `?token=`

Password must be at least 8 characters.

### `GET /api/products/:slug`

Requires `Authorization: Bearer <token>`. Returns one product, its variants, and EMI plans. Optional `?sku=` selects which variant the monthly amounts are calculated for.

Example: `GET /api/products/iphone-17-pro`

```json
{
  "slug": "iphone-17-pro",
  "name": "Apple iPhone 17 Pro",
  "brand": "Apple",
  "description": "iPhone 17 Pro with a pro camera system...",
  "highlights": ["Storage options: 256 GB and 512 GB"],
  "variants": [
    {
      "sku": "iphone-17-pro-silver-256",
      "color": "Silver",
      "storage": "256 GB",
      "mrp": 139900,
      "sellingPrice": 134900,
      "imageUrl": "https://images.unsplash.com/..."
    }
  ],
  "emiPlans": [
    {
      "id": "emi-3m-0",
      "tenureMonths": 3,
      "interestRate": 0,
      "cashbackAmount": 0,
      "cashbackLabel": null,
      "monthlyAmount": 44967
    },
    {
      "id": "emi-6m-0-cb",
      "tenureMonths": 6,
      "interestRate": 0,
      "cashbackAmount": 1500,
      "cashbackLabel": "₹1,500 cashback on first EMI",
      "monthlyAmount": 22483
    },
    {
      "id": "emi-12m-10",
      "tenureMonths": 12,
      "interestRate": 10.5,
      "cashbackAmount": 0,
      "cashbackLabel": null,
      "monthlyAmount": 12422
    }
  ]
}
```

Unknown slugs return `404`.

## Deploy

See [DEPLOY.md](DEPLOY.md) for Render + Vercel steps.


