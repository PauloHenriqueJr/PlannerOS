# PlannerOS

Cloud-based digital planners with Firebase Auth, Firestore sync, Stripe checkout, and optional Hotmart webhooks.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run check:prod-env
npm start
```

`npm run dev` starts the Express + Vite app on `http://localhost:3000`.

## Production Checklist

Required environment variables:

```bash
NODE_ENV=production
APP_URL=https://your-domain.com
PORT=3000
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FIREBASE_SERVICE_ACCOUNT_BASE64=...
FIRESTORE_DATABASE_ID=ai-studio-080cf906-17e2-4a53-8769-8407f39f60e8
```

Optional Hotmart support:

```bash
HOTMART_HOTTOK=...
```

Firebase Admin credentials are required in production because payment webhooks grant planner access in Firestore.

## Payment Flow

- Stripe checkout is created by `POST /api/checkout/stripe`.
- Stripe webhook `POST /api/webhooks/stripe` grants access with `purchasedPlanners`.
- Hotmart webhook `POST /api/webhooks/hotmart` grants access by buyer email.
- If a Hotmart buyer has not created an account yet, the purchase is stored in `pending_hotmart_purchases`.
- After Google login, the app calls `POST /api/access/sync-hotmart` to claim pending Hotmart purchases.

## Firestore

Client writes are restricted to the authenticated user's profile and planner data. Product catalog writes are server/admin only.

Deploy Firestore rules:

```bash
firebase deploy --only firestore --project gen-lang-client-0779193048
```
