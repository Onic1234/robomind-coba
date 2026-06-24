import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { COLORS, SPACING, SHAPES, FONTS } from "../constants/Theme";
import Button from "./ui/Button";

interface HeroCardProps {
  onCtaPress: () => void;
}

export default function HeroCard({ onCtaPress }: HeroCardProps) {
  // Avatars data for social proof circles
  const avatars = [
    { label: "A", color: "#FF5E36" }, // Alex - Orange
    { label: "M", color: "#00C3A0" }, // Mia - Teal
    { label: "S", color: "#9B51E0" }, // Sofia - Purple
    { label: "L", color: "#2F80ED" }, // Leo - Blue
  ];

  return (
    <View style={styles.cardContainer}>
      {/* Hero Headline */}
      <Text style={styles.headline}>
        Best Online Spanish Language Learning Classes for Kids
      </Text>

      {/* Video Call Mockup Widget */}
      <View style={styles.videoWidget}>
        {/* Kid learning illustration */}
        <Image
          source={require("../assets/images/hero_classroom.png")}
          style={styles.heroImage}
          contentFit="cover"
          transition={500}
        />

        {/* NOLA floating label */}
        <View style={styles.floatingLabel}>
          <Text style={styles.floatingLabelText}>NOLA</Text>
        </View>

        {/* Call control action buttons overlay */}
        <View style={styles.controlsOverlay}>
          <View style={styles.controlButton}>
            <Ionicons name="mic-outline" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.controlButton}>
            <Ionicons name="videocam-outline" size={18} color="#FFFFFF" />
          </View>
          <View style={[styles.controlButton, styles.endCallButton]}>
            <Ionicons name="call" size={18} color="#FFFFFF" />
          </View>
        </View>
      </View>

      {/* Try 7 Days Free Call-To-Action */}
      <Button
        title="Try 7 Days Free"
        onPress={onCtaPress}
        variant="primary"
        icon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
        style={styles.ctaButton}
      />

      {/* Social Proof row (Overlapping Avatars) */}
      <View style={styles.socialProofRow}>
        <View style={styles.avatarContainer}>
          {avatars.map((avatar, idx) => (
            <View
              key={idx}
              style={[
                styles.avatarCircle,
                { backgroundColor: avatar.color, marginLeft: idx === 0 ? 0 : -10 },
              ]}
            >
              <Text style={styles.avatarText}>{avatar.label}</Text>
            </View>
          ))}
          <View style={[styles.avatarCircle, styles.avatarPlusCircle]}>
            <Text style={styles.avatarPlusText}>+</Text>
          </View>
        </View>
        <Text style={styles.socialProofText}>
          Join Alex, Mia, Sofia, and Leo and{" "}
          <Text style={styles.socialProofHighlight}>+1200</Text> other young learners.
        </Text>
      </View>

      {/* Ratings Trust Block */}
      <View style={styles.ratingRow}>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <FontAwesome key={star} name="star" size={16} color={COLORS.brandGreen} style={styles.starIcon} />
          ))}
        </View>
        <View style={styles.divider} />
        <Text style={styles.ratingText}>Rating 4.9 out of 5</Text>
        <View style={styles.divider} />
        <View style={styles.trustpilotContainer}>
          <FontAwesome name="star" size={12} color="#FFFFFF" style={styles.tpStar} />
          <Text style={styles.trustpilotText}>Trustpilot</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.brandBlue,
    borderRadius: SHAPES.radiusXl + 4,
    padding: SPACING.xl,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
  },
  headline: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 36,
    marginBottom: SPACING.lg,
  },
  videoWidget: {
    width: "100%",
    height: 230,
    backgroundColor: "#E2E8F0",
    borderRadius: SHAPES.radiusLg + 4,
    overflow: "hidden",
    position: "relative",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    marginBottom: SPACING.xl,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  floatingLabel: {
    position: "absolute",
    top: SPACING.md,
    left: SPACING.md,
    backgroundColor: COLORS.brandOrange,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: SHAPES.radiusSm,
  },
  floatingLabelText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  controlsOverlay: {
    position: "absolute",
    bottom: SPACING.md,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "rgba(17, 24, 39, 0.75)",
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: SHAPES.radiusRound,
    gap: SPACING.md,
    alignItems: "center",
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: SHAPES.radiusRound,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  endCallButton: {
    backgroundColor: COLORS.error,
    transform: [{ rotate: "135deg" }], // Rotate icon slightly for hang-up look
  },
  ctaButton: {
    marginBottom: SPACING.lg,
  },
  socialProofRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: SHAPES.radiusRound,
    borderWidth: 2,
    borderColor: COLORS.brandBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  avatarPlusCircle: {
    backgroundColor: "#FFFFFF",
    marginLeft: -10,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlusText: {
    color: COLORS.brandBlue,
    fontSize: 14,
    fontWeight: "900",
  },
  socialProofText: {
    ...FONTS.bodyMedium,
    flex: 1,
    fontSize: 12,
    color: "#E0F2FE",
    lineHeight: 16,
  },
  socialProofHighlight: {
    color: "#FDE047", // Radiant gold accent for "+1200" text
    fontWeight: "800",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    marginRight: 2,
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  ratingText: {
    ...FONTS.bodyMedium,
    fontSize: 11,
    color: "#E0F2FE",
  },
  trustpilotContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tpStar: {
    backgroundColor: COLORS.brandGreen,
    padding: 2,
    borderRadius: 2,
    marginRight: SPACING.xs,
  },
  trustpilotText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
});
