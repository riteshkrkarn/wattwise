const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface RequestOptions extends RequestInit {
  headers?: HeadersInit;
}

// Genric API Response wrapper matching backend standard
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

// Legacy AuthResponse alias (for backward compatibility if needed)
export type AuthResponse = ApiResponse<AuthData>;

// Appliance Types
export interface Appliance {
  _id: string;
  category: string;
  name: string;
  wattage: number;
  count: number;
  defaultUsageHours: number;
}

export type CreateApplianceData = Omit<Appliance, "_id">;

export interface Preset {
  name: string;
  wattage: number;
}

// Bill & Estimation Types
export interface ParsedBillData {
  billingPeriod?: string;
  totalAmount?: number;
  totalUnits?: number;
  consumerNumber?: string;
  consumerName?: string;
  // Dynamic fields from parser
  [key: string]: any;
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
  normalizedBreakdown: Array<{
    name: string;
    estimatedCost: number;
    normalizedCost: number;
  }>;
}

export interface AIAnalysisInput {
  breakdown: any[]; // Or strict type if available
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
  breakdown: any[];
  date?: string;
}

// Auth Helpers
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem("authToken", token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem("authToken");
};

// Base API Request
const apiRequest = async <T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
};

// File Upload Helper
const uploadFile = async <T = unknown>(
  endpoint: string,
  file: File
): Promise<T> => {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("billPdf", file);

  const headers: HeadersInit = {};
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error");
  }
};

// API Client
export const api = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  patch: <T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/api/v1/users/login", { email, password }),

  signup: (name: string, email: string, password: string, city: string) =>
    api.post<AuthResponse>("/api/v1/users/signup", {
      name,
      email,
      password,
      city,
    }),

  logout: () => api.post("/api/v1/users/logout"),

  getMe: () => api.get<ApiResponse<{ user: User }>>("/api/v1/users/me"),

  updateDetails: (data: { name?: string; city?: string }) =>
    api.patch<ApiResponse<{ user: User }>>(
      "/api/v1/users/update-details",
      data
    ),
};

// Bills API
export const billsAPI = {
  getPresets: () => api.get<ApiResponse<Preset[]>>("/api/v1/bills/presets"),

  estimate: (
    rate: number,
    appliances: Array<{
      name: string;
      count: number;
      hours: number;
      watts: number;
    }>
  ) =>
    api.post<ApiResponse<EstimatedData>>("/api/v1/bills/estimate", {
      rate,
      appliances,
    }),

  compare: (actualBill: number, estimatedData: EstimatedData) =>
    api.post<ApiResponse<ComparisonResult>>("/api/v1/bills/compare", {
      actualBill,
      estimatedData,
    }),

  save: (data: Partial<BillRecord>) =>
    api.post<ApiResponse<any>>("/api/v1/bills/save", data),

  getHistory: () => api.get<ApiResponse<BillRecord[]>>("/api/v1/bills/history"),

  uploadPdf: (file: File) =>
    uploadFile<ApiResponse<ParsedBillData>>("/api/v1/bills/upload", file),
};

// Appliances API
export const appliancesAPI = {
  getAll: () => api.get<ApiResponse<Appliance[]>>("/api/v1/appliances"),

  create: (data: CreateApplianceData) =>
    api.post<ApiResponse<Appliance>>("/api/v1/appliances", data),

  delete: (id: string) =>
    api.delete<ApiResponse<any>>(`/api/v1/appliances/${id}`),
};

// AI API
export const aiAPI = {
  analyze: (billData: AIAnalysisInput) =>
    api.post<ApiResponse<AIResult>>("/api/v1/ai/analyze", { billData }),
};
