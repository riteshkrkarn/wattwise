"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const aiLogger_1 = require("../utils/aiLogger");
const ApiError_1 = require("../utils/ApiError");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class AIService {
    static initialize() {
        if (!process.env.GEMINI_API_KEY) {
            aiLogger_1.AILogger.error("GEMINI_API_KEY is missing in environment variables.");
            throw new Error("GEMINI_API_KEY is required.");
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        aiLogger_1.AILogger.log("AIService initialized with Gemini Pro.");
    }
    static generateAnalysis(usageData, billData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.model) {
                this.initialize();
            }
            const prompt = `
      Analyze the following electricity usage and bill estimate data:
      
      Usage Data: ${JSON.stringify(usageData)}
      Bill Estimate: ${JSON.stringify(billData)}

      Please provide a JSON response with the following structure:
      {
        "carbonFootprint": {
          "estimatedCO2": "Estimate CO2 emissions (e.g., '120 kg')",
          "context": "A short, relatable comparison (e.g., 'Equivalent to planting 2 trees')"
        },
        "savingsTips": [
          {
            "title": "Short title of the tip",
            "description": "Actionable advice based on the appliances used",
            "potentialSavings": "Estimated monthly savings amount"
          },
          // provide 3 tips
        ],
        "summary": "A brief 2-sentence summary of their energy habits."
      }
      
      Ensure the response is valid JSON and nothing else.
    `;
            try {
                aiLogger_1.AILogger.log("Sending prompt to Gemini...");
                const result = yield this.model.generateContent(prompt);
                const response = yield result.response;
                const text = response.text();
                aiLogger_1.AILogger.log("Received response from Gemini");
                // Clean the text to ensure it's valid JSON (remove markdown code blocks if present)
                const cleanText = text
                    .replace(/```json/g, "")
                    .replace(/```/g, "")
                    .trim();
                const parsed = JSON.parse(cleanText);
                return parsed;
            }
            catch (error) {
                aiLogger_1.AILogger.error("Error generating analysis from Gemini", error);
                throw new ApiError_1.ApiError(500, "Failed to generate AI analysis", [], error.message);
            }
        });
    }
}
exports.AIService = AIService;
