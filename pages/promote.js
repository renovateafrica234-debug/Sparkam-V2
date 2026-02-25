import React, { useState } from 'react';
import Head from 'next/head';
import { Sparkles, Music, Rocket, Share2, BarChart3 } from 'lucide-react';

export default function Promote() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSpark = async (e) => {
    e.preventDefault();
    if (!prompt) return;

    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data.text);
      } else {
        alert(data.error || 'Check GOOGLE_API_KEY in Vercel settings.');
      }
    } catch (error) {
      alert('AI Brain connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <Head><title>Sparkam | Promote</title></Head>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
          Spark Your Movement
        </h1>
        <form onSubmit={handleSpark} className="space-y-4">
          <textarea 
            className="w-full bg-[#111] border border-gray-800 p-4 rounded-xl text-white"
            placeholder="Describe your music vibe..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 py-4 rounded-full font-bold">
            {loading ? 'Sparking...' : 'SPARK IT'}
          </button>
        </form>
        {result && <div className="mt-8 p-6 bg-[#111] rounded-xl border border-pink-500/30">{result}</div>}
      </div>
    </div>
  );
    }
    
