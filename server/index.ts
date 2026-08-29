import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { submitBetaFeedback, validateBetaFeedback } from "./betaFeedback";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const recentFeedback = new Map<string, number>();

  app.use(express.json({ limit: "10kb" }));
  app.post("/api/beta-feedback", async (req, res) => {
    const requestKey = req.ip || "beta-feedback";
    const now = Date.now();
    const lastSubmitted = recentFeedback.get(requestKey) ?? 0;
    if (now - lastSubmitted < 30_000) {
      res.status(429).json({ ok: false, message: "Thank you. Please wait a moment before sending another note." });
      return;
    }

    const validated = validateBetaFeedback(req.body);
    if (!validated.feedback) {
      res.status(400).json({ ok: false, message: validated.error });
      return;
    }

    try {
      await submitBetaFeedback(validated.feedback);
      recentFeedback.set(requestKey, now);
      res.status(201).json({ ok: true });
    } catch (error) {
      console.error("[Beta feedback] submission failed", error);
      res.status(503).json({ ok: false, message: "Feedback is resting for a moment. Please try again soon." });
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
