// @ts-nocheck
/* eslint-disable @typescript-eslint/no-var-requires */
const { fontFamily } = require("tailwindcss/defaultTheme");
const colors = require("@radix-ui/colors");
const plugin = require("tailwindcss/plugin");

const iOsHeight = plugin(function ({ addUtilities }) {
  const supportsTouchRule = "@supports (-webkit-touch-callout: none)";
  const webkitFillAvailable = "-webkit-fill-available";

  const utilities = {
    ".min-h-screen-ios": {
      [supportsTouchRule]: {
        minHeight: webkitFillAvailable,
      },
    },
    ".h-screen-ios": {
      [supportsTouchRule]: {
        height: webkitFillAvailable,
      },
    },
  };

  addUtilities(utilities, ["responsive"]);
});

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "src/app/**/*.{ts,tsx}",
    "src/components/**/*.{ts,tsx}",
    "src/ui/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    DEFAULT: {
      css: {
        h1: {
          fontFamily: "Cal Sans",
        },
        h2: {
          fontFamily: "Cal Sans",
        },
        h3: {
          fontFamily: "Cal Sans",
        },
        "blockquote p:first-of-type::before": { content: "none" },
        "blockquote p:first-of-type::after": { content: "none" },
      },
    },
    extend: {
      colors: {
        cyan: {
          1: colors.cyanDarkA.cyanA1,
          2: colors.cyanDarkA.cyanA2,
          3: colors.cyanDarkA.cyanA3,
          4: colors.cyanDarkA.cyanA4,
          5: colors.cyanDarkA.cyanA5,
          6: colors.cyanDarkA.cyanA6,
          7: colors.cyanDarkA.cyanA7,
          8: colors.cyanDarkA.cyanA8,
          9: colors.cyanDarkA.cyanA9,
          10: colors.cyanDarkA.cyanA10,
          11: colors.cyanDarkA.cyanA11,
          12: colors.cyanDarkA.cyanA12,
        },
        blue: {
          1: colors.blueDarkA.blueA1,
          2: colors.blueDarkA.blueA2,
          3: colors.blueDarkA.blueA3,
          4: colors.blueDarkA.blueA4,
          5: colors.blueDarkA.blueA5,
          6: colors.blueDarkA.blueA6,
          7: colors.blueDarkA.blueA7,
          8: colors.blueDarkA.blueA8,
          9: colors.blueDarkA.blueA9,
          10: colors.blueDarkA.blueA10,
          11: colors.blueDarkA.blueA11,
          12: colors.blueDarkA.blueA12,
        },
        slate: {
          1: colors.slateDarkA.slateA1,
          2: colors.slateDarkA.slateA2,
          3: colors.slateDarkA.slateA3,
          4: colors.slateDarkA.slateA4,
          5: colors.slateDarkA.slateA5,
          6: colors.slateDarkA.slateA6,
          7: colors.slateDarkA.slateA7,
          8: colors.slateDarkA.slateA8,
          9: colors.slateDarkA.slateA9,
          10: colors.slateDarkA.slateA10,
          11: colors.slateDarkA.slateA11,
          12: colors.slateDarkA.slateA12,
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        default: ["var(--font-inter)", ...fontFamily.sans],
        cal: ["var(--font-cal)", ...fontFamily.sans],
        title: ["var(--font-title)", ...fontFamily.sans],
        mono: ["Consolas", ...fontFamily.mono],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
};
