import { Request, Response } from "express";
import { spawn } from "child_process";
import path from "path";
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

    console.log(
      `[BillUploadController] ========== PDF UPLOAD START ==========`
    );
    console.log(
      `[BillUploadController] File received: ${req.file.originalname}`
    );
    console.log(`[BillUploadController] File size: ${req.file.size} bytes`);
    console.log(`[BillUploadController] MIME type: ${req.file.mimetype}`);
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

      const pythonProcess = spawn(pythonExecutable, [pythonScriptPath]);

      let outputData = "";
      let errorData = "";

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
          `[BillUploadController] Sending base64 data (${payload.pdfBase64.length} chars)`
        );
      } else {
        payload.pdfText = pdfText;
        console.log(
          `[BillUploadController] Sending text data (${pdfText.length} chars)`
        );
      }

      pythonProcess.stdin.write(JSON.stringify(payload));
      pythonProcess.stdin.end();
      console.log(`[BillUploadController] Data sent to Python agent`);

      pythonProcess.stdout.on("data", (data) => {
        outputData += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        errorData += data.toString();
        console.log(`[BillUploadController] Agent log: ${data.toString()}`);
      });

      pythonProcess.on("close", (code) => {
        console.log(
          `[BillUploadController] Python agent exited with code: ${code}`
        );
        console.log(`[BillUploadController] Agent stdout: ${outputData}`);
        if (errorData) {
          console.log(`[BillUploadController] Agent stderr: ${errorData}`);
        }
        if (code !== 0) {
          AILogger.error("Bill Parser Agent failed", errorData);
          return res
            .status(500)
            .json(new ApiError(500, "Failed to parse bill data"));
        }

        try {
          const result = JSON.parse(outputData);

          if (result.error) {
            AILogger.error("Bill Parser Agent reported error", result.error);
            return res.status(500).json(new ApiError(500, result.error));
          }

          console.log(
            `[BillUploadController] Parsed result:`,
            JSON.stringify(result, null, 2)
          );
          AILogger.log("Bill parsing complete");
          console.log(
            `[BillUploadController] ========== PDF UPLOAD SUCCESS ==========`
          );
          res
            .status(200)
            .json(new ApiResponse(200, result, "Bill parsed successfully"));
        } catch (err: any) {
          AILogger.error("Failed to parse agent output", err);
          res
            .status(500)
            .json(new ApiError(500, "Invalid response from bill parser"));
        }
      });
    } catch (error: any) {
      AILogger.error("PDF parsing error", error);
      throw new ApiError(500, `Failed to process PDF: ${error.message}`);
    }
  });
}
