// api/get-paystack-key.js
// This endpoint returns the public key from environment variables

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get public key from environment variable
    const publicKey = process.env.PAYSTACK_PUBLIC_KEY;
    
    if (!publicKey) {
      console.error('❌ PAYSTACK_PUBLIC_KEY not set in environment variables');
      return res.status(500).json({ 
        success: false,
        error: 'Payment configuration missing' 
      });
    }
    
    // Verify it's a public key (starts with pk_)
    if (!publicKey.startsWith('pk_')) {
      console.error('❌ Invalid Paystack public key format');
      return res.status(500).json({ 
        success: false,
        error: 'Invalid payment configuration' 
      });
    }
    
    return res.status(200).json({
      success: true,
      publicKey: publicKey
    });
    
  } catch (error) {
    console.error('❌ Error getting Paystack key:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Payment system error' 
    });
  }
};
