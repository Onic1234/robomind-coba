import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, SHAPES, FONTS, SHADOWS } from "../constants/Theme";

interface StatCardProps {
  stat: string;
  label: string;
  backgroundColor: string;
}

export default function StatCard({ stat, label, backgroundColor }: StatCardProps) {
  return (
    <View style={[styles.cardContainer, { backgroundColor }]}>
      <Text style={styles.statText}>{stat}</Text>
      <Text style={styles.labelText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    minHeight: 110,
    borderRadius: SHAPES.radiusLg,
    padding: SPACING.lg,
    justifyContent: "center",
    ...SHADOWS.light,
  },
  statText: {
    ...FONTS.heading,
    fontSize: 26,
    color: COLORS.textDark,
    marginBottom: SPACING.xs,
  },
  labelText: {
    ...FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textMedium,
    lineHeight: 16,
  },
});
