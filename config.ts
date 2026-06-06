import Constants from 'expo-constants';

function readExtra(key: string): string | undefined {
  const value = Constants.expoConfig?.extra?.[key];
  return typeof value === 'string' ? value : undefined;
}

function readEnv(key: string): string | undefined {
  const value = process.env?.[key];
  return typeof value === 'string' ? value : undefined;
}

export const EXPO_PUBLIC_APP_B_URL =
  readExtra('EXPO_PUBLIC_APP_B_URL') ||
  readEnv('EXPO_PUBLIC_APP_B_URL') ||
  'https://rrgbk.tecnotics.co';

export const EXPO_PUBLIC_APP_B_PATH =
  readExtra('EXPO_PUBLIC_APP_B_PATH') || readEnv('EXPO_PUBLIC_APP_B_PATH') || '';

export const EXPO_PUBLIC_PORTAL_URL =
  readExtra('EXPO_PUBLIC_PORTAL_URL') ||
  readEnv('EXPO_PUBLIC_PORTAL_URL') ||
  'https://terminaldelsur.com';

export const EXPO_PUBLIC_TERMINAL_FE_SIMBA_TOKEN =
  readExtra('EXPO_PUBLIC_TERMINAL_FE_SIMBA_TOKEN') ||
  readEnv('EXPO_PUBLIC_TERMINAL_FE_SIMBA_TOKEN') ||
  '';

export const EXPO_PUBLIC_TERMINAL_FE_ID =
  readExtra('EXPO_PUBLIC_TERMINAL_FE_ID') ||
  readEnv('EXPO_PUBLIC_TERMINAL_FE_ID') ||
  '';

export const EXPO_PUBLIC_FE_URL =
  readExtra('EXPO_PUBLIC_FE_URL') ||
  readEnv('EXPO_PUBLIC_FE_URL') ||
  'https://fesimba.terminaldelsur.com';

export const EXPO_PUBLIC_ENABLE_SOCKETS =
  (readExtra('EXPO_PUBLIC_ENABLE_SOCKETS') ||
    readEnv('EXPO_PUBLIC_ENABLE_SOCKETS') ||
    'true') !== 'false';

export const FACTURACION_WEBHOOK_EVENT = 'facturacion_actualizada';
