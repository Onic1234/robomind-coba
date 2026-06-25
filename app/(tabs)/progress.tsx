import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, Pressable, Platform, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Polygon, Line, Circle, Text as SvgText } from "react-native-svg";
import { COLORS, SPACING, SHAPES, FONTS, SHADOWS } from "../../constants/Theme";

type SimulationLevel = "Beginner" | "Intermediate" | "Advanced";

interface SkillData {
  logika: number;
  kreativitas: number;
  bahasa: number;
  fokus: number;
  pemecahanMasalah: number;
}

export default function ProgressScreen() {
  const [selectedLevel, setSelectedLevel] = useState<SimulationLevel>("Intermediate");

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
      skills: "12",
      activities: "24",
      curriculum: "15",
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
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5;
    const x = cx + r * value * Math.cos(angle);
    const y = cy + r * value * Math.sin(angle);
    return { x, y };
  };

  const getLabelCoordinates = (index: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5;
    const x = cx + (r + 14) * Math.cos(angle);
    const y = cy + (r + 12) * Math.sin(angle);
    return { x, y };
  };

  // Concentric pentagon grid lines paths
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const gridPolygons = gridLevels.map((lvl) => {
    const pts = [0, 1, 2, 3, 4].map((i) => {
      const { x, y } = getCoordinates(i, lvl);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return pts.join(" ");
  });

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

  // Recent activity data
  const activities = [
    { id: "act1", title: "Math Quest Level 3", xp: "+50 XP", time: "1 hari lalu", icon: "calculator-outline", iconBg: "#EFF6FF", iconColor: COLORS.brandBlue },
    { id: "act2", title: "Moral Story Level 2", xp: "+30 XP", time: "2 hari lalu", icon: "book-outline", iconBg: "#F0FDF4", iconColor: COLORS.brandGreen },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />
      
      {/* Header Panel */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>LAPORAN PERKEMBANGAN</Text>
          <Text style={styles.headerTitle}>Progress Anak</Text>
        </View>
        
        {/* Calendar / Sync button */}
        <Pressable style={styles.headerButton} onPress={() => alert("Membuka Kalender Aktivitas")}>
          <Ionicons name="calendar-outline" size={20} color={COLORS.textDark} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Level & XP Card */}
        <View style={styles.levelCard}>
          <View style={styles.levelLeft}>
            <Text style={styles.levelLabelText}>Level Saat Ini</Text>
            <Text style={styles.levelNumber}>12</Text>
            <View style={styles.xpBarContainer}>
              <View style={styles.xpBarWrapper}>
                <View style={[styles.xpBarFill, { width: "71%" }]} />
              </View>
              <Text style={styles.xpText}>XP 856 / 1200</Text>
            </View>
          </View>
          <Image
            source={require("../../assets/images/robomind_hero.png")}
            style={styles.levelRobotAvatar}
            contentFit="cover"
          />
        </View>

        {/* Level Selector Tabs */}
        <View style={styles.tabSelectorRow}>
          <Text style={styles.sectionLabel}>TINJAU LEVEL</Text>
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
        </View>

        {/* Radar Chart Card */}
        <View style={styles.chartCard}>
          <Text style={styles.chartCardTitle}>Radar Kemampuan</Text>
          <View style={styles.svgWrapper}>
            <Svg width={230} height={230} viewBox="0 0 220 220">
              {gridPolygons.map((pts, idx) => (
                <Polygon
                  key={idx}
                  points={pts}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="1"
                />
              ))}

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

              <Polygon
                points={valuePoints}
                fill="rgba(11, 132, 255, 0.2)"
                stroke={COLORS.brandBlue}
                strokeWidth="2.5"
              />

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

              {axisLabels.map((lbl, idx) => {
                const { x, y } = getLabelCoordinates(idx);
                let textAnchor: any = "middle";
                if (idx === 1) textAnchor = "start";
                if (idx === 2) textAnchor = "start";
                if (idx === 3) textAnchor = "end";
                if (idx === 4) textAnchor = "end";
                
                return (
                  <SvgText
                    key={idx}
                    x={x}
                    y={idx === 0 ? y - 2 : y + 4}
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

        {/* Weekly Stats Grid */}
        <Text style={styles.sectionTitle}>Statistik Mingguan</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeaderRow}>
              <Ionicons name="time-outline" size={16} color={COLORS.brandBlue} />
              <Text style={styles.metricValue}>8.5 jam</Text>
            </View>
            <Text style={styles.metricLabel}>WAKTU BELAJAR</Text>
          </View>
          
          <View style={styles.metricCard}>
            <View style={styles.metricHeaderRow}>
              <Ionicons name="game-controller-outline" size={16} color={COLORS.brandOrange} />
              <Text style={[styles.metricValue, { color: COLORS.brandOrange }]}>24</Text>
            </View>
            <Text style={styles.metricLabel}>GAME DIMAINKAN</Text>
          </View>
          
          <View style={styles.metricCard}>
            <View style={styles.metricHeaderRow}>
              <Ionicons name="trophy-outline" size={16} color={COLORS.brandGreen} />
              <Text style={[styles.metricValue, { color: COLORS.brandGreen }]}>{activeMetrics.skills}</Text>
            </View>
            <Text style={styles.metricLabel}>BADGE DIRAIH</Text>
          </View>
        </View>

        {/* Activity History */}
        <View style={styles.activityHeader}>
          <Text style={styles.sectionTitle}>Riwayat Aktivitas</Text>
          <Pressable onPress={() => alert("Membuka semua riwayat aktivitas")}>
            <Text style={styles.linkText}>{"Lihat Semua >"}</Text>
          </Pressable>
        </View>

        <View style={styles.activitiesContainer}>
          {activities.map((act) => (
            <View key={act.id} style={styles.activityCard}>
              <View style={[styles.activityIconCircle, { backgroundColor: act.iconBg }]}>
                <Ionicons name={act.icon as any} size={18} color={act.iconColor} />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityTitle}>{act.title}</Text>
                <Text style={styles.activityTime}>{act.time}</Text>
              </View>
              <Text style={styles.activityXp}>{act.xp}</Text>
            </View>
          ))}
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
  },
  headerSubtitle: {
    ...FONTS.caption,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: COLORS.brandBlue,
  },
  headerTitle: {
    ...FONTS.heading,
    fontSize: 20,
    color: COLORS.textDark,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: Platform.OS === "ios" ? SPACING.xxl + 20 : SPACING.xxl,
  },
  levelCard: {
    backgroundColor: COLORS.brandBlue,
    borderRadius: SHAPES.radiusLg,
    padding: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  levelLeft: {
    flex: 1,
  },
  levelLabelText: {
    ...FONTS.bodyBold,
    fontSize: 12,
    color: "#E0F2FE",
    opacity: 0.9,
    marginBottom: 4,
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 38,
    marginBottom: SPACING.md,
  },
  xpBarContainer: {
    gap: 4,
  },
  xpBarWrapper: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 3,
    overflow: "hidden",
  },
  xpBarFill: {
    height: "100%",
    backgroundColor: COLORS.brandOrange,
    borderRadius: 3,
  },
  xpText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#E0F2FE",
  },
  levelRobotAvatar: {
    width: 90,
    height: 90,
    borderRadius: SHAPES.radiusMd,
    marginLeft: SPACING.md,
  },
  tabSelectorRow: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    ...FONTS.bodyBold,
    fontSize: 10,
    color: COLORS.textLight,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  tabSelector: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  tabChip: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: SHAPES.radiusRound,
    backgroundColor: COLORS.cardWhite,
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
  chartCard: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: SHAPES.radiusLg,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    padding: SPACING.lg,
    alignItems: "center",
    marginBottom: SPACING.xl,
    ...SHADOWS.light,
  },
  chartCardTitle: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.textDark,
    alignSelf: "flex-start",
    marginBottom: SPACING.md,
  },
  svgWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    ...FONTS.subheading,
    fontSize: 15,
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.cardWhite,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: SHAPES.radiusMd,
    padding: SPACING.md,
    ...SHADOWS.light,
  },
  metricHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  metricValue: {
    ...FONTS.heading,
    fontSize: 15,
    color: COLORS.brandBlue,
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: COLORS.textLight,
    letterSpacing: 0.5,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  linkText: {
    ...FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.brandBlue,
  },
  activitiesContainer: {
    gap: SPACING.sm,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardWhite,
    borderRadius: SHAPES.radiusMd,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
  },
  activityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.textDark,
    marginBottom: 2,
  },
  activityTime: {
    ...FONTS.caption,
    fontSize: 10,
    color: COLORS.textLight,
  },
  activityXp: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.success,
  },
});
