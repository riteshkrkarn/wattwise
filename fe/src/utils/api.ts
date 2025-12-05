const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface RequestOptions extends RequestInit {
  headers?: HeadersInit;
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Set auth token to localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Remove auth token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// Base API request function
const apiRequest = async (
  endpoint: string,
  options: RequestOptions = {}
): Promise<any> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error');
  }
};

// API methods
export const api = {
  get: (endpoint: string, options?: RequestOptions) =>
    apiRequest(endpoint, { ...options, method: 'GET' }),

  post: (endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: (endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (endpoint: string, options?: RequestOptions) =>
    apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

// Auth API calls
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),

  signup: (name: string, email: string, password: string) =>
    api.post('/api/auth/signup', { name, email, password }),

  logout: () => {
    removeAuthToken();
  },
};
