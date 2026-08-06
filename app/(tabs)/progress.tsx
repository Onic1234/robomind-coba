import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, Pressable, Platform, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Svg, { Polygon, Line, Circle, Rect, Path, Text as SvgText } from "react-native-svg";
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
  const [userCoins, setUserCoins] = useState(1250);

  const levelsMetrics = {
    Beginner: {
      skills: "5",
      activities: "10",
      curriculum: "5 Misi",
      status: "Beginner Explorer 🚀",
      desc: "Anak dalam tahap pengenalan konsep dasar & logika!",
    },
    Intermediate: {
      skills: "12",
      activities: "24",
      curriculum: "15 Misi",
      status: "Intermediate Coder 🌟",
      desc: "Anak mulai mahir menguasai algoritma menengah!",
    },
    Advanced: {
      skills: "18",
      activities: "50",
      curriculum: "24 Misi",
      status: "Advanced Genius 👑",
      desc: "Mampu memecahkan masalah logika & coding kompleks!",
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
      logika: 0.68,
      kreativitas: 0.72,
      bahasa: 0.9,
      fokus: 0.65,
      pemecahanMasalah: 0.6,
    },
    Advanced: {
      logika: 0.92,
      kreativitas: 0.88,
      bahasa: 0.95,
      fokus: 0.85,
      pemecahanMasalah: 0.88,
    },
  };

  // Radar Chart dimensions with wide padding for kid-friendly labels
  const cx = 150;
  const cy = 150;
  const r = 75; // Max radius
  const axisLabels = ["🧠 Logika", "🎨 Kreativitas", "🗣️ Bahasa", "🎯 Fokus", "🧩 Masalah"];

  const getCoordinates = (index: number, value: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5;
    const x = cx + r * value * Math.cos(angle);
    const y = cy + r * value * Math.sin(angle);
    return { x, y };
  };

  const getLabelCoordinates = (index: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5;
    const distance = r + 30;
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
    { id: "act1", title: "Robot Circuit Level 5", xp: "+50 XP ⭐", time: "1 jam lalu", icon: "hardware-chip", iconBg: "#E0F2FE", iconColor: "#0284C7" },
    { id: "act2", title: "Screw Spin Level 8", xp: "+40 XP ⭐", time: "3 jam lalu", icon: "construct", iconBg: "#DCFCE7", iconColor: "#16A34A" },
    { id: "act3", title: "Rogue Soul II Stage 2", xp: "+100 XP ⭐", time: "1 hari lalu", icon: "flash", iconBg: "#FFEDD5", iconColor: "#EA580C" },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Playful Top Profile Header Bar */}
      <View style={styles.topProfileBar}>
        <View style={styles.userProfileLeft}>
          <View style={styles.avatarGlowContainer}>
            <Image
              source={require("../../assets/images/robomind_hero.png")}
              style={styles.userAvatar}
              contentFit="cover"
            />
          </View>
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={styles.userName}>Halo, Aira!</Text>
              <Text style={{ fontSize: 18 }}>👋</Text>
            </View>
            <View style={styles.levelBadgeChip}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.userSubtext}>Level 20 • Junior Explorer</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={styles.bellButton}
          onPress={() => alert("Notifikasi Aktivitas Seru!")}
        >
          <Ionicons name="notifications" size={20} color="#0284C7" />
          <View style={styles.bellBadge} />
        </Pressable>
      </View>

      {/* Kids Colorful Currency HUD Pills */}
      <View style={styles.currencyRow}>
        <View style={[styles.currencyPill, { backgroundColor: "#FFF9E6", borderColor: "#FDE68A" }]}>
          <Text style={{ fontSize: 16 }}>🪙</Text>
          <Text style={[styles.currencyText, { color: "#D97706" }]}>{userCoins.toLocaleString("id-ID")} Koin</Text>
        </View>

        <View style={[styles.currencyPill, { backgroundColor: "#E0F2FE", borderColor: "#BAE6FD" }]}>
          <Text style={{ fontSize: 16 }}>⚡</Text>
          <Text style={[styles.currencyText, { color: "#0284C7" }]}>85/100 Energi</Text>
        </View>

        <View style={[styles.currencyPill, { backgroundColor: "#FCE7F3", borderColor: "#FBCFE8" }]}>
          <Text style={{ fontSize: 16 }}>💎</Text>
          <Text style={[styles.currencyText, { color: "#DB2777" }]}>12 Permata</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Vibrant Rogue Soul II Banner */}
        <View style={styles.promoBannerCard}>
          <View style={styles.promoBannerLeft}>
            <View style={styles.promoTagContainer}>
              <Text style={styles.promoTagText}>🔥 GAME BARU!</Text>
              <Text style={styles.promoTagSub}>ACTION PLATFORMER</Text>
            </View>
            <Text style={styles.promoTitle}>Rogue Soul II ⚔️</Text>
            <Text style={styles.promoDesc}>Parkour seru, tebasan pedang, pisau lempar & toko armor keren!</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.mainGameBtn, pressed && { transform: [{ scale: 0.95 }] }]}
            onPress={() => router.push("/rogue-soul")}
          >
            <Text style={styles.mainGameBtnText}>MAIN! 🎮</Text>
          </Pressable>
        </View>

        {/* Playful Robot Mascot Showcase Area */}
        <View style={styles.robotShowcaseCard}>
          <View style={styles.skyCloudLeft} />
          <View style={styles.skyCloudRight} />
          <View style={styles.showcaseBgCircle} />
          
          <Svg width="150" height="160" viewBox="0 0 150 160">
            {/* Soft Shadow */}
            <Rect x="40" y="148" width="70" height="8" rx="4" fill="rgba(0,0,0,0.12)" />
            
            {/* Robot Head */}
            <Rect x="25" y="25" width="100" height="75" rx="26" fill="#FFFFFF" stroke="#0284C7" strokeWidth="4.5" />
            <Rect x="36" y="38" width="78" height="48" rx="18" fill="#0F172A" />
            
            {/* Visor Cute Eyes */}
            <Circle cx="56" cy="62" r="10" fill="#00F0FF" />
            <Circle cx="56" cy="62" r="4" fill="#FFFFFF" />
            <Circle cx="94" cy="62" r="10" fill="#00F0FF" />
            <Circle cx="94" cy="62" r="4" fill="#FFFFFF" />
            
            {/* Cute Antenna & Ball */}
            <Line x1="75" y1="25" x2="75" y2="10" stroke="#0284C7" strokeWidth="4.5" strokeLinecap="round" />
            <Circle cx="75" cy="8" r="7" fill="#FFB703" stroke="#FFFFFF" strokeWidth="2" />
            
            {/* Cute Ears */}
            <Rect x="15" y="52" width="10" height="20" rx="5" fill="#0284C7" />
            <Rect x="125" y="52" width="10" height="20" rx="5" fill="#0284C7" />
            
            {/* Robot Body */}
            <Rect x="35" y="106" width="80" height="40" rx="20" fill="#FFFFFF" stroke="#0284C7" strokeWidth="4.5" />
            <Circle cx="75" cy="126" r="9" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
          </Svg>

          {/* Grass Floor */}
          <View style={styles.grassGround} />
        </View>

        {/* Level Simulation Control Container */}
        <View style={styles.simControlCard}>
          <View style={styles.simHeaderRow}>
            <Text style={styles.simHeaderTitle}>🎯 LEVEL SIMULASI BELAJAR</Text>
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

          {/* Radar Chart Kemampuan */}
          <View style={styles.radarHeaderWrapper}>
            <Text style={styles.radarCardTitle}>✨ RADAR KEMAMPUAN ANAK</Text>
          </View>

          <View style={styles.radarContainer}>
            <Svg width={300} height={300} viewBox="0 0 300 300">
              {/* Concentric Pentagons */}
              {gridPolygons.map((pts, idx) => (
                <Polygon
                  key={idx}
                  points={pts}
                  fill="none"
                  stroke="#CBD5E1"
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
                    stroke="#94A3B8"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Active Competence Polygon */}
              <Polygon
                points={valuePoints}
                fill="rgba(16, 185, 129, 0.25)"
                stroke="#10B981"
                strokeWidth="3.5"
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
                    r="6"
                    fill="#FF8C00"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                );
              })}

              {/* Clear Axis Labels with Kid Emojis */}
              {axisLabels.map((lbl, idx) => {
                const { x, y } = getLabelCoordinates(idx);
                let anchor: "middle" | "start" | "end" = "middle";
                if (idx === 1 || idx === 2) anchor = "start";
                if (idx === 3 || idx === 4) anchor = "end";

                return (
                  <SvgText
                    key={idx}
                    x={x}
                    y={idx === 0 ? y - 6 : y + 5}
                    fontSize="12"
                    fontWeight="800"
                    fill="#1E293B"
                    textAnchor={anchor}
                  >
                    {lbl}
                  </SvgText>
                );
              })}
            </Svg>
          </View>

          {/* 3 Fun Metric Stat Summary Cards */}
          <View style={styles.threeStatsRow}>
            <View style={[styles.statBoxCard, { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }]}>
              <Text style={[styles.statBoxNumber, { color: "#059669" }]}>{activeMetrics.skills}</Text>
              <Text style={styles.statBoxLabel}>KETERAMPILAN TARGET</Text>
            </View>

            <View style={[styles.statBoxCard, { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }]}>
              <Text style={[styles.statBoxNumber, { color: "#D97706" }]}>{activeMetrics.activities}</Text>
              <Text style={styles.statBoxLabel}>AKTIVITAS INTERAKTIF</Text>
            </View>

            <View style={[styles.statBoxCard, { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }]}>
              <Text style={[styles.statBoxNumber, { color: "#2563EB" }]}>{activeMetrics.curriculum}</Text>
              <Text style={styles.statBoxLabel}>UKURAN KURIKULUM</Text>
            </View>
          </View>
        </View>

        {/* Fun Daily Progress Card */}
        <View style={styles.dailyProgressCard}>
          <View style={styles.dailyHeaderRow}>
            <Text style={styles.dailyTitle}>🚀 Progress Hari Ini</Text>
            <Text style={styles.dailyXpText}>+120 XP ⭐</Text>
          </View>
          <View style={styles.dailyBarTrack}>
            <View style={[styles.dailyBarFill, { width: "65%" }]} />
            <View style={styles.dailyRobotBadge}>
              <Ionicons name="hardware-chip" size={14} color="#10B981" />
            </View>
          </View>
        </View>

        {/* Activity History */}
        <View style={styles.activityHeader}>
          <Text style={styles.sectionTitle}>📜 Riwayat Aktivitas</Text>
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
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  userProfileLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarGlowContainer: {
    padding: 2,
    borderRadius: 24,
    backgroundColor: "#E0F2FE",
  },
  userAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: "#0284C7",
  },
  userName: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
  },
  levelBadgeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  userSubtext: {
    fontSize: 10,
    fontWeight: "800",
    color: "#B45309",
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F0F9FF",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  bellBadge: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#EF4444",
  },
  currencyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    gap: 10,
  },
  currencyPill: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    elevation: 1,
  },
  currencyText: {
    fontSize: 13,
    fontWeight: "900",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  promoBannerCard: {
    backgroundColor: "#D97706",
    borderRadius: 26,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    elevation: 5,
    shadowColor: "#D97706",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 2,
    borderColor: "#FDE68A",
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  promoTagSub: {
    color: "#FEF3C7",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  promoTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 2,
  },
  promoDesc: {
    color: "#FEF3C7",
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 15,
  },
  mainGameBtn: {
    backgroundColor: "#10B981",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    borderWidth: 2,
    borderColor: "#A7F3D0",
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
    borderWidth: 2,
    borderColor: "#7DD3FC",
  },
  skyCloudLeft: {
    position: "absolute",
    top: 24,
    left: 20,
    width: 60,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    opacity: 0.9,
  },
  skyCloudRight: {
    position: "absolute",
    top: 36,
    right: 25,
    width: 70,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    opacity: 0.9,
  },
  showcaseBgCircle: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255, 255, 255, 0.45)",
  },
  grassGround: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 48,
    backgroundColor: "#34D399",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  simControlCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    elevation: 3,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  simHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  simHeaderTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#059669",
    letterSpacing: 1,
  },
  autoSyncBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  autoSyncText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#047857",
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  levelChip: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  levelChipActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  levelChipText: {
    fontSize: 12,
    fontWeight: "800",
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
    borderWidth: 1.5,
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
    borderColor: "#10B981",
  },
  robotStatusTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1E293B",
  },
  robotStatusDesc: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },
  radarHeaderWrapper: {
    alignItems: "center",
    marginTop: 6,
    marginBottom: 4,
  },
  radarCardTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: 0.5,
  },
  radarContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },
  threeStatsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  statBoxCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 2,
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
    fontWeight: "900",
    color: "#64748B",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  dailyProgressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
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
    fontWeight: "900",
    color: "#1E293B",
  },
  dailyXpText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#10B981",
  },
  dailyBarTrack: {
    height: 14,
    backgroundColor: "#F1F5F9",
    borderRadius: 7,
    position: "relative",
    justifyContent: "center",
  },
  dailyBarFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 7,
  },
  dailyRobotBadge: {
    position: "absolute",
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
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
    fontWeight: "800",
    color: "#0284C7",
  },
  activitiesContainer: {
    gap: 8,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1.5,
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
    fontWeight: "900",
    color: "#1E293B",
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8",
  },
  activityXp: {
    fontSize: 13,
    fontWeight: "900",
    color: "#10B981",
  },
});
