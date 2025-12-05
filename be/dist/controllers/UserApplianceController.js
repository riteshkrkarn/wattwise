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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserApplianceController = void 0;
const UserAppliance_1 = require("../models/UserAppliance");
const AsyncHandler_1 = require("../utils/AsyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const ApiError_1 = require("../utils/ApiError");
class UserApplianceController {
}
exports.UserApplianceController = UserApplianceController;
_a = UserApplianceController;
// Create a new appliance
UserApplianceController.createAppliance = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // We assume userId comes from auth middleware, but for now we might need to pass it in body or header
    // or just hardcode/mock it if auth isn't set up yet.
    // Let's assume req.body contains userId for now or we extract it.
    const appliance = new UserAppliance_1.UserAppliance(req.body);
    yield appliance.save();
    res
        .status(201)
        .json(new ApiResponse_1.ApiResponse(201, appliance, "Appliance created successfully"));
}));
// Get all appliances for a user
UserApplianceController.getUserAppliances = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.query; // or req.params depending on route
    if (!userId) {
        throw new ApiError_1.ApiError(400, "UserId required");
    }
    const appliances = yield UserAppliance_1.UserAppliance.find({ userId });
    res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, appliances, "Appliances fetched successfully"));
}));
// Delete an appliance
UserApplianceController.deleteAppliance = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const deleted = yield UserAppliance_1.UserAppliance.findByIdAndDelete(id);
    if (!deleted) {
        throw new ApiError_1.ApiError(404, "Appliance not found");
    }
    res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, { id }, "Appliance deleted successfully"));
}));
