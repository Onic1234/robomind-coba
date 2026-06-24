import React, { useRef } from "react";
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Animated,
  ViewStyle,
  TextStyle,
} from "react-native";
import { COLORS, SPACING, SHAPES, FONTS } from "../../constants/Theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "accent";
  size?: "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "large",
  loading = false,
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  // Micro-animation for button press scale effect
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const isInteractionDisabled = disabled || loading;

  // Compute button styles based on variants
  const buttonStyle = [
    styles.baseButton,
    size === "large" ? styles.largeButton : styles.mediumButton,
    variant === "primary" && styles.primaryButton,
    variant === "secondary" && styles.secondaryButton,
    variant === "accent" && styles.accentButton,
    isInteractionDisabled && styles.disabledButton,
    style,
  ].filter(Boolean) as ViewStyle[];

  // Compute text styles based on variants
  const textStyle = [
    styles.baseText,
    size === "large" ? styles.largeText : styles.mediumText,
    variant === "primary" && styles.primaryText,
    variant === "secondary" && styles.secondaryText,
    variant === "accent" && styles.accentText,
    isInteractionDisabled && styles.disabledText,
  ].filter(Boolean) as TextStyle[];

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }], width: style?.width || "100%" }}>
      <Pressable
        onPress={isInteractionDisabled ? undefined : onPress}
        onPressIn={isInteractionDisabled ? undefined : handlePressIn}
        onPressOut={isInteractionDisabled ? undefined : handlePressOut}
        style={({ pressed }) => [
          buttonStyle,
          pressed && !isInteractionDisabled && styles.pressedEffect,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === "secondary" ? COLORS.brandBlue : "#FFFFFF"}
            size="small"
          />
        ) : (
          <>
            {icon && <React.Fragment>{icon}</React.Fragment>}
            <Text style={textStyle}>{title}</Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: SHAPES.radiusRound,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  mediumButton: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  largeButton: {
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.xxl,
    gap: SPACING.md,
  },
  primaryButton: {
    backgroundColor: COLORS.brandOrange,
    borderColor: COLORS.brandOrange,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderColor: COLORS.borderLight,
  },
  accentButton: {
    backgroundColor: COLORS.brandGreen,
    borderColor: COLORS.brandGreen,
  },
  disabledButton: {
    backgroundColor: COLORS.textMuted,
    borderColor: COLORS.textMuted,
  },
  pressedEffect: {
    opacity: 0.9,
  },
  baseText: {
    ...FONTS.bodyBold,
    textAlign: "center",
  },
  largeText: {
    fontSize: 16,
  },
  mediumText: {
    fontSize: 14,
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: COLORS.textDark,
  },
  accentText: {
    color: "#FFFFFF",
  },
  disabledText: {
    color: COLORS.textMedium,
    opacity: 0.5,
  },
});
