import sys
import json
import os
import base64
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def log(message):
    """Log to stderr so it doesn't interfere with JSON stdout output"""
    print(f"[BillParserAgent] {message}", file=sys.stderr)

class BillPdfParserAgent:
    def __init__(self):
        log("Initializing BillPdfParserAgent...")
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            log("ERROR: GEMINI_API_KEY not found!")
            raise ValueError("GEMINI_API_KEY not found")
        log("API key found, configuring Gemini...")
        genai.configure(api_key=self.api_key)
        # Using Gemini 2.0 Flash (stable) for speed and vision support
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        log("Model initialized: gemini-2.0-flash")

    def extract_from_text(self, pdf_text: str):
        """
        Extracts bill details from raw PDF text using Gemini.
        """
        log(f"TEXT MODE: Received PDF text of length: {len(pdf_text)} characters")
        log(f"First 200 chars of input: {pdf_text[:200]}...")
        
        prompt = f"""
        You are an Electricity Bill Parser Agent. Your task is to extract key billing information from the provided bill text.
        
        Bill Text:
        {pdf_text[:8000]}
        
        Extract the following information:
        1. Total Bill Amount (in INR or the currency shown)
        2. Total Units Consumed (in kWh)
        3. Billing Period (if available)
        4. Consumer/Account Number (if available)
        
        Output ONLY valid JSON in this exact format:
        {{
            "totalAmount": 3450.50,
            "totalUnits": 420,
            "billingPeriod": "Oct 2023 - Nov 2023",
            "consumerNumber": "1234567890",
            "confidence": "high"
        }}
        
        Notes:
        - If a field is not found, use null for that field.
        - "confidence" should be "high", "medium", or "low" based on how clearly the data was identified.
        - Return ONLY valid JSON, no explanations.
        """
        
        try:
            log("Sending text prompt to Gemini API...")
            response = self.model.generate_content(prompt)
            log("Received response from Gemini API")
            log(f"Raw response text: {response.text[:500]}...")
            text = response.text.replace('```json', '').replace('```', '').strip()
            log(f"Cleaned response: {text}")
            result = json.loads(text)
            log(f"Parsed result: {json.dumps(result)}")
            return result
        except Exception as e:
            log(f"ERROR during text extraction: {str(e)}")
            return {"error": str(e)}

    def extract_from_image(self, pdf_base64: str):
        """
        Extracts bill details from image-based PDF using Gemini Vision.
        """
        log(f"VISION MODE: Received base64 of length: {len(pdf_base64)} chars")
        
        prompt = """
        You are an Electricity Bill Parser Agent. Analyze this electricity bill image and extract the following information:
        
        1. Total Bill Amount (in INR or the currency shown)
        2. Total Units Consumed (in kWh)
        3. Billing Period (if available)
        4. Consumer/Account Number (if available)
        
        Output ONLY valid JSON in this exact format:
        {
            "totalAmount": 3450.50,
            "totalUnits": 420,
            "billingPeriod": "Oct 2023 - Nov 2023",
            "consumerNumber": "1234567890",
            "confidence": "high"
        }
        
        Notes:
        - If a field is not found, use null for that field.
        - "confidence" should be "high", "medium", or "low" based on how clearly the data was identified.
        - Return ONLY valid JSON, no explanations.
        """
        
        try:
            log("Preparing image data for Gemini Vision...")
            # Create the image part for Gemini
            image_data = {
                "mime_type": "application/pdf",
                "data": pdf_base64
            }
            
            log("Sending vision prompt to Gemini API...")
            response = self.model.generate_content([prompt, image_data])
            log("Received response from Gemini Vision API")
            log(f"Raw response text: {response.text[:500]}...")
            text = response.text.replace('```json', '').replace('```', '').strip()
            log(f"Cleaned response: {text}")
            result = json.loads(text)
            log(f"Parsed result: {json.dumps(result)}")
            return result
        except Exception as e:
            log(f"ERROR during vision extraction: {str(e)}")
            return {"error": str(e)}

if __name__ == "__main__":
    log("========== BILL PARSER AGENT START ==========")
    try:
        log("Reading input from stdin...")
        input_data = sys.stdin.read()
        log(f"Received {len(input_data)} bytes from stdin")
        
        if not input_data:
            log("ERROR: No input data provided")
            print(json.dumps({"error": "No input data provided"}))
            sys.exit(1)
            
        data = json.loads(input_data)
        is_image_based = data.get("isImageBased", False)
        log(f"Mode: {'VISION' if is_image_based else 'TEXT'}")
        
        agent = BillPdfParserAgent()
        
        if is_image_based:
            pdf_base64 = data.get("pdfBase64", "")
            log(f"Processing image-based PDF, base64 length: {len(pdf_base64)}")
            if not pdf_base64:
                log("ERROR: No base64 data provided for image mode")
                print(json.dumps({"error": "No PDF base64 data provided"}))
                sys.exit(1)
            result = agent.extract_from_image(pdf_base64)
        else:
            pdf_text = data.get("pdfText", "")
            log(f"Processing text-based PDF, text length: {len(pdf_text)}")
            if not pdf_text:
                log("ERROR: No PDF text provided for text mode")
                print(json.dumps({"error": "No PDF text provided"}))
                sys.exit(1)
            result = agent.extract_from_text(pdf_text)
        
        log(f"Final result: {json.dumps(result)}")
        log("========== BILL PARSER AGENT END ==========")
        print(json.dumps(result))
    except Exception as e:
        log(f"FATAL ERROR: {str(e)}")
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


