const plugin = require("tailwindcss/plugin");
const { colors } = require("./src/core/theme/tokens");

/**
 * Inter static weights (SDK 57 cannot load several faces under one family,
 * so each weight is its own font family — see Expo docs, "Fonts").
 */
const INTER_FAMILIES = {
  "400": "Inter_400Regular",
  "500": "Inter_500Medium",
  "600": "Inter_600SemiBold",
  "700": "Inter_700Bold",
  "800": "Inter_800ExtraBold",
  "900": "Inter_900Black",
};

/**
 * Derive NativeWind's `{token: {DEFAULT, dark}}` color shape from the shared
 * palette so `text-primary dark:text-primary-dark` keeps working.
 */
const palette = Object.fromEntries(
  Object.keys(colors.light).map((token) => [
    token,
    { DEFAULT: colors.light[token], dark: colors.dark[token] },
  ]),
);

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: palette,
      fontFamily: {
        sans: [INTER_FAMILIES["400"]],
      },
    },
  },
  plugins: [
    // Core `font-weight` utilities (font-bold, font-semibold, …) only set
    // fontWeight; on React Native that would render synthetic bold. These
    // utilities are emitted after core and set the matching Inter file too.
    plugin(({ addUtilities }) => {
      addUtilities({
        ".font-normal": { fontWeight: "400", fontFamily: INTER_FAMILIES["400"] },
        ".font-medium": { fontWeight: "500", fontFamily: INTER_FAMILIES["500"] },
        ".font-semibold": { fontWeight: "600", fontFamily: INTER_FAMILIES["600"] },
        ".font-bold": { fontWeight: "700", fontFamily: INTER_FAMILIES["700"] },
        ".font-extrabold": { fontWeight: "800", fontFamily: INTER_FAMILIES["800"] },
        ".font-black": { fontWeight: "900", fontFamily: INTER_FAMILIES["900"] },
      });
    }),
  ],
};
