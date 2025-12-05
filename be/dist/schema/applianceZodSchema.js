"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparisonSchema = exports.estimationSchema = exports.applianceSchema = void 0;
const zod_1 = require("zod");
const UserAppliance_1 = require("../models/UserAppliance");
exports.applianceSchema = zod_1.z.object({
    body: zod_1.z.object({
        category: zod_1.z.nativeEnum(UserAppliance_1.ApplianceCategory).optional(), // Optional, defaults to Other in Mongoose, but good to validate if sent
        name: zod_1.z
            .string({
            message: "Name is required",
        })
            .min(2, "Name must be at least 2 characters long"),
        wattage: zod_1.z
            .number({
            message: "Wattage is required",
        })
            .min(1, "Wattage must be at least 1 watt"),
        count: zod_1.z.number().int().min(1, "Count must be at least 1").default(1),
        defaultUsageHours: zod_1.z
            .number()
            .min(0)
            .max(24, "Usage hours cannot exceed 24")
            .default(0),
    }),
});
// For validating the bulk estimation request input
exports.estimationSchema = zod_1.z.object({
    body: zod_1.z.object({
        rate: zod_1.z.number().positive().optional(),
        appliances: zod_1.z
            .array(zod_1.z.object({
            name: zod_1.z.string(),
            count: zod_1.z.number().min(1),
            hours: zod_1.z.number().min(0).max(24),
            watts: zod_1.z.number().positive().optional(),
        }))
            .nonempty("At least one appliance is required"),
    }),
});
// For validating the Comparison request
exports.comparisonSchema = zod_1.z.object({
    body: zod_1.z.object({
        actualBill: zod_1.z.number().positive("Actual bill must be a positive number"),
        threshold: zod_1.z.number().min(1).optional(),
        estimatedData: zod_1.z.object({
            totalCost: zod_1.z.number(),
            breakdown: zod_1.z.array(zod_1.z.object({
                name: zod_1.z.string(),
                estimatedCost: zod_1.z.number(),
            })),
        }),
    }),
});
