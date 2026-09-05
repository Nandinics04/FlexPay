# Demo video (2–5 minutes)

Upload the recording to Google Drive or YouTube with **anyone who has the link can view**. Then submit:

https://forms.gle/V4vqbcSAhJV7BqoAA

## Suggested script (~3 minutes)

1. **Intro (15s)** — This is the 1Fi SDE1 assignment: React + NestJS + MongoDB product EMI page.
2. **Database (30s)** — Open MongoDB Atlas (or Compass). Show the `products` collection: 3 phones, variants, EMI plans.
3. **Backend (40s)** — Open `/api/products` and `/api/products/iphone-17-pro` in the browser. Point out prices, images, and EMI fields coming from the database.
4. **Frontend (90s)**
   - Home page lists all 3 products.
   - Open `/products/iphone-17-pro`.
   - Switch color and storage; image, MRP, selling price, and monthly EMI update.
   - Select the 6-month cashback plan, click **Proceed**.
   - Confirm page shows variant + monthly + tenure + interest + cashback.
   - Repeat quickly for Samsung and OnePlus unique URLs.
5. **Close (15s)** — Mention the GitHub repo and the live Vercel/Render links.

## What reviewers must see

- Data is not hardcoded in the frontend.
- Unique product URLs.
- At least 3 products, each with 2+ variants.
- Selectable EMI plans and a proceed action.
