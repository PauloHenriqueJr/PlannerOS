import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import Stripe from "stripe";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import "dotenv/config";

const FIRESTORE_DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || "ai-studio-080cf906-17e2-4a53-8769-8407f39f60e8";

function getAdminDb() {
  return getFirestore(FIRESTORE_DATABASE_ID);
}

function getFirebaseAdminConfig() {
  const fallbackProjectId = "gen-lang-client-0779193048";
  const jsonSecret = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const base64Secret = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), "service_account.json");

  const parseServiceAccount = (raw: string) => {
    const serviceAccount = JSON.parse(raw);
    return {
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || fallbackProjectId
    };
  };

  if (base64Secret) {
    return parseServiceAccount(Buffer.from(base64Secret, "base64").toString("utf8"));
  }

  if (jsonSecret) {
    return parseServiceAccount(jsonSecret);
  }

  if (fs.existsSync(serviceAccountPath)) {
    return parseServiceAccount(fs.readFileSync(serviceAccountPath, "utf8"));
  }

  return { projectId: fallbackProjectId };
}

function validateRequiredEnvVars() {
  const required = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length > 0) {
    console.error(`[Boot] FATAL: Missing required env vars: ${missing.join(', ')}`);
    process.exit(1);
  }
}

try {
  const config = getFirebaseAdminConfig();
  initializeApp(config);
  if (!('credential' in config)) {
    if (process.env.NODE_ENV === "production") {
      console.error("[Boot] FATAL: Firebase Admin credentials are required in production.");
      process.exit(1);
    }
    console.warn("[Boot] WARNING: Firebase Admin running WITHOUT credentials. Webhook DB writes will fail.");
  } else {
    console.log("Firebase Admin initialized with credentials.");
  }
} catch (e: any) {
  if (e?.code === 'app/duplicate-app') {
    console.log("Firebase Admin already initialized.");
  } else {
    console.error("[Boot] FATAL: Firebase Admin init failed:", e);
    process.exit(1);
  }
}

const PRODUCTS_TO_SEED = [
  {
    id: 'adhd-planner-2026',
    nameKey: 'prod_adhd_name',
    descKey: 'prod_adhd_desc',
    priceUsd: 14.90,
    priceBrl: 47.90,
    image: '/planner-covers/adhd-planner-2026.svg',
    tagKey: 'prod_adhd_tag',
    active: true,
    order: 1
  },
  {
    id: 'it-girl-wellness',
    nameKey: 'prod_itgirl_name',
    descKey: 'prod_itgirl_desc',
    priceUsd: 12.90,
    priceBrl: 37.90,
    image: '/planner-covers/it-girl-wellness.svg',
    tagKey: 'prod_itgirl_tag',
    active: true,
    order: 2
  },
  {
    id: 'undated-digital-planner',
    nameKey: 'prod_undated_name',
    descKey: 'prod_undated_desc',
    priceUsd: 14.90,
    priceBrl: 47.90,
    image: '/planner-covers/undated-digital-planner.svg',
    tagKey: 'prod_undated_tag',
    active: true,
    order: 3
  },
  {
    id: 'small-business-os',
    nameKey: 'prod_smallbiz_name',
    descKey: 'prod_smallbiz_desc',
    priceUsd: 19.90,
    priceBrl: 67.90,
    image: '/planner-covers/small-business-os.svg',
    tagKey: 'prod_smallbiz_tag',
    active: true,
    order: 4
  },
  {
    id: 'meal-prep-weekly',
    nameKey: 'prod_meal_name',
    descKey: 'prod_meal_desc',
    priceUsd: 9.90,
    priceBrl: 27.90,
    image: '/planner-covers/meal-prep-weekly.svg',
    tagKey: 'prod_meal_tag',
    active: true,
    order: 5
  },
  {
    id: 'weight-loss-tracker',
    nameKey: 'prod_weight_name',
    descKey: 'prod_weight_desc',
    priceUsd: 9.90,
    priceBrl: 27.90,
    image: '/planner-covers/weight-loss-tracker.svg',
    tagKey: 'prod_weight_tag',
    active: true,
    order: 6
  }
];

