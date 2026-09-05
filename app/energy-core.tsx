import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  Modal,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HowToPlayModal } from "../components/HowToPlayModal";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";
import Svg, { Path, Rect, Circle, Polygon, Line, Text as SvgText } from "react-native-svg";
import { SPACING } from "../constants/Theme";
import Button from "../components/ui/Button";
import { saveGameSession } from "../lib/gameProgressService";

const STORAGE_KEY_COINS = "user_coins_balance";
const STORAGE_KEY_LEVEL = "energy_core_current_level";
const STORAGE_KEY_EVOLUTION = "robomind_robot_evolution";

type CellType = "SOURCE" | "STRAIGHT" | "CORNER" | "TJUNC" | "CROSS" | "NODE";

const ENERGY_COLORS = {
  LOGIC: { name: "Blue Energy (Logika)", color: "#38BDF8", glow: "rgba(56, 189, 248, 0.4)", xpType: "Logic XP" },
  MATH: { name: "Green Energy (Matematika)", color: "#10B981", glow: "rgba(16, 185, 129, 0.4)", xpType: "Math XP" },
  CREATIVITY: { name: "Yellow Energy (Kreativitas)", color: "#F59E0B", glow: "rgba(245, 158, 11, 0.4)", xpType: "Creativity XP" },
  LITERACY: { name: "Purple Energy (Literasi)", color: "#8B5CF6", glow: "rgba(139, 92, 246, 0.4)", xpType: "Literacy XP" },
  MORAL: { name: "Red Energy (Moral & Empati)", color: "#EF4444", glow: "rgba(239, 68, 68, 0.4)", xpType: "Moral XP" },
};

interface GridCell {
  id: string;
  gridX: number;
  gridY: number;
  type: CellType;
  name: string;
  energyType: "LOGIC" | "MATH" | "CREATIVITY" | "LITERACY" | "MORAL";
  rotation: number;
  isLocked?: boolean;
}

interface LevelConfig {
  level: number;
  title: string;
  gridWidth: number;
  gridHeight: number;
  rewardCoins: number;
  rewardXP: number;
  cells: GridCell[];
}

const LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: "Sirkuit Pemula (Sangat Mudah)",
    gridWidth: 2,
    gridHeight: 2,
    rewardCoins: 30,
    rewardXP: 15,
    cells: [
      { id: "c0", gridX: 0, gridY: 0, type: "SOURCE", name: "AI Core", energyType: "LOGIC", rotation: 90 },
      { id: "c1", gridX: 1, gridY: 0, type: "NODE", name: "Battery Core", energyType: "LOGIC", rotation: 270 },
    ],
  },
  {
    level: 2,
    title: "Jalur Transmisi AI",
    gridWidth: 3,
    gridHeight: 3,
    rewardCoins: 50,
    rewardXP: 25,
    cells: [
      { id: "c0", gridX: 0, gridY: 1, type: "SOURCE", name: "Power Source", energyType: "LOGIC", rotation: 90 },
      { id: "c1", gridX: 1, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 0 },
      { id: "c2", gridX: 2, gridY: 1, type: "NODE", name: "CPU Chip", energyType: "LOGIC", rotation: 270 },
    ],
  },
  {
    level: 3,
    title: "Aliran Sudut Daya",
    gridWidth: 3,
    gridHeight: 3,
    rewardCoins: 75,
    rewardXP: 35,
    cells: [
      { id: "c0", gridX: 0, gridY: 0, type: "SOURCE", name: "Math Power Core", energyType: "MATH", rotation: 90 },
      { id: "c1", gridX: 1, gridY: 0, type: "CORNER", name: "Jalur Sirkuit", energyType: "MATH", rotation: 0 },
      { id: "c2", gridX: 1, gridY: 1, type: "NODE", name: "Servo Motor", energyType: "MATH", rotation: 0 },
    ],
  },
  {
    level: 4,
    title: "Jalur Distributor AI",
    gridWidth: 3,
    gridHeight: 3,
    rewardCoins: 100,
    rewardXP: 45,
    cells: [
      { id: "c0", gridX: 0, gridY: 1, type: "SOURCE", name: "Math Source", energyType: "MATH", rotation: 90 },
      { id: "c1", gridX: 1, gridY: 1, type: "TJUNC", name: "Distributor Daya", energyType: "MATH", rotation: 0 },
      { id: "c2", gridX: 1, gridY: 0, type: "NODE", name: "Neural Processor", energyType: "MATH", rotation: 180 },
      { id: "c3", gridX: 2, gridY: 1, type: "NODE", name: "Battery Core", energyType: "MATH", rotation: 270 },
    ],
  },
  {
    level: 5,
    title: "Sirkuit Ganda Kreativitas & Moral",
    gridWidth: 4,
    gridHeight: 4,
    rewardCoins: 120,
    rewardXP: 60,
    cells: [
      { id: "c0", gridX: 0, gridY: 0, type: "SOURCE", name: "Creativity Core", energyType: "CREATIVITY", rotation: 90 },
      { id: "c1", gridX: 1, gridY: 0, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 0 },
      { id: "c2", gridX: 2, gridY: 0, type: "NODE", name: "AI Core", energyType: "CREATIVITY", rotation: 270 },
      { id: "c3", gridX: 0, gridY: 2, type: "SOURCE", name: "Moral Power Core", energyType: "MORAL", rotation: 90 },
      { id: "c4", gridX: 1, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MORAL", rotation: 0 },
      { id: "c5", gridX: 2, gridY: 2, type: "NODE", name: "Energy Crystal", energyType: "MORAL", rotation: 270 },
    ],
  },
  {
    level: 6,
    title: "Labirin Quantum AI",
    gridWidth: 4,
    gridHeight: 4,
    rewardCoins: 150,
    rewardXP: 80,
    cells: [
      { id: "c0", gridX: 0, gridY: 0, type: "SOURCE", name: "Quantum Source", energyType: "LITERACY", rotation: 90 },
      { id: "c1", gridX: 1, gridY: 0, type: "TJUNC", name: "Distributor Daya", energyType: "LITERACY", rotation: 90 },
      { id: "c2", gridX: 2, gridY: 0, type: "CORNER", name: "Jalur Sirkuit", energyType: "LITERACY", rotation: 180 },
      { id: "c3", gridX: 1, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LITERACY", rotation: 90 },
      { id: "c4", gridX: 2, gridY: 1, type: "NODE", name: "Satellite Node", energyType: "LITERACY", rotation: 0 },
      { id: "c5", gridX: 1, gridY: 2, type: "NODE", name: "Quantum Hub", energyType: "LITERACY", rotation: 0 },
    ],
  },
];

const getPorts = (type: CellType, rotation: number): ("UP" | "RIGHT" | "DOWN" | "LEFT")[] => {
  const normalizedRotation = rotation % 360;
  let base: ("UP" | "RIGHT" | "DOWN" | "LEFT")[] = [];
  if (type === "SOURCE" || type === "NODE") {
    base = ["UP"];
  } else if (type === "STRAIGHT") {
    base = ["UP", "DOWN"];
  } else if (type === "CORNER") {
    base = ["UP", "RIGHT"];
  } else if (type === "TJUNC") {
    base = ["LEFT", "UP", "RIGHT"];
  } else if (type === "CROSS") {
    base = ["UP", "RIGHT", "DOWN", "LEFT"];
  }
  const directions: ("UP" | "RIGHT" | "DOWN" | "LEFT")[] = ["UP", "RIGHT", "DOWN", "LEFT"];
  const rotSteps = Math.floor(normalizedRotation / 90);
  return base.map((p) => {
    const idx = directions.indexOf(p);
    const newIdx = (idx + rotSteps) % 4;
    return directions[newIdx];
  });
};

const GridCellItem = React.memo(function GridCellItem({
  cell,
  cellSize,
  isEnergized,
  energyColor,
  onPress,
}: {
  cell: GridCell;
  cellSize: number;
  isEnergized: boolean;
  energyColor: string;
  onPress: () => void;
}) {
  // Monotonic display angle so rotation always turns the shortest, forward way (no 270°-backwards wobble)
  const animRot = useSharedValue(cell.rotation);
  const prevRot = useRef(cell.rotation);
  const pulse = useSharedValue(0);

  useEffect(() => {
    const prev = prevRot.current;
    prevRot.current = cell.rotation;
    let raw = cell.rotation - prev;
    let d = ((raw % 360) + 360) % 360;
    if (d > 180) d -= 360;
    animRot.value = withTiming(animRot.value + d, { duration: 200, easing: Easing.out(Easing.cubic) });
  }, [cell.rotation, animRot]);

  useEffect(() => {
    if (isEnergized) {
      pulse.value = withRepeat(withTiming(1, { duration: 650 }), -1, true);
    } else {
      cancelAnimation(pulse);
      pulse.value = 0;
    }
  }, [isEnergized, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${animRot.value}deg` }],
    opacity: isEnergized ? 0.9 + pulse.value * 0.1 : 1,
  }));

  const S = cellSize;
  const C = S / 2;

  // Proportional cable metrics
  const glowW = Math.max(10, S * 0.13);
  const mainW = Math.max(6, S * 0.085);
  const coreW = Math.max(2.5, S * 0.024);
  const viaR = Math.max(3.5, mainW * 0.8);

  const glowColor = isEnergized ? energyColor : "rgba(148, 163, 184, 0.35)";
  const mainColor = isEnergized ? energyColor : "#64748B";
  const coreColor = isEnergized ? "#FFFFFF" : "#0F172A";

  const renderCable = (dPath: string) => (
    <>
      {isEnergized && (
        <Path
          d={dPath}
          stroke={glowColor}
          strokeWidth={glowW}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.45}
          fill="none"
        />
      )}
      <Path
        d={dPath}
        stroke={mainColor}
        strokeWidth={mainW}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d={dPath}
        stroke={coreColor}
        strokeWidth={coreW}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  );

  // Solder-pad vias where the conduit exits the tile (base orientation)
  const renderVias = (pts: [number, number][]) => (
    <>
      {pts.map(([vx, vy], i) => (
        <Circle
          key={i}
          cx={vx}
          cy={vy}
          r={viaR}
          fill={mainColor}
          stroke={isEnergized ? "#FFFFFF" : "#1E293B"}
          strokeWidth={1.5}
        />
      ))}
    </>
  );

  const reactor = S * 0.23;

  let content: React.ReactNode = null;
  switch (cell.type) {
    case "SOURCE":
      content = (
        <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
          {renderCable(`M ${C} ${C - reactor} L ${C} 0`)}
          <Circle cx={C} cy={C} r={reactor + 7} fill="rgba(8, 12, 24, 0.9)" stroke={mainColor} strokeWidth={2.5} />
          {isEnergized && <Circle cx={C} cy={C} r={reactor + 10} fill={glowColor} opacity={0.25} />}
          <Circle cx={C} cy={C} r={reactor} fill={isEnergized ? energyColor : "#1E293B"} stroke={isEnergized ? "#FFFFFF" : "#475569"} strokeWidth={2} />
          <Circle cx={C} cy={C} r={reactor * 0.62} fill="#0B132B" />
          <Path
            d={`M ${C} ${C - reactor * 0.42} L ${C - reactor * 0.24} ${C + 1} L ${C + 1} ${C + 1} L ${C - reactor * 0.1} ${C + reactor * 0.42} L ${C + reactor * 0.24} ${C - 1} L ${C} ${C - 1} Z`}
            fill={isEnergized ? "#FFFFFF" : "#94A3B8"}
          />
          {renderVias([[C, 0]])}
        </Svg>
      );
      break;
    case "NODE":
      content = (
        <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
          {renderCable(`M ${C} ${C - S * 0.22} L ${C} 0`)}
          <Rect
            x={C - S * 0.2}
            y={C - S * 0.2}
            width={S * 0.4}
            height={S * 0.4}
            rx={S * 0.08}
            fill="#0B132B"
            stroke={mainColor}
            strokeWidth={2.5}
          />
          {isEnergized && (
            <Rect
              x={C - S * 0.2}
              y={C - S * 0.2}
              width={S * 0.4}
              height={S * 0.4}
              rx={S * 0.08}
              fill={glowColor}
              opacity={0.3}
            />
          )}
          <Rect
            x={C - S * 0.1}
            y={C - S * 0.1}
            width={S * 0.2}
            height={S * 0.2}
            rx={S * 0.04}
            fill={isEnergized ? energyColor : "#334155"}
          />
          {renderVias([[C, 0]])}
        </Svg>
      );
      break;
    case "STRAIGHT":
      content = (
        <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
          {renderCable(`M ${C} 0 L ${C} ${S}`)}
          {renderVias([[C, 0], [C, S]])}
        </Svg>
      );
      break;
    case "CORNER":
      content = (
        <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
          {renderCable(`M ${C} 0 L ${C} ${C} L ${S} ${C}`)}
          {renderVias([[C, 0], [S, C]])}
        </Svg>
      );
      break;
    case "TJUNC":
      content = (
        <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
          {renderCable(`M 0 ${C} L ${S} ${C}`)}
          {renderCable(`M ${C} ${C} L ${C} 0`)}
          {renderVias([[0, C], [S, C], [C, 0]])}
        </Svg>
      );
      break;
    case "CROSS":
      content = (
        <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
          {renderCable(`M 0 ${C} L ${S} ${C}`)}
          {renderCable(`M ${C} 0 L ${C} ${S}`)}
          {renderVias([[0, C], [S, C], [C, 0], [C, S]])}
        </Svg>
      );
      break;
    default:
      content = null;
  }

  return (
    <Pressable
      onPress={onPress}
      style={[styles.cellContainer, { width: cellSize, height: cellSize }]}
    >
      <Animated.View style={[styles.cellWrapper, animatedStyle]}>
        {content}
      </Animated.View>
    </Pressable>
  );
});

export default function EnergyCoreScreen() {
  const router = useRouter();

  const [level, setLevel] = useState(1);
  const [cells, setCells] = useState<GridCell[]>([]);
  const [history, setHistory] = useState<GridCell[][]>([]);
  const [userCoins, setUserCoins] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "victory" | "completed">("playing");
  const [showHelp, setShowHelp] = useState(true);
  const [companionText, setCompanionText] = useState(
    "Klik pada kabel dan sirkuit untuk memutarnya. Sambungkan semua inti energi ke robot agar kota menyala!"
  );
  const [robotEvolution, setRobotEvolution] = useState(52);

  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const boardPadding = SPACING.md;

  const currentLevelConfig = useMemo(() => {
    return LEVELS.find((l) => l.level === level) || LEVELS[0];
  }, [level]);

  const gridWidth = currentLevelConfig.gridWidth;
  const gridHeight = currentLevelConfig.gridHeight;
  const maxBoardWidth = Math.min(windowWidth - boardPadding * 2, 540, windowHeight * 0.58);
  const cellSize = maxBoardWidth / gridWidth;
  const boardSize = cellSize * gridWidth;

  useEffect(() => {
    const loadStats = async () => {
      try {
        const storedCoins = await AsyncStorage.getItem(STORAGE_KEY_COINS);
        if (storedCoins !== null) setUserCoins(parseInt(storedCoins));
        const storedLevel = await AsyncStorage.getItem(STORAGE_KEY_LEVEL);
        if (storedLevel !== null) {
          const l = parseInt(storedLevel);
          if (l <= LEVELS.length) setLevel(l);
        }
        const storedEvo = await AsyncStorage.getItem(STORAGE_KEY_EVOLUTION);
        if (storedEvo !== null) setRobotEvolution(parseInt(storedEvo));
      } catch (err) {
        console.error(err);
      }
    };
    loadStats();
  }, []);

  useEffect(() => {
    if (currentLevelConfig) {
      const randomized = currentLevelConfig.cells.map((cell) => {
        const rots = [0, 90, 180, 270];
        const randomRot = rots[Math.floor(Math.random() * rots.length)];
        return { ...cell, rotation: randomRot };
      });
      setCells(randomized);
      setHistory([]);
      setGameState("playing");
      setCompanionText(
        `World ${level}: Hubungkan lintasan daya. Warna sasaran: ${
          ENERGY_COLORS[currentLevelConfig.cells[0]?.energyType]?.name
        }`
      );
    }
  }, [level, currentLevelConfig]);

  const energizedCellsMap = useMemo(() => {
    const energizedMap: Record<string, { energized: boolean; color: string }> = {};
    const sources = cells.filter((c) => c.type === "SOURCE");
    const queue: GridCell[] = [];

    sources.forEach((src) => {
      energizedMap[src.id] = {
        energized: true,
        color: ENERGY_COLORS[src.energyType]?.color || "#38BDF8",
      };
      queue.push(src);
    });

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentPorts = getPorts(current.type, current.rotation);
      const currentColor = energizedMap[current.id].color;

      currentPorts.forEach((portDir) => {
        let nx = current.gridX;
        let ny = current.gridY;
        if (portDir === "UP") ny -= 1;
        else if (portDir === "RIGHT") nx += 1;
        else if (portDir === "DOWN") ny += 1;
        else if (portDir === "LEFT") nx -= 1;

        const neighbor = cells.find((c) => c.gridX === nx && c.gridY === ny);
        if (!neighbor) return;

        const neighborPorts = getPorts(neighbor.type, neighbor.rotation);
        const requiredInput =
          portDir === "UP" ? "DOWN" : portDir === "RIGHT" ? "LEFT" : portDir === "DOWN" ? "UP" : "RIGHT";

        if (neighborPorts.includes(requiredInput)) {
          if (!energizedMap[neighbor.id]) {
            energizedMap[neighbor.id] = { energized: true, color: currentColor };
            queue.push(neighbor);
          }
        }
      });
    }
    return energizedMap;
  }, [cells]);

  useEffect(() => {
    if (cells.length === 0 || gameState !== "playing") return;
    const allEnergized = cells.every((c) => energizedCellsMap[c.id]?.energized);
    if (allEnergized) {
      setGameState("victory");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCompanionText("Sirkuit menyala! Kamu berhasil memperbaiki jaringan kota.");
    }
  }, [cells, energizedCellsMap, gameState]);

  const handleCellPress = (cellId: string) => {
    if (gameState !== "playing") return;
    setCells((prev) =>
      prev.map((c) => {
        if (c.id === cellId) {
          setHistory((h) => [...h, JSON.parse(JSON.stringify(prev))]);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          return { ...c, rotation: (c.rotation + 90) % 360 };
        }
        return c;
      })
    );
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const prevState = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCells(prevState);
  };

  const handleRestart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    const randomized = cells.map((cell) => {
      const rots = [0, 90, 180, 270];
      return { ...cell, rotation: rots[Math.floor(Math.random() * rots.length)] };
    });
    setCells(randomized);
    setHistory([]);
  };

  const handleNextLevel = async () => {
    saveGameSession({
      gameId: "energy-core",
      level: level,
      score: 100,
      xpEarned: 120,
      coinsEarned: currentLevelConfig.rewardCoins || 50,
      completed: true,
    });
    const nextLvl = level + 1;
    const coinsReward = currentLevelConfig.rewardCoins;
    const finalCoins = userCoins + coinsReward;
    setUserCoins(finalCoins);
    await AsyncStorage.setItem(STORAGE_KEY_COINS, String(finalCoins));

    const nextEvo = Math.min(100, robotEvolution + 8);
    setRobotEvolution(nextEvo);
    await AsyncStorage.setItem(STORAGE_KEY_EVOLUTION, String(nextEvo));

    if (nextLvl > LEVELS.length) {
      setGameState("completed");
      setLevel(1);
      await AsyncStorage.setItem(STORAGE_KEY_LEVEL, "1");
    } else {
      setLevel(nextLvl);
      await AsyncStorage.setItem(STORAGE_KEY_LEVEL, String(nextLvl));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0E17" />
      <View style={styles.header}>
        <View style={styles.headerLeftRow}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => setShowHelp(true)}>
            <Ionicons name="help-circle-outline" size={24} color="#FFFFFF" />
          </Pressable>
        </View>
        <View style={styles.levelBadgeContainer}>
          <Text style={styles.levelText}>{currentLevelConfig.title}</Text>
        </View>
        <View style={styles.topHud}>
          <View style={[styles.hudBadge, { borderColor: "#F59E0B" }]}>
            <MaterialCommunityIcons name="cash-multiple" size={16} color="#FFFFFF" />
            <Text style={styles.hudText}>{userCoins}</Text>
          </View>
        </View>
      </View>

      <View style={styles.mainGameArea}>
        <View style={[styles.boardContainer, { width: boardSize, height: boardSize, flexDirection: "column" }]}>
          {Array.from({ length: gridHeight }).map((_, y) => (
            <View key={y} style={{ flexDirection: "row" }}>
              {Array.from({ length: gridWidth }).map((_, x) => {
                const cell = cells.find((c) => c.gridX === x && c.gridY === y);
                if (!cell) return <View key={x} style={{ width: cellSize, height: cellSize }} />;
                const status = energizedCellsMap[cell.id] || { energized: false, color: "#475569" };
                return (
                  <GridCellItem
                    key={cell.id}
                    cell={cell}
                    cellSize={cellSize}
                    isEnergized={status.energized}
                    energyColor={status.color}
                    onPress={() => handleCellPress(cell.id)}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.evolutionPanel}>
        <View style={styles.evolutionHeader}>
          <Text style={styles.evolutionTitle}>Ron-Bonta Evolution</Text>
          <Text style={styles.evolutionPercent}>{robotEvolution}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${robotEvolution}%` }]} />
        </View>
      </View>

      <View style={styles.companionPanel}>
        <View style={styles.ronBontaAvatarContainer}>
          <Svg width="44" height="44" viewBox="0 0 64 64">
            <Rect x="8" y="14" width="48" height="40" rx="14" fill="#00C3A0" stroke="#FFFFFF" strokeWidth="3" />
            <Circle cx="22" cy="32" r="6" fill="#1E2937" />
            <Circle cx="22" cy="32" r="2.5" fill="#00FFFF" />
            <Circle cx="42" cy="32" r="6" fill="#1E2937" />
            <Circle cx="42" cy="32" r="2.5" fill="#00FFFF" />
            <Rect x="29" y="4" width="6" height="10" rx="3" fill="#FFE600" />
            <Circle cx="32" cy="4" r="5" fill="#FFE600" />
          </Svg>
        </View>
        <View style={styles.dialogBubble}>
          <Text style={styles.dialogText}>{companionText}</Text>
        </View>
      </View>

      <View style={styles.bottomBar}>
        <Pressable style={styles.actionBtn} onPress={handleUndo}>
          <View style={styles.actionIconBg}>
            <Ionicons name="arrow-undo-outline" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionBtnLabel}>Undo</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={handleRestart}>
          <View style={[styles.actionIconBg, { backgroundColor: "#FF5E36" }]}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionBtnLabel}>Reset</Text>
        </Pressable>
      </View>

      {/* VICTORY / MISSION COMPLETED MODAL */}
      <Modal visible={gameState === "victory"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.victoryCardContainer}>
            {/* Header Tag & Title */}
            <Text style={styles.missionTagText}>MISSION COMPLETED</Text>
            <Text style={styles.victoryTitleText}>
              ENERGY CORE LEVEL {String(level).padStart(2, "0")} CLEARED!
            </Text>
            <Text style={styles.victorySubText}>
              Transmisi Sirkuit Energi Core: Level {level} → Selesai!
            </Text>

            {/* Main Content Row */}
            <ScrollView style={{ width: "100%", maxHeight: 400 }} contentContainerStyle={styles.victoryContentRow}>
              {/* Left Column: Mission Achievements */}
              <View style={styles.victoryLeftCol}>
                <Text style={styles.columnTitle}>PENCAPAIAN MISI</Text>

                {/* 3 Stars */}
                <View style={styles.starRowGroup}>
                  <Ionicons name="star" size={26} color="#FFD700" />
                  <Ionicons name="star" size={32} color="#FFD700" style={{ marginTop: -4 }} />
                  <Ionicons name="star" size={26} color="#FFD700" />
                </View>

                {/* Checklist */}
                <View style={styles.checklistGroup}>
                  <View style={styles.checkItem}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.checkText}>Koneksi Sirkuit Terhubung (100%)</Text>
                  </View>
                  <View style={styles.checkItem}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.checkText}>Aliran Energi Terdistribusi</Text>
                  </View>
                  <View style={styles.checkItem}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.checkText}>Efisiensi Sirkuit Maksimal</Text>
                  </View>
                </View>

                {/* Loot Breakdown */}
                <View style={styles.lootDivider} />
                <View style={styles.lootRow}>
                  <Text style={styles.lootLabel}>Loot Energi Terkumpul:</Text>
                  <Text style={styles.lootValue}>+{currentLevelConfig?.rewardCoins || 75} Koin</Text>
                </View>
                <View style={styles.lootRow}>
                  <Text style={styles.lootLabel}>Bonus Transmisi XP:</Text>
                  <Text style={styles.lootValue}>+{currentLevelConfig?.rewardXP || 35} XP</Text>
                </View>
                <View style={[styles.lootRow, { marginTop: 6 }]}>
                  <Text style={styles.totalLabel}>TOTAL KOIN / XP:</Text>
                  <Text style={styles.totalValue}>{(currentLevelConfig?.rewardCoins || 75) + 35} KOIN</Text>
                </View>
              </View>

              {/* Right Column: Brain Cognitive Analysis Radar Chart */}
              <View style={styles.victoryRightCol}>
                <Text style={styles.columnTitle}>🧠 Analisis Perkembangan Otak</Text>
                <Text style={styles.columnSubTitle}>(Prefrontal Cortex & Kontrol Emosi)</Text>

                {/* SVG Radar Chart */}
                <View style={styles.victoryRadarWrapper}>
                  <Svg width={180} height={180} viewBox="0 0 200 200">
                    {/* Grid Pentagons */}
                    {[0.3, 0.6, 1.0].map((lvl, idx) => {
                      const pts = [0, 1, 2, 3, 4].map((i) => {
                        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                        const x = 100 + 55 * lvl * Math.cos(angle);
                        const y = 100 + 55 * lvl * Math.sin(angle);
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      }).join(" ");

                      return (
                        <Polygon
                          key={idx}
                          points={pts}
                          fill="none"
                          stroke="rgba(56, 189, 248, 0.3)"
                          strokeWidth="1"
                          strokeDasharray={idx < 2 ? "3 3" : "0"}
                        />
                      );
                    })}

                    {/* Axis Spoke Lines */}
                    {[0, 1, 2, 3, 4].map((i) => {
                      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                      const endX = 100 + 55 * Math.cos(angle);
                      const endY = 100 + 55 * Math.sin(angle);
                      return (
                        <Line key={i} x1={100} y1={100} x2={endX} y2={endY} stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1" />
                      );
                    })}

                    {/* Polygon Fill */}
                    {(() => {
                      const vals = [0.88, 0.8, 0.92, 0.85, 0.78];
                      const pts = vals.map((val, i) => {
                        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                        const x = 100 + 55 * val * Math.cos(angle);
                        const y = 100 + 55 * val * Math.sin(angle);
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      }).join(" ");

                      return (
                        <Polygon
                          points={pts}
                          fill="rgba(56, 189, 248, 0.45)"
                          stroke="#38BDF8"
                          strokeWidth="2.5"
                        />
                      );
                    })()}

                    {/* Data Node Dots */}
                    {[0, 1, 2, 3, 4].map((i) => {
                      const vals = [0.88, 0.8, 0.92, 0.85, 0.78];
                      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                      const x = 100 + 55 * vals[i] * Math.cos(angle);
                      const y = 100 + 55 * vals[i] * Math.sin(angle);
                      return <Circle key={i} cx={x} cy={y} r="3.5" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="1.5" />;
                    })}

                    {/* Axis Text Labels */}
                    {["Perencanaan", "Keputusan", "Kontrol Diri", "Memori Kerja", "Spasial"].map((lbl, i) => {
                      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                      const x = 100 + (55 + 18) * Math.cos(angle);
                      const y = 100 + (55 + 14) * Math.sin(angle);
                      let anchor: "middle" | "start" | "end" = "middle";
                      if (i === 1 || i === 2) anchor = "start";
                      if (i === 3 || i === 4) anchor = "end";

                      return (
                        <SvgText key={i} x={x} y={i === 0 ? y - 2 : y + 3} fontSize="9" fontWeight="800" fill="#E2E8F0" textAnchor={anchor}>
                          {lbl}
                        </SvgText>
                      );
                    })}
                  </Svg>
                </View>
              </View>
            </ScrollView>

            {/* Bottom Action Buttons */}
            <View style={styles.victoryActionRow}>
              <Pressable
                style={({ pressed }) => [styles.backToMapBtn, pressed && styles.btnPressed]}
                onPress={() => router.back()}
              >
                <Text style={styles.backToMapText}>Kembali Ke Menu Utama</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.continueBtn, pressed && styles.btnPressed]}
                onPress={handleNextLevel}
              >
                <Text style={styles.continueText}>Lanjut Level ➔</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={gameState === "completed"} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.victoryCard}>
            <MaterialCommunityIcons name="party-popper" size={60} color="#FF5E36" />
            <Text style={styles.victoryTitle}>Semua Sirkuit Menyala!</Text>
            <Text style={styles.victorySubtitle}>Kota RoboMind kini menyala terang benderang. Ron-Bonta berterima kasih!</Text>
            <Button
              title="Kembali ke Home"
              onPress={() => router.back()}
              variant="primary"
              style={styles.nextLevelButton}
            />
          </View>
        </View>
      </Modal>

      <HowToPlayModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title="Cara Main Energy Core"
        goal="Sambungkan jalur energi dari sumber ke semua inti baterai robot agar kota menyala!"
        accentColor="#0D9488"
        subtitleColor="#0F766E"
        steps={[
          { emoji: "1️⃣", text: "Ketuk kabel, sirkuit, atau sumber energi untuk memutarnya sebesar 90°." },
          { emoji: "2️⃣", text: "Putar tile hingga terbentuk jalur yang tersambung dari SUMBER ke semua inti/baterai." },
          { emoji: "3️⃣", text: "Gunakan tombol Undo untuk membatalkan langkah, dan Reset untuk mengacak ulang rotasi." },
          { emoji: "4️⃣", text: "Setiap level punya target energi berbeda. Selesaikan semua level untuk memenangkan misi!" },
        ]}
        tips={[
          "Mulai putar dari tile yang dekat dengan sumber energi dulu.",
          "Jalur boleh bercabang (T/CROSS) asalkan semua inti terhubung.",
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B0E17",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: "#111827",
  },
  headerLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  levelBadgeContainer: {
    backgroundColor: "transparent",
  },
  levelText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
  topHud: {
    flexDirection: "row",
    gap: 8,
  },
  hudBadge: {
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF8C42",
    gap: 4,
  },
  hudText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  mainGameArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  boardContainer: {
    backgroundColor: "#0B1120",
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "rgba(148, 163, 184, 0.22)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    padding: 6,
    overflow: "hidden",
  },
  cellContainer: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  cellWrapper: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  evolutionPanel: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  evolutionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  evolutionTitle: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
  },
  evolutionPercent: {
    color: "#38BDF8",
    fontSize: 12,
    fontWeight: "800",
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#334155",
    width: "100%",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#10B981",
  },
  companionPanel: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 10,
  },
  ronBontaAvatarContainer: {
    marginRight: 10,
  },
  dialogBubble: {
    flex: 1,
  },
  dialogText: {
    color: "#E2E8F0",
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 16,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  actionBtn: {
    alignItems: "center",
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  actionBtnLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(11, 14, 23, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  victoryCard: {
    width: "100%",
    backgroundColor: "#1E293B",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#38BDF8",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  victoryTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  victorySubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 20,
  },
  evolutionStatsGroup: {
    width: "100%",
    marginBottom: 20,
  },
  statsLabel: {
    color: "#E2E8F0",
    fontSize: 13,
    fontWeight: "700",
  },
  rewardCardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#0F172A",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    marginBottom: 24,
  },
  rewardItem: {
    alignItems: "center",
    flex: 1,
  },
  rewardAmount: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 6,
    textAlign: "center",
  },
  nextLevelButton: {
    width: "100%",
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  // Victory / Mission Completed Popup Styles
  victoryCardContainer: {
    width: Math.min(Dimensions.get("window").width - 20, 520),
    backgroundColor: "#0B132B",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(56, 189, 248, 0.4)",
    padding: 16,
    alignItems: "center",
    elevation: 12,
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  missionTagText: {
    color: "#FFB703",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 2,
  },
  victoryTitleText: {
    color: "#38BDF8",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1.5,
    textAlign: "center",
    textShadowColor: "#38BDF8",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  victorySubText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 14,
    textAlign: "center",
  },
  victoryContentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  victoryLeftCol: {
    flex: 1,
    minWidth: 210,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.2)",
    padding: 12,
  },
  victoryRightCol: {
    flex: 1,
    minWidth: 210,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.2)",
    padding: 12,
    alignItems: "center",
  },
  columnTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#38BDF8",
    marginBottom: 6,
    textAlign: "center",
  },
  columnSubTitle: {
    fontSize: 9,
    fontWeight: "600",
    color: "#94A3B8",
    marginBottom: 4,
    textAlign: "center",
  },
  starRowGroup: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginVertical: 6,
  },
  checklistGroup: {
    gap: 4,
    marginVertical: 6,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  checkText: {
    color: "#E2E8F0",
    fontSize: 10,
    fontWeight: "600",
  },
  lootDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 8,
  },
  lootRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  lootLabel: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "500",
  },
  lootValue: {
    color: "#FFD700",
    fontSize: 10,
    fontWeight: "800",
  },
  totalLabel: {
    color: "#00FF88",
    fontSize: 11,
    fontWeight: "900",
  },
  totalValue: {
    color: "#00FF88",
    fontSize: 12,
    fontWeight: "900",
  },
  victoryRadarWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  victoryActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    width: "100%",
    marginTop: 14,
    justifyContent: "center",
  },
  backToMapBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
  },
  backToMapText: {
    color: "#CBD5E1",
    fontSize: 11,
    fontWeight: "700",
  },
  continueBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#38BDF8",
    alignItems: "center",
    elevation: 4,
  },
  continueText: {
    color: "#0F172A",
    fontSize: 11,
    fontWeight: "900",
  },
});
