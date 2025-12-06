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

    AILogger.log(
      "Starting Triple-Agent Analysis (CO2 + Recommendations + Weather)..."
    );

    const inputData = JSON.stringify(billData);
    const pythonExecutable = path.resolve(
      __dirname,
      "../../venv/Scripts/python.exe"
    );

    // Function to spawn an agent
    const spawnAgent = (
      scriptName: string,
      label: string,
      customInput?: string
    ): Promise<any> => {
      return new Promise((resolve, reject) => {
        const scriptPath = path.join(
          __dirname,
          `../python-agent/${scriptName}`
        );
        AILogger.log(`Spawning ${label} Agent...`);

        const process = spawn(pythonExecutable, [scriptPath]);
        let output = "";
        let error = "";

        process.stdin.write(customInput || inputData);
        process.stdin.end();

        process.stdout.on("data", (data) => {
          output += data.toString();
        });

        process.stderr.on("data", (data) => {
          error += data.toString();
        });

        process.on("close", (code) => {
          if (code !== 0) {
            AILogger.error(`${label} Agent failed`, error);
            reject(new Error(`${label} Agent failed`));
            return;
          }
          try {
            const result = JSON.parse(output);
            if (result.error) {
              reject(new Error(result.error));
            } else {
              resolve(result);
            }
          } catch (e) {
            reject(new Error(`Failed to parse ${label} output`));
          }
        });
      });
    };

    try {
      // Prepare weather prediction input
      const city = req.user?.city || "Mumbai";
      const currentMonth = new Date().toLocaleString("en-US", {
        month: "long",
      });
      const currentBill = billData.breakdown.reduce(
        (sum: number, item: any) => sum + (item.estimatedCost || 0),
        0
      );

      const weatherInput = JSON.stringify({
        city,
        currentMonth,
        currentBill,
        appliances: billData.breakdown.map((item: any) => ({
          name: item.name,
          count: item.count,
          hours: item.hours,
          watts: item.watts,
        })),
      });

      // Run all three agents in parallel
      const [co2Result, recResult, weatherResult] = await Promise.all([
        spawnAgent("co2_agent.py", "CO2"),
        spawnAgent("recommendation_agent.py", "Recommendation"),
        spawnAgent("weather_prediction_agent.py", "Weather", weatherInput),
      ]);

      AILogger.log("All three agents completed successfully.");

      // Post-processing: Calculate cost savings in Rupees
      const suggestions = recResult.suggestions || [];
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
        carbonFootprint: co2Result.carbonFootprint,
        impact: co2Result.impact,
        suggestions: enhancedSuggestions,
        totalPotentialSavings: parseFloat(totalPotentialSavings.toFixed(2)),
        weatherPrediction: weatherResult, // NEW: Weather prediction for next month
      };

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            finalResult,
            "AI Analysis (Triple-Agent) generated successfully"
          )
        );
    } catch (error: any) {
      AILogger.error("AI Analysis failed", error);
      res
        .status(500)
        .json(new ApiError(500, error.message || "AI Analysis failed"));
    }
  });
}
