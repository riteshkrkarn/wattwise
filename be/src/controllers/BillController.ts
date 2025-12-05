import { Request, Response } from "express";
import { BillService, ApplianceUsageInput } from "../services/BillService";
import { BillRecord } from "../models/BillRecord";
import { APPLIANCE_PRESETS } from "../data/presets";
import { asyncHandler } from "../utils/AsyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

export class BillController {
  static getPresets = asyncHandler(async (req: Request, res: Response) => {
    res
      .status(200)
      .json(
        new ApiResponse(200, APPLIANCE_PRESETS, "Presets fetched successfully")
      );
  });

  static estimate = asyncHandler(async (req: Request, res: Response) => {
    const { appliances, rate } = req.body;

    if (!appliances || !Array.isArray(appliances)) {
      throw new ApiError(400, "Invalid input: appliances array required");
    }

    const result = BillService.estimateBill(
      appliances as ApplianceUsageInput[],
      rate
    );
    res
      .status(200)
      .json(new ApiResponse(200, result, "Bill estimated successfully"));
  });

  static compare = asyncHandler(async (req: Request, res: Response) => {
    const { estimatedData, actualBill, threshold } = req.body;

    if (!estimatedData || !actualBill) {
      throw new ApiError(
        400,
        "Invalid input: estimatedData and actualBill required"
      );
    }

    const result = BillService.compareAndNormalize(
      estimatedData,
      actualBill,
      threshold
    );
    res.status(200).json(new ApiResponse(200, result, "Comparison complete"));
  });

  static saveRecord = asyncHandler(async (req: Request, res: Response) => {
    // aligning with UserApplianceController: extracting userId from body
    const {
      userId,
      totalEstimatedUnits,
      totalEstimatedCost,
      actualBillAmount,
      breakdown,
      discrepancyRatio,
      metadata,
    } = req.body;

    if (!userId) {
      throw new ApiError(400, "UserId is required");
    }

    // Basic validation
    if (totalEstimatedCost === undefined || !breakdown) {
      throw new ApiError(400, "Missing required bill data (cost, breakdown)");
    }

    const record = await BillRecord.create({
      userId,
      totalEstimatedUnits,
      totalEstimatedCost,
      actualBillAmount, // can be null
      discrepancyRatio,
      breakdown,
      metadata,
      date: new Date(),
    });

    res
      .status(201)
      .json(new ApiResponse(201, record, "Bill record saved successfully"));
  });

  static getHistory = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.query;

    if (!userId) {
      throw new ApiError(400, "UserId is required");
    }

    const history = await BillRecord.find({ userId }).sort({ date: -1 });

    res
      .status(200)
      .json(new ApiResponse(200, history, "Bill history fetched successfully"));
  });
}
