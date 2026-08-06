import React, { useState, useCallback } from "react";
import { StyleSheet, View, Text, ScrollView, Pressable, StatusBar, Modal, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import Svg, { Polygon, Line, Circle, Text as SvgText } from "react-native-svg";
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, SPACING, SHAPES, FONTS, SHADOWS } from "../../constants/Theme";
import Robot3DModelView from "../../components/Robot3DModelView";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../hooks/useAuth";

type SimulationLevel = "Beginner" | "Intermediate" | "Advanced";

export default function Index() {
  const router = useRouter();
  const { isLoggedIn, childName, updateChildName, avatarUrl, updateAvatarUrl } = useAuth();
  const [userCoins, setUserCoins] = useState(1250);
  const [childLevel, setChildLevel] = useState(12);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const val = await AsyncStorage.getItem("user_coins_balance");
          if (val !== null) {
            setUserCoins(parseInt(val));
          }
          const storedLevel = await AsyncStorage.getItem("robot_escape_current_level");
          if (storedLevel !== null) {
            setChildLevel(11 + parseInt(storedLevel));
          } else {
            setChildLevel(12);
          }
        } catch (e) {
          console.error("Failed to load dashboard data", e);
        }
      };
      loadData();
    }, [])
  );

  // Name Editing States
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [nameError, setNameError] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  // Avatar Picking State
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  const handlePickAvatar = async () => {
    if (!isLoggedIn) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Maaf, kami memerlukan izin akses galeri untuk mengubah foto profil.");
      return;
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setIsSavingAvatar(true);
        const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        await updateAvatarUrl(base64Uri);
      }
    } catch (err: any) {
      alert(err?.message || "Gagal mengubah foto profil.");
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleSaveName = async () => {
    setNameError("");
    if (!editName.trim()) {
      setNameError("Nama tidak boleh kosong.");
      return;
    }
    setIsSavingName(true);
    try {
      await updateChildName(editName.trim());
      setNameModalVisible(false);
    } catch (err: any) {
      setNameError(err?.message || "Terjadi kesalahan saat menyimpan nama.");
    } finally {
      setIsSavingName(false);
    }
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

  const [selectedLevel, setSelectedLevel] = useState<SimulationLevel>("Intermediate");

  const levelsMetrics = {
    Beginner: {
      skills: "5",
      activities: "10+",
      curriculum: "5 Misi",
      status: "Beginner",
      desc: "Berkembang sesuai progres bermain anak.",
    },
    Intermediate: {
      skills: "12",
      activities: "24",
      curriculum: "15 Misi",
      status: "Intermediate",
      desc: "Anak mulai menguasai algoritma menengah.",
    },
    Advanced: {
      skills: "15+",
      activities: "50+",
      curriculum: "24 Misi",
      status: "Advanced",
      desc: "Mampu memecahkan masalah logika kompleks.",
    },
  };

  const levelsChartData: Record<SimulationLevel, { logika: number; kreativitas: number; bahasa: number; fokus: number; pemecahanMasalah: number }> = {
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

  const activeSkills = levelsChartData[selectedLevel];
  const skillValues = [
    activeSkills.logika,
    activeSkills.kreativitas,
    activeSkills.bahasa,
    activeSkills.fokus,
    activeSkills.pemecahanMasalah,
  ];

  const valuePoints = [0, 1, 2, 3, 4]
    .map((i) => {
      const { x, y } = getCoordinates(i, skillValues[i]);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const activeMetrics = levelsMetrics[selectedLevel];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3FAFF" />

      {/* Child Header HUD Panel */}
      <View style={styles.header}>
        {/* Child Profile info */}
        <View style={styles.profileSection}>
          <Pressable 
            onPress={handlePickAvatar}
            disabled={!isLoggedIn || isSavingAvatar}
            style={({ pressed }) => [
              styles.avatarOutline,
              pressed && { opacity: 0.8 }
            ]}
          >
            {isSavingAvatar ? (
              <View style={[styles.avatar, { justifyContent: "center", alignItems: "center", backgroundColor: "rgba(11, 132, 255, 0.1)" }]}>
                <ActivityIndicator size="small" color="#0B84FF" />
              </View>
            ) : (
              <Image
                source={avatarUrl ? { uri: avatarUrl } : require("../../assets/images/robomind_hero.png")}
                style={styles.avatar}
                contentFit="cover"
              />
            )}
            {isLoggedIn && (
              <View style={styles.homeEditAvatarBadge}>
                <Ionicons name="camera" size={8} color="#FFFFFF" />
              </View>
            )}
          </Pressable>
          
          <Pressable
            onPress={() => {
              if (isLoggedIn) {
                setEditName(childName);
                setNameModalVisible(true);
                setNameError("");
              }
            }}
            disabled={!isLoggedIn}
            style={({ pressed }) => [
              pressed && { opacity: 0.85 }
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={styles.greetingText}>Halo, {childName}! 👋</Text>
              {isLoggedIn && (
                <Ionicons name="pencil-sharp" size={12} color="#0B84FF" style={{ opacity: 0.8, marginTop: 2 }} />
              )}
            </View>
            <Text style={styles.levelText}>Level {childLevel} • Junior Explorer</Text>
          </Pressable>
        </View>

        {/* Daily Spin Icon Badge */}
        <Pressable 
          onPress={() => alert("Daily Spin is ready!")}
          style={({ pressed }) => [styles.dailySpinBadge, pressed && { opacity: 0.8 }]}
        >
          <View style={styles.dailySpinIconContainer}>
            <MaterialCommunityIcons name="dharmachakra" size={16} color="#FF9F0A" />
          </View>
          <View style={{ marginLeft: 4 }}>
            <Text style={styles.dailySpinTitle}>DAILY SPIN</Text>
            <Text style={styles.dailySpinSub}>FREE</Text>
          </View>
        </Pressable>
      </View>

      {/* Quick stats HUD row (coins, energy, gems) */}
      <View style={styles.hudRow}>
        <View style={styles.hudBadge}>
          <MaterialCommunityIcons name="coins" size={14} color="#F59E0B" />
          <Text style={[styles.hudBadgeText, { color: "#D97706" }]}>{userCoins.toLocaleString("id-ID")}</Text>
        </View>
        
        <View style={[styles.hudBadge, { borderColor: "#DBEAFE" }]}>
          <Ionicons name="flash" size={14} color="#0B84FF" />
          <Text style={[styles.hudBadgeText, { color: "#0B84FF" }]}>85/100</Text>
        </View>
        
        <View style={[styles.hudBadge, { borderColor: "#FCE7F3" }]}>
          <Ionicons name="diamond" size={12} color="#EC4899" />
          <Text style={[styles.hudBadgeText, { color: "#DB2777" }]}>12</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress XP Bar Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressCardTitle}>Progress Hari Ini</Text>
            <Text style={styles.xpText}>+120 XP ⭐</Text>
          </View>
          <View style={styles.xpBarContainer}>
            <View style={styles.xpBarWrapper}>
              <View style={[styles.xpBarFill, { width: "60%" }]} />
            </View>
            <MaterialCommunityIcons name="robot" size={16} color="#00C3A0" style={styles.robotIndicator} />
          </View>
        </View>

        {/* CHARACTER SECTION - CENTER ROBOT WITH FLOATING LEFT AND RIGHT MENUS */}
        <View style={styles.gameCharacterWrapper}>
          {/* Centered Robot character container */}
          <View style={styles.centerCharacterContainer}>
            <Robot3DModelView />
          </View>

          {/* Left Menu (Event, Shop, Pass) */}
          <View style={styles.leftMenuSide}>
            <Pressable onPress={() => alert("Event dibuka!")} style={styles.sideMenuBtn}>
              <View style={styles.badgeOverlay}><Text style={styles.badgeText}>2</Text></View>
              <Ionicons name="gift" size={20} color="#FF5E36" />
              <Text style={styles.sideMenuBtnText}>EVENT</Text>
            </Pressable>

            <Pressable onPress={() => alert("Shop dibuka!")} style={styles.sideMenuBtn}>
              <Ionicons name="cart" size={20} color="#0B84FF" />
              <Text style={styles.sideMenuBtnText}>SHOP</Text>
            </Pressable>

            <Pressable onPress={() => alert("Pass dibuka!")} style={styles.sideMenuBtn}>
              <Ionicons name="shield-checkmark" size={20} color="#00C3A0" />
              <Text style={styles.sideMenuBtnText}>PASS</Text>
            </Pressable>
          </View>

          {/* Right Menu (Mail, Quest, Friend) */}
          <View style={styles.rightMenuSide}>
            <Pressable onPress={() => alert("Mail dibuka!")} style={styles.sideMenuBtn}>
              <View style={styles.badgeOverlay}><Text style={styles.badgeText}>2</Text></View>
              <Ionicons name="mail" size={20} color="#4B5563" />
              <Text style={styles.sideMenuBtnText}>MAIL</Text>
            </Pressable>

            <Pressable onPress={() => alert("Quest dibuka!")} style={styles.sideMenuBtn}>
              <View style={styles.badgeOverlay}><Text style={styles.badgeText}>1</Text></View>
              <Ionicons name="document-text" size={20} color="#F59E0B" />
              <Text style={styles.sideMenuBtnText}>QUEST</Text>
            </Pressable>

            <Pressable onPress={() => alert("Friend dibuka!")} style={styles.sideMenuBtn}>
              <Ionicons name="people" size={20} color="#FF8F36" />
              <Text style={styles.sideMenuBtnText}>FRIEND</Text>
            </Pressable>
          </View>
        </View>

        {/* Featured Game: Rogue Soul 2 Banner */}
        <Pressable
          style={({ pressed }) => [
            styles.featuredBanner,
            pressed && { transform: [{ scale: 0.98 }] }
          ]}
          onPress={() => router.push("/rogue-soul")}
        >
          <View style={{ flex: 1, paddingRight: SPACING.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <View style={styles.tagNew}>
                <Text style={styles.tagNewText}>GAME BARU!</Text>
              </View>
              <Text style={styles.bannerSubtitle}>2D ACTION PLATFORMER</Text>
            </View>
            <Text style={styles.bannerTitle}>Rogue Soul II</Text>
            <Text style={styles.bannerDesc}>Parkour, tebasan pedang, pisau lempar & toko armor!</Text>
          </View>
          <View style={styles.bannerActionBtn}>
            <Text style={styles.bannerActionText}>PLAY</Text>
          </View>
        </Pressable>

        {/* Radar Chart Card (Skala Progress) */}
        <View style={styles.chartCard}>
          {/* Header Row */}
          <View style={styles.chartHeaderRow}>
            <Text style={styles.simulasiLabel}>LEVEL SIMULASI</Text>
            <View style={styles.syncBadge}>
              <View style={styles.syncDot} />
              <Text style={styles.syncBadgeText}>Auto-sync: Real-time</Text>
            </View>
          </View>

          {/* Level Selector Tabs */}
          <View style={styles.simChipsRow}>
            {(["Beginner", "Intermediate", "Advanced"] as SimulationLevel[]).map((level) => {
              const isActive = selectedLevel === level;
              return (
                <Pressable
                  key={level}
                  onPress={() => setSelectedLevel(level)}
                  style={[styles.simTab, isActive && styles.simTabActive]}
                >
                  <Text style={[styles.simTabText, isActive && styles.simTabTextActive]}>
                    {level}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Robot Status Info */}
          <View style={styles.robotStatusRow}>
            <View style={styles.robotAvatarOuter}>
              <Image
                source={require("../../assets/images/robomind_hero.png")}
                style={styles.robotAvatarImg}
                contentFit="cover"
              />
            </View>
            <View style={styles.robotStatusTextContainer}>
              <Text style={styles.robotStatusTitle}>
                Status Robot: <Text style={styles.robotStatusHighlight}>{activeMetrics.status}</Text>
              </Text>
              <Text style={styles.robotStatusDesc}>{activeMetrics.desc}</Text>
            </View>
          </View>

          {/* Radar Chart Visual */}
          <View style={styles.svgWrapper}>
            <Svg width={220} height={220} viewBox="0 0 220 220">
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
                fill="rgba(11, 132, 255, 0.1)"
                stroke="#0B84FF"
                strokeWidth="2"
              />

              {[0, 1, 2, 3, 4].map((i) => {
                const { x, y } = getCoordinates(i, skillValues[i]);
                return (
                  <Circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="4.5"
                    fill="#0B84FF"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
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
                    fontSize="9"
                    fontWeight="800"
                    fill="#4B5563"
                    textAnchor={textAnchor}
                  >
                    {lbl}
                  </SvgText>
                );
              })}
            </Svg>
          </View>

          {/* Three Stat Cards */}
          <View style={styles.simMetricsRow}>
            <View style={styles.simMetricCard}>
              <Text style={styles.simMetricValue}>{activeMetrics.skills}</Text>
              <Text style={styles.simMetricLabel}>KETERAMPILAN{"\n"}TARGET</Text>
            </View>
            
            <View style={styles.simMetricCard}>
              <Text style={[styles.simMetricValue, { color: "#F59E0B" }]}>{activeMetrics.activities}</Text>
              <Text style={styles.simMetricLabel}>AKTIVITAS{"\n"}INTERAKTIF</Text>
            </View>

            <View style={styles.simMetricCard}>
              <Text style={[styles.simMetricValue, { color: "#0B84FF" }]}>{activeMetrics.curriculum}</Text>
              <Text style={styles.simMetricLabel}>UKURAN{"\n"}KURIKULUM</Text>
            </View>
          </View>
        </View>

        {/* Large Gold CTA button like stitch replicator's CLAIM button */}
        <Pressable
          style={({ pressed }) => [
            styles.goldClaimBtn,
            pressed && { transform: [{ scale: 0.98 }], opacity: 0.95 }
          ]}
          onPress={() => router.push("/play")}
        >
          <Text style={styles.goldClaimText}>MULAI BELAJAR</Text>
          <View style={styles.shineEffect} />
        </Pressable>

      </ScrollView>

      {/* Ubah Nama Modal */}
      <Modal
        visible={nameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.pencilIconCircle}>
              <Ionicons name="pencil" size={24} color="#0B84FF" />
            </View>
            
            <Text style={styles.modalTitle}>Ubah Nama Anak</Text>
            <Text style={styles.modalSubtitle}>
              Masukkan nama baru untuk mengubah panggilan anak di aplikasi.
            </Text>

            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Masukkan nama anak"
              placeholderTextColor="#9CA3AF"
              style={styles.nameInput}
              autoCapitalize="words"
              maxLength={20}
              onSubmitEditing={handleSaveName}
            />

            {nameError ? (
              <Text style={styles.errorText}>{nameError}</Text>
            ) : null}

            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalBtn, styles.modalBtnSecondary]} 
                onPress={() => setNameModalVisible(false)}
                disabled={isSavingName}
              >
                <Text style={styles.modalBtnTextSecondary}>Batal</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.modalBtn, styles.modalBtnPrimary]} 
                onPress={handleSaveName}
                disabled={isSavingName}
              >
                {isSavingName ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalBtnTextPrimary}>Simpan</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3FAFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
    backgroundColor: "#F3FAFF",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 9999,
    paddingRight: SPACING.lg,
    paddingLeft: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 104, 116, 0.12)",
  },
  avatarOutline: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: "#0B84FF",
    padding: 1.5,
    marginRight: SPACING.sm,
    position: "relative",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 19,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1F2937",
  },
  levelText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 1,
  },
  dailySpinBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(0, 104, 116, 0.12)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dailySpinIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 159, 10, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  dailySpinTitle: {
    fontSize: 8,
    fontWeight: "900",
    color: "#1F2937",
  },
  dailySpinSub: {
    fontSize: 7,
    fontWeight: "800",
    color: "#10B981",
    marginTop: 0.5,
  },
  hudRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
    gap: SPACING.sm,
    backgroundColor: "#F3FAFF",
  },
  hudBadge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: SHAPES.radiusMd,
    paddingVertical: 8,
    gap: 4,
  },
  hudBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  scrollContent: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 40,
  },
  gameCharacterWrapper: {
    width: "100%",
    height: 360,
    position: "relative",
    marginBottom: SPACING.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  centerCharacterContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    overflow: "hidden",
  },
  leftMenuSide: {
    position: "absolute",
    left: 8,
    top: 30,
    bottom: 30,
    justifyContent: "space-around",
    zIndex: 10,
  },
  rightMenuSide: {
    position: "absolute",
    right: 8,
    top: 30,
    bottom: 30,
    justifyContent: "space-around",
    zIndex: 10,
  },
  sideMenuBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderWidth: 1.5,
    borderColor: "rgba(0, 104, 116, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sideMenuBtnText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#4B5563",
    marginTop: 2,
    textAlign: "center",
  },
  badgeOverlay: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
  },
  featuredBanner: {
    backgroundColor: "#FFF7ED",
    borderRadius: SHAPES.radiusLg,
    borderWidth: 1.5,
    borderColor: "#FF9F0A",
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#FF9F0A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  tagNew: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagNewText: {
    color: "#FFF",
    fontSize: 8,
    fontWeight: "900",
  },
  bannerSubtitle: {
    color: "#D97706",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  bannerTitle: {
    color: "#1F2937",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  bannerDesc: {
    color: "#4B5563",
    fontSize: 11,
    marginTop: 2,
  },
  bannerActionBtn: {
    backgroundColor: "#0B84FF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderBottomWidth: 3,
    borderBottomColor: "#0062C4",
  },
  bannerActionText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: SHAPES.radiusLg,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: SPACING.lg,
    alignItems: "center",
    marginBottom: SPACING.lg,
    ...SHADOWS.light,
  },
  chartHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: SPACING.md,
  },
  simulasiLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0B84FF",
    letterSpacing: 0.5,
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: SHAPES.radiusRound,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    gap: 4,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  syncBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
  },
  simChipsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    width: "100%",
    marginBottom: SPACING.md,
  },
  simTab: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: SHAPES.radiusRound,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  simTabActive: {
    backgroundColor: "#0B84FF",
    borderColor: "#0B84FF",
  },
  simTabText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
  },
  simTabTextActive: {
    color: "#FFFFFF",
  },
  robotStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: SHAPES.radiusLg,
    padding: SPACING.md,
    width: "100%",
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  robotAvatarOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#0B84FF",
    padding: 1.5,
    backgroundColor: "#E0F2FE",
  },
  robotAvatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  robotStatusTextContainer: {
    flex: 1,
  },
  robotStatusTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 2,
  },
  robotStatusHighlight: {
    color: "#0B84FF",
  },
  robotStatusDesc: {
    fontSize: 10,
    fontWeight: "500",
    color: "#6B7280",
    lineHeight: 14,
  },
  svgWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: SPACING.sm,
  },
  simMetricsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    width: "100%",
    marginTop: SPACING.md,
  },
  simMetricCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: SHAPES.radiusMd,
    paddingVertical: SPACING.md,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  simMetricValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0B84FF",
    marginBottom: 2,
  },
  simMetricLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: SHAPES.radiusLg,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.light,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  progressCardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1F2937",
  },
  xpText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#00C3A0",
  },
  xpBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    paddingRight: 24,
  },
  xpBarWrapper: {
    flex: 1,
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  xpBarFill: {
    height: "100%",
    backgroundColor: "#00C3A0",
    borderRadius: 4,
  },
  robotIndicator: {
    position: "absolute",
    right: 0,
  },
  
  // Gold CTA Button Styling
  goldClaimBtn: {
    backgroundColor: "#FF9F0A",
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.sm,
    borderBottomWidth: 4,
    borderBottomColor: "#C77400",
    position: "relative",
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  goldClaimText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },
  shineEffect: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    opacity: 0,
  },

  // Modal & Edit Name Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    maxWidth: 320,
    borderRadius: SHAPES.radiusXl,
    padding: SPACING.xl + 4,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    ...SHADOWS.medium,
  },
  pencilIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(11, 132, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(11, 132, 255, 0.2)",
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 15,
    marginBottom: SPACING.lg,
  },
  nameInput: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: SHAPES.radiusMd,
    width: "100%",
    height: 45,
    textAlign: "left",
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: 10,
    color: "#EF4444",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    gap: SPACING.md,
  },
  modalBtn: {
    flex: 1,
    height: 40,
    borderRadius: SHAPES.radiusRound,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBtnPrimary: {
    backgroundColor: "#0B84FF",
  },
  modalBtnSecondary: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalBtnTextPrimary: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  modalBtnTextSecondary: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4B5563",
  },
  homeEditAvatarBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#0B84FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
});
