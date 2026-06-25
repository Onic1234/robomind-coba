import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, SHAPES, FONTS, SHADOWS } from "../constants/Theme";

export default function Robot3DView() {
  return (
    <View style={styles.card}>
      <View style={styles.avatarContainer}>
        <Image
          source={require("../assets/images/robomind_hero.png")}
          style={styles.robotImage}
          contentFit="contain"
        />
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Ionicons name="sparkles" size={14} color="#F59E0B" style={{ marginRight: 4 }} />
          <Text style={styles.titleText}>Robo Junior</Text>
        </View>
        <Text style={styles.subtitleText}>Level 12 • Pet Kognitif Utama</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Mode Portrait</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: SHAPES.radiusLg,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    ...SHADOWS.light,
    width: "100%",
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: SHAPES.radiusMd,
    backgroundColor: "#E0F2FE", 
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#BAE6FD",
  },
  robotImage: {
    width: 48,
    height: 48,
  },
  infoContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  titleText: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.textDark,
  },
  subtitleText: {
    ...FONTS.bodyRegular,
    fontSize: 11,
    color: COLORS.textMedium,
    marginBottom: 6,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    borderRadius: SHAPES.radiusRound,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: "800",
    color: COLORS.brandGreen,
  },
});
