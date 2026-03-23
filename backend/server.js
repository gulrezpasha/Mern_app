const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ── MongoDB Connection ──────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ── Schema & Model ──────────────────────────────────────────────────────────
const flowSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Flow = mongoose.model("Flow", flowSchema);



app.post("/api/ask-ai", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  // console.log("📨 Prompt received:", prompt);
  // console.log("🔑 API Key loaded:", process.env.OPENROUTER_API_KEY ? "YES" : "NO");

  try {
    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Flow App",
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    // console.log("📡 OpenRouter status:", aiRes.status);
    const data = await aiRes.json();
    // console.log("📦 OpenRouter response:", JSON.stringify(data, null, 2));

    if (!aiRes.ok) {
      return res.status(500).json({ error: "AI API call failed", details: data });
    }

    const answer = data.choices?.[0]?.message?.content ?? "No response from AI.";
    res.json({ answer });
  } catch (err) {
    console.error("💥 Fetch error:", err.message);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// ── POST /api/save ──────────────────────────────────────────────────────────
app.post("/api/save", async (req, res) => {
  const { prompt, response } = req.body;
  if (!prompt || !response)
    return res.status(400).json({ error: "Both prompt and response are required" });

  try {
    const doc = await Flow.create({ prompt, response });
    res.json({ success: true, id: doc._id });
  } catch (err) {
    res.status(500).json({ error: "Failed to save" });
  }
});

// ── GET /api/history ────────────────────────────────────────────────────────
app.get("/api/history", async (_req, res) => {
  try {
    const docs = await Flow.find().sort({ createdAt: -1 }).limit(20);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));