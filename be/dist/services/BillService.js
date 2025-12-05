"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillService = void 0;
const presets_1 = require("../data/presets");
const ApiError_1 = require("../utils/ApiError");
class BillService {
    static estimateBill(appliances, rate = this.DEFAULT_RATE) {
        let totalUnits = 0;
        const breakdown = appliances.map((item) => {
            let wattage = item.watts;
            if (!wattage) {
                const preset = presets_1.APPLIANCE_PRESETS.find((p) => p.name.toLowerCase() === item.name.toLowerCase());
                wattage = preset ? preset.wattage : 100;
            }
            const dailyUnits = (wattage * item.count * item.hours) / 1000;
            const monthlyUnits = dailyUnits * BillService.DAYS_IN_MONTH;
            const cost = monthlyUnits * rate;
            totalUnits += monthlyUnits;
            return Object.assign(Object.assign({}, item), { wattageUsed: wattage, monthlyUnits: parseFloat(monthlyUnits.toFixed(2)), estimatedCost: parseFloat(cost.toFixed(2)) });
        });
        const totalCost = totalUnits * rate;
        return {
            breakdown,
            totalUnits: parseFloat(totalUnits.toFixed(2)),
            totalCost: parseFloat(totalCost.toFixed(2)),
            rateApplied: rate,
        };
    }
    static compareAndNormalize(estimatedData, actualBillAmount, threshold = 1.2) {
        const estimatedTotal = estimatedData.totalCost;
        if (estimatedTotal === 0) {
            throw new ApiError_1.ApiError(400, "Estimated bill cannot be zero for comparison");
        }
        const ratio = actualBillAmount / estimatedTotal;
        const isHighMismatch = ratio > threshold;
        const normalizedBreakdown = estimatedData.breakdown.map((item) => ({
            name: item.name,
            estimatedCost: item.estimatedCost,
            normalizedCost: parseFloat((item.estimatedCost * ratio).toFixed(2)),
            difference: parseFloat((item.estimatedCost * ratio - item.estimatedCost).toFixed(2)),
        }));
        const percentageDiff = (ratio * 100 - 100).toFixed(1);
        return {
            originalEstimate: estimatedTotal,
            actualBill: actualBillAmount,
            ratio: parseFloat(ratio.toFixed(2)),
            alert: isHighMismatch,
            alertType: isHighMismatch ? "HIGH_DISCREPANCY" : "NORMAL",
            actionRequired: isHighMismatch ? "CONFIRM_PROCEED" : "NONE",
            alertMessage: isHighMismatch
                ? `Critical: Actual bill is ${percentageDiff}% higher than estimated. Please check your appliance usage inputs.`
                : "Bill is within expected range.",
            normalizedBreakdown,
        };
    }
}
exports.BillService = BillService;
BillService.DAYS_IN_MONTH = 30;
BillService.DEFAULT_RATE = 10;
