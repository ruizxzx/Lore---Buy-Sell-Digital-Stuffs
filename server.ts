import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import crypto from "crypto";
import fs from "fs";

let firebaseConfig: any = {};
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }
} catch (e) {
  console.log("Could not read firebase-applet-config.json", e);
}

// Initialize Firebase Admin (Using application default credentials)
try {
  initializeApp({
    credential: applicationDefault(),
    projectId: firebaseConfig.projectId
  });
  console.log("Firebase Admin initialized with application default credentials");
} catch (e) {
  console.log("Firebase Admin initialization error:", e);
}

const db = getFirestore(firebaseConfig.firestoreDatabaseId || "(default)");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_ENVIRONMENT = process.env.CASHFREE_ENVIRONMENT || "SANDBOX";

const cfBaseUrl = CASHFREE_ENVIRONMENT === "PRODUCTION" 
  ? "https://api.cashfree.com/pg" 
  : "https://sandbox.cashfree.com/pg";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());

  // Cashfree Webhook Verification
  app.post(
    "/api/webhooks/cashfree",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const signature = req.headers["x-webhook-signature"];
      const timestamp = req.headers["x-webhook-timestamp"];
      
      if (!signature || !timestamp || !CASHFREE_SECRET_KEY) {
        return res.status(400).send("Missing Cashfree signature or secret");
      }

      const rawBody = req.body.toString();
      const dataToSign = timestamp + rawBody;
      const expectedSignature = crypto.createHmac("sha256", CASHFREE_SECRET_KEY).update(dataToSign).digest("base64");

      if (expectedSignature !== signature) {
        console.error("Cashfree Webhook Signature Mismatch");
        return res.status(400).send("Signature mismatch");
      }

      let event;
      try {
        event = JSON.parse(rawBody);
      } catch (err: any) {
        return res.status(400).send("Invalid JSON");
      }

      // Handle the event
      if (event.type === 'PAYMENT_SUCCESS_WEBHOOK') {
        const orderId = event.data.order.order_id;
        const tags = event.data.order.order_tags || {};
        console.log("Cashfree payment success for order:", orderId);
        
        try {
          const { productId, buyerId, creatorId, cartProducts } = tags;
          
          if (cartProducts && buyerId) {
            const pIds = cartProducts.split(',');
            for (let i = 0; i < pIds.length; i++) {
              const pId = pIds[i];
              const uniqueOrderId = `${orderId}_${i}`;
              // Cannot easily pass all creatorIds in tags, can fetch if needed
              const pRef = await db.collection('products').doc(pId).get();
              const pData = pRef.data();
              
              await db.collection('orders').doc(uniqueOrderId).set({
                buyerId,
                creatorId: pData?.ownerId || "unknown", 
                productId: pId,
                cfOrderId: orderId,
                amount: pData?.price || 0,
                currency: event.data.order.order_currency || "INR",
                status: "paid",
                createdAt: Date.now(),
                paidAt: Date.now()
              });
              console.log("Cart Order created in Firestore:", uniqueOrderId);
            }
          } else if (productId && buyerId) {
            await db.collection('orders').doc(orderId).set({
              buyerId,
              creatorId: creatorId || "unknown",
              productId,
              cfOrderId: orderId,
              amount: event.data.order.order_amount,
              currency: event.data.order.order_currency || "INR",
              status: "paid",
              createdAt: Date.now(),
              paidAt: Date.now()
            });
            console.log("Order created in Firestore:", orderId);
          }
        } catch (dbErr) {
          console.error("Failed to write order to Firestore via Admin SDK:", dbErr);
        }
      }

      res.status(200).send();
    }
  );

  // Normal JSON parsing for other API routes
  app.use(express.json());

  app.post("/api/ai/generate", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API Key missing" });
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: req.body.prompt,
      });
      res.json({ text: response.text });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Cashfree Order Creation
  app.post("/api/checkout", async (req, res) => {
    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      return res.status(500).json({ error: "Cashfree is not configured on this server." });
    }
    try {
      const { cartItems, productId, price, title, buyerId, creatorId, appUrl, buyerPhone = "9999999999", buyerEmail = "test@example.com" } = req.body;
      const orderId = `order_${Date.now()}_${Math.floor(Math.random()*1000)}`;
      
      let itemsToProcess = [];
      if (cartItems && cartItems.length > 0) {
        itemsToProcess = cartItems;
      } else if (productId) {
        itemsToProcess = [{ id: productId, price, title, creatorId }];
      }

      if (itemsToProcess.length === 0) {
        return res.status(400).json({ error: "No items to checkout" });
      }

      const totalPrice = itemsToProcess.reduce((sum: number, item: any) => sum + item.price, 0);
      const productIds = itemsToProcess.map((item: any) => item.id).join(',').substring(0, 250);
      
      const payload: any = {
        order_amount: Math.max(1, totalPrice), // Cashfree requires min amount
        order_currency: "INR", // Adjust if needed
        order_id: orderId,
        customer_details: {
          customer_id: buyerId.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 50),
          customer_phone: buyerPhone,
          customer_email: buyerEmail,
          customer_name: "Customer"
        },
        order_meta: {
          return_url: `${appUrl}/dashboard/orders?success=true&order_id={order_id}`
        },
        order_tags: {
          cartProducts: productIds,
          buyerId: buyerId
        }
      };

      const response = await fetch(`${cfBaseUrl}/orders`, {
        method: "POST",
        headers: {
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
          "x-api-version": "2023-08-01",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create Cashfree order");
      }

      res.json({ 
        paymentSessionId: data.payment_session_id,
        orderId: data.order_id
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  // Secure Signed URL generation for downloads (Placeholder until Firebase integration)
  app.post("/api/downloads/generate", async (req, res) => {
    // Generate signed URL from Firebase Storage
    // Needs authentication verification via Firebase Admin
    res.json({ url: "https://example.com/placeholder-signed-url" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
