# 1Fi API

NestJS + MongoDB API for the 1Fi product EMI app.

See the root [README.md](../README.md) for setup, schema, seed data, and example responses.

```bash
copy .env.example .env
npm install
npm run seed
npm run start:dev
```

`npm run seed` inserts `seed/products.json` into MongoDB. API routes only query the database.
