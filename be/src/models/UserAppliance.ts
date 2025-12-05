import mongoose, { Schema, Document } from "mongoose";

export enum ApplianceCategory {
  Cooling = "Cooling",
  Heating = "Heating",
  Kitchen = "Kitchen",
  Laundry = "Laundry",
  Lighting = "Lighting",
  Entertainment = "Entertainment",
  Other = "Other",
}

export interface IUserAppliance extends Document {
  userId: mongoose.Types.ObjectId;
  category: ApplianceCategory;
  name: string;
  wattage: number;
  count: number;
  defaultUsageHours: number;
}

const UserApplianceSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(ApplianceCategory),
      default: ApplianceCategory.Other,
    },
    name: {
      type: String,
      required: true,
    },
    wattage: {
      type: Number,
      required: true,
    },
    count: {
      type: Number,
      default: 1,
      min: 1,
    },
    defaultUsageHours: {
      type: Number,
      default: 0,
      min: 0,
      max: 24,
    },
  },
  { timestamps: true }
);

export const UserAppliance = mongoose.model<IUserAppliance>(
  "UserAppliance",
  UserApplianceSchema
);
