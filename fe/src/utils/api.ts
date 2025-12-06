import type {
  ApiResponse,
  User,
  AuthData,
  AuthResponse,
  Appliance,
  CreateApplianceData,
  Preset,
  BreakdownItem,
  ParsedBillData,
  BillData,
  EstimatedData,
  ComparisonResult,
  AIAnalysisInput,
  AIResult,
  BillRecord,
  UploadedBill,
  OperationResponse,
} from "../types";

import axios from "axios";

// Re-export types for backward compatibility
export type {
  ApiResponse,
  User,
  AuthData,
  AuthResponse,
  Appliance,
  CreateApplianceData,
  Preset,
  BreakdownItem,
  ParsedBillData,
  BillData,
  EstimatedData,
  ComparisonResult,
  AIAnalysisInput,
  AIResult,
  BillRecord,
  UploadedBill,
  OperationResponse,
};

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

// Helper to get headers with auth token
const getHeaders = (includeAuth = true) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

// Simple API wrapper
export const api = {
  get: async <T = unknown>(endpoint: string) => {
    const response = await axios.get<T>(`${API_BASE_URL}${endpoint}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  post: async <T = unknown>(endpoint: string, data?: unknown) => {
    const response = await axios.post<T>(`${API_BASE_URL}${endpoint}`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  patch: async <T = unknown>(endpoint: string, data?: unknown) => {
    const response = await axios.patch<T>(`${API_BASE_URL}${endpoint}`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  delete: async <T = unknown>(endpoint: string) => {
    const response = await axios.delete<T>(`${API_BASE_URL}${endpoint}`, {
      headers: getHeaders(),
    });
    return response.data;
  },
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
    api.post<ApiResponse<OperationResponse>>("/api/v1/bills/save", data),

  getHistory: () => api.get<ApiResponse<BillRecord[]>>("/api/v1/bills/history"),

  uploadPdf: async (file: File) => {
    const formData = new FormData();
    formData.append("billPdf", file);

    const token = getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "multipart/form-data",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.post<ApiResponse<ParsedBillData>>(
      `${API_BASE_URL}/api/v1/bills/upload`,
      formData,
      { headers }
    );

    return response.data;
  },
};

// Appliances API
export const appliancesAPI = {
  getAll: () => api.get<ApiResponse<Appliance[]>>("/api/v1/appliances"),

  create: (data: CreateApplianceData) =>
    api.post<ApiResponse<Appliance>>("/api/v1/appliances", data),

  update: (id: string, data: { count?: number; defaultUsageHours?: number }) =>
    api.patch<ApiResponse<Appliance>>(`/api/v1/appliances/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<OperationResponse>>(`/api/v1/appliances/${id}`),
};

// AI API
export const aiAPI = {
  analyze: (billData: AIAnalysisInput) =>
    api.post<ApiResponse<AIResult>>("/api/v1/ai/analyze", { billData }),
};
