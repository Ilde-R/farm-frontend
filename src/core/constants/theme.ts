import { colors, type ThemeColor } from "@/core/theme/tokens";

/**
 * Theme palette for imperative consumers (navigation config, icon colors, …).
 * Colors are defined in `core/theme/tokens.ts` — the single source of truth
 * shared with `tailwind.config.js`.
 */
export const Colors = colors;

export type { ThemeColor };
