import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, Pressable, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, SPACING, SHAPES, FONTS, SHADOWS } from "../constants/Theme";

export default function ParentModeScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("Mingguan");

  const filters = ["Mingguan", "Bulanan", "3 Bulan"];

  // Weekly study times for the bar chart
  const weeklyData = [
    { day: "Sen", hours: 1.0 },
    { day: "Sel", hours: 1.5 },
    { day: "Rab", hours: 0.8 },
    { day: "Kam", hours: 2.0 },
    { day: "Jum", hours: 1.2 },
    { day: "Sab", hours: 1.6 },
    { day: "Min", hours: 0.4 },
  ];

  const maxHours = 2.5; // for height scaling

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      {/* Header with Back button */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
        </Pressable>
        <Text style={styles.headerTitle}>Dashboard Orang Tua</Text>
        <View style={{ width: 40 }} /> {/* Spacer to align title center */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Subtitle intro */}
        <Text style={styles.welcomeText}>Selamat Datang, Parents! 👋</Text>
        <Text style={styles.welcomeDesc}>
          Pantau perkembangan motorik, kognitif, dan bahasa si kecil berdasarkan data aktivitas ter-sync.
        </Text>

        {/* Filter Tab Chips Row */}
        <View style={styles.filtersWrapper}>
          {filters.map((filter) => {
            const isActive = selectedFilter === filter;
            return (
              <Pressable
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Metrics Chart Card */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartLabel}>Total Waktu Belajar</Text>
            <View style={styles.trendBadge}>
              <Ionicons name="trending-up" size={14} color={COLORS.success} />
              <Text style={styles.trendText}>+12%</Text>
            </View>
          </View>
          <Text style={styles.totalHoursText}>8.5 jam</Text>
          <Text style={styles.chartSubtitleText}>Rata-rata 1.2 jam / hari</Text>

          {/* Bar Chart Container */}
          <View style={styles.barChartContainer}>
            <View style={styles.barsWrapper}>
              {weeklyData.map((data, idx) => {
                const heightPercentage = `${(data.hours / maxHours) * 100}%`;
                return (
                  <View key={idx} style={styles.barColumn}>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { height: heightPercentage }]} />
                    </View>
                    <Text style={styles.barDayText}>{data.day}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Competencies Details row (Skill Terkuat & Psikolog Recommendations) */}
        <Text style={styles.sectionTitle}>Analisis Potensi</Text>
        
        {/* Strongest skill */}
        <View style={styles.infoCard}>
          <View style={[styles.iconCircle, { backgroundColor: "#EFF6FF" }]}>
            <Ionicons name="chatbubbles-outline" size={20} color={COLORS.brandBlue} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Skill Terkuat</Text>
            <Text style={styles.infoValue}>Bahasa Spanyol (VIP)</Text>
            <Text style={styles.infoDesc}>Anak menunjukkan pengenalan kosakata baru dengan akurasi pelafalan 90%.</Text>
          </View>
        </View>

        {/* Recommendations */}
        <View style={[styles.infoCard, { borderLeftColor: COLORS.brandOrange, borderLeftWidth: 4 }]}>
          <View style={[styles.iconCircle, { backgroundColor: "#FFF7ED" }]}>
            <MaterialCommunityIcons name="brain" size={20} color={COLORS.brandOrange} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Rekomendasi Psikolog Anak</Text>
            <Text style={styles.infoValue}>Fokus pada Logika Algoritma</Text>
            <Text style={styles.infoDesc}>
              {"Aktivitas kognitif menunjukkan tren menurun minggu ini. Disarankan bermain 'Math Quest' 2 kali sehari selama 15 menit."}
            </Text>
          </View>
        </View>

        {/* Sync Status Badge */}
        <View style={styles.syncFooter}>
          <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.textLight} />
          <Text style={styles.syncText}>Semua metrik tersinkronisasi otomatis dari game anak</Text>
        </View>

      </ScrollView>
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
  scrollContent: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: Platform.OS === "ios" ? SPACING.xxl + 20 : SPACING.xxl,
  },
  welcomeText: {
    ...FONTS.heading,
    fontSize: 18,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  welcomeDesc: {
    ...FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.textMedium,
    lineHeight: 16,
    marginBottom: SPACING.xl,
  },
  filtersWrapper: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: SHAPES.radiusRound,
    padding: 4,
    gap: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: SHAPES.radiusRound,
    justifyContent: "center",
    alignItems: "center",
  },
  filterChipActive: {
    backgroundColor: COLORS.cardWhite,
    ...SHADOWS.light,
  },
  filterChipText: {
    ...FONTS.bodyMedium,
    fontSize: 11,
    color: COLORS.textMedium,
  },
  filterChipTextActive: {
    color: COLORS.textDark,
    fontWeight: "700",
  },
  chartCard: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: SHAPES.radiusLg,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    padding: SPACING.lg,
    marginBottom: SPACING.xxl,
    ...SHADOWS.light,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  chartLabel: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.textMedium,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: SHAPES.radiusSm,
    paddingVertical: 2,
    paddingHorizontal: 6,
    gap: 2,
  },
  trendText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.success,
  },
  totalHoursText: {
    ...FONTS.heading,
    fontSize: 26,
    color: COLORS.textDark,
    lineHeight: 30,
    marginBottom: 2,
  },
  chartSubtitleText: {
    ...FONTS.caption,
    fontSize: 10,
    color: COLORS.textLight,
    marginBottom: SPACING.xl,
  },
  barChartContainer: {
    height: 150,
    justifyContent: "flex-end",
    paddingTop: SPACING.md,
  },
  barsWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: "100%",
  },
  barColumn: {
    alignItems: "center",
    flex: 1,
  },
  barTrack: {
    width: 14,
    height: 100,
    backgroundColor: "#F1F5F9",
    borderRadius: 7,
    justifyContent: "flex-end",
    overflow: "hidden",
    marginBottom: SPACING.sm,
  },
  barFill: {
    width: "100%",
    backgroundColor: COLORS.brandBlue,
    borderRadius: 7,
  },
  barDayText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.textLight,
  },
  sectionTitle: {
    ...FONTS.subheading,
    fontSize: 15,
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: COLORS.cardWhite,
    borderRadius: SHAPES.radiusLg,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    padding: SPACING.md + 2,
    alignItems: "flex-start",
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.textLight,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  infoDesc: {
    ...FONTS.bodyRegular,
    fontSize: 11,
    color: COLORS.textMedium,
    lineHeight: 15,
  },
  syncFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  syncText: {
    ...FONTS.caption,
    fontSize: 10,
    color: COLORS.textLight,
  },
});
