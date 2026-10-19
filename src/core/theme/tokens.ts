/**
 * Single source of truth for the app palette.
 *
 * Consumed by:
 * - `tailwind.config.js` (NativeWind classes: `text-primary dark:text-primary-dark`)
 * - `core/constants/theme.ts` (imperative consumers via `useTheme()`)
 *
 * Add or change colors here only — both sides stay in sync.
 */
export const colors = {
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
    textError: "#FF0000",
    primary: "#208AEF",
    primaryForeground: "#FFFFFF",
    success: "#34d399",
    info: "#60a5fa",
    warning: "#fcd34d",
    danger: "#f87171",
  },
} as const;

export type ThemeColor = keyof typeof colors.light & keyof typeof colors.dark;

/**
 * Palette of the animated flow lines on the tank map — mode-aware, kept here
 * with the rest of the color source of truth.
 */
export const flowColors = {
  light: { trunk: "#06B6D4", flow: "#0E7490" },
  dark: { trunk: "#0891B2", flow: "#67E8F9" },
} as const;
