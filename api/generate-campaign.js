module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  try {
    const { artistName, trackTitle, genre, budget } = req.body;
    
    if (!artistName || !trackTitle || !genre || !budget) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'Groq API key not configured' 
      });
    }
    
    const prompt = `You are a professional music marketing strategist specializing in Nigerian and African music (Afrobeats, Afropop, Alté, etc.).

Create a comprehensive 30-day marketing campaign for:
- Artist: ${artistName}
- Track: ${trackTitle}
- Genre: ${genre}
- Budget: ₦${budget.toLocaleString()}

Generate a detailed JSON strategy with:
1. campaign_overview (summary)
2. tiktok_strategy (30 video concepts, hashtags, posting times)
3. instagram_strategy (21 Reels concepts, Story ideas)
4. spotify_strategy (20 playlist targets, curator outreach template)
5. influencer_strategy (target influencers, outreach approach)
6. budget_breakdown (how to allocate ₦${budget.toLocaleString()})
7. week_by_week_plan (4 weeks of activities)
8. kpis (target streams, followers, engagement rate)

Return ONLY valid JSON, no markdown, no explanation.`;
    
    // Groq API call
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a Nigerian music marketing expert. Always return valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Groq API error');
    }
    
    const responseText = data.choices[0].message.content;
    
    let campaignData;
    try {
      // Remove markdown code blocks if present
      const cleanText = responseText.replace(/```json\n?|\n?```/g, '').trim();
      campaignData = JSON.parse(cleanText);
    } catch (e) {
      // If JSON parsing fails, create structured data from text
      campaignData = {
        campaign_overview: responseText.substring(0, 500),
        raw_strategy: responseText
      };
    }
    
    return res.status(200).json({
      success: true,
      campaign: {
        artistName,
        trackTitle,
        genre,
        budget,
        strategy: campaignData,
        createdAt: new Date().toISOString(),
        ai_model: 'Llama 3.3 70B (via Groq)'
      }
    });
    
  } catch (error) {
    console.error('Campaign generation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate campaign'
    });
  }
};
      
