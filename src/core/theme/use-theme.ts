/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme as useNativeColorScheme } from "react-native";
import { Colors } from "../constants/theme";

/** Normalized color scheme — `useColorScheme()` may return null or
 * (on old RN versions) "unspecified". */
export function useColorScheme(): "light" | "dark" {
  return useNativeColorScheme() === "dark" ? "dark" : "light";
}

/** Palette for the active scheme (see `core/theme/tokens.ts`). */
export function useTheme() {
  return Colors[useColorScheme()];
}
