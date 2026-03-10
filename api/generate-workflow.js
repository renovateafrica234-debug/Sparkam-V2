module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  try {
    const { campaign } = req.body;
    
    if (!campaign || !campaign.strategy) {
      return res.status(400).json({ 
        success: false, 
        error: 'Campaign data required' 
      });
    }
    
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'Groq API key not configured' 
      });
    }
    
    const { artistName, trackTitle, genre, budget, strategy } = campaign;
    const currency = campaign.currency || '₦';
    
    // AI Agent: Convert strategy into 30-day workflow with tasks
    const workflowPrompt = `You are a music marketing project manager. Convert this campaign strategy into a detailed 30-day workflow.

Campaign: "${trackTitle}" by ${artistName}
Genre: ${genre}
Total Budget: ${currency}${budget.toLocaleString()}

Strategy Summary:
${JSON.stringify(strategy, null, 2).substring(0, 2000)}

Create a JSON workflow with:
1. 30 days of tasks (4-6 tasks per week)
2. Each task must have:
   - day (1-30)
   - title (clear, actionable)
   - description (what to do, how to do it)
   - budget (specific amount from total budget)
   - category (content/ads/influencer/playlist/community)
   - automation_level (manual/semi_auto/approval_required)
   - expected_result (specific outcome)
   - priority (high/medium/low)

Budget allocation by category:
- Content Creation: ${Math.floor(budget * 0.20)}
- Paid Ads: ${Math.floor(budget * 0.25)}
- Influencer Collabs: ${Math.floor(budget * 0.30)}
- Playlist Pitching: ${Math.floor(budget * 0.15)}
- Community/Misc: ${Math.floor(budget * 0.10)}

Make tasks SPECIFIC and ACTIONABLE. Include exact platform names, posting times, content ideas.

Return ONLY valid JSON in this format:
{
  "workflow_id": "wf_[random]",
  "total_budget": ${budget},
  "currency": "${currency}",
  "duration_days": 30,
  "tasks": [
    {
      "day": 1,
      "title": "Create and post TikTok video #1",
      "description": "Film 15-second clip using your phone. Hook: 'This sound go scatter dance floor!' Film in Lagos traffic or home. Use trending sound. Post at 3PM.",
      "budget": 500,
      "category": "content",
      "automation_level": "manual",
      "expected_result": "2K-5K views, 100-300 profile visits",
      "priority": "high"
    }
  ],
  "weekly_goals": [
    { "week": 1, "streams": 1500, "budget_checkpoint": ${Math.floor(budget * 0.25)} },
    { "week": 2, "streams": 4000, "budget_checkpoint": ${Math.floor(budget * 0.50)} },
    { "week": 3, "streams": 7000, "budget_checkpoint": ${Math.floor(budget * 0.75)} },
    { "week": 4, "streams": 10000, "budget_checkpoint": ${budget} }
  ]
}`;

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
            content: 'You are a music marketing workflow specialist. Create detailed, actionable task lists with specific budgets. Return ONLY valid JSON, no markdown, no explanations.'
          },
          {
            role: 'user',
            content: workflowPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Groq API error');
    }
    
    let workflowData;
    try {
      const responseText = data.choices[0].message.content;
      const cleanText = responseText.replace(/```json\n?|\n?```/g, '').trim();
      workflowData = JSON.parse(cleanText);
    } catch (e) {
      throw new Error('Failed to parse workflow JSON: ' + e.message);
    }
    
    // Add metadata
    workflowData.campaign_info = {
      artistName,
      trackTitle,
      genre
    };
    
    workflowData.created_at = new Date().toISOString();
    workflowData.status = 'active';
    
    return res.status(200).json({
      success: true,
      workflow: workflowData
    });
    
  } catch (error) {
    console.error('Workflow generation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate workflow'
    });
  }
};
