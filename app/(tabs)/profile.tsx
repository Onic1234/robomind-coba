import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Polygon, Line, Circle, Text as SvgText } from "react-native-svg";
import { COLORS, SPACING, SHAPES, FONTS, SHADOWS } from "../../constants/Theme";
import Button from "../../components/ui/Button";

type SimulationLevel = "Beginner" | "Intermediate" | "Advanced";

interface SkillData {
  logika: number;
  kreativitas: number;
  bahasa: number;
  fokus: number;
  pemecahanMasalah: number;
}

export default function ProfileScreen() {
  const [selectedLevel, setSelectedLevel] = useState<SimulationLevel>("Beginner");

  // Competence metrics values for each simulation level
  const levelsMetrics = {
    Beginner: {
      skills: "5",
      activities: "10+",
      curriculum: "5h",
      status: "Beginner",
      desc: "Berkembang sesuai progres bermain anak.",
    },
    Intermediate: {
      skills: "10+",
      activities: "25+",
      curriculum: "12h",
      status: "Intermediate",
      desc: "Anak mulai menguasai algoritma menengah.",
    },
    Advanced: {
      skills: "15+",
      activities: "50+",
      curriculum: "24h",
      status: "Advanced",
      desc: "Mampu memecahkan masalah logika kompleks.",
    },
  };

  // Competence chart values (0.0 to 1.0) mapping the 5 axes
  const levelsChartData: Record<SimulationLevel, SkillData> = {
    Beginner: {
      logika: 0.35,
      kreativitas: 0.45,
      bahasa: 0.85,
      fokus: 0.4,
      pemecahanMasalah: 0.3,
    },
    Intermediate: {
      logika: 0.65,
      kreativitas: 0.7,
      bahasa: 0.9,
      fokus: 0.6,
      pemecahanMasalah: 0.55,
    },
    Advanced: {
      logika: 0.9,
      kreativitas: 0.85,
      bahasa: 0.95,
      fokus: 0.8,
      pemecahanMasalah: 0.85,
    },
  };

  // Radar Chart calculation constants
  const cx = 110;
  const cy = 110;
  const r = 70; // Max radius
  const axisLabels = ["Logika", "Kreativitas", "Bahasa", "Fokus", "Pemecahan Masalah"];

  // Helper function to get coordinates for radar charts
  const getCoordinates = (index: number, value: number) => {
    // 5 vertices: angle offset of 72 degrees each, starting from top (-90 degrees)
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5;
    const x = cx + r * value * Math.cos(angle);
    const y = cy + r * value * Math.sin(angle);
    return { x, y };
  };

  const getLabelCoordinates = (index: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5;
    // Push labels slightly further from the edge (radius 88)
    const x = cx + (r + 14) * Math.cos(angle);
    const y = cy + (r + 12) * Math.sin(angle);
    return { x, y };
  };

  // 1. Compute concentric pentagon grid lines paths
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const gridPolygons = gridLevels.map((lvl) => {
    const pts = [0, 1, 2, 3, 4].map((i) => {
      const { x, y } = getCoordinates(i, lvl);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return pts.join(" ");
  });

  // 2. Compute child performance polygon points
  const activeSkills = levelsChartData[selectedLevel];
  const activeValues = [
    activeSkills.logika,
    activeSkills.kreativitas,
    activeSkills.bahasa,
    activeSkills.fokus,
    activeSkills.pemecahanMasalah,
  ];

  const valuePoints = [0, 1, 2, 3, 4]
    .map((i) => {
      const { x, y } = getCoordinates(i, activeValues[i]);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const activeMetrics = levelsMetrics[selectedLevel];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Block */}
        <View style={styles.headerBlock}>
          <Text style={styles.pageTitle}>Parent Dashboard & Progress</Text>
          <Text style={styles.pageSubtitle}>
            Pantau metrik perkembangan anak Anda secara real-time dan lihat evaluasi kompetensi mereka.
          </Text>
        </View>

        {/* Dashboard Frame Container Card */}
        <View style={styles.dashboardFrame}>
          
          {/* Level Simulation Tabs */}
          <Text style={styles.sectionLabel}>LEVEL SIMULASI</Text>
          <View style={styles.tabSelector}>
            {(["Beginner", "Intermediate", "Advanced"] as SimulationLevel[]).map((level) => {
              const isActive = selectedLevel === level;
              return (
                <Pressable
                  key={level}
                  onPress={() => setSelectedLevel(level)}
                  style={[styles.tabChip, isActive && styles.tabChipActive]}
                >
                  <Text style={[styles.tabChipText, isActive && styles.tabChipTextActive]}>
                    {level}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Robot Avatar and Status Description */}
          <View style={styles.robotStatusRow}>
            <View style={styles.avatarOutline}>
              <Image
                source={require("../../assets/images/robomind_hero.png")}
                style={styles.robotAvatar}
                contentFit="cover"
              />
            </View>
            <View style={styles.robotStatusText}>
              <Text style={styles.statusLabel}>
                Status Robot:{" "}
                <Text style={styles.statusValue}>{activeMetrics.status}</Text>
              </Text>
              <Text style={styles.statusDesc}>{activeMetrics.desc}</Text>
            </View>
          </View>

          {/* Metrics Horizontal Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{activeMetrics.skills}</Text>
              <Text style={styles.metricLabel}>KETERAMPILAN TARGET</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: COLORS.brandOrange }]}>
                {activeMetrics.activities}
              </Text>
              <Text style={styles.metricLabel}>AKTIVITAS INTERAKTIF</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: COLORS.brandGreen }]}>
                {activeMetrics.curriculum}
              </Text>
              <Text style={styles.metricLabel}>UKURAN KURIKULUM</Text>
            </View>
          </View>

          <View style={styles.horizontalDivider} />

          {/* Radar Chart Visual Section */}
          <View style={styles.chartSection}>
            <View style={styles.chartHeader}>
              <Text style={styles.syncIndicator}>Auto-sync: Real-time</Text>
            </View>

            {/* Radar Svg */}
            <View style={styles.svgWrapper}>
              <Svg width={230} height={230} viewBox="0 0 220 220">
                {/* 1. Draw nested pentagonal web grid lines */}
                {gridPolygons.map((pts, idx) => (
                  <Polygon
                    key={idx}
                    points={pts}
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                ))}

                {/* 2. Draw axis lines radiating from center */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const end = getCoordinates(i, 1.0);
                  return (
                    <Line
                      key={i}
                      x1={cx}
                      y1={cy}
                      x2={end.x}
                      y2={end.y}
                      stroke="#E2E8F0"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* 3. Draw active child competency polygon */}
                <Polygon
                  points={valuePoints}
                  fill="rgba(20, 184, 166, 0.25)"
                  stroke="#14B8A6"
                  strokeWidth="2.5"
                />

                {/* 4. Draw vertices coordinates indicator dots */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const { x, y } = getCoordinates(i, activeValues[i]);
                  return (
                    <Circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="4.5"
                      fill={COLORS.brandOrange}
                      stroke="#FFFFFF"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* 5. Draw axis labels */}
                {axisLabels.map((lbl, idx) => {
                  const { x, y } = getLabelCoordinates(idx);
                  let textAnchor: any = "middle";
                  if (idx === 1) textAnchor = "start"; // Kreativitas
                  if (idx === 2) textAnchor = "start"; // Bahasa
                  if (idx === 3) textAnchor = "end";   // Fokus
                  if (idx === 4) textAnchor = "end";   // Pemecahan Masalah
                  
                  return (
                    <SvgText
                      key={idx}
                      x={x}
                      y={idx === 0 ? y - 2 : y + 4} // Slightly adjust top label
                      fontSize="10"
                      fontWeight="700"
                      fill={COLORS.textMedium}
                      textAnchor={textAnchor}
                    >
                      {lbl}
                    </SvgText>
                  );
                })}
              </Svg>
            </View>
          </View>
          
        </View>

        {/* Subscription section */}
        <View style={styles.subscriptionSection}>
          <Text style={styles.subTitleText}>Berlangganan & Optimalkan Potensi</Text>
          <Text style={styles.subSubtitleText}>
            Pilih paket yang sesuai dengan kebutuhan evaluasi dan bimbingan anak Anda.
          </Text>

          {/* Free Tier Card */}
          <View style={styles.priceCard}>
            <Text style={styles.priceCardType}>Free Tier</Text>
            <View style={styles.priceAmountRow}>
              <Text style={styles.priceTextBig}>Rp 0</Text>
              <Text style={styles.pricePeriodText}>/selamanya</Text>
            </View>
            <Text style={styles.priceDescText}>Akses awal untuk mengenal dunia logika dasar.</Text>

            <View style={styles.perksWrapper}>
              <View style={styles.perkRow}>
                <Ionicons name="checkmark" size={16} color={COLORS.brandGreen} />
                <Text style={styles.perkActiveText}>Akses modul game dasar</Text>
              </View>
              <View style={styles.perkRow}>
                <Ionicons name="checkmark" size={16} color={COLORS.brandGreen} />
                <Text style={styles.perkActiveText}>Diagram perkembangan umum bulanan</Text>
              </View>
              <View style={styles.perkRow}>
                <Ionicons name="checkmark" size={16} color={COLORS.textLight} />
                <Text style={styles.perkInactiveText}>Analisis bertenaga AI mingguan</Text>
              </View>
              <View style={styles.perkRow}>
                <Ionicons name="checkmark" size={16} color={COLORS.textLight} />
                <Text style={styles.perkInactiveText}>Konsultasi ahli via Chatbot AI</Text>
              </View>
            </View>

            <Button
              title="Mulai Gratis"
              onPress={() => alert("Mulai Paket Gratis")}
              variant="secondary"
              style={styles.freeCta}
            />
          </View>

          {/* Premium SaaS Card */}
          <View style={[styles.priceCard, styles.premiumPriceCard]}>
            {/* Paling Populer Badge */}
            <View style={styles.populerBadge}>
              <Text style={styles.populerText}>PALING POPULER</Text>
            </View>

            <Text style={styles.premiumCardType}>⭐ Premium SaaS</Text>
            <View style={styles.priceAmountRow}>
              <Text style={[styles.priceTextBig, { color: "#FFFFFF" }]}>Rp 99.000</Text>
              <Text style={[styles.pricePeriodText, { color: "#9CA3AF" }]}>/bulan</Text>
            </View>
            <Text style={[styles.priceDescText, { color: "#D1D5DB" }]}>
              Pendampingan penuh untuk memaksimalkan potensi si kecil.
            </Text>

            <View style={styles.perksWrapper}>
              <View style={styles.perkRow}>
                <Ionicons name="checkmark" size={16} color="#14B8A6" />
                <Text style={styles.perkActiveTextWhite}>Akses ke semua modul game interaktif</Text>
              </View>
              <View style={styles.perkRow}>
                <Ionicons name="checkmark" size={16} color="#14B8A6" />
                <Text style={styles.perkActiveTextWhite}>Analisis mendalam bertenaga AI secara mingguan</Text>
              </View>
              <View style={styles.perkRow}>
                <Ionicons name="checkmark" size={16} color="#14B8A6" />
                <Text style={styles.perkActiveTextWhite}>Konsultasi Chatbot AI 24/7 terkait metrik anak</Text>
              </View>
              <View style={styles.perkRow}>
                <Ionicons name="checkmark" size={16} color="#14B8A6" />
                <Text style={styles.perkActiveTextWhite}>Rekomendasi aktivitas nyata dari Psikolog Anak</Text>
              </View>
            </View>

            <Button
              title="Langganan Sekarang"
              onPress={() => alert("Langganan Paket Premium")}
              variant="accent"
              style={styles.premiumCta}
            />
          </View>
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
  scrollContent: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerBlock: {
    alignItems: "center",
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
  },
  pageTitle: {
    ...FONTS.heading,
    fontSize: 22,
    color: COLORS.textDark,
    textAlign: "center",
    marginBottom: SPACING.sm,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    ...FONTS.bodyRegular,
    fontSize: 13,
    color: COLORS.textMedium,
    textAlign: "center",
    lineHeight: 18,
  },
  dashboardFrame: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: SHAPES.radiusXl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.medium,
  },
  sectionLabel: {
    ...FONTS.bodyBold,
    fontSize: 11,
    color: COLORS.textLight,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs + 2,
  },
  tabSelector: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  tabChip: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: SHAPES.radiusRound,
    backgroundColor: COLORS.bgPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
  },
  tabChipActive: {
    backgroundColor: COLORS.brandGreen,
    borderColor: COLORS.brandGreen,
  },
  tabChipText: {
    ...FONTS.bodyBold,
    fontSize: 11,
    color: COLORS.textMedium,
  },
  tabChipTextActive: {
    color: "#FFFFFF",
  },
  robotStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  avatarOutline: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: `${COLORS.brandGreen}30`,
    padding: 2,
    marginRight: SPACING.md,
  },
  robotAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
  robotStatusText: {
    flex: 1,
  },
  statusLabel: {
    ...FONTS.bodyBold,
    fontSize: 15,
    color: COLORS.textDark,
    marginBottom: 2,
  },
  statusValue: {
    color: COLORS.brandOrange,
  },
  statusDesc: {
    ...FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.textMedium,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: SHAPES.radiusMd,
    padding: SPACING.sm + 2,
    alignItems: "flex-start",
  },
  metricValue: {
    ...FONTS.heading,
    fontSize: 20,
    color: COLORS.brandBlue,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: COLORS.textMedium,
    letterSpacing: 0.5,
    lineHeight: 10,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  chartSection: {
    alignItems: "center",
    paddingTop: SPACING.md,
  },
  chartHeader: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: SPACING.sm,
  },
  syncIndicator: {
    ...FONTS.caption,
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textLight,
  },
  svgWrapper: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xs,
  },
  subscriptionSection: {
    marginTop: SPACING.xxl,
    marginBottom: Platform.OS === "ios" ? SPACING.xxl : SPACING.lg,
  },
  subTitleText: {
    ...FONTS.subheading,
    fontSize: 18,
    color: COLORS.textDark,
    textAlign: "center",
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  subSubtitleText: {
    ...FONTS.bodyRegular,
    fontSize: 13,
    color: COLORS.textMedium,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  priceCard: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: SHAPES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  premiumPriceCard: {
    backgroundColor: COLORS.brandDarkBlue,
    borderColor: "rgba(255, 255, 255, 0.15)",
    position: "relative",
    overflow: "hidden",
  },
  populerBadge: {
    position: "absolute",
    top: 16,
    right: -30,
    backgroundColor: COLORS.brandOrange,
    paddingVertical: 4,
    paddingHorizontal: 30,
    transform: [{ rotate: "45deg" }],
  },
  populerText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  priceCardType: {
    ...FONTS.bodyBold,
    fontSize: 18,
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  premiumCardType: {
    ...FONTS.bodyBold,
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: SPACING.sm,
  },
  priceAmountRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: SPACING.xs,
  },
  priceTextBig: {
    ...FONTS.heading,
    fontSize: 28,
    color: COLORS.textDark,
    lineHeight: 32,
  },
  pricePeriodText: {
    ...FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 4,
    marginBottom: 4,
  },
  priceDescText: {
    ...FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.textMedium,
    lineHeight: 16,
    marginBottom: SPACING.lg,
  },
  perksWrapper: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  perkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  perkActiveText: {
    ...FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.textDark,
  },
  perkActiveTextWhite: {
    ...FONTS.bodyMedium,
    fontSize: 13,
    color: "#FFFFFF",
  },
  perkInactiveText: {
    ...FONTS.bodyRegular,
    fontSize: 13,
    color: COLORS.textLight,
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  freeCta: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
  },
  premiumCta: {
    backgroundColor: "#14B8A6",
    borderColor: "#14B8A6",
  },
});
