import React from "react";
import { Pressable, StyleSheet, Text, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface GameBackButtonProps {
  onPress?: () => void;
  showText?: boolean;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  bottomBorderColor?: string;
}

export function GameBackButton({
  onPress,
  showText = false,
  color = "#FFFFFF",
  bgColor = "#006874",
  borderColor = "#006874",
  bottomBorderColor = "#004E57",
}: GameBackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      try {
        if (router.canGoBack && router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(tabs)" as any);
        }
      } catch (e) {
        if (Platform.OS === "web") {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            window.location.href = "/";
          }
        } else {
          router.replace("/(tabs)" as any);
        }
      }
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
          borderBottomColor: bottomBorderColor,
        },
        showText && styles.buttonWithText,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name="arrow-back" size={20} color={color} />
      {showText && <Text style={[styles.text, { color }]}>Kembali</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderBottomWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    // @ts-ignore - web cursor
    cursor: "pointer",
  },
  buttonWithText: {
    width: "auto",
    paddingHorizontal: 12,
    flexDirection: "row",
    gap: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: "700",
  },
  pressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 2,
  },
});
