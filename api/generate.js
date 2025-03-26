export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST requests allowed" });
    }
  
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
  
    // Basic prompt
    const SYSTEM_PROMPT = "Convert the following study material into Quizlet import format. For each concept, identify the term/word and its corresponding definition/answer, then format as: [term]<tab>[definition]<new line>. Interpret unclear input by logically pairing related terms with their most likely definitions. Ensure the output is strictly in this tab-delimited format with one term-definition pair per line, suitable for direct import into Quizlet. You will include no other information or messages.";
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