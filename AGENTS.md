# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Dev server (Express + Vite) on http://localhost:3000
npm run build    # Vite production build → dist/
npm run lint     # TypeScript type-check only (tsc --noEmit)
npm run preview  # Preview production build
```

No test runner configured.

## Architecture

**Full-stack SPA**: Express (`server.ts`) serves as both API server and Vite dev middleware. In production it serves `dist/` statically.

**Frontend**: React 19 + React Router v7 + Tailwind CSS v4 (via `@tailwindcss/vite`).

**Auth & DB**: Firebase Auth (Google Sign-In) + Firestore. Config loaded from `firebase-applet-config.json`. `src/firebase.ts` exports `db`, `auth`, `googleProvider`.

**State**: Three React Contexts in `src/store.tsx` — `AuthContext` (user + Firebase auth), `PurchasesContext` (purchased planner IDs), `ThemeContext` (dark/light). All wrapped by `AppProvider`. No external state lib.

**Cloud sync**: `src/lib/useCloudSync.ts` — custom hook that syncs any JSON state to Firestore path `users/{uid}/planner_data/{docId}`. Debounced 700ms writes with optimistic local updates. Used by planner views to persist tasks, habits, notes.

**Payments**: Stripe checkout via `/api/checkout/stripe`. Stripe webhook at `/api/webhooks/stripe` grants access by writing to Firestore. Hotmart webhook at `/api/webhooks/hotmart` (partially implemented). After payment, `purchasedPlanners` array on user's Firestore doc controls access.

**Routes**:
- `/` → `Home` (marketing landing)
- `/login` → inline `Login` component in `App.tsx`
- `/dashboard` → `Dashboard` (user's planner library)
- `/planner/:id` → `PlannerApp` (the actual planner UI)
- `/checkout/:productId` → `Checkout`

**Products**: Defined as `PRODUCTS` array in `src/store.tsx`. Each product has `id`, i18n key refs, `priceUsd`, `priceBrl`. Product `id` maps to planner type rendered in `PlannerApp`.

**i18n**: All UI strings use `react-i18next`. All translations (EN + PT) are inline in `src/i18n.ts`. Language auto-detected; toggle in header switches between `en`/`pt`.

## Design System

CSS vars defined in `src/index.css`, used as Tailwind utilities via `@theme`:

| Token | Tailwind class | Light | Dark |
|-------|---------------|-------|------|
| Background | `bg-paper` | `#F8F5F2` | `#1C1B1A` |
| Text | `text-ink` | `#3D3D3D` | `#E8E1D9` |
| Border | `border-line` | `#E8E1D9` | `#383431` |
| Accent | `text-accent` / `bg-accent` | `#A6927C` | `#D4B895` |
| Sidebar | `bg-sidebar` | `#FAF9F7` | `#242220` |

Fonts: `font-sans` = Inter, `font-serif` = Cormorant Garamond.

Dark mode toggled via `.dark` class on `<html>` — managed by `ThemeContext`.

## Environment Variables

Required in `.env` (or `.env.local`):
- `GEMINI_API_KEY` — exposed to frontend via Vite's `define`
- `STRIPE_SECRET_KEY` — server-side only
- `STRIPE_WEBHOOK_SECRET` — server-side only
- `HOTMART_HOTTTOk` — server-side only (note the typo in the env key)

Firebase credentials for Admin SDK: set `GOOGLE_APPLICATION_CREDENTIALS` or place `service_account.json` in root. Firebase init failure is silently caught (webhook grant won't work without it).
