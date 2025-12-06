// API Response wrapper
export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

// User & Auth Types
export interface User {
  _id: string;
  name: string;
  email: string;
  city: string;
}

export interface AuthData {
  user: User;
  accessToken: string;
}

export type AuthResponse = ApiResponse<AuthData>;

// Appliance Types
export interface Preset {
  name: string;
  wattage: number;
  category: string;
}

export interface CreateApplianceData {
  category: string;
  name: string;
  wattage: number;
  count: number;
  defaultUsageHours: number;
}

export interface Appliance {
  _id: string;
  userId: string;
  category: string;
  name: string;
  wattage: number;
  count: number;
  defaultUsageHours: number;
}

// Bill & Estimation Types
export interface BreakdownItem {
  name: string;
  estimatedCost: number;
  normalizedCost: number;
}

export interface ParsedBillData {
  billingPeriod?: string;
  totalAmount?: number;
  totalUnits?: number;
  consumerNumber?: string;
  consumerName?: string;
  // Dynamic fields from parser
  [key: string]: string | number | undefined;
}

// State object for Bill Data passed between pages
export interface BillData {
  billMonth: string;
  totalAmount: number;
  unitsConsumed: number;
  consumerNumber?: string;
  dueDate?: string;
  consumerName?: string;
}

export interface EstimatedData {
  rate: number;
  appliances: Array<{
    name: string;
    count: number;
    hours: number;
    watts: number;
  }>;
  totalUnits: number;
  totalCost: number;
}

export interface ComparisonResult {
  discrepancyRatio: number;
  normalizedBreakdown: BreakdownItem[];
}

export interface AIAnalysisInput {
  breakdown: BreakdownItem[];
  totalEstimatedUnits: number;
}

export interface AIResult {
  carbonFootprint: number;
  impact?: { trees: number; carKm: number; description: string };
  suggestions: Array<{
    name: string;
    strategy: string;
    reductionPercentage: number;
    savedAmount: number;
  }>;
  totalPotentialSavings: number;
}

export interface BillRecord {
  userId: string;
  totalEstimatedUnits: number;
  totalEstimatedCost: number;
  actualBillAmount: number;
  discrepancyRatio: number;
  breakdown: BreakdownItem[];
  date?: string;
}

// Response type for save/delete operations
export interface OperationResponse {
  message: string;
  success: boolean;
}
