import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { PARENT_CONTACT_RETENTION_DAYS, purgeExpiredParentContacts, submitParentContact, validateParentContact } from "./betaFeedback";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const recentContact = new Map<string, number>();
  const purgeExpiredContacts = async () => {
    try {
      const removed = await purgeExpiredParentContacts();
      if (removed > 0) console.info(`[Parent contact] removed ${removed} record(s) older than ${PARENT_CONTACT_RETENTION_DAYS} days.`);
    } catch (error) {
      console.error("[Parent contact] retention cleanup failed", error);
    }
  };

  // Support messages contain only adult-submitted contact details, but are still
  // automatically removed after 30 days. Run once at startup and daily after.
  await purgeExpiredContacts();
  const retentionTimer = setInterval(() => { void purgeExpiredContacts(); }, 24 * 60 * 60 * 1000);
  retentionTimer.unref();

  // The managed deployment sits behind one reverse proxy. Trusting that single
  // hop lets req.ip identify the originating parent for the contact throttle.
  app.set("trust proxy", 1);
  app.use(express.json({ limit: "10kb" }));
  app.post("/api/parent-contact", async (req, res) => {
    const requestKey = req.ip || "parent-contact";
    const now = Date.now();
    const lastSubmitted = recentContact.get(requestKey) ?? 0;
    if (now - lastSubmitted < 60_000) {
      res.status(429).json({ ok: false, message: "Thank you. Please wait a minute before sending another parent message." });
      return;
    }

    const validated = validateParentContact(req.body);
    if (!validated.contact) {
      res.status(400).json({ ok: false, message: validated.error });
      return;
    }

    try {
      await submitParentContact(validated.contact);
      recentContact.set(requestKey, now);
      res.status(201).json({ ok: true });
    } catch (error) {
      console.error("[Parent contact] submission failed", error);
      res.status(503).json({ ok: false, message: "Parent contact is resting for a moment. Please try again soon." });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
