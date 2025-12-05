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