const PRO_PRODUCT = {
  id: 'pro',
  nameKey: 'price_sub_t',
  descKey: 'price_features_sub',
  priceUsd: 9.90,
  priceBrl: 29.90,
  image: '',
  tagKey: '',
  active: true,
  order: 0
};

const PRODUCT_TITLES: Record<string, { en: string; pt: string }> = {
  'adhd-planner-2026': { en: 'ADHD Dopamine Planner', pt: 'Planner Dopamina TDAH' },
  'it-girl-wellness': { en: 'Minimalist IT GIRL Journal', pt: 'Diario IT GIRL Minimalista' },
  'undated-digital-planner': { en: 'Undated Digital Agenda', pt: 'Agenda Digital Classica' },
  'small-business-os': { en: 'Small Biz Creator OS', pt: 'Sistema Empreendedor' },
  'meal-prep-weekly': { en: 'Weekly Meal Prep Matrix', pt: 'Matriz Semanal de Refeicoes' },
  'weight-loss-tracker': { en: 'Body & Fitness Tracker', pt: 'Guia Corpo & Fitness' },
  pro: { en: 'Plann.OS Pro', pt: 'Plann.OS Pro' }
};

const CHECKOUT_PRODUCTS = [...PRODUCTS_TO_SEED, PRO_PRODUCT];

function getCheckoutProduct(productId: string) {
  return CHECKOUT_PRODUCTS.find((product) => product.id === productId && product.active !== false);
}

function getBearerToken(req: express.Request) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' ? token : '';
}

async function resolveProductId(externalId: string): Promise<string> {
  const db = getAdminDb();
  try {
    const mappingRef = db.collection("product_mappings").doc(String(externalId));
    const mappingDoc = await mappingRef.get();
    
    if (mappingDoc.exists) {
      const internalId = mappingDoc.data()?.plannerId;
      console.log(`[Mapping] Resolved ${externalId} to ${internalId}`);
      return internalId || externalId;
    }
  } catch (e) {
    console.error("[Mapping Error]", e);
  }
  return externalId;
}

async function autoSeedProducts() {
  const db = getAdminDb();
  const productsRef = db.collection("products");
  
  try {
    const snapshot = await productsRef.limit(1).get();
    if (snapshot.empty) {
      console.log("[AutoSeed] Products collection is empty. Seeding initial products...");
      const batch = db.batch();
      
      for (const p of PRODUCTS_TO_SEED) {
        batch.set(productsRef.doc(p.id), {
          ...p,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        });
      }
      
      await batch.commit();
      console.log("[AutoSeed] Successfully seeded initial products.");
    }
  } catch (error: any) {
    console.error("[AutoSeed Error]:", error.message);
  }
}

function getAppUrl(req: express.Request) {
  const configuredUrl = process.env.APP_URL?.replace(/\/$/, "");
  if (configuredUrl) return configuredUrl;
  return String(req.headers.origin || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, "");
}

async function grantPlannerAccess(userId: string, productId: string) {
  const db = getAdminDb();
  const userRef = db.collection("users").doc(userId);
  await userRef.set({
    purchasedPlanners: FieldValue.arrayUnion(productId)
  }, { merge: true });
}

