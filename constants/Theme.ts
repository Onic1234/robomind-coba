export const COLORS = {
  // Brand Main Colors
  brandBlue: "#0B84FF",        // Vibrant blue for the main hero card
  brandOrange: "#FF5E36",      // Radiant orange for main CTAs ("Try 7 Days Free")
  brandGreen: "#00C3A0",       // Teal green from the "Spanish VIP" logo
  brandDarkBlue: "#111827",    // Sleek dark grey/blue for headers and text

  // Neutral Backgrounds & Card Colors
  bgPrimary: "#FDFDFD",        // Page background (clean off-white)
  cardPurple: "#EAE6FF",       // Light purple for the 90+ countries stat badge
  cardCream: "#FAF3E8",        // Light cream for the 150,000 classes stat badge
  cardWhite: "#FFFFFF",        // Card container backgrounds
  borderLight: "#F0F0EE",      // Subtle separators and borders
  
  // Feedback States
  success: "#10B981",          // Success green for ratings and validations
  error: "#EF4444",            // Error red for validation states
  warning: "#F59E0B",          // Amber warning state
  
  // Grey Scales
  textDark: "#1F2937",         // Primary text
  textMedium: "#4B5563",       // Secondary text
  textLight: "#9CA3AF",        // Captions / placeholders
  textMuted: "#D1D5DB",        // Disabled buttons or borders
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const SHAPES = {
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusRound: 9999,
};

export const SHADOWS = {
  light: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: "#171717",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  premium: {
    shadowColor: "#0084FF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
};

export const FONTS = {
  // We use standard React Native font weights for maximum compatibility while maintaining high visual quality.
  heading: {
    fontWeight: "800" as const,
    color: COLORS.textDark,
  },
  subheading: {
    fontWeight: "700" as const,
    color: COLORS.textDark,
  },
  bodyBold: {
    fontWeight: "600" as const,
    color: COLORS.textDark,
  },
  bodyMedium: {
    fontWeight: "500" as const,
    color: COLORS.textMedium,
  },
  bodyRegular: {
    fontWeight: "400" as const,
    color: COLORS.textMedium,
  },
  caption: {
    fontWeight: "400" as const,
    color: COLORS.textLight,
  },
};
