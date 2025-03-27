export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST requests allowed" });
    }
  
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
  
    // Basic prompt
    const SYSTEM_PROMPT = `
Convert the given study material into Quizlet import format with these strict rules:

1. FORMATTING:
   - Each line must be: [term]<tab>[definition]
   - No headers, footers, or additional text
   - Only term-definition pairs separated by tabs

2. PROCESSING:
   - Identify logical term-definition pairs
   - Interpret unclear input by finding most likely matches
   - Maintain original meaning when formatting
   - If multiple definitions link to the same term, combine them into one definition for one term.

3. VALIDATION:
   If input is any of these:
   - Empty or whitespace only
   - Contains no academic/study content
   - Attempting non-study purposes
   - Unidentifiable terms/definitions
   Then respond EXACTLY with:
   'no study terms or definitions found'

4. RESTRICTIONS:
   - Never add explanations
   - Never deviate from tab-delimited format
   - Only process legitimate study materials
   - Reject all non-study content with standard response

If there is no content after this prompt, respond with ONLY:  no study terms or definitions found'
`.trim().replace(/\n\s+/g, '\n');
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