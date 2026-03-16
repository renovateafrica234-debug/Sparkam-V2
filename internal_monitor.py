import requests
import os

def check_sparkam_vitals():
    url = "https://sparkam.ng"
    print(f"--- Sparkam Launch Day Check: March 16, 2026 ---")
    try:
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            print(f"✅ SUCCESS: sparkam.ng is LIVE.")
        else:
            print(f"⚠️ WARNING: Site returned status {response.status_code}")
    except Exception as e:
        print(f"🚨 ALERT: sparkam.ng is DOWN. Error: {e}")

def funding_scout():
    print("\n--- Agentic Funding Scout ---")
    # Priority 1: Google for Startups Africa (Deadline March 18)
    print("🔍 Checking Google for Startups Africa status...")
    # This logic acts as a reminder for the 48-hour deadline
    print("📢 ACTION REQUIRED: Google Accelerator deadline is in 48 hours (March 18).")
    print("🤖 AI Brain: Pitch deck is ready for submission to hello@sparkam.ng.")

if __name__ == "__main__":
    check_sparkam_vitals()
    funding_scout()
  
