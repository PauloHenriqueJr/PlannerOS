import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import Stripe from "stripe";
import "dotenv/config";

const PORT = 3000;

async function startServer() {
  const app = express();

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
        apiVersion: "2025-01-27.acacia"
      });

      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, secret);
      } catch (err: any) {
        console.error("Webhook Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        // Here you would find the user by session.client_reference_id or session.customer_email
        // and grant them access to the planner they bought (session.metadata.productId)
        console.log("Payment completed for:", session.customer_email, "Product:", session.metadata?.productId);
      }

      res.json({ received: true });
    }
  );

  // Parse JSON for other routes
  app.use(express.json());

  // Webhook for Hotmart (usually JSON payload, verify Hotmart token)
  app.post("/api/webhooks/hotmart", (req, res) => {
    const hotmartToken = req.headers['x-hotmart-hottok'];
    if (hotmartToken !== process.env.HOTMART_HOTTTOk) {
      console.warn("Invalid Hotmart Token");
      // return res.status(401).send("Unauthorized"); // Commented for testing
    }

    const { event, data } = req.body;
    
    if (event === "PURCHASE_APPROVED") {
      const buyerEmail = data.buyer.email;
      const product = data.product.id;
      // Grant access to user in your DB
      console.log(`Hotmart Sale! Granted access to ${buyerEmail} for product ${product}`);
    }

    res.json({ status: "ok" });
  });

  // Stripe Checkout Session Creation
  app.post("/api/checkout/stripe", async (req, res) => {
    const { productId, priceUsd, priceBrl, title, isPt, email, userId } = req.body;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Stripe key not configured. Check .env" });
    }

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-01-27.acacia"
      });

      // Price mapping based on language (simulating BRL PIX availability vs Global USD)
      const currency = isPt ? "brl" : "usd";
      const unitAmount = isPt ? priceBrl * 100 : priceUsd * 100;

      // Allow PIX if currency is BRL, otherwise limit to Card/Apple Pay etc.
      const paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = isPt 
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
        customer_email: email || undefined,
        client_reference_id: userId || undefined,
        metadata: {
          productId,
        },
        // We use the referrer URL to redirect back
        success_url: `${req.headers.origin}/dashboard?success=true&product=${productId}`,
        cancel_url: `${req.headers.origin}/checkout/${productId}?canceled=true`,
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
