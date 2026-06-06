import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LOGO, TERMINAL_SUR_BRAND } from '../constants/brand';

interface BrandLogoProps {
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  showAccentBar?: boolean;
}

export function BrandLogo({
  width = 200,
  height = 72,
  style,
  containerStyle,
  showAccentBar = false,
}: BrandLogoProps) {
  return (
    <View style={containerStyle}>
      {showAccentBar ? (
        <View style={styles.accentBar}>
          <View style={[styles.accentHalf, { backgroundColor: TERMINAL_SUR_BRAND.azul }]} />
          <View style={[styles.accentHalf, { backgroundColor: TERMINAL_SUR_BRAND.naranja }]} />
        </View>
      ) : null}
      <Image
        source={LOGO}
        style={[{ width, height, resizeMode: 'contain' }, style]}
        accessibilityLabel="Terminal del Sur"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  accentBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  accentHalf: { flex: 1 },
});
