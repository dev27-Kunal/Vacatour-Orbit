/** @type {import('tailwindcss').Config} */
export default {
  content: ["./client/index.html", "./client/src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
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
      backgroundImage: {
        primaryGradient: "linear-gradient(135deg, #9810FA 0%, #155DFC 100%)",
        landingBgGradient:
          "linear-gradient(166.73deg, #FAF5FF 20.45%, #FEF2F2 67.04%)",
        violetGradient: "linear-gradient(135deg, #AD46FF 0%, #9810FA 100%)",
        blueGradient: "linear-gradient(135deg, #2B7FFF 0%, #155DFC 100%)",
        darkBlueGradient: "linear-gradient(135deg, #615FFF 0%, #4F39F6 100%)",
        headerActiveGradient:
          "linear-gradient(90deg, rgba(142, 197, 255, 0.4) 0%, rgba(218, 178, 255, 0.4) 100%)",
        heroTitleGradient:
          "linear-gradient(90deg, rgba(152, 16, 250, 0.1) 0%, rgba(21, 93, 252, 0.1) 100%)",
        heroHeadingGradient:
          "linear-gradient(90deg, #9810FA 0%, #155DFC 50%, #9810FA 100%)",
        heroTabGradientOrange:
          "linear-gradient(135deg, #FF8904 0%, #F54900 100%)",
        heroTabGradientBlue:
          "linear-gradient(135deg, #51A2FF 0%, #155DFC 100%)",
        heroTabGradientGreen:
          "linear-gradient(135deg, #05DF72 0%, #00A63E 100%)",
        heroTabGradientPurple:
          "linear-gradient(135deg, #C27AFF 0%, #9810FA 100%)",
        heroTabGradientRed: "linear-gradient(135deg, #FF6467 0%, #E7000B 100%)",
        lastSectionGradient:
          "linear-gradient(90deg, #155DFC 0%, #9810FA 50%, #E60076 100%)",
        jobsSectionBtnGradient:
          "linear-gradient(90deg, #9810FA 0%, #155DFC 100%)",
        jobsFirstCardIconGradient:
          "linear-gradient(135deg, #00C950 0%, #00A63E 100%)",
        jobsFirstCardArcGradient:
          "linear-gradient(135deg, rgba(0, 201, 80, 0.1) 0%, rgba(0, 201, 80, 0) 100%)",
        jobsSecondCardIconGradient:
          "linear-gradient(135deg, #FF6900 0%, #F54900 100%)",
        jobsSecondCardArcGradient:
          "linear-gradient(135deg, rgba(255, 105, 0, 0.1) 0%, rgba(255, 105, 0, 0) 100%)",
        jobsThirdCardIconGradient:
          "linear-gradient(135deg, #F6339A 0%, #E60076 100%)",
        jobsThirdCardArcGradient:
          "linear-gradient(135deg, rgba(246, 51, 154, 0.1) 0%, rgba(246, 51, 154, 0) 100%)",
        jobsFourthPercentageBg:
          "linear-gradient(135deg, #FB2C36 0%, #E7000B 100%)",
        jobsFirstPercentageColor:
          "linear-gradient(90deg, #155DFC 0%, #1447E6 100%)",
        jobsSecondPercentageColor:
          "linear-gradient(90deg, #00A63E 0%, #008236 100%)",
        jobsThirdPercentageColor:
          "linear-gradient(90deg, #9810FA 0%, #8200DB 100%)",
        jobsFourthPercentageColor:
          "linear-gradient(90deg, #E7000B 0%, #C10007 100%)",
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