function normalizeEmail(email: unknown) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function getHotmartEventId(payload: any) {
  return String(
    payload?.id ||
    payload?.event_id ||
    payload?.data?.purchase?.transaction ||
    payload?.data?.transaction ||
    `${payload?.event || "unknown"}_${payload?.data?.buyer?.email || "no-email"}_${payload?.data?.product?.id || "no-product"}`
  ).replace(/[\/?#]/g, "_");
}

async function grantPendingHotmartPurchases(userId: string, email: string) {
  const db = getAdminDb();
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return [];

  const snapshot = await db
    .collection("pending_hotmart_purchases")
    .where("email", "==", normalizedEmail)
    .where("status", "==", "pending")
    .get();

  const granted: string[] = [];
  const batch = db.batch();

  snapshot.docs.forEach((purchaseDoc) => {
    const productId = purchaseDoc.data()?.productId;
    if (typeof productId === "string" && productId) {
      granted.push(productId);
    }
    batch.set(purchaseDoc.ref, {
      status: "claimed",
      claimedBy: userId,
      claimedAt: FieldValue.serverTimestamp()
    }, { merge: true });
  });

  if (granted.length > 0) {
    const userRef = db.collection("users").doc(userId);
    batch.set(userRef, {
      purchasedPlanners: FieldValue.arrayUnion(...granted)
    }, { merge: true });
    await batch.commit();
  }

  return granted;
}

async function startServer() {
  validateRequiredEnvVars();

  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  // Seed opportunistically, but never block the app from listening.
  autoSeedProducts().catch((error: any) => {
    console.error("[AutoSeed Error]:", error?.message || error);
  });

  // Webhook for Stripe (Must use raw body, before express.json middleware)
  app.post(
    "/api/webhooks/stripe",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];
      const secret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!secret) {
        console.warn("Missing STRIPE_WEBHOOK_SECRET");
        return res.status(400).send("Webhook secret missing");
      }

      if (!sig) {
        return res.status(400).send("No signature");
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: "2025-01-27.acacia" as any
      });

      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, secret);
      } catch (err: any) {
        console.error("Webhook Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Idempotency: skip if already processed
      const db = getAdminDb();
      const eventRef = db.collection("processed_webhook_events").doc(event.id);
      const alreadyProcessed = await eventRef.get();
      if (alreadyProcessed.exists) {
        return res.json({ received: true, duplicate: true });
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const productId = session.metadata?.productId;

        if (!userId || !productId) {
          console.error("Missing userId or productId in session:", event.id);
          // 400 = don't retry (code bug, not transient)
          return res.status(400).send("Missing session metadata");
        }

        try {
          await grantPlannerAccess(userId, productId);
          await eventRef.set({ processedAt: FieldValue.serverTimestamp(), type: event.type });
          console.log(`Granted access to ${productId} for user ${userId}`);
        } catch (dbError: any) {
          console.error(`Firestore write failed for user ${userId}:`, dbError.message);
          // 500 = Stripe will retry
          return res.status(500).send("DB write failed");
        }
      }

      res.json({ received: true });
    }
  );

  // Parse JSON for other routes
  app.use(express.json());

// Webhook for Hotmart (usually JSON payload, verify Hotmart token)
app.post("/api/webhooks/hotmart", async (req, res) => {
  const configuredHottok = process.env.HOTMART_HOTTOK;
  const hotmartToken = req.headers['x-hotmart-hottok'];

  if (!configuredHottok) {
    console.warn("Hotmart webhook received but HOTMART_HOTTOK is not configured.");
    return res.status(503).send("Hotmart not configured");
  }

  if (!hotmartToken || hotmartToken !== configuredHottok) {
    console.warn("Unauthorized: Invalid or missing Hotmart Token");
    return res.status(401).send("Unauthorized: Invalid Hottok");
  }

  const { event, data } = req.body;
  
  if (!data?.buyer?.email || !data?.product?.id) {
    return res.status(400).send("Bad Request: Missing data");
  }

  const buyerEmail = normalizeEmail(data.buyer.email);
  const externalProductId = String(data.product.id);
  const db = getAdminDb();
  const eventId = getHotmartEventId(req.body);
  const eventRef = db.collection("processed_webhook_events").doc(`hotmart_${eventId}`);

  try {
    const alreadyProcessed = await eventRef.get();
    if (alreadyProcessed.exists) {
      return res.status(200).json({ status: "duplicate" });
    }

    // RESOLVE: Map Hotmart numeric ID to our string ID (e.g. adhd-planner)
    const productId = await resolveProductId(externalProductId);

    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", buyerEmail).get();

    if (snapshot.empty) {
      await db.collection("pending_hotmart_purchases").doc(eventId).set({
        email: buyerEmail,
        externalProductId,
        productId,
        event,
        status: event === "PURCHASE_APPROVED" ? "pending" : "ignored",
        createdAt: FieldValue.serverTimestamp()
      }, { merge: true });
      await eventRef.set({ processedAt: FieldValue.serverTimestamp(), type: event });
      console.warn(`No user found for email ${buyerEmail}. Stored pending Hotmart purchase.`);
      return res.status(200).json({ status: "pending_user_signup" }); 
    }

    const userDoc = snapshot.docs[0];

    if (event === "PURCHASE_APPROVED") {
      await userDoc.ref.set({
        purchasedPlanners: FieldValue.arrayUnion(productId)
      }, { merge: true });
      console.log(`[Hotmart] Success: Granted access to ${productId} (from ${externalProductId}) for ${buyerEmail}`);
    } 
    else if (["PURCHASE_CANCELED", "PURCHASE_REFUNDED", "SUBSCRIPTION_CANCELLATION", "PURCHASE_CHARGEBACK"].includes(event)) {
      await userDoc.ref.update({
        purchasedPlanners: FieldValue.arrayRemove(productId)
      });
      console.log(`[Hotmart] Revoked: Removed access to ${productId} for ${buyerEmail} due to ${event}`);
    }

    await eventRef.set({ processedAt: FieldValue.serverTimestamp(), type: event });
    return res.status(200).json({ status: "success" });
  } catch (error: any) {
    console.error("[Hotmart Webhook Error]:", error.message);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/api/access/sync-hotmart", async (req, res) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const decodedToken = await getAuth().verifyIdToken(token);
    const email = normalizeEmail(decodedToken.email);
    if (!email) {
      return res.status(400).json({ error: "Authenticated user has no email." });
    }

    const granted = await grantPendingHotmartPurchases(decodedToken.uid, email);
    return res.json({ granted });
  } catch (error: any) {
    console.error("[Hotmart Sync Error]:", error.message);
    return res.status(500).json({ error: "Unable to sync purchases." });
  }
});

