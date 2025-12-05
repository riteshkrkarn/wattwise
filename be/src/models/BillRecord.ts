import mongoose, { Schema, Document } from "mongoose";

export interface IBillBreakdownItem {
  name: string;
  count: number;
  hours: number;
  watts: number;
  monthlyUnits: number;
  estimatedCost: number;
}

export interface IBillRecord extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  totalEstimatedUnits: number;
  totalEstimatedCost: number;
  actualBillAmount?: number;
  discrepancyRatio?: number;
  breakdown: IBillBreakdownItem[];
  metadata?: Record<string, any>; // For any extra info like "alert level"
}

const BillBreakdownSchema = new Schema(
  {
    name: { type: String, required: true },
    count: { type: Number, required: true },
    hours: { type: Number, required: true },
    watts: { type: Number, required: true },
    monthlyUnits: { type: Number, required: true },
    estimatedCost: { type: Number, required: true },
  },
  { _id: false }
);

const BillRecordSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    totalEstimatedUnits: {
      type: Number,
      required: true,
    },
    totalEstimatedCost: {
      type: Number,
      required: true,
    },
    actualBillAmount: {
      type: Number,
      default: null,
    },
    discrepancyRatio: {
      type: Number,
      default: null,
    },
    breakdown: [BillBreakdownSchema],
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

export const BillRecord = mongoose.model<IBillRecord>(
  "BillRecord",
  BillRecordSchema
);
