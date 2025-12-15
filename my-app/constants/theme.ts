/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#111827',
    background: '#F5F7FB',
    tint: '#007AFF',
    icon: '#6B7280',
    tabIconDefault: '#999999',
    tabIconSelected: '#003366',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// Centralized app palette (light theme focused)
export const Palette = {
  background: '#F5F7FB',
  card: '#FFFFFF',
  border: '#E5E7EB',
  borderSoft: '#F3F4F6',
  text: '#111827',
  textMuted: '#4B5563',
  header: '#003366',
  primary: '#007AFF',
  success: '#16A34A',
  danger: '#EF4444',
  statusIn: '#DCFCE7',
  statusOut: '#FEE2E2',
  statusHome: '#E5E7EB',
  gray500: '#6B7280',
  gray700: '#374151',
  shadow: {
    color: '#000',
    opacity: 0.05,
    radius: 8,
    offset: { width: 0, height: 2 } as const,
    elevation: 2,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
