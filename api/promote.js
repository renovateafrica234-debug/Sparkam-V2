import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { musicLink, struggle } = req.body;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are the Sparkam AI Brain, a professional music promo manager. Analyze the user's struggle and music link to provide a 3-step growth strategy."
        },
        {
          role: "user",
          content: `Music Link: ${musicLink}. Main Struggle: ${struggle}`
        }
      ],
      model: "mixtral-8x7b-32768",
    });

    res.status(200).json({ strategy: chatCompletion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "AI Brain is offline. Try again later." });
  }
}
