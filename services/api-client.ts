import {
  EXPO_PUBLIC_APP_B_PATH,
  EXPO_PUBLIC_APP_B_URL,
} from '../config';
import type { ApiErrorResponse } from '../types';
import { getStoredToken } from './auth-storage';

export class ApiError extends Error {
  status: number;
  data?: ApiErrorResponse;

  constructor(status: number, message: string, data?: ApiErrorResponse) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = token;
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    let errorData: ApiErrorResponse | undefined;
    try {
      const body: ApiErrorResponse = await response.json();
      errorMessage = body.message || errorMessage;
      errorData = body;
    } catch {
      // ignore
    }
    throw new ApiError(response.status, errorMessage, errorData);
  }
  if (response.status === 204) return {} as T;
  return response.json();
}

function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  const baseUrl = EXPO_PUBLIC_APP_B_URL.replace(/\/$/, '');
  const path = endpoint.replace(/^\//, '');
  const base = EXPO_PUBLIC_APP_B_PATH
    ? `${baseUrl}${EXPO_PUBLIC_APP_B_PATH}/${path}`
    : `${baseUrl}/${path}`;
  if (!params || Object.keys(params).length === 0) return base;
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') search.append(k, String(v));
  });
  const q = search.toString();
  return q ? `${base}?${q}` : base;
}

export async function apiGet<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
  auth = true
): Promise<T> {
  const url = buildUrl(endpoint, params);
  const headers = auth ? await getAuthHeaders() : { 'Content-Type': 'application/json' };
  const response = await fetch(url, { method: 'GET', headers });
  return handleResponse<T>(response);
}

export async function apiPost<T>(
  endpoint: string,
  body?: object,
  auth = true
): Promise<T> {
  const url = buildUrl(endpoint);
  const headers = auth ? await getAuthHeaders() : { 'Content-Type': 'application/json' };
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

export async function apiPut<T>(endpoint: string, body?: object): Promise<T> {
  const url = buildUrl(endpoint);
  const headers = await getAuthHeaders();
  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

export async function apiPatch<T>(endpoint: string, body?: object): Promise<T> {
  const url = buildUrl(endpoint);
  const headers = await getAuthHeaders();
  const response = await fetch(url, {
    method: 'PATCH',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  const url = buildUrl(endpoint);
  const headers = await getAuthHeaders();
  const response = await fetch(url, { method: 'DELETE', headers });
  return handleResponse<T>(response);
}
