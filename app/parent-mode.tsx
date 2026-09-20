import React, { useEffect } from "react";
import { StyleSheet, View, Text, Pressable, Platform, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, SPACING, SHAPES, FONTS, SHADOWS } from "../constants/Theme";

const PARENT_DASHBOARD_URL = "https://robomind-beta.vercel.app/dashboard";

export default function ParentModeScreen() {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === "web") {
      window.location.href = PARENT_DASHBOARD_URL;
    } else {
      Linking.openURL(PARENT_DASHBOARD_URL).catch(() => {});
    }
  }, []);

  const openDashboard = () => {
    if (Platform.OS === "web") {
      window.location.href = PARENT_DASHBOARD_URL;
    } else {
      Linking.openURL(PARENT_DASHBOARD_URL).catch(() => {});
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </Pressable>
        <Text style={styles.headerTitle}>Dashboard Orang Tua</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="open-outline" size={30} color={COLORS.brandBlue} />
        </View>
        <Text style={styles.title}>Membuka Dashboard Orang Tua...</Text>
        <Text style={styles.desc}>
          Dashboard kini dibuka di halaman web agar datanya selalu ter-sinkron dengan progres
          bermain anak.
        </Text>

        <Pressable
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          onPress={openDashboard}
        >
          <Text style={styles.ctaText}>Buka Dashboard di Web</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.bgPrimary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    ...FONTS.subheading,
    fontSize: 16,
    color: COLORS.textDark,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xxl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  title: {
    ...FONTS.heading,
    fontSize: 18,
    color: COLORS.textDark,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  desc: {
    ...FONTS.bodyRegular,
    fontSize: 13,
    color: COLORS.textMedium,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: SPACING.xl,
  },
  cta: {
    backgroundColor: COLORS.brandBlue,
    paddingVertical: 14,
    paddingHorizontal: SPACING.xxl,
    borderRadius: SHAPES.radiusRound,
    ...SHADOWS.medium,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaText: {
    ...FONTS.bodyBold,
    color: "#FFFFFF",
    fontSize: 14,
  },
});
