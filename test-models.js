const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({ 
        error: 'GOOGLE_API_KEY not set',
        key_exists: false
      });
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // Test different models
    const testResults = {
      api_key_exists: true,
      api_key_prefix: process.env.GOOGLE_API_KEY.substring(0, 8) + '...',
      models_tested: []
    };
    
    const modelsToTest = [
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-pro",
      "gemini-2.0-flash-exp"
    ];
    
    for (const modelName of modelsToTest) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say hello");
        const text = result.response.text();
        
        testResults.models_tested.push({
          name: modelName,
          status: 'SUCCESS',
          response: text.substring(0, 50)
        });
        
        break; // Found working model!
        
      } catch (error) {
        testResults.models_tested.push({
          name: modelName,
          status: 'FAILED',
          error: error.message
        });
      }
    }
    
    return res.status(200).json(testResults);
    
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
};

