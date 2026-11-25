
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "AI connection is not configured."
    });
  }

  try {
    const { question, level, subject } = req.body || {};

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        error: "Please enter a question."
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          instructions:
            "You are Krakem AI, a friendly educational assistant. Help learners from primary school to university. Explain answers clearly, step by step, using examples appropriate to their education level. Encourage learning rather than simply giving answers.",
          input:
            `Education level: ${level || "Not specified"}\n` +
            `Subject: ${subject || "General"}\n` +
            `Student question: ${question}`,
          max_output_tokens: 1000
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
      answer: data.output_text || "No answer was generated."
    });

  } catch (error) {
    return res.status(500).json({
      error: "Something went wrong. Please try again."
    });
  }
};
