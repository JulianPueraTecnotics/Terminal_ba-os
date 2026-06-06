/**
 * EAS Build: crea .env después de instalar dependencias
 * para que app.config.js tenga las variables al empaquetar.
 */
const fs = require('fs');
const path = require('path');

const keys = [
  'EXPO_PUBLIC_APP_B_URL',
  'EXPO_PUBLIC_APP_B_PATH',
  'EXPO_PUBLIC_PORTAL_URL',
  'EXPO_PUBLIC_TERMINAL_FE_SIMBA_TOKEN',
  'EXPO_PUBLIC_TERMINAL_FE_ID',
  'EXPO_PUBLIC_FE_URL',
  'EXPO_PUBLIC_ENABLE_SOCKETS',
];

const defaults = {
  EXPO_PUBLIC_APP_B_URL: 'https://rrgbk.tecnotics.co',
  EXPO_PUBLIC_APP_B_PATH: '',
  EXPO_PUBLIC_PORTAL_URL: 'https://terminaldelsur.com',
  EXPO_PUBLIC_TERMINAL_FE_SIMBA_TOKEN: '',
  EXPO_PUBLIC_TERMINAL_FE_ID: '',
  EXPO_PUBLIC_FE_URL: 'https://fesimba.terminaldelsur.com',
  EXPO_PUBLIC_ENABLE_SOCKETS: 'true',
};

const lines = keys.map(
  (key) => `${key}=${process.env[key] ?? defaults[key] ?? ''}`
);

const envPath = path.join(__dirname, '..', '.env');

try {
  fs.writeFileSync(envPath, `${lines.join('\n')}\n`, 'utf8');
} catch (err) {
  console.warn('[eas-post-install] No se pudo escribir .env:', err.message);
}
