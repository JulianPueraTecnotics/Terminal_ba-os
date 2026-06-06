import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiError } from '../services/api-client';
import {
  clearAuthStorage,
  decodeJwtPayload,
  fixEncoding,
  getStoredFeName,
  getStoredToken,
  setOutOfScheduleInfo,
  setStoredFeName,
  setStoredToken,
} from '../services/auth-storage';
import { loginRequest } from '../services/facturacion.service';
import type { FeRole, JwtPayload, OutOfScheduleInfo } from '../types';
import { TERMINAL_SUR_BRAND } from '../constants/brand';

const STORAGE_KEY = 'terminal_banos_theme_mode';

type ThemeMode = 'light' | 'dark';

export interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  colors: {
    primary: string;
    primaryText: string;
    background: string;
    card: string;
    cardBorder: string;
    text: string;
    textSecondary: string;
    headerBg: string;
    headerText: string;
    inputBg: string;
    inputBorder: string;
    error: string;
    success: string;
    warning: string;
  };
}

const lightColors = {
  primary: TERMINAL_SUR_BRAND.naranja,
  primaryText: TERMINAL_SUR_BRAND.azulOscuro,
  background: TERMINAL_SUR_BRAND.background,
  card: TERMINAL_SUR_BRAND.white,
  cardBorder: '#e2e8f0',
  text: TERMINAL_SUR_BRAND.text,
  textSecondary: TERMINAL_SUR_BRAND.textSecondary,
  headerBg: TERMINAL_SUR_BRAND.azulOscuro,
  headerText: TERMINAL_SUR_BRAND.white,
  inputBg: TERMINAL_SUR_BRAND.white,
  inputBorder: '#d1d5db',
  error: '#b91c1c',
  success: '#15803d',
  warning: TERMINAL_SUR_BRAND.naranja,
};

const darkColors = {
  ...lightColors,
  primaryText: TERMINAL_SUR_BRAND.azulCeleste,
  background: '#0f172a',
  card: '#1e293b',
  cardBorder: '#334155',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  headerBg: TERMINAL_SUR_BRAND.gradientDarkEnd,
  inputBg: '#334155',
  inputBorder: '#475569',
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'dark' || saved === 'light') setIsDark(saved === 'dark');
      setLoaded(true);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const colors = isDark ? darkColors : lightColors;
  const value: ThemeContextValue = { isDark, toggleTheme, colors };

  if (!loaded) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

interface AuthContextValue {
  token: string | null;
  user: JwtPayload | null;
  feName: string | null;
  role: FeRole | string | null;
  isLoading: boolean;
  outOfSchedule: OutOfScheduleInfo | null;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearOutOfSchedule: () => Promise<void>;
  isFeAdmin: boolean;
  isFeUser: boolean;
  isCajaFuerte: boolean;
  isFacturacionRole: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [feName, setFeName] = useState<string | null>(null);
  const [outOfSchedule, setOutOfScheduleState] = useState<OutOfScheduleInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const user = useMemo(() => (token ? decodeJwtPayload(token) : null), [token]);
  const role = user?.rol ?? null;

  const refreshAuth = useCallback(async () => {
    const { getOutOfScheduleInfo } = await import('../services/auth-storage');
    const [storedToken, storedName, scheduleInfo] = await Promise.all([
      getStoredToken(),
      getStoredFeName(),
      getOutOfScheduleInfo(),
    ]);
    setToken(storedToken);
    setFeName(storedName);
    setOutOfScheduleState(scheduleInfo);
  }, []);

  useEffect(() => {
    refreshAuth().finally(() => setIsLoading(false));
  }, [refreshAuth]);

  const login = useCallback(async (correo: string, password: string) => {
    try {
      const data = await loginRequest(correo, password);
      const accessToken = data.accessToken;
      const payload = decodeJwtPayload(accessToken);
      if (!payload) throw new Error('Token inválido');

      await setStoredToken(accessToken);
      const name = fixEncoding(payload.name || '');
      await setStoredFeName(name);
      setToken(accessToken);
      setFeName(name);
      setOutOfScheduleState(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403 && err.data?.code === 'OUT_OF_SCHEDULE') {
        const info: OutOfScheduleInfo = {
          hora_inicio: err.data.hora_inicio || '',
          hora_final: err.data.hora_final || '',
          gracia_minutos: err.data.gracia_minutos ?? 5,
        };
        await setOutOfScheduleInfo(info);
        setOutOfScheduleState(info);
      }
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await clearAuthStorage();
    setToken(null);
    setFeName(null);
    setOutOfScheduleState(null);
  }, []);

  const clearOutOfSchedule = useCallback(async () => {
    const { clearOutOfScheduleInfo } = await import('../services/auth-storage');
    await clearOutOfScheduleInfo();
    setOutOfScheduleState(null);
  }, []);

  const value: AuthContextValue = {
    token,
    user,
    feName,
    role,
    isLoading,
    outOfSchedule,
    login,
    logout,
    refreshAuth,
    clearOutOfSchedule,
    isFeAdmin: role === 'fe_admin' || role === 'Admin',
    isFeUser: role === 'fe_user',
    isCajaFuerte: role === 'caja_fuerte',
    isFacturacionRole:
      role === 'fe_admin' || role === 'fe_user' || role === 'caja_fuerte' || role === 'Admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
