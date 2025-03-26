export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST requests allowed" });
    }
  
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
  
    // Basic prompt
    const SYSTEM_PROMPT = "Include the word 'potato' in your response. ";
    const fullPrompt = SYSTEM_PROMPT + prompt;
  
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }]
          })
        }
      );
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
      res.status(200).json({ text });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }