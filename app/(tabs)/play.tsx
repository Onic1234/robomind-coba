import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, SHADOWS, SHAPES, SPACING } from "../../constants/Theme";
import { useAuth } from "../../hooks/useAuth";
import { usePlaytimeGuard, formatDurationHMS } from "../../hooks/usePlaytimeGuard";

interface GameItem {
  id: string;
  title: string;
  category: "Kognitif" | "Moral" | "Literasi" | "Fokus";
  image: any;
  levelInfo?: string;
  coinsReward?: number;
  isLocked?: boolean;
}

export default function PlayScreen() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const playtimeGuard = usePlaytimeGuard();

  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [userCoins, setUserCoins] = useState(1250);
  const [robotEscapeLevel, setRobotEscapeLevel] = useState(1);
  const [robotCircuitLevel, setRobotCircuitLevel] = useState(1);
  const [energyCoreLevel, setEnergyCoreLevel] = useState(1);
  const [roboCircleLevel, setRoboCircleLevel] = useState(1);
  const [roboChargeLevel, setRoboChargeLevel] = useState(1);
  const [roboLinkLevel, setRoboLinkLevel] = useState(1);
  const [roboMazeLevel, setRoboMazeLevel] = useState(1);

  const [screwSpinLevel, setScrewSpinLevel] = useState(1);
  const [pickAndDropLevel, setPickAndDropLevel] = useState(1);
  const [poseMasterLevel, setPoseMasterLevel] = useState(1);
  const [roboBrosLevel, setRoboBrosLevel] = useState(1);

  const [screwSpinCooldown, setScrewSpinCooldown] = useState(0);

  const formatSecs = (totalSec: number) => {
    const m = Math.floor(Math.max(0, totalSec) / 60);
    const s = Math.max(0, totalSec) % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  useFocusEffect(
    useCallback(() => {
      let intervalId: NodeJS.Timeout;

      const checkCooldowns = async () => {
        try {
          const val = await AsyncStorage.getItem("screw_spin_cooldown_until");
          if (val) {
            const until = parseInt(val, 10);
            const rem = Math.ceil((until - Date.now()) / 1000);
            setScrewSpinCooldown(rem > 0 ? rem : 0);
          } else {
            setScrewSpinCooldown(0);
          }
        } catch (e) {
          console.error("Failed to check cooldown", e);
        }
      };

      const loadData = async () => {
        try {
          await checkCooldowns();
          await playtimeGuard.refreshPlaytimeStatus();
          const val = await AsyncStorage.getItem("user_coins_balance");
          if (val !== null) {
            setUserCoins(parseInt(val));
          }
          const storedLevel = await AsyncStorage.getItem("robot_escape_current_level");
          if (storedLevel !== null) {
            setRobotEscapeLevel(parseInt(storedLevel));
          }
          const storedCircuitLevel = await AsyncStorage.getItem("robot_circuit_current_level");
          if (storedCircuitLevel !== null) {
            setRobotCircuitLevel(parseInt(storedCircuitLevel));
          }
          const storedEnergyLevel = await AsyncStorage.getItem("energy_core_current_level");
          if (storedEnergyLevel !== null) {
            setEnergyCoreLevel(parseInt(storedEnergyLevel));
          }
          const storedCircleLevel = await AsyncStorage.getItem("robo_circle_current_level");
          if (storedCircleLevel !== null) {
            setRoboCircleLevel(parseInt(storedCircleLevel));
          }
          const storedChargeLevel = await AsyncStorage.getItem("robo_charge_current_level");
          if (storedChargeLevel !== null) {
            setRoboChargeLevel(parseInt(storedChargeLevel));
          }
          const storedLinkLevel = await AsyncStorage.getItem("robo_link_current_level");
          if (storedLinkLevel !== null) {
            setRoboLinkLevel(parseInt(storedLinkLevel));
          }
          const storedMazeLevel = await AsyncStorage.getItem("robo_maze_current_level");
          if (storedMazeLevel !== null) {
            setRoboMazeLevel(parseInt(storedMazeLevel));
          }
          const storedScrewSpin = await AsyncStorage.getItem("screw_spin_current_level");
          if (storedScrewSpin !== null) {
            setScrewSpinLevel(parseInt(storedScrewSpin));
          }
          const storedPickDrop = await AsyncStorage.getItem("pick_and_drop_current_level");
          if (storedPickDrop !== null) {
            setPickAndDropLevel(parseInt(storedPickDrop));
          }
          const storedPoseMaster = await AsyncStorage.getItem("pose_master_current_level");
          if (storedPoseMaster !== null) {
            setPoseMasterLevel(parseInt(storedPoseMaster));
          }
          const storedRoboBros = await AsyncStorage.getItem("robo_bros_current_level");
          if (storedRoboBros !== null) {
            setRoboBrosLevel(parseInt(storedRoboBros));
          }
        } catch (e) {
          console.error("Failed to load play screen data", e);
        }
      };

      loadData();
      intervalId = setInterval(checkCooldowns, 1000);

      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }, [])
  );

  const categories = ["Semua", "Kognitif", "Moral", "Literasi", "Fokus"];

  const games: GameItem[] = [
    {
      id: "screw_spin",
      title: "Screw Spin",
      category: "Kognitif",
      image: require("../../assets/images/Screw_Spin.png"),
      levelInfo: playtimeGuard.isCooldownActive
        ? `🔒 ${formatDurationHMS(playtimeGuard.cooldownRemainingSeconds)}`
        : screwSpinCooldown > 0
        ? `🔒 ${formatSecs(screwSpinCooldown)}`
        : `Level ${screwSpinLevel}`,
      coinsReward: 250,
      isLocked: playtimeGuard.isCooldownActive || screwSpinCooldown > 0,
    },
    {
      id: "robo_bros",
      title: "Robo Bros",
      category: "Kognitif",
      image: require("../../assets/images/modul_robot.png"),
      levelInfo: `Level ${roboBrosLevel}`,
      coinsReward: 350,
      isLocked: false,
    },
    {
      id: "rogue_soul_2",
      title: "Rogue Soul 2",
      category: "Fokus",
      image: require("../../assets/images/rgsl.png"),
      levelInfo: "BARU! 2D Action",
      coinsReward: 500,
      isLocked: false,
    },
    {
      id: "robot_circuit_puzzle",
      title: "Robot Circuit",
      category: "Kognitif",
      image: require("../../assets/images/rbt_ct.png"), // Jigsaw escape puzzle visual
      levelInfo: `Level ${robotCircuitLevel}`,
      coinsReward: 200,
      isLocked: false,
    },
    {
      id: "energy_core",
      title: "Energy Core",
      category: "Kognitif",
      image: require("../../assets/images/enrg_cr.png"), // Connection circuit puzzle visual
      levelInfo: `Level ${energyCoreLevel}`,
      coinsReward: 200,
      isLocked: false,
    },
    {
      id: "problem_solving",
      title: "Robot Escape",
      category: "Fokus",
      image: require("../../assets/images/rbt_escp.png"),
      levelInfo: `Level ${robotEscapeLevel}`,
      coinsReward: 180,
      isLocked: false,
    },
    {
      id: "robo_circle",
      title: "Robo Circle",
      category: "Fokus",
      image: require("../../assets/images/rbt_circle.png"),
      levelInfo: `Level ${roboCircleLevel}`,
      coinsReward: 250,
      isLocked: false,
    },
    {
      id: "robo_charge",
      title: "Robo Charge",
      category: "Fokus",
      image: require("../../assets/images/rbt_chrg.png"),
      levelInfo: `Level ${roboChargeLevel}`,
      coinsReward: 250,
      isLocked: true,
    },
    {
      id: "robo_link",
      title: "Robo Link",
      category: "Kognitif",
      image: require("../../assets/images/rbt_link.png"),
      levelInfo: `Level ${roboLinkLevel}`,
      coinsReward: 250,
      isLocked: false,
    },
    {
      id: "robo_maze",
      title: "Robo Maze",
      category: "Kognitif",
      image: require("../../assets/images/rbt_maze.png"),
      levelInfo: `Level ${roboMazeLevel}`,
      coinsReward: 250,
      isLocked: false,
    },
    {
      id: "pick_and_drop",
      title: "Robo Pick & Drop",
      category: "Kognitif",
      image: require("../../assets/images/rbt_ct.png"),
      levelInfo: `Level ${pickAndDropLevel}`,
      coinsReward: 300,
      isLocked: false,
    },
    {
      id: "pose_master",
      title: "Master Pose Tangan",
      category: "Fokus",
      image: require("../../assets/images/modul_robot.png"),
      levelInfo: `Level ${poseMasterLevel}`,
      coinsReward: 300,
      isLocked: false,
    },
    {
      id: "robo_jek",
      title: "Robo-Jek",
      category: "Fokus",
      image: require("../../assets/images/modul_robot.png"),
      levelInfo: "Level 1",
      coinsReward: 300,
      isLocked: false,
    },
  ];

  const filteredGames = selectedCategory === "Semua" 
    ? games 
    : games.filter(game => game.category === selectedCategory);

  const renderGameCard = ({ item }: { item: GameItem }) => {
    return (
      <Pressable 
        style={[styles.card, item.isLocked && styles.cardLocked]}
        onPress={() => {
          if (item.isLocked) {
            if (playtimeGuard.isCooldownActive) {
              Alert.alert(
                "Waktu Istirahat Aktif (1 Jam Bermain)",
                `Anda sudah bermain selama 1 jam hari ini. Silakan istirahat sejenak selama ${formatDurationHMS(playtimeGuard.cooldownRemainingSeconds)} demi kesehatan mata dan otak!`
              );
            } else if (item.id === "screw_spin" && screwSpinCooldown > 0) {
              Alert.alert(
                "Game Terkunci (Cooldown)",
                `Game Screw Spin sedang dalam masa cooldown. Silakan tunggu ${formatSecs(screwSpinCooldown)}!`
              );
            } else {
              Alert.alert("Game Terkunci", "Misi game ini masih terkunci! Selesaikan misi sebelumnya.");
            }
          } else {
            if (item.id === "screw_spin") {
              router.push("/screw-spin");
            } else if (item.id === "robo_bros") {
              router.push("/robo-bros");
            } else if (item.id === "pose_master") {
              router.push("/pose-master");
            } else if (item.id === "pick_and_drop") {
              router.push("/pick-and-drop");
            } else if (item.id === "rogue_soul_2") {
              router.push("/rogue-soul");
            } else if (item.id === "problem_solving") {
              router.push("/robot-escape");
            } else if (item.id === "robot_circuit_puzzle") {
              router.push("/robot-circuit-puzzle");
            } else if (item.id === "energy_core") {
              router.push("/energy-core");
            } else if (item.id === "robo_circle") {
              router.push("/robo-circle");
            } else if (item.id === "robo_charge") {
              router.push("/robo-charge");
            } else if (item.id === "robo_link") {
              router.push("/robo-link");
            } else if (item.id === "robo_maze") {
              router.push("/robo-maze");
            } else if (item.id === "robo_jek") {
              router.push("/robo-jek");
            } else if (!isLoggedIn) {
              Alert.alert(
                "Harap Login Dahulu",
                "Anda belum login. Silakan login terlebih dahulu untuk menyimpan progres belajar anak.",
                [
                  {
                    text: "Lanjutkan Bermain",
                    onPress: () => alert(`Memulai game ${item.title}...`),
                  },
                  {
                    text: "Batal",
                    style: "cancel",
                  },
                ]
              );
            } else {
              alert(`Memulai game ${item.title}...`);
            }
          }
        }}
      >
        <View style={styles.cardImageContainer}>
          <Image source={item.image} style={styles.cardImage} contentFit="cover" />
          
          {item.isLocked && (
            <View style={styles.lockedOverlay}>
              <View style={styles.lockCircle}>
                <Ionicons name="lock-closed" size={20} color="#FFFFFF" />
              </View>
            </View>
          )}

          {!item.isLocked && item.levelInfo && (
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{item.levelInfo}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View style={styles.cardFooter}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
            {item.coinsReward && (
              <View style={styles.coinsRow}>
                <MaterialCommunityIcons name="coins" size={14} color="#F59E0B" />
                <Text style={styles.coinsText}>{item.coinsReward}</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />
      
      {/* Header Panel */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>PILIH MISI GAME</Text>
          <Text style={styles.headerTitle}>Petualangan Belajar</Text>
        </View>
        
        {/* Coins HUD Badge */}
        <View style={styles.coinsHud}>
          <Ionicons name="cash" size={18} color="#F59E0B" />
          <Text style={styles.coinsHudText}>{userCoins.toLocaleString("id-ID")}</Text>
        </View>
      </View>

      {/* Playtime Guard Monitor HUD Card */}
      <View style={styles.playtimeCard}>
        <View style={styles.playtimeHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons
              name={playtimeGuard.isCooldownActive ? "moon" : "time-sharp"}
              size={16}
              color={playtimeGuard.isCooldownActive ? "#EF4444" : "#10B981"}
            />
            <Text style={styles.playtimeTitle}>
              {playtimeGuard.isCooldownActive ? "WAKTU ISTIRAHAT AKTIF" : "WAKTU BERMAIN HARI INI"}
            </Text>
          </View>

          <Pressable
            onPress={() => {
              Alert.alert(
                "Akses Orang Tua",
                "Apakah Anda (Orang Tua) ingin me-reset waktu bermain hari ini dan membuka kunci game?",
                [
                  { text: "Batal", style: "cancel" },
                  {
                    text: "Reset Waktu Bermain",
                    style: "destructive",
                    onPress: async () => {
                      await playtimeGuard.resetPlaytimeGuard();
                      Alert.alert("Sukses", "Durasi bermain 1 jam & status cooldown telah di-reset oleh Orang Tua.");
                    },
                  },
                ]
              );
            }}
            style={styles.parentResetBtn}
          >
            <Ionicons name="shield-checkmark" size={13} color="#00C3A0" />
            <Text style={styles.parentResetText}>Orang Tua</Text>
          </Pressable>
        </View>

        {playtimeGuard.isCooldownActive ? (
          <View style={styles.cooldownBanner}>
            <Ionicons name="lock-closed" size={14} color="#EF4444" />
            <Text style={styles.cooldownBannerText}>
              Batas 1 jam terlampaui. Sisa waktu istirahat: {formatDurationHMS(playtimeGuard.cooldownRemainingSeconds)}
            </Text>
          </View>
        ) : (
          <View style={styles.progressRow}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(100, (playtimeGuard.playtimeSeconds / playtimeGuard.maxPlaytimeSeconds) * 100)}%`,
                    backgroundColor: playtimeGuard.isWarning ? "#F59E0B" : "#10B981",
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.floor(playtimeGuard.playtimeSeconds / 60)} / 60 Menit
            </Text>
          </View>
        )}
      </View>

      {/* Category Chips Scroll */}
      <View style={styles.chipsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Grid of games */}
      <FlatList
        data={filteredGames}
        renderItem={renderGameCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.rowWrapper}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      />
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
    color: COLORS.brandGreen,
  },
  headerTitle: {
    ...FONTS.heading,
    fontSize: 20,
    color: COLORS.textDark,
  },
  coinsHud: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderWidth: 1.5,
    borderColor: "#FFEDD5",
    borderRadius: SHAPES.radiusRound,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    gap: 4,
    ...SHADOWS.light,
  },
  coinsHudText: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: "#D97706",
  },
  chipsContainer: {
    paddingVertical: 0,
  },
  chipsScroll: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: SPACING.lg,
    borderRadius: SHAPES.radiusRound,
    backgroundColor: COLORS.cardWhite,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
  },
  chipActive: {
    backgroundColor: COLORS.brandGreen,
    borderColor: COLORS.brandGreen,
  },
  chipText: {
    ...FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.textMedium,
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  gridContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  rowWrapper: {
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  card: {
    width: "48%",
    backgroundColor: COLORS.cardWhite,
    borderRadius: SHAPES.radiusLg,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    overflow: "hidden",
    ...SHADOWS.light,
  },
  cardLocked: {
    opacity: 0.85,
  },
  cardImageContainer: {
    width: "100%",
    height: 120,
    position: "relative",
    backgroundColor: "#F1F5F9",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  lockCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  levelBadge: {
    position: "absolute",
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: "rgba(0, 195, 160, 0.85)",
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: SHAPES.radiusSm,
  },
  levelBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  cardInfo: {
    padding: SPACING.md,
  },
  cardTitle: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.textDark,
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    backgroundColor: COLORS.bgPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: SHAPES.radiusSm,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  categoryBadgeText: {
    fontSize: 8,
    fontWeight: "700",
    color: COLORS.textMedium,
  },
  coinsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  coinsText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#D97706",
  },
  playtimeCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: COLORS.cardWhite,
    borderRadius: SHAPES.radiusLg,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
    ...SHADOWS.light,
  },
  playtimeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  playtimeTitle: {
    ...FONTS.caption,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.textDark,
  },
  parentResetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: SHAPES.radiusRound,
  },
  parentResetText: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.textMedium,
  },
  cooldownBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: SHAPES.radiusSm,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
  },
  cooldownBannerText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#DC2626",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.textMedium,
  },
});
