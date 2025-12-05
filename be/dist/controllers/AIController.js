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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const AsyncHandler_1 = require("../utils/AsyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const ApiError_1 = require("../utils/ApiError");
const aiLogger_1 = require("../utils/aiLogger");
class AIController {
}
exports.AIController = AIController;
_a = AIController;
AIController.analyze = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { billData } = req.body;
    // Expect billData to be the normalized bill object
    if (!billData || !billData.breakdown) {
        throw new ApiError_1.ApiError(400, "Missing required data: billData with breakdown is required.");
    }
    aiLogger_1.AILogger.log("Spawning Python Agent for analysis...");
    // Path to python script
    const pythonScriptPath = path_1.default.join(__dirname, "../python-agent/agent.py");
    // Prepare data for python script
    const inputData = JSON.stringify(billData);
    // Use venv python
    const pythonExecutable = path_1.default.resolve(__dirname, "../../venv/Scripts/python.exe");
    const pythonProcess = (0, child_process_1.spawn)(pythonExecutable, [pythonScriptPath]);
    let outputData = "";
    let errorData = "";
    pythonProcess.stdin.write(inputData);
    pythonProcess.stdin.end();
    pythonProcess.stdout.on("data", (data) => {
        outputData += data.toString();
    });
    pythonProcess.stderr.on("data", (data) => {
        errorData += data.toString();
    });
    pythonProcess.on("close", (code) => {
        if (code !== 0) {
            aiLogger_1.AILogger.error("Python Agent failed", errorData);
            // Don't crash the request if AI fails, return 500
            return res
                .status(500)
                .json(new ApiError_1.ApiError(500, "AI Agent failed to analyze data"));
        }
        try {
            const agentResult = JSON.parse(outputData);
            if (agentResult.error) {
                aiLogger_1.AILogger.error("Python Agent reported error", agentResult.error);
                return res.status(500).json(new ApiError_1.ApiError(500, agentResult.error));
            }
            // Post-processing: Calculate cost savings in Rupees
            const suggestions = agentResult.suggestions || [];
            const enhancedSuggestions = suggestions.map((s) => {
                const match = billData.breakdown.find((b) => b.name.toLowerCase() === s.name.toLowerCase());
                let savedAmount = 0;
                if (match) {
                    savedAmount = match.estimatedCost * (s.reductionPercentage || 0);
                }
                return Object.assign(Object.assign({}, s), { savedAmount: parseFloat(savedAmount.toFixed(2)), currency: "INR" });
            });
            const totalPotentialSavings = enhancedSuggestions.reduce((acc, curr) => acc + curr.savedAmount, 0);
            const finalResult = {
                carbonFootprint: agentResult.carbonFootprint,
                suggestions: enhancedSuggestions,
                totalPotentialSavings: parseFloat(totalPotentialSavings.toFixed(2)),
            };
            aiLogger_1.AILogger.log("Python Agent analysis complete.");
            res
                .status(200)
                .json(new ApiResponse_1.ApiResponse(200, finalResult, "AI Analysis (Agent) generated successfully"));
        }
        catch (err) {
            aiLogger_1.AILogger.error("Failed to parse Python Agent output", err);
            res
                .status(500)
                .json(new ApiError_1.ApiError(500, "Invalid response from AI Agent"));
        }
    });
}));
