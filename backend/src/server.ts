import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import objectsRoutes from "./routes/objects";
import checklistRoutes from "./routes/checklists";
import { db } from "./db";
import {
  configureWebPush,
  ensureNotificationSchema,
  sendBroadcastNotification,
  startReminderScheduler,
} from "./push";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Objects routes
app.use("/api/objects", objectsRoutes);

// Checklist routes
app.use("/api/checklists", checklistRoutes);

// Checklist routes
app.get("/api/checklists", async (req, res) => {
  try {
    // TODO: Get user's checklists from database
    res.json({ checklists: [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch checklists" });
  }
});

app.post("/api/checklists", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title required" });
    }

    // TODO: Create checklist in database
    res.status(201).json({ message: "Checklist created" });
  } catch (error) {
    res.status(500).json({ error: "Failed to create checklist" });
  }
});

// Push notification subscription
app.post("/api/subscribe", async (req, res) => {
  try {
    const { subscription, userId } = req.body;

    if (!subscription?.endpoint || !subscription?.keys?.auth || !subscription?.keys?.p256dh) {
      return res.status(400).json({ error: "Valid subscription required" });
    }

    const resolvedUserId = Number(userId || 1);

    await db.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, auth_key, p256dh_key)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (endpoint)
       DO UPDATE SET
         user_id = EXCLUDED.user_id,
         auth_key = EXCLUDED.auth_key,
         p256dh_key = EXCLUDED.p256dh_key`,
      [
        resolvedUserId,
        subscription.endpoint,
        subscription.keys.auth,
        subscription.keys.p256dh,
      ]
    );

    res.status(201).json({ message: "Subscription stored" });
  } catch (error) {
    res.status(500).json({ error: "Failed to store subscription" });
  }
});

// Send push notification
app.post("/api/notify", async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: "Title and message required" });
    }

    const result = await sendBroadcastNotification(title, message);
    res.json({ message: "Notification sent", ...result });
  } catch (error) {
    res.status(500).json({ error: "Failed to send notification" });
  }
});

// Geolocation endpoint
app.post("/api/location", async (req, res) => {
  try {
    const { latitude, longitude, userId } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: "Location coordinates required" });
    }

    // TODO: Store location in database
    res.json({ message: "Location stored" });
  } catch (error) {
    res.status(500).json({ error: "Failed to store location" });
  }
});

// Admin stats
app.get("/api/admin/stats", async (req, res) => {
  try {
    // TODO: Get aggregated statistics
    res.json({
      activeUsers: 0,
      notificationsSent: 0,
      checklistsCompleted: 0,
      completionRate: 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Start server
async function bootstrap() {
  configureWebPush();
  await ensureNotificationSchema();
  startReminderScheduler();

  app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Server bootstrap failed:", error);
  process.exit(1);
});
