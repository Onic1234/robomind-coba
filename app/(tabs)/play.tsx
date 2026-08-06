import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, FlatList, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, SHADOWS, SHAPES, SPACING } from "../../constants/Theme";
import { useAuth } from "../../hooks/useAuth";

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
      levelInfo: `Level ${screwSpinLevel}`,
      coinsReward: 250,
      isLocked: false,
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
    // Render transparent invisible spacer for grid row alignment
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
            alert("Misi game ini masih terkunci! Selesaikan misi sebelumnya.");
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
          
          {/* Stitch Hover Overlay with MAIN Button (for other games) */}
          {isHovered && !item.isLocked && !isRoboLink && (
            <View style={styles.hoverTitleOverlay}>
              <View style={styles.stitchPlayButton}>
                <Text style={styles.stitchPlayButtonText}>MAIN</Text>
              </View>
            </View>
          )}

          {/* Pure HTML5 Video Highlight Preview for Robo Link on Hover */}
          {hasVideoPreview && isHovered && (
            <View style={[styles.videoHighlightOverlay, { zIndex: 99 }]}>
              {Platform.OS === "web" ? (
                // @ts-ignore - web html5 video player
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
                    borderRadius: 0,
                    pointerEvents: "none",
                  }}
                />
              ) : (
                <View style={styles.animatedCircuitPreview}>
                  <Ionicons name="sparkles" size={24} color="#00F0FF" style={styles.previewSparkle} />
                  <View style={styles.previewPulseCircle} />
                  <Ionicons name="hardware-chip-outline" size={40} color="#26C6DA" />
                </View>
              )}
              
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>PREVIEW VIDEO</Text>
              </View>
            </View>
          )}
        </View>

        {/* Stitch Bottom Card Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.cardFooterTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
      </Pressable>
    );
  };

  // Format games array with invisible dummy spacers so incomplete last row items match exact grid column width
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
          <Text style={styles.headerTitle}>Petualangan Belajar</Text>
        </View>
        
        <View style={styles.currencyBadge}>
          <Text style={styles.currencyIcon}>🪙</Text>
          <Text style={styles.currencyText}>{userCoins.toLocaleString("id-ID")}</Text>
        </View>
      </View>

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
                  size={16} 
                  color={isActive ? "#FFFFFF" : "#071E27"} 
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
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#006874",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#071E27",
  },
  currencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E24D",
    borderRadius: SHAPES.radiusRound,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    gap: 6,
    borderBottomWidth: 3,
    borderBottomColor: "#6D6400",
    ...SHADOWS.light,
  },
  currencyIcon: {
    fontSize: 18,
  },
  currencyText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6D6400",
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
    paddingVertical: 10,
    paddingHorizontal: SPACING.lg,
    borderRadius: SHAPES.radiusRound,
    borderWidth: 2,
  },
  chipActive: {
    backgroundColor: "#006874",
    borderColor: "#006874",
    borderBottomWidth: 4,
    borderBottomColor: "#004E57",
  },
  chipInactive: {
    backgroundColor: "#DBF1FE",
    borderColor: "#BBC9CC",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  chipTextInactive: {
    color: "#071E27",
  },
  gridContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  rowWrapper: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 14,
    marginBottom: SPACING.md,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#DBF1FE",
    borderBottomWidth: 3,
    borderBottomColor: "#CFE6F2",
    overflow: "hidden",
    ...SHADOWS.light,
    // @ts-ignore - web cursor
    cursor: "pointer",
  },
  cardHovered: {
    borderColor: "#006874",
    borderBottomColor: "#006874",
    shadowColor: "#006874",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardLocked: {
    opacity: 0.7,
    backgroundColor: "#E6F6FF",
  },
  cardImageContainer: {
    width: "100%",
    height: 125,
    position: "relative",
    backgroundColor: "#CFE6F2",
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardImageHovered: {
    opacity: 0.9,
  },
  videoHighlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7, 30, 39, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  animatedCircuitPreview: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  previewSparkle: {
    position: "absolute",
    top: 8,
    right: 10,
  },
  previewPulseCircle: {
    position: "absolute",
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: "rgba(38, 198, 218, 0.6)",
  },
  previewPulseCircle2: {
    position: "absolute",
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 1,
    borderColor: "rgba(38, 198, 218, 0.3)",
  },
  liveBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(7, 30, 39, 0.9)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: "#26C6DA",
    zIndex: 15,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#BA1A1A",
  },
  liveText: {
    fontSize: 7,
    fontWeight: "700",
    color: "#26C6DA",
    letterSpacing: 0.5,
  },
  hoverTitleOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7, 30, 39, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xs,
    zIndex: 12,
  },
  stitchPlayButton: {
    backgroundColor: "#006874",
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: SHAPES.radiusRound,
    borderBottomWidth: 3,
    borderBottomColor: "#004E57",
    marginBottom: 6,
    ...SHADOWS.light,
  },
  stitchPlayButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  hoverCardTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 3,
  },
  hoverCategoryBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: SHAPES.radiusSm,
    paddingVertical: 1,
    paddingHorizontal: 6,
  },
  hoverCategoryBadgeText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#98F0FF",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
  },
  cardFooterTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#071E27",
    textAlign: "center",
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7, 30, 39, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 11,
  },
  lockCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
