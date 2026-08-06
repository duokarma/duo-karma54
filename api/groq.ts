export default async function handler(req: any, res: any) {
  // CORS handling
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ error: 'Missing GROQ_API_KEY environment variable' });
    }

    const { action, prompt, messages, systemPrompt } = req.body;

    const apiUrl = "https://api.groq.com/openai/v1/chat/completions";

    let payload: any = {
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      messages: [],
    };

    if (action === "chat") {
      payload.messages = messages;
    } else if (action === "schema") {
      payload.response_format = { type: "json_object" };
      payload.messages = [
        {
          role: "system",
          content: systemPrompt || "You are a database architect. Return JSON only.",
        },
        { role: "user", content: prompt },
      ];
    } else {
      return res.status(400).json({ error: "Invalid action provided" });
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq API Error: ${err}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Groq Handler Error:", error);
    return res.status(400).json({ error: error.message });
  }
}
