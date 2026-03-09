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
    
    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'Google API key not configured' 
      });
    }
    
    // Use REST API directly (works with free tier)
    const prompt = `Create a 30-day music marketing campaign for ${artistName} - "${trackTitle}" (${genre}, Budget: ₦${budget.toLocaleString()}).

Include TikTok strategy with 30 video concepts, Instagram strategy with 21 Reels concepts, Spotify playlists (20 targets), influencer targets, budget breakdown, and week-by-week plan.

Return as JSON.`;
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }
    
    const responseText = data.candidates[0].content.parts[0].text;
    
    let campaignData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      campaignData = jsonMatch ? JSON.parse(jsonMatch[0]) : { campaign_overview: responseText.substring(0, 500) };
    } catch (e) {
      campaignData = { campaign_overview: responseText.substring(0, 500) };
    }
    
    return res.status(200).json({
      success: true,
      campaign: {
        artistName,
        trackTitle,
        genre,
        budget,
        strategy: campaignData,
        createdAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate campaign'
    });
  }
};
        
