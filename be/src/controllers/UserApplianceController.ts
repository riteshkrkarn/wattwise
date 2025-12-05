import { Request, Response } from "express";
import { UserAppliance } from "../models/UserAppliance";
import { asyncHandler } from "../utils/AsyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

export class UserApplianceController {
  // Create a new appliance
  static createAppliance = asyncHandler(async (req: Request, res: Response) => {
    // We assume userId comes from auth middleware, but for now we might need to pass it in body or header
    // or just hardcode/mock it if auth isn't set up yet.
    // Let's assume req.body contains userId for now or we extract it.

    const appliance = new UserAppliance(req.body);
    await appliance.save();
    res
      .status(201)
      .json(new ApiResponse(201, appliance, "Appliance created successfully"));
  });

  // Get all appliances for a user
  static getUserAppliances = asyncHandler(
    async (req: Request, res: Response) => {
      const { userId } = req.query; // or req.params depending on route
      if (!userId) {
        throw new ApiError(400, "UserId required");
      }

      const appliances = await UserAppliance.find({ userId });
      res
        .status(200)
        .json(
          new ApiResponse(200, appliances, "Appliances fetched successfully")
        );
    }
  );

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
