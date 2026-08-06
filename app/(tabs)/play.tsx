import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, FlatList, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, useWindowDimensions, View } from "react-native";
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
  const { width } = useWindowDimensions();

  // Dynamic responsive grid columns based on screen width
  const numColumns = width < 640 ? 3 : width < 1024 ? 4 : 5;
  const isMobile = width < 640;

  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [userCoins, setUserCoins] = useState(5569);
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

  const categories = [
    { name: "Semua", icon: "grid-outline" },
    { name: "Kognitif", icon: "bulb-outline" },
    { name: "Moral", icon: "heart-outline" },
    { name: "Literasi", icon: "book-outline" },
    { name: "Fokus", icon: "extension-puzzle-outline" },
  ];

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
      image: require("../../assets/images/rbt_ct.png"),
      levelInfo: `Level ${robotCircuitLevel}`,
      coinsReward: 200,
      isLocked: false,
    },
    {
      id: "energy_core",
      title: "Energy Core",
      category: "Kognitif",
      image: require("../../assets/images/enrg_cr.png"),
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
      title: "Master Pose",
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
    {
      id: "robo_pose",
      title: "Robo Pose",
      category: "Fokus",
      image: require("../../assets/images/modul_retro.png"),
      levelInfo: "Level 1",
      coinsReward: 200,
      isLocked: false,
    },
  ];

  const filteredGames = selectedCategory === "Semua" 
    ? games 
    : games.filter(game => game.category === selectedCategory);

  const [hoveredGameId, setHoveredGameId] = useState<string | null>(null);

  const renderGameCard = ({ item }: { item: GameItem }) => {
    if ((item as any).isSpacer) {
      return <View style={[styles.card, { backgroundColor: "transparent", borderWidth: 0, shadowOpacity: 0, opacity: 0 }]} />;
    }

    const isHovered = hoveredGameId === item.id;
    const isRoboLink = item.id === "robo_link";
    const isRoboMaze = item.id === "robo_maze";
    const hasVideoPreview = isRoboLink || isRoboMaze;
    const videoPreviewSrc = isRoboLink ? "/robo_link_preview.mp4" : "/robo_maze_preview.mp4";

    return (
      <Pressable 
        // @ts-ignore - web mouse events
        onMouseEnter={() => setHoveredGameId(item.id)}
        // @ts-ignore - web mouse events
        onMouseLeave={() => setHoveredGameId(null)}
        style={[
          styles.card, 
          item.isLocked && styles.cardLocked,
          isHovered && styles.cardHovered
        ]}
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
            } else if (item.id === "robo_pose") {
              router.push("/robo-pose");
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
          <Image 
            source={item.image} 
            style={[styles.cardImage, isHovered && styles.cardImageHovered]} 
            contentFit="cover" 
          />
          
          {/* Locked Badge Overlay */}
          {item.isLocked && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={24} color="#FF5E36" />
              <Text style={styles.lockText}>{item.levelInfo}</Text>
            </View>
          )}
          
          {/* Hover Play Button (Stitch design style) */}
          {isHovered && !item.isLocked && !isRoboLink && (
            <View style={styles.hoverTitleOverlay}>
              <View style={styles.stitchPlayButton}>
                <Text style={styles.stitchPlayButtonText}>PLAY</Text>
              </View>
            </View>
          )}

          {/* HTML5 Video Highlight Preview for Robo Link/Maze on Hover */}
          {hasVideoPreview && isHovered && (
            <View style={[styles.videoHighlightOverlay, { zIndex: 99 }]}>
              {Platform.OS === "web" ? (
                // @ts-ignore
                <video
                  src={videoPreviewSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    pointerEvents: "none",
                  }}
                />
              ) : (
                <View style={styles.animatedCircuitPreview}>
                  <Ionicons name="sparkles" size={24} color="#0B84FF" style={styles.previewSparkle} />
                  <View style={styles.previewPulseCircle} />
                  <Ionicons name="hardware-chip-outline" size={40} color="#0B84FF" />
                </View>
              )}
              
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>PREVIEW VIDEO</Text>
              </View>
            </View>
          )}
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.cardFooterTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardFooterSub}>
            {item.isLocked ? "Terkunci" : item.levelInfo}
          </Text>
        </View>
      </Pressable>
    );
  };

  const formatDataWithSpacers = (dataList: GameItem[], cols: number) => {
    const fullRows = Math.floor(dataList.length / cols);
    let numberOfElementsLastRow = dataList.length - fullRows * cols;
    if (numberOfElementsLastRow === 0) return dataList;

    const paddedList = [...dataList];
    while (numberOfElementsLastRow !== cols && numberOfElementsLastRow !== 0) {
      paddedList.push({
        id: `blank-spacer-${numberOfElementsLastRow}`,
        title: "",
        category: "Kognitif",
        image: null,
        isSpacer: true,
      } as any);
      numberOfElementsLastRow++;
    }
    return paddedList;
  };

  const displayGames = formatDataWithSpacers(filteredGames, numColumns);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3FAFF" />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerSubtitle}>PILIH MISI GAME</Text>
          <Text style={styles.headerTitle}>Misi Belajar</Text>
        </View>
        
        <View style={styles.currencyBadge}>
          <Text style={styles.currencyIcon}>🪙</Text>
          <Text style={styles.currencyText}>{userCoins.toLocaleString("id-ID")}</Text>
        </View>
      </View>

      {/* Playtime Guard Monitor HUD Card */}
      <View style={styles.playtimeCard}>
        <View style={styles.playtimeHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons
              name={playtimeGuard.isCooldownActive ? "moon" : "time-sharp"}
              size={16}
              color={playtimeGuard.isCooldownActive ? "#EF4444" : "#0B84FF"}
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
            <Ionicons name="shield-checkmark" size={13} color="#0B84FF" />
            <Text style={styles.parentResetText}>Orang Tua</Text>
          </Pressable>
        </View>

        {playtimeGuard.isCooldownActive ? (
          <View style={styles.cooldownBanner}>
            <Ionicons name="lock-closed" size={14} color="#EF4444" />
            <Text style={styles.cooldownBannerText}>
              Batas bermain terlampaui. Istirahat: {formatDurationHMS(playtimeGuard.cooldownRemainingSeconds)}
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
                    backgroundColor: playtimeGuard.isWarning ? "#EF4444" : "#0B84FF",
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
            const isActive = selectedCategory === cat.name;
            return (
              <Pressable
                key={cat.name}
                onPress={() => setSelectedCategory(cat.name)}
                style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
              >
                <Ionicons 
                  name={cat.icon as any} 
                  size={14} 
                  color={isActive ? "#FFFFFF" : "#64748B"} 
                />
                <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        key={`grid-${numColumns}`}
        data={displayGames}
        renderItem={renderGameCard}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
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
    backgroundColor: "#F3FAFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: "#F3FAFF",
  },
  headerLeft: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#0B84FF",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1F2937",
  },
  currencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: SHAPES.radiusRound,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    gap: 6,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  currencyIcon: {
    fontSize: 16,
  },
  currencyText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#D97706",
  },
  playtimeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: SHAPES.radiusLg,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  playtimeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  playtimeTitle: {
    fontSize: 9,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: 0.5,
  },
  parentResetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  parentResetText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
  },
  cooldownBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cooldownBannerText: {
    fontSize: 11,
    color: "#EF4444",
    fontWeight: "700",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
  },
  chipsContainer: {
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  chipsScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    borderRadius: SHAPES.radiusRound,
    borderWidth: 1.5,
  },
  chipActive: {
    backgroundColor: "#0B84FF",
    borderColor: "#0B84FF",
  },
  chipInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderColor: "#E2E8F0",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "800",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  chipTextInactive: {
    color: "#64748B",
  },
  gridContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl + 40,
  },
  rowWrapper: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 12,
    marginBottom: SPACING.sm,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    ...SHADOWS.light,
  },
  cardHovered: {
    borderColor: "#0B84FF",
    shadowColor: "#0B84FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLocked: {
    opacity: 0.6,
  },
  cardImageContainer: {
    width: "100%",
    height: 100,
    position: "relative",
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardImageHovered: {
    opacity: 0.85,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  lockText: {
    color: "#FF5E36",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 4,
  },
  videoHighlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  animatedCircuitPreview: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  previewSparkle: {
    position: "absolute",
    top: 6,
    right: 8,
  },
  previewPulseCircle: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "rgba(11, 132, 255, 0.3)",
  },
  liveBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    gap: 3,
    borderWidth: 1,
    borderColor: "#0B84FF",
  },
  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#EF4444",
  },
  liveText: {
    fontSize: 6,
    fontWeight: "800",
    color: "#0B84FF",
  },
  hoverTitleOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  stitchPlayButton: {
    backgroundColor: "#0B84FF",
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: 12,
    borderBottomWidth: 3,
    borderBottomColor: "#0062C4",
  },
  stitchPlayButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
  cardFooter: {
    padding: 8,
  },
  cardFooterTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1F2937",
  },
  cardFooterSub: {
    fontSize: 9,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },
});
