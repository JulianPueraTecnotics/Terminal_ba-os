import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { EXPO_PUBLIC_PORTAL_URL } from '../../config';
import { useAuth, useTheme } from '../../contexts/AppContext';
import {
  HIDE_PORTAL_CHROME_SCRIPT,
  buildPortalAuthScript,
} from '../../services/portal-webview';

/**
 * Carga /facturacion del portal (POS Tecnotics real) e inyecta CSS
 * para ocultar solo navbar y footer naranjas del sitio web.
 */
export function BillingScreen() {
  const { colors } = useTheme();
  const { token, feName } = useAuth();

  const portalUri = `${EXPO_PUBLIC_PORTAL_URL.replace(/\/$/, '')}/facturacion`;

  const injectedBefore = useMemo(
    () => (token ? buildPortalAuthScript(token, feName || '') : 'true;'),
    [token, feName]
  );

  if (!token) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.headerBg} />
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: portalUri }}
      injectedJavaScriptBeforeContentLoaded={injectedBefore}
      injectedJavaScript={HIDE_PORTAL_CHROME_SCRIPT}
      sharedCookiesEnabled
      thirdPartyCookiesEnabled
      javaScriptEnabled
      domStorageEnabled
      startInLoadingState
      renderLoading={() => (
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <ActivityIndicator color={colors.headerBg} />
        </View>
      )}
      style={{ flex: 1, backgroundColor: colors.background }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
