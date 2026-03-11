module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  
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
        error: 'GROQ_API_KEY not configured' 
      });
    }
    
    const currency = budget < 1000 ? '$' : '₦';
    
    // DETAILED MULTI-SECTION PROMPT
    const prompt = `You are a music marketing strategist. Create a comprehensive 30-day campaign for:

**Artist:** ${artistName}
**Track:** ${trackTitle}
**Genre:** ${genre}
**Budget:** ${currency}${budget.toLocaleString()}

Generate detailed sections:

## MARKET RESEARCH
- 5 similar successful independent ${genre} artists
- What marketing tactics worked for them
- Current trends in ${genre} music
- Realistic benchmarks for this budget

## INFLUENCER STRATEGY
List 10-15 affordable influencers/music bloggers:
- Handle/Name
- Follower count (5K-50K range)
- Estimated cost (${currency}5K-${currency}50K)
- Why they're good for this campaign
- Outreach approach

## CONTENT STRATEGY (TikTok/Instagram)
15 specific video concepts:
- Video hook/opening line
- What to film (specific scenes)
- Call-to-action
- Best posting time
- Expected reach

## PLAYLIST STRATEGY
20 realistic playlists to target:
- Playlist name
- Platform (Spotify/Apple/YouTube)
- Follower count
- How to submit (SubmitHub/email/etc)
- Expected result if added

## WEEK-BY-WEEK ACTION PLAN
Detailed plan for 4 weeks:
**Week 1:** Day-by-day tasks
**Week 2:** Day-by-day tasks
**Week 3:** Day-by-day tasks
**Week 4:** Day-by-day tasks

## ROI PROJECTIONS
- Week 1 expected: X streams
- Week 2 expected: X streams
- Week 3 expected: X streams
- Week 4 expected: X streams
- Total 30-day expected: X streams, Y followers
- Expected ROI: X%

Be SPECIFIC with real examples, names, handles, and actionable steps.`;

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
            content: 'You are a detailed music marketing strategist. Provide comprehensive, specific strategies with real examples. Be thorough and actionable.'
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
    
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(500).json({
        success: false,
        error: `Groq API error: ${errorData.error?.message || 'Unknown'}`
      });
    }
    
    const data = await response.json();
    const fullText = data.choices[0].message.content;
    
    // Parse into sections
    const sections = {
      market_research: extractSection(fullText, 'MARKET RESEARCH', 'INFLUENCER STRATEGY'),
      influencer_strategy: extractSection(fullText, 'INFLUENCER STRATEGY', 'CONTENT STRATEGY'),
      content_strategy: extractSection(fullText, 'CONTENT STRATEGY', 'PLAYLIST STRATEGY'),
      playlist_strategy: extractSection(fullText, 'PLAYLIST STRATEGY', 'WEEK-BY-WEEK'),
      action_plan: extractSection(fullText, 'WEEK-BY-WEEK', 'ROI PROJECTIONS'),
      roi_projections: extractSection(fullText, 'ROI PROJECTIONS', null)
    };
    
    const campaign = {
      campaign_type: 'Independent Artist Campaign',
      campaign_overview: fullText.substring(0, 500) + '...',
      
      ...sections,
      
      budget_breakdown: {
        total: `${currency}${budget.toLocaleString()}`,
        content_creation: `${currency}${Math.floor(budget * 0.20).toLocaleString()} (20%)`,
        social_ads: `${currency}${Math.floor(budget * 0.25).toLocaleString()} (25%)`,
        micro_influencers: `${currency}${Math.floor(budget * 0.30).toLocaleString()} (30%)`,
        playlist_pitching: `${currency}${Math.floor(budget * 0.15).toLocaleString()} (15%)`,
        community_misc: `${currency}${Math.floor(budget * 0.10).toLocaleString()} (10%)`
      },
      
      realistic_expectations: {
        streams_30_days: `${Math.floor(budget * 0.04)}-${Math.floor(budget * 0.10)}`,
        new_followers: `${Math.floor(budget * 0.007)}-${Math.floor(budget * 0.025)}`,
        playlist_adds: '8-15 indie playlists',
        roi_percentage: '90-220%'
      },
      
      full_text: fullText
    };
    
    return res.status(200).json({
      success: true,
      campaign: {
        artistName,
        trackTitle,
        genre,
        budget,
        currency,
        strategy: campaign,
        createdAt: new Date().toISOString(),
        ai_model: 'Groq Llama 3.3 70B'
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

function extractSection(text, startMarker, endMarker) {
  const startIdx = text.indexOf(startMarker);
  if (startIdx === -1) return '';
  
  const contentStart = startIdx + startMarker.length;
  
  if (endMarker) {
    const endIdx = text.indexOf(endMarker, contentStart);
    if (endIdx === -1) return text.substring(contentStart).trim();
    return text.substring(contentStart, endIdx).trim();
  }
  
  return text.substring(contentStart).trim();
}
  
