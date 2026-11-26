
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "AI connection is not configured."
    });
  }

  try {
    const { question, level, subject } = req.body || {};

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "Please enter a question." });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content:
                "You are Krakem AI, a friendly educational assistant. Explain clearly and step by step, using examples appropriate to the learner's education level."
            },
            {
              role: "user",
              content: `Education level: ${level || "Not specified"}
Subject: ${subject || "General"}
Student question: ${question}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "AI request failed."
      });
    }

    return res.status(200).json({
      answer:
        data.choices?.[0]?.message?.content || "No answer was generated."
    });
  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong. Please try again."
    });
  }
};
