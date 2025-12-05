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
exports.BillController = void 0;
const BillService_1 = require("../services/BillService");
const BillRecord_1 = require("../models/BillRecord");
const presets_1 = require("../data/presets");
const AsyncHandler_1 = require("../utils/AsyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const ApiError_1 = require("../utils/ApiError");
class BillController {
}
exports.BillController = BillController;
_a = BillController;
BillController.getPresets = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, presets_1.APPLIANCE_PRESETS, "Presets fetched successfully"));
}));
BillController.estimate = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { appliances, rate } = req.body;
    if (!appliances || !Array.isArray(appliances)) {
        throw new ApiError_1.ApiError(400, "Invalid input: appliances array required");
    }
    const result = BillService_1.BillService.estimateBill(appliances, rate);
    res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, result, "Bill estimated successfully"));
}));
BillController.compare = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { estimatedData, actualBill, threshold } = req.body;
    if (!estimatedData || !actualBill) {
        throw new ApiError_1.ApiError(400, "Invalid input: estimatedData and actualBill required");
    }
    const result = BillService_1.BillService.compareAndNormalize(estimatedData, actualBill, threshold);
    res.status(200).json(new ApiResponse_1.ApiResponse(200, result, "Comparison complete"));
}));
BillController.saveRecord = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // aligning with UserApplianceController: extracting userId from body
    const { userId, totalEstimatedUnits, totalEstimatedCost, actualBillAmount, breakdown, discrepancyRatio, metadata, } = req.body;
    if (!userId) {
        throw new ApiError_1.ApiError(400, "UserId is required");
    }
    // Basic validation
    if (totalEstimatedCost === undefined || !breakdown) {
        throw new ApiError_1.ApiError(400, "Missing required bill data (cost, breakdown)");
    }
    const record = yield BillRecord_1.BillRecord.create({
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
        .json(new ApiResponse_1.ApiResponse(201, record, "Bill record saved successfully"));
}));
BillController.getHistory = (0, AsyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.query;
    if (!userId) {
        throw new ApiError_1.ApiError(400, "UserId is required");
    }
    const history = yield BillRecord_1.BillRecord.find({ userId }).sort({ date: -1 });
    res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, history, "Bill history fetched successfully"));
}));
