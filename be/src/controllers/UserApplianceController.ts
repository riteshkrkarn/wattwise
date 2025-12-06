import { Request, Response } from "express";
import { UserAppliance } from "../models/UserAppliance";
import { asyncHandler } from "../utils/AsyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

export class UserApplianceController {
  // Create a new appliance
  static createAppliance = asyncHandler(async (req: Request, res: Response) => {
    // We assume userId comes from auth middleware
    const userId = req.user?._id;
    if (!userId) {
      throw new ApiError(401, "Unauthorized - User ID missing");
    }

    console.log(
      `[UserApplianceController] Creating appliance: ${req.body.name} for user ${userId}`
    );

    const appliance = new UserAppliance({
      ...req.body,
      userId,
    });
    await appliance.save();
    res
      .status(201)
      .json(new ApiResponse(201, appliance, "Appliance created successfully"));
  });

  // Get all appliances for a user
  static getUserAppliances = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = req.user?._id;
      if (!userId) {
        throw new ApiError(401, "Unauthorized - User ID missing");
      }

      const appliances = await UserAppliance.find({ userId });
      res
        .status(200)
        .json(
          new ApiResponse(200, appliances, "Appliances fetched successfully")
        );
    }
  );

  // Update an appliance
  static updateAppliance = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized - User ID missing");
    }

    const { count, defaultUsageHours } = req.body;

    if (!count || !defaultUsageHours) {
      throw new ApiError(400, "Missing required fields");
    }

    const appliance = await UserAppliance.findOneAndUpdate(
      { _id: id, userId }, // Ensure user owns this appliance
      { count, defaultUsageHours },
      { new: true, runValidators: true }
    );

    if (!appliance) {
      throw new ApiError(404, "Appliance not found or unauthorized");
    }

    res
      .status(200)
      .json(new ApiResponse(200, appliance, "Appliance updated successfully"));
  });

  // Delete an appliance
  static deleteAppliance = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = await UserAppliance.findByIdAndDelete(id);
    if (!deleted) {
      throw new ApiError(404, "Appliance not found");
    }
    res
      .status(200)
      .json(new ApiResponse(200, { id }, "Appliance deleted successfully"));
  });
}
