import sys
import json
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class RecommendationAgent:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found")
        genai.configure(api_key=self.api_key)
        # Using gemini-2.0-flash
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    def analyze(self, data):
        """
        Generates energy saving recommendations.
        """
        breakdown = data.get('breakdown', [])
        
        prompt = f"""
        You are an Energy Efficiency Expert Agent.
        
        Input Data (Appliance Usage Breakdown):
        {json.dumps(breakdown, indent=2)}
        
        Task:
        Analyze each appliance. If an appliance consumes significant energy, suggest a REALISTIC percentage reduction strategy.
        Provide a short, actionable "strategy" string for each suggestion.
        
        Output JSON Format:
        {{
            "suggestions": [
                {{
                    "name": "Appliance Name (exact match from input)",
                    "reductionPercentage": 0.15, // e.g. 15%
                    "strategy": "Turn off AC when leaving the room to save 15%"
                }}
            ]
        }}
        
        Notes:
        - Only include suggestions for the top 3-4 energy consuming appliances.
        - reductions should be realistic (0.05 to 0.30).
        
        Return ONLY valid JSON.
        """
        
        try:
            response = self.model.generate_content(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            return {"error": str(e)}

if __name__ == "__main__":
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data provided"}))
            sys.exit(1)
            
        data = json.loads(input_data)
        agent = RecommendationAgent()
        result = agent.analyze(data)
        
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
