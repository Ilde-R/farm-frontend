/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#181F3B",
    background: "#F7F8FA",
    backgroundElement: "#FFFFFF",
    backgroundSelected: "#E8EBEF",
    border: "#E2E6EB",
    textSecondary: "#5B6169",
    textTertiary: "#9AA1AC",
    textError: "#B42318",
    primary: "#208AEF",
    primaryForeground: "#FFFFFF",
    success: "#059669",
    info: "#2563EB",
    warning: "#D97706",
    danger: "#DC2626",
  },
  dark: {
    text: "#ffffff",
    background: "#121212",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    border: "#2E3135",
    textSecondary: "#B0B4BA",
    textTertiary: "#7A7F87",
    textError: '#FF0000',
    primary: "#208AEF",
    primaryForeground: "#FFFFFF",
    success: "#34d399",
    info: "#60a5fa",
    warning: "#fcd34d",
    danger: "#f87171",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
