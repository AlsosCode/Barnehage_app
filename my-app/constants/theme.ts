/**
 * Design system for Barnehage App
 * Sentralisert konfigurasjon for farger, typografi og spacing
 */

import { Platform } from 'react-native';

// Hovedfargepalett
const primaryColor = '#003366';
const secondaryColor = '#007AFF';
const tintColorLight = primaryColor;
const tintColorDark = '#fff';

export const Colors = {
  light: {
    // Primærfarger
    primary: primaryColor,
    secondary: secondaryColor,

    // Tekst
    text: '#000',
    textSecondary: '#666',
    textTertiary: '#999',
    textWhite: 'white',

    // Bakgrunner
    background: '#fff',
    backgroundSecondary: '#f5f5f5',
    backgroundTertiary: '#f9f9f9',
    backgroundCard: '#f0f0f5',

    // Tema
    tint: tintColorLight,

    // Ikoner
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,

    // Borders
    border: '#ddd',
    borderLight: '#e5e7eb',

    // Status farger
    success: '#34C759',
    successLight: '#d4f4dd',
    successText: '#2d7a3e',

    warning: '#FF9500',
    warningLight: '#fff3cd',
    warningText: '#856404',

    error: '#FF3B30',
    errorLight: '#f8d7da',
    errorText: '#721c24',

    info: '#007AFF',

    // Kort og overflatere
    card: '#fff',
    cardBorder: '#ddd',

    // Input felter
    inputBackground: '#f9f9f9',
    inputBorder: '#ddd',
    inputPlaceholder: '#999',

    // Knapper
    buttonPrimary: primaryColor,
    buttonSecondary: secondaryColor,
    buttonDanger: '#FF3B30',
    buttonDisabled: '#ccc',

    // Avatar
    avatarBackground: '#999',

    // Skygger
    shadow: '#000',
  },
  dark: {
    // Primærfarger
    primary: '#4A90E2',
    secondary: '#007AFF',

    // Tekst
    text: '#ECEDEE',
    textSecondary: '#A0A0A0',
    textTertiary: '#666',

    // Bakgrunner
    background: '#151718',
    backgroundSecondary: '#1E1E1E',
    backgroundTertiary: '#2C2C2C',

    // Tema
    tint: tintColorDark,

    // Ikoner
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,

    // Borders
    border: '#333',
    borderLight: '#444',

    // Status farger
    success: '#32D74B',
    warning: '#FF9F0A',
    error: '#FF453A',
    info: '#0A84FF',

    // Kort og overflatere
    card: '#1E1E1E',
    cardBorder: '#333',

    // Input felter
    inputBackground: '#2C2C2C',
    inputBorder: '#444',
    inputPlaceholder: '#666',

    // Knapper
    buttonPrimary: '#4A90E2',
    buttonSecondary: '#007AFF',
    buttonDisabled: '#444',

    // Skygger
    shadow: '#000',
  },
};

// Typografi
export const Typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 13,
    base: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 32,
  },

  // Font weights
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing system (basert på 4px grid)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

// Border radius
export const BorderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

// Shadows
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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
