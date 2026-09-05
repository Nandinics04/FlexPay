# Deploy 1Fi (Render + Vercel)

## 1. MongoDB Atlas

1. Create a free M0 cluster.
2. Database Access: add a user.
3. Network Access: add `0.0.0.0/0` for the assignment demo.
4. Copy the URI, for example:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/onefi?retryWrites=true&w=majority`

## 2. Backend on Render

1. Push this repo to GitHub.
2. In [Render](https://render.com), New → Web Service → connect the repo.
3. Settings:
   - Root directory: `backend`
   - Build command: `npm install --include=dev && npm run build`
   - Start command: `npm run start:prod`
4. Environment variables:
   - `MONGODB_URI` = Atlas URI
   - `FRONTEND_ORIGIN` = your Vercel URL (add it after step 3, then redeploy)
   - `NODE_ENV` = `production`
5. Deploy. Open `https://<service>.onrender.com/api/health` and `/api/products`.
6. First boot seeds the 3 products if the collection is empty.

`render.yaml` at the repo root can also be used with Render Blueprint.

## 3. Frontend on Vercel

1. In [Vercel](https://vercel.com), New Project → import the same GitHub repo.
2. Root directory: `frontend`
3. Framework preset: Vite
4. Environment variable:
   - `VITE_API_URL` = `https://<your-render-service>.onrender.com` (no trailing slash)
5. Deploy. Product URLs such as `/products/iphone-17-pro` work because `frontend/vercel.json` rewrites to `index.html`.
6. Copy the Vercel URL into Render `FRONTEND_ORIGIN` and redeploy the API.

## 4. Smoke test

- `https://<vercel>/`
- `https://<vercel>/products/iphone-17-pro`
- `https://<vercel>/products/samsung-s24-ultra`
- `https://<vercel>/products/oneplus-13`
- Change color/storage, select an EMI plan, click Proceed.
