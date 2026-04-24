# PlannerOS Project Summary

Updated: 2026-04-23

PlannerOS is a React 19 + Vite SPA served by Express from `server.ts`. It uses Firebase Auth, Firestore planner sync, Stripe checkout, and optional Hotmart webhooks.

Recent launch-hardening changes:
- Pro is treated as a one-time "Pro Pass", not a subscription. Stripe checkout uses `mode: "payment"`.
- Production boot requires Firebase Admin credentials because payment webhooks grant access.
- `APP_URL` controls Stripe success/cancel URLs in production.
- Hotmart purchases made before account creation are stored in `pending_hotmart_purchases`; authenticated users claim them via `/api/access/sync-hotmart`.
- Legal pages exist at `/terms`, `/privacy`, and `/refunds`.
- `npm start` uses `tsx server.ts`.
- `npm run check:prod-env` validates production environment readiness without printing secrets.
- Firestore rules deploy through `firebase.json` to database `ai-studio-080cf906-17e2-4a53-8769-8407f39f60e8` in project `gen-lang-client-0779193048`.
- Server-side Firebase Admin uses `FIRESTORE_DATABASE_ID` and defaults to the same custom database as the frontend.

Verification:
- `npm run lint` passes.
- `npm run build` passes with a large bundle warning.

Remaining launch work:
- Configure real `APP_URL`, Stripe live keys/webhook, Firebase Admin credential, support email/domain.
- Run live/test checkout and webhook end-to-end before accepting paid traffic.
- Consider code splitting to reduce the >500 kB bundle warning.
