// api/claude-chat.js
const Anthropic = require('@anthropic-ai/sdk');
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const { messages, userTier } = req.body;
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `Music marketing advisor for Sparkam. Tier: ${userTier}`,
      messages: messages
    });
    return res.json({ success: true, response: response.content[0].text });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

