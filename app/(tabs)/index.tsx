import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING } from "../../constants/Theme";

// Import custom components
import Header from "../../components/Header";
import HeroCarousel from "../../components/HeroCarousel";
import StatCard from "../../components/StatCard";
import GameFeaturesSlider from "../../components/GameFeaturesSlider";
import ScreeningPillars from "../../components/ScreeningPillars";
import NewsSection from "../../components/NewsSection";

export default function Index() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />
      
      {/* Hide Stack Screen header since bottom tab navigator handles it */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* Main Header */}
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Hero visual box (Carousel) */}
        <HeroCarousel />

        {/* Social Proof statistics row */}
        <View style={styles.statsContainer}>
          <StatCard
            stat="90+"
            label="Worked with students in 90+ countries"
            backgroundColor={COLORS.cardPurple}
          />
          <StatCard
            stat="150,000"
            label="More than 150,000 successful classes"
            backgroundColor={COLORS.cardCream}
          />
        </View>

        {/* Game Features exploration slider (Horizontal swipe) */}
        <GameFeaturesSlider />

        {/* 3 Pillars of Initial Screening info cards */}
        <ScreeningPillars />

        {/* News & Blog Updates slider (Horizontal swipe) */}
        <NewsSection />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.bgPrimary,
  },
  statsContainer: {
    flexDirection: "row",
    gap: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
});
