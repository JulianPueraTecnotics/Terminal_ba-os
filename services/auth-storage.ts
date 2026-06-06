import AsyncStorage from '@react-native-async-storage/async-storage';
import type { JwtPayload, OutOfScheduleInfo } from '../types';

const TOKEN_KEY = 'terminal_banos_token';
const FE_NAME_KEY = 'terminal_banos_fe_name';
const OUT_OF_SCHEDULE_KEY = 'terminal_banos_out_of_schedule';

export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setStoredToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearStoredToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function getStoredFeName(): Promise<string | null> {
  return AsyncStorage.getItem(FE_NAME_KEY);
}

export async function setStoredFeName(name: string): Promise<void> {
  await AsyncStorage.setItem(FE_NAME_KEY, name);
}

export async function clearStoredFeName(): Promise<void> {
  await AsyncStorage.removeItem(FE_NAME_KEY);
}

export async function getOutOfScheduleInfo(): Promise<OutOfScheduleInfo | null> {
  const raw = await AsyncStorage.getItem(OUT_OF_SCHEDULE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OutOfScheduleInfo;
  } catch {
    return null;
  }
}

export async function setOutOfScheduleInfo(info: OutOfScheduleInfo): Promise<void> {
  await AsyncStorage.setItem(OUT_OF_SCHEDULE_KEY, JSON.stringify(info));
}

export async function clearOutOfScheduleInfo(): Promise<void> {
  await AsyncStorage.removeItem(OUT_OF_SCHEDULE_KEY);
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(decoded))) as JwtPayload;
  } catch {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload)) as JwtPayload;
    } catch {
      return null;
    }
  }
}

export function fixEncoding(text: string): string {
  try {
    return decodeURIComponent(escape(text));
  } catch {
    return text;
  }
}

export async function clearAuthStorage(): Promise<void> {
  await Promise.all([
    clearStoredToken(),
    clearStoredFeName(),
    clearOutOfScheduleInfo(),
  ]);
}
