import sys
import json
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class CO2Agent:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found")
        genai.configure(api_key=self.api_key)
        # Using gemini-2.0-flash for consistency with bill parser
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    def analyze(self, data):
        """
        Calculates carbon footprint and provides environmental context.
        """
        breakdown = data.get('breakdown', [])
        
        prompt = f"""
        You are a Carbon Footprint Calculator Agent.
        
        Input Data (Normalized Bill Breakdown):
        {json.dumps(breakdown, indent=2)}
        
        Task:
        1. Calculate the estimated Carbon Footprint (in kg CO2) for this monthly usage. 
           (Assume approx 0.82 kg CO2 per kWh if not specified, but refine based on appliance type if possible).
        2. Provide "environmental impact" context. Translate this amount of CO2 into tangible terms:
           - Equivalent number of trees needed to absorb this CO2.
           - Equivalent km driven by an average car.
        
        Output JSON Format:
        {{
            "carbonFootprint": 150.5,  // number in kg
            "impact": {{
                "trees": 5,           // number of trees
                "carKm": 300,         // number of km
                "description": "Your monthly energy usage generates 150.5kg of CO2, which is equivalent to driving a car for 300km. You would need 5 trees to offset this."
            }}
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
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data provided"}))
            sys.exit(1)
            
        data = json.loads(input_data)
        agent = CO2Agent()
        result = agent.analyze(data)
        
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
