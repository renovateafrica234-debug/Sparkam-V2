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
        alert(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error sparking promo:', error);
      alert('Failed to connect to AI Brain.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Head>
        <title>Promote | Sparkam AI</title>
      </Head>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
            Spark Your Movement
          </h1>
          <p className="text-gray-400 text-lg">
            Feed the AI Brain your track details and let us generate your viral lore.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-8 mb-8">
          <form onSubmit={handleSpark}>
            <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-widest">
              Audio DNA & Vibe
            </label>
            <textarea
              className="w-full bg-black border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all resize-none h-32"
              placeholder="e.g. An Afrobeat track about late nights in Lagos, high energy, neon visuals, target audience: Gen Z club-goers..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            
            <button
              type="submit"
              disabled={loading}
              className={`mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold text-lg transition-all ${
                loading 
                ? 'bg-gray-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(219,39,119,0.4)]'
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  <Sparkles size={20} />
                  Spark It
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-[#111] border border-pink-900/30 rounded-2xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-4 text-cyan-400">
              <Rocket size={20} />
              <h2 className="font-bold uppercase tracking-widest">Your AI Lore is Ready</h2>
            </div>
            <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
              {result}
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <button className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-200">
                <Share2 size={18} /> Copy Promo
              </button>
              <button className="flex items-center gap-2 border border-gray-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-900">
                <BarChart3 size={18} /> View Data Flow
              </button>
            </div>
          </div>
        )}

        {/* Footer Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <FeatureCard icon={<Music className="text-pink-500" />} title="Audio DNA" desc="Deep analysis of your sound." />
          <FeatureCard icon={<Sparkles className="text-cyan-400" />} title="AI Visuals" desc="Cinematic lore in seconds." />
          <FeatureCard icon={<BarChart3 className="text-purple-500" />} title="Live Data" desc="Track your spark in real-time." />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-[#0A0A0A] border border-gray-900 p-6 rounded-xl">
      <div className="mb-3">{icon}</div>
      <h3 className="font-bold text-white mb-1">{title}</h3>
      <p className="text-gray-500 text-sm">{desc}</p>
    </div>
  );
    }
    
