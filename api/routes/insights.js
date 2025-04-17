// routes/insights.js
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import axios from "axios";

const router = express.Router();
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

router.post("/", async (req, res) => {
  const transactions = req.body.transactions;
  console.log("🔵 Received POST /api/insights");
  console.log("🟡 Transactions data:", transactions);

  if (!transactions || !Array.isArray(transactions)) {
    return res.status(400).json({ error: "Invalid or missing transactions data" });
  }

  const formattedTransactions = transactions.map((t, i) =>
    `${i + 1}. ${t.name} — ₹${t.price} (${t.type}, ${t.category}) on ${new Date(t.dateTime).toDateString()}`
  ).join('\n');

  const prompt = `You are a financial advisor. Analyze the following financial transactions and give 3 practical suggestions to improve spending and saving habits, format them as short bullet points:\n\n${formattedTransactions}`;

  console.log("🟢 Prompt being sent:", prompt);

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "anthropic/claude-3.7-sonnet",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const insightText = response.data.choices[0]?.message?.content || "No insights returned.";
    res.json({ insights: insightText });
  } catch (err) {
    console.error("🔴 Error from OpenRouter API:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate insights." });
  }
});

export default router;
