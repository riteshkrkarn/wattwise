import sys
import json
import os
import requests
import google.generativeai as genai
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

class WeatherPredictionAgent:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.weather_api_key = os.getenv("OPENWEATHER_API_KEY")  # Optional
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found")
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
    
    def get_weather_data(self, city):
        """
        Fetch current weather data from OpenWeatherMap API (optional).
        Returns current temperature, humidity, and description.
        """
        if not self.weather_api_key:
            return None
        
        try:
            # Get city coordinates first
            geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city},IN&limit=1&appid={self.weather_api_key}"
            geo_response = requests.get(geo_url, timeout=5)
            geo_data = geo_response.json()
            
            if not geo_data:
                return None
            
            lat = geo_data[0]['lat']
            lon = geo_data[0]['lon']
            
            # Get current weather
            weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={self.weather_api_key}&units=metric"
            weather_response = requests.get(weather_url, timeout=5)
            weather_data = weather_response.json()
            
            return {
                "currentTemp": weather_data['main']['temp'],
                "humidity": weather_data['main']['humidity'],
                "description": weather_data['weather'][0]['description']
            }
        except Exception as e:
            print(f"Weather API error: {e}", file=sys.stderr)
            return None
    
    def predict(self, data):
        """
        Predicts next month's bill change based on weather/seasonal factors.
        """
        city = data.get('city')
        current_month = data.get('currentMonth')  # e.g., "November"
        current_bill = data.get('currentBill')
        appliances = data.get('appliances', [])
        
        # Try to get real weather data
        weather_data = self.get_weather_data(city)
        weather_context = ""
        
        if weather_data:
            weather_context = f"""
            Current Weather Data for {city}:
            - Temperature: {weather_data['currentTemp']}°C
            - Humidity: {weather_data['humidity']}%
            - Conditions: {weather_data['description']}
            
            Use this real data to make more accurate predictions.
            """
        
        prompt = f"""
        You are a Weather-Based Energy Consumption Predictor for India.
        
        Input Data:
        - City: {city}
        - Current Month: {current_month}
        - Current Bill: ₹{current_bill}
        - Appliances: {json.dumps(appliances, indent=2)}
        
        {weather_context}
        
        Task:
        1. Analyze typical weather patterns for {city} in the NEXT month (consider Indian climate)
        2. Consider seasonal changes (temperature, humidity, monsoon, summer, winter)
        3. Predict how appliance usage will change:
           - AC/Cooling: increases in summer (Mar-Jun), decreases in winter/monsoon
           - Fans: high in summer, moderate in other seasons
           - Heating: increases in winter (Dec-Feb) in northern cities
           - Refrigerator: slightly higher in summer
           - Other appliances: minimal seasonal change
        
        4. Calculate the percentage change in total bill for next month
        
        Important: Be realistic. Most changes are between 0.8x to 1.5x
        
        Output JSON Format:
        {{
            "nextMonth": "December",
            "weatherFactor": 1.2,
            "predictedBill": {current_bill * 1.2},
            "reasoning": "December in {city} is typically cooler (15-20°C), reducing AC usage by 80% but fans still used moderately. Net effect: 20% increase in bill due to increased lighting hours."
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
        agent = WeatherPredictionAgent()
        result = agent.predict(data)
        
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
