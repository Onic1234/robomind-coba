import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, Pressable, Platform, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Svg, { Polygon, Line, Circle, Rect, Text as SvgText } from "react-native-svg";
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
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<SimulationLevel>("Intermediate");

  const levelsMetrics = {
    Beginner: {
      skills: "5",
      activities: "10",
      curriculum: "5",
      status: "Beginner",
      desc: "Anak dalam tahap pengenalan konsep dasar.",
    },
    Intermediate: {
      skills: "12",
      activities: "24",
      curriculum: "15",
      status: "Intermediate",
      desc: "Anak mulai menguasai algoritma menengah.",
    },
    Advanced: {
      skills: "18",
      activities: "50",
      curriculum: "24",
      status: "Advanced",
      desc: "Mampu memecahkan masalah logika kompleks.",
    },
  };

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

  // Radar Chart dimensions with extra padding to prevent text overlap
  const cx = 140;
  const cy = 140;
  const r = 70; // Max radius
  const axisLabels = ["Logika", "Kreativitas", "Bahasa", "Fokus", "Masalah"];

  const getCoordinates = (index: number, value: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5;
    const x = cx + r * value * Math.cos(angle);
    const y = cy + r * value * Math.sin(angle);
    return { x, y };
  };

  const getLabelCoordinates = (index: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5;
    const distance = r + 26;
    const x = cx + distance * Math.cos(angle);
    const y = cy + distance * Math.sin(angle);
    return { x, y };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1.0];
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

  const activities = [
    { id: "act1", title: "Robot Circuit Level 5", xp: "+50 XP", time: "1 jam lalu", icon: "hardware-chip-outline", iconBg: "#EFF6FF", iconColor: "#0284C7" },
    { id: "act2", title: "Screw Spin Level 8", xp: "+40 XP", time: "3 jam lalu", icon: "construct-outline", iconBg: "#F0FDF4", iconColor: "#16A34A" },
    { id: "act3", title: "Rogue Soul II Stage 2", xp: "+100 XP", time: "1 hari lalu", icon: "flash-outline", iconBg: "#FFF7ED", iconColor: "#EA580C" },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Profile Header Bar */}
      <View style={styles.topProfileBar}>
        <View style={styles.userProfileLeft}>
          <Image
            source={require("../../assets/images/robomind_hero.png")}
            style={styles.userAvatar}
            contentFit="cover"
          />
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={styles.userName}>Halo, Aira!</Text>
              <Text style={{ fontSize: 16 }}>👋</Text>
            </View>
            <Text style={styles.userSubtext}>Level 20 • Junior Explorer</Text>
          </View>
        </View>

        <Pressable
          style={styles.bellButton}
          onPress={() => alert("Notifikasi Aktivitas")}
        >
          <Ionicons name="notifications-outline" size={20} color="#475569" />
          <View style={styles.bellBadge} />
        </Pressable>
      </View>

      {/* Currency HUD Pills */}
      <View style={styles.currencyRow}>
        <View style={[styles.currencyPill, { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }]}>
          <Text style={{ fontSize: 14 }}>💡</Text>
          <Text style={[styles.currencyText, { color: "#D97706" }]}>6.355</Text>
        </View>

        <View style={[styles.currencyPill, { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }]}>
          <Ionicons name="flash" size={14} color="#2563EB" />
          <Text style={[styles.currencyText, { color: "#1D4ED8" }]}>85/100</Text>
        </View>

        <View style={[styles.currencyPill, { backgroundColor: "#FDF2F8", borderColor: "#FBCFE8" }]}>
          <Ionicons name="diamond" size={14} color="#DB2777" />
          <Text style={[styles.currencyText, { color: "#BE185D" }]}>12</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Promo Banner Rogue Soul II */}
        <View style={styles.promoBannerCard}>
          <View style={styles.promoBannerLeft}>
            <View style={styles.promoTagContainer}>
              <Text style={styles.promoTagText}>GAME BARU!</Text>
              <Text style={styles.promoTagSub}>2D ACTION PLATFORMER</Text>
            </View>
            <Text style={styles.promoTitle}>Rogue Soul II</Text>
            <Text style={styles.promoDesc}>Parkour, tebasan pedang, pisau lempar & toko armor!</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.mainGameBtn, pressed && { opacity: 0.85 }]}
            onPress={() => router.push("/rogue-soul")}
          >
            <Text style={styles.mainGameBtnText}>MAIN</Text>
          </Pressable>
        </View>

        {/* Interactive 3D Robot Showcase Area */}
        <View style={styles.robotShowcaseCard}>
          <View style={styles.showcaseBgCircle} />
          <Svg width="140" height="150" viewBox="0 0 140 150">
            {/* Robot Head */}
            <Rect x="20" y="25" width="100" height="75" rx="24" fill="#FFFFFF" stroke="#0284C7" strokeWidth="4" />
            <Rect x="32" y="38" width="76" height="48" rx="16" fill="#0B132B" />
            {/* Visor Eyes */}
            <Circle cx="52" cy="62" r="9" fill="#00F0FF" />
            <Circle cx="52" cy="62" r="4" fill="#FFFFFF" />
            <Circle cx="88" cy="62" r="9" fill="#00F0FF" />
            <Circle cx="88" cy="62" r="4" fill="#FFFFFF" />
            {/* Antenna */}
            <Line x1="70" y1="25" x2="70" y2="12" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />
            <Circle cx="70" cy="10" r="6" fill="#FFB703" />
            {/* Robot Chest */}
            <Rect x="30" y="105" width="80" height="40" rx="18" fill="#FFFFFF" stroke="#0284C7" strokeWidth="4" />
            <Circle cx="70" cy="125" r="8" fill="#00C3A0" />
          </Svg>
        </View>

        {/* Level Simulation Control Container */}
        <View style={styles.simControlCard}>
          <View style={styles.simHeaderRow}>
            <Text style={styles.simHeaderTitle}>LEVEL SIMULASI</Text>
            <View style={styles.autoSyncBadge}>
              <View style={styles.syncDot} />
              <Text style={styles.autoSyncText}>Auto-sync: Real-time</Text>
            </View>
          </View>

          {/* Level Filter Chips */}
          <View style={styles.chipRow}>
            {(["Beginner", "Intermediate", "Advanced"] as SimulationLevel[]).map((level) => {
              const isActive = selectedLevel === level;
              return (
                <Pressable
                  key={level}
                  onPress={() => setSelectedLevel(level)}
                  style={[styles.levelChip, isActive && styles.levelChipActive]}
                >
                  <Text style={[styles.levelChipText, isActive && styles.levelChipTextActive]}>
                    {level}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Status Robot Banner */}
          <View style={styles.robotStatusCard}>
            <Image
              source={require("../../assets/images/robomind_hero.png")}
              style={styles.robotStatusIcon}
              contentFit="cover"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.robotStatusTitle}>
                Status Robot: <Text style={{ color: "#D97706" }}>{activeMetrics.status}</Text>
              </Text>
              <Text style={styles.robotStatusDesc}>{activeMetrics.desc}</Text>
            </View>
          </View>

          {/* Radar Chart */}
          <View style={styles.radarContainer}>
            <Svg width={280} height={280} viewBox="0 0 280 280">
              {/* Concentric Pentagons */}
              {gridPolygons.map((pts, idx) => (
                <Polygon
                  key={idx}
                  points={pts}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="1.5"
                  strokeDasharray={idx < 3 ? "4 4" : "0"}
                />
              ))}

              {/* Axis Spoke Lines */}
              {[0, 1, 2, 3, 4].map((i) => {
                const end = getCoordinates(i, 1.0);
                return (
                  <Line
                    key={i}
                    x1={cx}
                    y1={cy}
                    x2={end.x}
                    y2={end.y}
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Active Competence Polygon */}
              <Polygon
                points={valuePoints}
                fill="rgba(0, 195, 160, 0.25)"
                stroke="#00C3A0"
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {/* Data Node Points */}
              {[0, 1, 2, 3, 4].map((i) => {
                const { x, y } = getCoordinates(i, activeValues[i]);
                return (
                  <Circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="5"
                    fill="#FF8C00"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                );
              })}

              {/* Crisp Axis Labels */}
              {axisLabels.map((lbl, idx) => {
                const { x, y } = getLabelCoordinates(idx);
                let anchor: "middle" | "start" | "end" = "middle";
                if (idx === 1 || idx === 2) anchor = "start";
                if (idx === 3 || idx === 4) anchor = "end";

                return (
                  <SvgText
                    key={idx}
                    x={x}
                    y={idx === 0 ? y - 4 : y + 4}
                    fontSize="11"
                    fontWeight="800"
                    fill="#334155"
                    textAnchor={anchor}
                  >
                    {lbl}
                  </SvgText>
                );
              })}
            </Svg>
          </View>

          {/* 3 Metric Stat Summary Boxes */}
          <View style={styles.threeStatsRow}>
            <View style={styles.statBoxCard}>
              <Text style={[styles.statBoxNumber, { color: "#00C3A0" }]}>{activeMetrics.skills}</Text>
              <Text style={styles.statBoxLabel}>KETERAMPILAN TARGET</Text>
            </View>

            <View style={styles.statBoxCard}>
              <Text style={[styles.statBoxNumber, { color: "#D97706" }]}>{activeMetrics.activities}</Text>
              <Text style={styles.statBoxLabel}>AKTIVITAS INTERAKTIF</Text>
            </View>

            <View style={styles.statBoxCard}>
              <Text style={[styles.statBoxNumber, { color: "#0284C7" }]}>{activeMetrics.curriculum}</Text>
              <Text style={styles.statBoxLabel}>UKURAN KURIKULUM</Text>
            </View>
          </View>
        </View>

        {/* Progress Hari Ini */}
        <View style={styles.dailyProgressCard}>
          <View style={styles.dailyHeaderRow}>
            <Text style={styles.dailyTitle}>Progress Hari Ini</Text>
            <Text style={styles.dailyXpText}>+120 XP</Text>
          </View>
          <View style={styles.dailyBarTrack}>
            <View style={[styles.dailyBarFill, { width: "65%" }]} />
            <View style={styles.dailyRobotBadge}>
              <Ionicons name="hardware-chip" size={14} color="#00C3A0" />
            </View>
          </View>
        </View>

        {/* Activity History */}
        <View style={styles.activityHeader}>
          <Text style={styles.sectionTitle}>Riwayat Aktivitas</Text>
          <Pressable onPress={() => alert("Membuka riwayat lengkap")}>
            <Text style={styles.linkText}>Lihat Semua {">"}</Text>
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
    backgroundColor: "#F8FAFC",
  },
  topProfileBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  userProfileLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#0284C7",
  },
  userName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  userSubtext: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bellBadge: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  currencyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    gap: 8,
  },
  currencyPill: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  currencyText: {
    fontSize: 13,
    fontWeight: "800",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  promoBannerCard: {
    backgroundColor: "#782A00",
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  promoBannerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  promoTagContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  promoTagText: {
    backgroundColor: "#EF4444",
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  promoTagSub: {
    color: "#FFD700",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  promoTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 2,
  },
  promoDesc: {
    color: "#FFEDD5",
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 15,
  },
  mainGameBtn: {
    backgroundColor: "#00A859",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  mainGameBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
  robotShowcaseCard: {
    width: "100%",
    height: 230,
    backgroundColor: "#BAE6FD",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    position: "relative",
    overflow: "hidden",
  },
  showcaseBgCircle: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  simControlCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 2,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  simHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  simHeaderTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#00C3A0",
    letterSpacing: 1,
  },
  autoSyncBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  autoSyncText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  levelChip: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  levelChipActive: {
    backgroundColor: "#00C3A0",
    borderColor: "#00C3A0",
  },
  levelChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  levelChipTextActive: {
    color: "#FFFFFF",
  },
  robotStatusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  robotStatusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#00C3A0",
  },
  robotStatusTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
  },
  robotStatusDesc: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 2,
  },
  radarContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  threeStatsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  statBoxCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  statBoxNumber: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 4,
  },
  statBoxLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#94A3B8",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  dailyProgressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 2,
  },
  dailyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dailyTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E293B",
  },
  dailyXpText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#00C3A0",
  },
  dailyBarTrack: {
    height: 12,
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
    position: "relative",
    justifyContent: "center",
  },
  dailyBarFill: {
    height: "100%",
    backgroundColor: "#00C3A0",
    borderRadius: 6,
  },
  dailyRobotBadge: {
    position: "absolute",
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#00C3A0",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  linkText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0284C7",
  },
  activitiesContainer: {
    gap: 8,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    padding: 12,
  },
  activityIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 10,
    fontWeight: "500",
    color: "#94A3B8",
  },
  activityXp: {
    fontSize: 13,
    fontWeight: "800",
    color: "#00C3A0",
  },
});
