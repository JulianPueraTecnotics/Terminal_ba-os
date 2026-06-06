const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed
          .slice(idx + 1)
          .trim()
          .replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    }
  });
}

const appJson = require('./app.json');

module.exports = {
  expo: {
    ...appJson.expo,
    owner: 'torosentado',
    ios: {
      ...appJson.expo.ios,
      bundleIdentifier: 'com.tecnotics.terminal.banos',
    },
    android: {
      ...appJson.expo.android,
      package: 'com.tecnotics.terminal.banos',
    },
    extra: {
      ...appJson.expo.extra,
      eas: {
        projectId: '00000000-0000-0000-0000-000000000000',
      },
      EXPO_PUBLIC_APP_B_URL:
        process.env.EXPO_PUBLIC_APP_B_URL || 'https://rrgbk.tecnotics.co',
      EXPO_PUBLIC_APP_B_PATH: process.env.EXPO_PUBLIC_APP_B_PATH || '',
      EXPO_PUBLIC_PORTAL_URL:
        process.env.EXPO_PUBLIC_PORTAL_URL || 'https://terminaldelsur.com',
      EXPO_PUBLIC_TERMINAL_FE_SIMBA_TOKEN:
        process.env.EXPO_PUBLIC_TERMINAL_FE_SIMBA_TOKEN || '',
      EXPO_PUBLIC_TERMINAL_FE_ID:
        process.env.EXPO_PUBLIC_TERMINAL_FE_ID || '',
      EXPO_PUBLIC_FE_URL:
        process.env.EXPO_PUBLIC_FE_URL || 'https://fesimba.terminaldelsur.com',
      EXPO_PUBLIC_ENABLE_SOCKETS:
        process.env.EXPO_PUBLIC_ENABLE_SOCKETS ?? 'true',
    },
  },
};
