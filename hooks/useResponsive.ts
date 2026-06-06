import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;
const TABLET_BREAKPOINT = 768;
const SMALL_PHONE_MAX = 360;
const MAX_CONTENT_WIDTH = 600;

export interface ResponsiveValues {
  width: number;
  height: number;
  isSmallPhone: boolean;
  isTablet: boolean;
  contentWidth: number;
  scaleHorizontal: (size: number) => number;
  scaleVertical: (size: number) => number;
  moderateScale: (size: number, factor?: number) => number;
  spacingHorizontal: number;
  spacingVertical: number;
  fontSizeBase: number;
  fontSizeTitle: number;
  fontSizeSubtitle: number;
}

export function useResponsive(): ResponsiveValues {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const isTablet = width >= TABLET_BREAKPOINT;
    const isSmallPhone = width < SMALL_PHONE_MAX;

    const scaleHorizontal = (size: number) => {
      if (isTablet) {
        const scale = Math.min(width / BASE_WIDTH, 1.4);
        return Math.round(size * scale);
      }
      const scale = width / BASE_WIDTH;
      return Math.round(size * Math.min(scale, 1.2));
    };

    const scaleVertical = (size: number) => {
      const scale = height / BASE_HEIGHT;
      return Math.round(size * Math.min(scale, 1.3));
    };

    const moderateScale = (size: number, factor = 0.5) => {
      const scale = (width / BASE_WIDTH - 1) * factor + 1;
      return Math.round(size * Math.min(Math.max(scale, 1), 1.25));
    };

    const contentWidth = isTablet ? Math.min(width * 0.7, MAX_CONTENT_WIDTH) : width;
    const spacingHorizontal = isTablet
      ? Math.max(32, Math.min(width * 0.08, 56))
      : isSmallPhone
        ? 12
        : 20;
    const spacingVertical = isTablet ? 28 : isSmallPhone ? 16 : 24;

    return {
      width,
      height,
      isSmallPhone,
      isTablet,
      contentWidth,
      scaleHorizontal,
      scaleVertical,
      moderateScale,
      spacingHorizontal,
      spacingVertical,
      fontSizeBase: moderateScale(15),
      fontSizeTitle: moderateScale(22),
      fontSizeSubtitle: moderateScale(16),
    };
  }, [width, height]);
}
