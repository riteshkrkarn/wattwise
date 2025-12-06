import { Request, Response } from "express";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { asyncHandler } from "../utils/AsyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { AILogger } from "../utils/aiLogger";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

export class BillUploadController {
  static uploadAndParse = asyncHandler(async (req: Request, res: Response) => {
    // Check if file was uploaded
    if (!req.file) {
      throw new ApiError(400, "No file uploaded. Please upload a PDF file.");
    }

    // Validate file type
    if (req.file.mimetype !== "application/pdf") {
      throw new ApiError(400, "Invalid file type. Only PDF files are allowed.");
    }

    AILogger.log(`Processing uploaded PDF: ${req.file.originalname}`);

    try {
      const pdfBuffer = req.file.buffer;
      let pdfText = "";
      let isImageBased = false;

      // Try to extract text from PDF
      try {
        const pdfData = await pdfParse(pdfBuffer);
        pdfText = pdfData.text?.trim() || "";
        console.log(
          `[BillUploadController] Text extraction result: ${pdfText.length} chars`
        );
      } catch (parseErr: any) {
        console.log(
          `[BillUploadController] Text extraction failed: ${parseErr.message}`
        );
      }

      // If no text extracted, it's likely an image-based PDF
      if (!pdfText || pdfText.length < 50) {
        console.log(
          `[BillUploadController] PDF appears to be image-based, using vision mode`
        );
        isImageBased = true;
      } else {
        console.log(`[BillUploadController] PDF text extraction successful`);
        console.log(
          `[BillUploadController] First 300 chars: ${pdfText.substring(
            0,
            300
          )}...`
        );
      }

      // Spawn Python agent for AI extraction
      const pythonScriptPath = path.join(
        __dirname,
        "../python-agent/bill_parser_agent.py"
      );
      const pythonExecutable = path.resolve(
        __dirname,
        "../../venv/Scripts/python.exe"
      );

      // Verify Python executable exists
      if (!fs.existsSync(pythonExecutable)) {
        console.error(
          `[BillUploadController] ❌ Python executable not found: ${pythonExecutable}`
        );
        throw new ApiError(
          500,
          "Python environment not configured. Please ensure virtual environment is set up."
        );
      }

      // Verify Python script exists
      if (!fs.existsSync(pythonScriptPath)) {
        console.error(
          `[BillUploadController] ❌ Python script not found: ${pythonScriptPath}`
        );
        throw new ApiError(500, "Bill parser script not found.");
      }

      console.log(
        `[BillUploadController] Python script path: ${pythonScriptPath}`
      );
      console.log(
        `[BillUploadController] Python executable: ${pythonExecutable}`
      );
      console.log(`[BillUploadController] Spawning Python agent...`);
      console.log(
        `[BillUploadController] Mode: ${isImageBased ? "VISION" : "TEXT"}`
      );

      console.log(`[BillUploadController] Spawning Python agent process...`);
      const pythonProcess = spawn(pythonExecutable, [pythonScriptPath]);

      let outputData = "";
      let errorData = "";

      // Handle process errors
      pythonProcess.on("error", (err) => {
        console.error(
          `[BillUploadController] ❌ Failed to spawn Python process:`,
          err
        );
        if (!res.headersSent) {
          const errorResponse = new ApiError(
            500,
            `Failed to start bill parser: ${err.message}`
          );
          res.status(errorResponse.statusCode).json(errorResponse);
        }
      });

      // Prepare payload - include base64 for image-based PDFs
      const payload: {
        pdfText?: string;
        pdfBase64?: string;
        isImageBased: boolean;
      } = {
        isImageBased,
      };

      if (isImageBased) {
        payload.pdfBase64 = pdfBuffer.toString("base64");
        console.log(
          `[BillUploadController] Prepared payload with BASE64 data (${payload.pdfBase64.length} chars)`
        );
      } else {
        payload.pdfText = pdfText;
        console.log(
          `[BillUploadController] Prepared payload with TEXT data (${pdfText.length} chars)`
        );
      }

      // Handle stream errors
      pythonProcess.stdin.on("error", (err) => {
        console.error(`[BillUploadController] ❌ Stdin Error:`, err);
      });

      try {
        pythonProcess.stdin.write(JSON.stringify(payload));
        pythonProcess.stdin.end();
        console.log(
          `[BillUploadController] Payload written to Python stdin. Waiting for response...`
        );
      } catch (writeErr) {
        console.error(
          `[BillUploadController] ❌ Failed to write to stdin:`,
          writeErr
        );
        throw new ApiError(500, "Failed to communicate with analysis agent");
      }

      pythonProcess.stdout.on("data", (data) => {
        const chunk = data.toString();
        outputData += chunk;
      });

      pythonProcess.stderr.on("data", (data) => {
        const errChunk = data.toString();
        errorData += errChunk;
        console.log(`[BillUploadController] ⚠️ Agent Log/Error: ${errChunk}`);
      });

      pythonProcess.on("close", (code) => {
        console.log(
          `[BillUploadController] Python agent exited with code: ${code}`
        );

        console.log(
          `[BillUploadController] Full Output Data Length: ${outputData.length}`
        );
        // Log first 200 chars to see what we got
        console.log(
          `[BillUploadController] Output Preview: ${outputData.substring(
            0,
            200
          )}...`
        );

        if (errorData) {
          console.log(`[BillUploadController] Full Stderr Data: ${errorData}`);
        }

        // Guard against multiple responses
        if (res.headersSent) {
          console.log(
            `[BillUploadController] ⚠️ Response already sent, skipping.`
          );
          return;
        }

        if (code !== 0) {
          console.error(
            `[BillUploadController] ❌ Agent failed with non-zero exit code.`
          );
          AILogger.error("Bill Parser Agent failed", errorData);
          const errorResponse = new ApiError(
            500,
            "Failed to parse bill data - Agent Error"
          );
          return res.status(errorResponse.statusCode).json(errorResponse);
        }

        try {
          const result = JSON.parse(outputData);

          if (result.error) {
            AILogger.error("Bill Parser Agent reported error", result.error);
            const errorResponse = new ApiError(500, result.error);
            return res.status(errorResponse.statusCode).json(errorResponse);
          }

          console.log(
            `[BillUploadController] Parsed result:`,
            JSON.stringify(result, null, 2)
          );
          AILogger.log("Bill parsing complete");
          console.log(
            `[BillUploadController] ========== PDF UPLOAD SUCCESS ==========`
          );
          const successResponse = new ApiResponse(
            200,
            result,
            "Bill parsed successfully"
          );
          res.status(200).json(successResponse);
        } catch (err: any) {
          console.error(
            `[BillUploadController] ❌ JSON Parse Error:`,
            err.message
          );
          console.error(
            `[BillUploadController] Raw output that failed to parse:`,
            outputData
          );
          AILogger.error("Failed to parse agent output", err);
          const errorResponse = new ApiError(
            500,
            "Invalid response from bill parser"
          );
          res.status(errorResponse.statusCode).json(errorResponse);
        }
      });
    } catch (error: any) {
      AILogger.error("PDF parsing error", error);
      throw new ApiError(500, `Failed to process PDF: ${error.message}`);
    }
  });
}
