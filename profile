<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile - Sparkam</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body { background: linear-gradient(135deg, #0f051a 0%, #1a0520 100%); font-family: 'Inter', sans-serif; color: white; }
        .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .gradient-text { background: linear-gradient(90deg, #ff00cc, #3333ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    </style>
</head>
<body>
    <nav class="glass border-b border-white/10">
        <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <a href="/dashboard.html" class="text-2xl font-black gradient-text">SPARKAM</a>
            <a href="/dashboard.html" class="text-gray-400 hover:text-white"><i class="fa-solid fa-arrow-left"></i> Back</a>
        </div>
    </nav>

    <div class="max-w-4xl mx-auto px-6 py-12">
        <h1 class="text-4xl font-black mb-8">Account <span class="gradient-text">Settings</span></h1>

        <div class="glass rounded-3xl p-8 mb-6">
            <h2 class="text-2xl font-bold mb-6">Subscription</h2>
            <div class="flex items-center justify-between mb-4">
                <div>
                    <div class="text-sm text-gray-400">Current Plan</div>
                    <div class="text-2xl font-black gradient-text">PRO</div>
                </div>
                <div class="text-right">
                    <div class="text-sm text-gray-400">Monthly Cost</div>
                    <div class="text-2xl font-black">₦49,500</div>
                    <div class="text-xs text-green-400">50% Beta Discount</div>
                </div>
            </div>
            <div class="flex gap-4 mt-6">
                <a href="/pricing.html" class="px-6 py-3 border-2 border-pink-500 rounded-xl font-bold hover:bg-pink-500/10">
                    Change Plan
                </a>
                <button class="px-6 py-3 text-gray-400 hover:text-white">Cancel Subscription</button>
            </div>
        </div>

        <div class="glass rounded-3xl p-8 mb-6">
            <h2 class="text-2xl font-bold mb-6">Profile Information</h2>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm mb-2">Artist Name</label>
                    <input type="text" class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3" value="Zeeter Oliver">
                </div>
                <div>
                    <label class="block text-sm mb-2">Email</label>
                    <input type="email" class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3" value="artist@example.com">
                </div>
                <button class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl font-bold">
                    Save Changes
                </button>
            </div>
        </div>

        <div class="glass rounded-3xl p-8">
            <h2 class="text-2xl font-bold mb-6">Usage Statistics</h2>
            <div class="grid md:grid-cols-3 gap-6">
                <div>
                    <div class="text-sm text-gray-400">Campaigns Generated</div>
                    <div class="text-3xl font-black">0</div>
                </div>
                <div>
                    <div class="text-sm text-gray-400">Chat Messages</div>
                    <div class="text-3xl font-black">0</div>
                </div>
                <div>
                    <div class="text-sm text-gray-400">Downloads</div>
                    <div class="text-3xl font-black">0</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>

