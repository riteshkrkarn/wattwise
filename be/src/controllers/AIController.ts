import { Request, Response } from "express";
import { spawn } from "child_process";
import path from "path";
import { asyncHandler } from "../utils/AsyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { AILogger } from "../utils/aiLogger";

export class AIController {
  static analyze = asyncHandler(async (req: Request, res: Response) => {
    const { billData } = req.body;

    // Expect billData to be the normalized bill object
    if (!billData || !billData.breakdown) {
      throw new ApiError(
        400,
        "Missing required data: billData with breakdown is required."
      );
    }

    AILogger.log("Spawning Python Agent for analysis...");

    // Path to python script
    const pythonScriptPath = path.join(__dirname, "../python-agent/agent.py");

    // Prepare data for python script
    const inputData = JSON.stringify(billData);

    // Use venv python
    const pythonExecutable = path.resolve(
      __dirname,
      "../../venv/Scripts/python.exe"
    );
    const pythonProcess = spawn(pythonExecutable, [pythonScriptPath]);

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
        AILogger.error("Python Agent failed", errorData);
        // Don't crash the request if AI fails, return 500
        return res
          .status(500)
          .json(new ApiError(500, "AI Agent failed to analyze data"));
      }

      try {
        const agentResult = JSON.parse(outputData);

        if (agentResult.error) {
          AILogger.error("Python Agent reported error", agentResult.error);
          return res.status(500).json(new ApiError(500, agentResult.error));
        }

        // Post-processing: Calculate cost savings in Rupees
        const suggestions = agentResult.suggestions || [];
        const enhancedSuggestions = suggestions.map((s: any) => {
          const match = billData.breakdown.find(
            (b: any) => b.name.toLowerCase() === s.name.toLowerCase()
          );
          let savedAmount = 0;
          if (match) {
            savedAmount = match.estimatedCost * (s.reductionPercentage || 0);
          }
          return {
            ...s,
            savedAmount: parseFloat(savedAmount.toFixed(2)),
            currency: "INR",
          };
        });

        const totalPotentialSavings = enhancedSuggestions.reduce(
          (acc: number, curr: any) => acc + curr.savedAmount,
          0
        );

        const finalResult = {
          carbonFootprint: agentResult.carbonFootprint,
          suggestions: enhancedSuggestions,
          totalPotentialSavings: parseFloat(totalPotentialSavings.toFixed(2)),
        };

        AILogger.log("Python Agent analysis complete.");
        res
          .status(200)
          .json(
            new ApiResponse(
              200,
              finalResult,
              "AI Analysis (Agent) generated successfully"
            )
          );
      } catch (err: any) {
        AILogger.error("Failed to parse Python Agent output", err);
        res
          .status(500)
          .json(new ApiError(500, "Invalid response from AI Agent"));
      }
    });
  });
}
