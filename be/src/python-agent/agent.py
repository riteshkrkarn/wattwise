import sys
import json
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class CarbonFootprintAgent:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found")
        genai.configure(api_key=self.api_key)
        # Using gemini-1.5-flash for better availability/speed
        self.model = genai.GenerativeModel('gemini-2.5-pro')

    def analyze(self, data):
        """
        Analyzes the bill data and returns carbon footprint + savings percentages.
        """
        breakdown = data.get('breakdown', [])
        
        prompt = f"""
        You are an Energy Efficiency Agent. Your goal is to analyze appliance usage and suggest savings.
        
        Input Data (Normalized Bill):
        {json.dumps(breakdown, indent=2)}
        
        Task:
        1. Calculate the estimated Carbon Footprint (in kg CO2) for this monthly usage. (Approx 0.82 kg CO2 per kWh).
        2. Analyze each appliance. If an appliance uses a lot of energy, suggest a REALISTIC percentage reduction (e.g., 0.10 for 10%).
        3. Provide a short "strategy" string for each suggestion.
        
        Output JSON Format:
        {{
            "carbonFootprint": "150 kg CO2",
            "suggestions": [
                {{
                    "name": "Appliance Name (exact match)",
                    "reductionPercentage": 0.15,
                    "strategy": "Turn off AC when leaving the room to save 15%"
                }}
            ]
        }}
        
        Return ONLY valid JSON.
        """
        
        try:
            response = self.model.generate_content(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            return {"error": str(e)}

if __name__ == "__main__":
    # Read input from stdin
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data provided"}))
            sys.exit(1)
            
        data = json.loads(input_data)
        agent = CarbonFootprintAgent()
        result = agent.analyze(data)
        
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