// Admin endpoint to seed current products to Firestore
app.post("/api/admin/seed-products", async (req, res) => {
  const { adminToken } = req.body;
  const configuredAdminToken = process.env.ADMIN_TOKEN || process.env.HOTMART_HOTTOK;
  if (!configuredAdminToken || !adminToken || adminToken !== configuredAdminToken) {
    return res.status(401).send("Unauthorized");
  }

  const db = getAdminDb();
  try {
    const batch = db.batch();
    for (const p of PRODUCTS_TO_SEED) {
      const ref = db.collection("products").doc(p.id);
      batch.set(ref, {
        ...p,
        updatedAt: FieldValue.serverTimestamp()
      });
    }
    await batch.commit();
    res.json({ success: true, count: PRODUCTS_TO_SEED.length });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

  // Stripe Checkout Session Creation
  app.post("/api/checkout/stripe", async (req, res) => {
    const { productId, isPt } = req.body;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Stripe key not configured. Check .env" });
    }

    try {
      if (typeof productId !== 'string') {
        return res.status(400).json({ error: "Invalid product." });
      }

      const token = getBearerToken(req);
      if (!token) {
        return res.status(401).json({ error: "Authentication required." });
      }

      const decodedToken = await getAuth().verifyIdToken(token);
      const checkoutProduct = getCheckoutProduct(productId);
      if (!checkoutProduct) {
        return res.status(404).json({ error: "Product not found." });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-01-27.acacia" as any
      });

      const usePortuguesePricing = isPt === true;
      const currency = usePortuguesePricing ? "brl" : "usd";
      const unitAmount = usePortuguesePricing
        ? checkoutProduct.priceBrl * 100
        : checkoutProduct.priceUsd * 100;
      const title = PRODUCT_TITLES[checkoutProduct.id]?.[usePortuguesePricing ? 'pt' : 'en'] || checkoutProduct.id;

      // Allow PIX if currency is BRL, otherwise limit to Card/Apple Pay etc.
      const paymentMethodTypes: any[] = usePortuguesePricing
        ? ["card", "pix"] 
        : ["card"];

      const session = await stripe.checkout.sessions.create({
        payment_method_types: paymentMethodTypes,
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: title,
              },
              unit_amount: Math.round(unitAmount),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        customer_email: decodedToken.email || undefined,
        client_reference_id: decodedToken.uid,
        metadata: {
          productId: checkoutProduct.id,
          uid: decodedToken.uid,
        },
        // We use the referrer URL to redirect back
        success_url: `${getAppUrl(req)}/dashboard?success=true&product=${checkoutProduct.id}`,
        cancel_url: `${getAppUrl(req)}/checkout/${checkoutProduct.id}?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
