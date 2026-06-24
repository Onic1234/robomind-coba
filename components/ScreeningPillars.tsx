import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, SHAPES, FONTS, SHADOWS } from "../constants/Theme";

interface PillarItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  iconType: "ionicons" | "material";
  iconColor: string;
  iconBg: string;
}

export default function ScreeningPillars() {
  const pillars: PillarItem[] = [
    {
      id: "cognitive",
      title: "Evaluasi Kognitif Dasar",
      description: "Pemetaan logika awal untuk menentukan tingkat kesulitan dasar game (dynamic difficulty adaptive).",
      iconName: "brain",
      iconType: "material",
      iconColor: COLORS.brandOrange,
      iconBg: "#FFF7ED", // Light orange tint
    },
    {
      id: "learning_style",
      title: "Identifikasi Gaya Belajar",
      description: "Mengetahui apakah anak condong ke gaya Visual, Auditori, atau Kinestetik.",
      iconName: "eye-outline",
      iconType: "ionicons",
      iconColor: COLORS.brandGreen,
      iconBg: "#F0FDF4", // Light green tint
    },
    {
      id: "interests",
      title: "Pemetaan Minat & Bakat",
      description: "Skrining psikologi dasar interaktif untuk melihat potensi terpendam anak.",
      iconName: "sparkles-outline",
      iconType: "ionicons",
      iconColor: COLORS.brandBlue,
      iconBg: "#EFF6FF", // Light blue tint
    },
  ];

  return (
    <View style={styles.container}>
      {/* Centered Heading Block */}
      <View style={styles.headerBlock}>
        <Text style={styles.title}>3 Pilar Skrining Awal</Text>
        <Text style={styles.subtitle}>
          Kenali profil belajar unik anak Anda sebelum mereka memulai petualangan edukasi bersama Robo Mind.
        </Text>
      </View>

      {/* Pillars Rows Stack */}
      <View style={styles.pillarsContainer}>
        {pillars.map((pillar) => {
          return (
            <View key={pillar.id} style={styles.card}>
              {/* Left Side: Icon Container */}
              <View style={[styles.iconCircle, { backgroundColor: pillar.iconBg }]}>
                {pillar.iconType === "material" ? (
                  <MaterialCommunityIcons
                    name={pillar.iconName as any}
                    size={22}
                    color={pillar.iconColor}
                  />
                ) : (
                  <Ionicons
                    name={pillar.iconName as any}
                    size={22}
                    color={pillar.iconColor}
                  />
                )}
              </View>

              {/* Right Side: Text Information */}
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{pillar.title}</Text>
                <Text style={styles.cardDesc}>{pillar.description}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.lg,
  },
  headerBlock: {
    alignItems: "center",
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
  },
  title: {
    ...FONTS.subheading,
    fontSize: 20,
    color: COLORS.textDark,
    textAlign: "center",
    marginBottom: SPACING.xs + 2,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...FONTS.bodyRegular,
    fontSize: 13,
    color: COLORS.textMedium,
    textAlign: "center",
    lineHeight: 18,
  },
  pillarsContainer: {
    gap: SPACING.md,
  },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.cardWhite,
    borderRadius: SHAPES.radiusLg,
    padding: SPACING.md + 2,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: "flex-start",
    ...SHADOWS.light,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  cardDesc: {
    ...FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.textMedium,
    lineHeight: 16,
  },
});
