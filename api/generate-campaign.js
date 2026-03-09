const { GoogleGenerativeAI } = require("@google/generative-ai");

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
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // Try multiple models in order until one works
    const modelsToTry = [
      "gemini-1.5-pro",
      "gemini-1.5-flash", 
      "gemini-2.0-flash-exp",
      "gemini-pro"
    ];
    
    let result;
    let lastError;
    
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = `Create a 30-day music marketing campaign for ${artistName} - "${trackTitle}" (${genre}, Budget: ₦${budget.toLocaleString()}).

Include TikTok strategy with 30 video concepts, Instagram strategy with 21 Reels concepts, Spotify playlists (20 targets), influencer targets, budget breakdown, and week-by-week plan.

Return as JSON.`;
        
        result = await model.generateContent(prompt);
        console.log(`Success with model: ${modelName}`);
        break; // Success! Exit loop
      } catch (error) {
        console.log(`Model ${modelName} failed, trying next...`);
        lastError = error;
        continue; // Try next model
      }
    }
    
    if (!result) {
      throw new Error(`All models failed. Last error: ${lastError.message}`);
    }
    
    const responseText = result.response.text();
    
    let campaignData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        campaignData = JSON.parse(jsonMatch[0]);
      } else {
        campaignData = { campaign_overview: responseText.substring(0, 500) };
      }
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
    console.error('Campaign generation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate campaign'
    });
  }
};
                                                                 
