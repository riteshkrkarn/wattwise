import { z } from "zod";
import { ApplianceCategory } from "../models/UserAppliance";

export const applianceSchema = z.object({
  body: z.object({
    category: z.nativeEnum(ApplianceCategory).optional(), // Optional, defaults to Other in Mongoose, but good to validate if sent
    name: z
      .string({
        message: "Name is required",
      })
      .min(2, "Name must be at least 2 characters long"),
    wattage: z
      .number({
        message: "Wattage is required",
      })
      .min(1, "Wattage must be at least 1 watt"),
    count: z.number().int().min(1, "Count must be at least 1").default(1),
    defaultUsageHours: z
      .number()
      .min(0)
      .max(24, "Usage hours cannot exceed 24")
      .default(0),
  }),
});

// For validating the bulk estimation request input
export const estimationSchema = z.object({
  body: z.object({
    rate: z.number().positive().optional(),
    appliances: z
      .array(
        z.object({
          name: z.string(),
          count: z.number().min(1),
          hours: z.number().min(0).max(24),
          watts: z.number().positive().optional(),
        })
      )
      .nonempty("At least one appliance is required"),
  }),
});

// For validating the Comparison request
export const comparisonSchema = z.object({
  body: z.object({
    actualBill: z.number().positive("Actual bill must be a positive number"),
    threshold: z.number().min(1).optional(),
    estimatedData: z.object({
      totalCost: z.number(),
      breakdown: z.array(
        z.object({
          name: z.string(),
          estimatedCost: z.number(),
        })
      ),
    }),
  }),
});

export const saveRecordSchema = z.object({
  body: z.object({
    // userId is extracted from token, so we don't validate it in body
    totalEstimatedUnits: z.number().min(0),
    totalEstimatedCost: z.number().min(0),
    actualBillAmount: z.number().nullable().optional(),
    discrepancyRatio: z.number().nullable().optional(),
    breakdown: z
      .array(
        z.object({
          name: z.string(),
          count: z.number().min(1),
          hours: z.number().min(0).max(24),
          watts: z.number().min(0),
          monthlyUnits: z.number().min(0),
          estimatedCost: z.number().min(0),
          normalizedCost: z.number().optional(), // Optional since it's calculated
        })
      )
      .nonempty("Breakdown cannot be empty"),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
});
