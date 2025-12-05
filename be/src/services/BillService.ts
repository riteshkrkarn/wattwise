import { APPLIANCE_PRESETS } from "../data/presets";
import { ApiError } from "../utils/ApiError";

export interface ApplianceUsageInput {
  name: string;
  count: number;
  hours: number;
  watts?: number;
}

export interface BillBreakdownItem extends ApplianceUsageInput {
  wattageUsed: number;
  monthlyUnits: number;
  estimatedCost: number;
}

export interface BillEstimateResult {
  breakdown: BillBreakdownItem[];
  totalUnits: number;
  totalCost: number;
  rateApplied: number;
}

export interface ComparisonResult {
  originalEstimate: number;
  actualBill: number;
  ratio: number;
  alert: boolean;
  alertType: "HIGH_DISCREPANCY" | "NORMAL";
  actionRequired: "CONFIRM_PROCEED" | "NONE";
  alertMessage: string;
  normalizedBreakdown: {
    name: string;
    estimatedCost: number;
    normalizedCost: number;
    difference: number;
  }[];
}

export class BillService {
  private static DAYS_IN_MONTH = 30;
  private static DEFAULT_RATE = 10;

  static estimateBill(
    appliances: ApplianceUsageInput[],
    rate: number = this.DEFAULT_RATE
  ): BillEstimateResult {
    let totalUnits = 0;

    const breakdown: BillBreakdownItem[] = appliances.map((item) => {
      let wattage = item.watts;

      if (!wattage) {
        const preset = APPLIANCE_PRESETS.find(
          (p) => p.name.toLowerCase() === item.name.toLowerCase()
        );
        wattage = preset ? preset.wattage : 100;
      }

      const dailyUnits = (wattage * item.count * item.hours) / 1000;
      const monthlyUnits = dailyUnits * BillService.DAYS_IN_MONTH;
      const cost = monthlyUnits * rate;

      totalUnits += monthlyUnits;

      return {
        ...item,
        wattageUsed: wattage,
        monthlyUnits: parseFloat(monthlyUnits.toFixed(2)),
        estimatedCost: parseFloat(cost.toFixed(2)),
      };
    });

    const totalCost = totalUnits * rate;

    return {
      breakdown,
      totalUnits: parseFloat(totalUnits.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      rateApplied: rate,
    };
  }

  static compareAndNormalize(
    estimatedData: BillEstimateResult,
    actualBillAmount: number,
    threshold: number = 1.2
  ): ComparisonResult {
    const estimatedTotal = estimatedData.totalCost;

    if (estimatedTotal === 0) {
      throw new ApiError(400, "Estimated bill cannot be zero for comparison");
    }

    const ratio = actualBillAmount / estimatedTotal;
    const isHighMismatch = ratio > threshold;

    const normalizedBreakdown = estimatedData.breakdown.map((item) => ({
      name: item.name,
      estimatedCost: item.estimatedCost,
      normalizedCost: parseFloat((item.estimatedCost * ratio).toFixed(2)),
      difference: parseFloat(
        (item.estimatedCost * ratio - item.estimatedCost).toFixed(2)
      ),
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
