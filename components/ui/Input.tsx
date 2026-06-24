import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from "react-native";
import { COLORS, SPACING, SHAPES, FONTS } from "../../constants/Theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export default function Input({
  label,
  error,
  icon,
  containerStyle,
  onFocus,
  onBlur,
  style,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          !!error && styles.inputWrapperError,
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        
        <TextInput
          style={[styles.textInput, style]}
          placeholderTextColor={COLORS.textLight}
          onFocus={handleFocus}
          onBlur={handleBlur}
          underlineColorAndroid="transparent"
          {...props}
        />
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: SPACING.md,
  },
  label: {
    ...FONTS.bodyMedium,
    color: COLORS.textDark,
    fontSize: 14,
    marginBottom: SPACING.xs + 2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardWhite,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: SHAPES.radiusMd,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: COLORS.brandBlue,
    shadowColor: COLORS.brandBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  iconContainer: {
    marginRight: SPACING.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    ...FONTS.bodyRegular,
    flex: 1,
    height: "100%",
    color: COLORS.textDark,
    fontSize: 15,
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    fontSize: 12,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});
