import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, SHAPES, FONTS, SHADOWS } from "../constants/Theme";

export default function Header() {
  return (
    <View style={styles.headerContainer}>
      {/* Left: Robo Mind Logo & Kids Greeting */}
      <View style={styles.leftSection}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <MaterialCommunityIcons name="robot" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.logoRobo}>Robo</Text>
          <Text style={styles.logoMind}>Mind</Text>
        </View>
        <Text style={styles.greetingText}>¡Hola, Kids! 👋</Text>
      </View>

      {/* Right: Gamified Streak & Notifications */}
      <View style={styles.rightSection}>
        {/* Streak Counter (Duolingo style) */}
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={16} color={COLORS.brandOrange} />
          <Text style={styles.streakText}>5 Hari</Text>
        </View>

        {/* Notifications Icon with Badge */}
        <Pressable style={styles.iconButton} hitSlop={10}>
          <Ionicons name="notifications-outline" size={20} color={COLORS.textDark} />
          <View style={styles.notificationDot} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.bgPrimary,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    ...SHADOWS.light,
  },
  leftSection: {
    flexDirection: "column",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoIcon: {
    width: 28,
    height: 28,
    backgroundColor: "#14B8A6",
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  logoRobo: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1E293B",
    letterSpacing: -0.5,
  },
  logoMind: {
    fontSize: 16,
    fontWeight: "900",
    color: "#14B8A6",
    letterSpacing: -0.5,
  },
  greetingText: {
    ...FONTS.caption,
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textMedium,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED", // Very light orange/tint
    borderWidth: 1,
    borderColor: "#FFEDD5",
    borderRadius: SHAPES.radiusRound,
    paddingVertical: 4,
    paddingHorizontal: SPACING.md,
    gap: 4,
  },
  streakText: {
    ...FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.brandOrange,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: SHAPES.radiusRound,
    backgroundColor: COLORS.cardWhite,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: SHAPES.radiusRound,
    backgroundColor: COLORS.error,
    borderWidth: 1.5,
    borderColor: COLORS.cardWhite,
  },
});
