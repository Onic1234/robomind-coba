import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
  Modal,
  StatusBar,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import Svg, { Rect, Circle, Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { COLORS } from "../constants/Theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAME_CANVAS_WIDTH = Math.min(SCREEN_WIDTH - 24, 380);
const STORAGE_KEY_LEVEL = "screw_spin_current_level";
const STORAGE_KEY_COINS = "user_coins_balance";
const TOTAL_LEVELS = 55;
const BUFFER_CAPACITY = 5;

// Color Palette for Screws & Boxes matching reference image
export interface ScrewColorDef {
  id: string;
  name: string;
  primary: string;
  dark: string;
  light: string;
  rim: string;
}

export const SCREW_COLORS: Record<string, ScrewColorDef> = {
  green: { id: "green", name: "Hijau", primary: "#4CD964", dark: "#1E7E34", light: "#86F09B", rim: "#2CD050" },
  purple: { id: "purple", name: "Ungu", primary: "#9D4EDD", dark: "#5A189A", light: "#E0AAFF", rim: "#7B2CBF" },
  pink: { id: "pink", name: "Pink", primary: "#FF26D9", dark: "#B50095", light: "#FF99F0", rim: "#E91E63" },
  cyan: { id: "cyan", name: "Cyan", primary: "#00D9FF", dark: "#00838F", light: "#84FFFF", rim: "#00B8D4" },
  yellow: { id: "yellow", name: "Kuning", primary: "#FFCC00", dark: "#CC9900", light: "#FFEE58", rim: "#FFAB00" },
  blue: { id: "blue", name: "Biru", primary: "#2979FF", dark: "#1565C0", light: "#82B1FF", rim: "#2962FF" },
  orange: { id: "orange", name: "Oranye", primary: "#FF6D00", dark: "#E65100", light: "#FF9E80", rim: "#FF6D00" },
  red: { id: "red", name: "Merah", primary: "#FF1744", dark: "#B71C1C", light: "#FF616F", rim: "#D50000" },
};

export interface CollectorBox {
  id: string;
  colorId: string;
  requiredCount: number;
  currentCount: number;
}

export interface ScrewItem {
  id: string;
  colorId: string;
  x: number;
  y: number;
  layer: number; // 0 = bottom/underneath, 1 = top/middle layer
  plateIds: string[];
  isRemoved?: boolean;
}

export interface PlateItem {
  id: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius?: number;
  layer: number; // 0 = bottom layer, 1 = top layer
  screwIds: string[];
  isDetached?: boolean;
}

export interface LevelData {
  levelNumber: number;
  boxesQueue: CollectorBox[];
  screws: ScrewItem[];
  plates: PlateItem[];
  coinsReward: number;
}

// Generate Hand-crafted & Balanced Levels with multi-layered progressive difficulty (Level 1 to 55)
const generateLevel = (levelNum: number): LevelData => {
  let plates: PlateItem[] = [];
  let screws: ScrewItem[] = [];

  if (levelNum === 1) {
    // Level 1: 1 Plate, 3 Screws
    plates = [
      { id: "p1", color: "rgba(235, 175, 165, 0.75)", x: 35, y: 50, width: 220, height: 160, borderRadius: 24, layer: 0, screwIds: ["s1", "s2", "s3"] },
    ];
    screws = [
      { id: "s1", colorId: "green", x: 65, y: 90, layer: 0, plateIds: ["p1"] },
      { id: "s2", colorId: "green", x: 225, y: 90, layer: 0, plateIds: ["p1"] },
      { id: "s3", colorId: "green", x: 145, y: 170, layer: 0, plateIds: ["p1"] },
    ];
  } else if (levelNum === 2) {
    // Level 2: 2 Plates (3 Green, 3 Purple)
    plates = [
      { id: "p1", color: "rgba(235, 175, 165, 0.75)", x: 25, y: 30, width: 240, height: 100, borderRadius: 20, layer: 0, screwIds: ["s1", "s2", "s3"] },
      { id: "p2", color: "rgba(235, 175, 165, 0.75)", x: 25, y: 140, width: 240, height: 100, borderRadius: 20, layer: 0, screwIds: ["s4", "s5", "s6"] },
    ];
    screws = [
      { id: "s1", colorId: "green", x: 55, y: 80, layer: 0, plateIds: ["p1"] },
      { id: "s2", colorId: "green", x: 145, y: 80, layer: 0, plateIds: ["p1"] },
      { id: "s3", colorId: "green", x: 235, y: 80, layer: 0, plateIds: ["p1"] },
      { id: "s4", colorId: "purple", x: 55, y: 190, layer: 0, plateIds: ["p2"] },
      { id: "s5", colorId: "purple", x: 145, y: 190, layer: 0, plateIds: ["p2"] },
      { id: "s6", colorId: "purple", x: 235, y: 190, layer: 0, plateIds: ["p2"] },
    ];
  } else if (levelNum === 3) {
    // Level 3: 2 Overlapping Plates (Layer 0 bottom bar + Layer 1 top bar)
    plates = [
      { id: "p1", color: "rgba(200, 150, 140, 0.5)", x: 25, y: 30, width: 240, height: 120, borderRadius: 20, layer: 0, screwIds: ["s1", "s2", "s3"] },
      { id: "p2", color: "rgba(235, 175, 165, 0.8)", x: 45, y: 100, width: 200, height: 140, borderRadius: 20, layer: 1, screwIds: ["s4", "s5", "s6", "s7"] },
    ];
    screws = [
      // Layer 0 screws
      { id: "s1", colorId: "cyan", x: 55, y: 60, layer: 0, plateIds: ["p1"] },
      { id: "s2", colorId: "cyan", x: 145, y: 60, layer: 0, plateIds: ["p1"] },
      { id: "s3", colorId: "cyan", x: 235, y: 60, layer: 0, plateIds: ["p1"] },
      // Layer 1 screws
      { id: "s4", colorId: "yellow", x: 65, y: 130, layer: 1, plateIds: ["p2"] },
      { id: "s5", colorId: "yellow", x: 225, y: 130, layer: 1, plateIds: ["p2"] },
      { id: "s6", colorId: "yellow", x: 65, y: 210, layer: 1, plateIds: ["p2"] },
      { id: "s7", colorId: "yellow", x: 225, y: 210, layer: 1, plateIds: ["p2"] },
    ];
  } else if (levelNum === 4) {
    // Level 4: 3 Plates (Layer 0 background + Layer 1 two top plates)
    plates = [
      { id: "p0", color: "rgba(180, 130, 120, 0.4)", x: 30, y: 20, width: 230, height: 250, borderRadius: 30, layer: 0, screwIds: ["sb1", "sb2", "sb3"] },
      { id: "p1", color: "rgba(235, 175, 165, 0.8)", x: 45, y: 35, width: 200, height: 100, borderRadius: 20, layer: 1, screwIds: ["s1", "s2", "s3"] },
      { id: "p2", color: "rgba(235, 175, 165, 0.8)", x: 45, y: 150, width: 200, height: 100, borderRadius: 20, layer: 1, screwIds: ["s4", "s5", "s6"] },
    ];
    screws = [
      // Layer 0 (Hidden under top plates)
      { id: "sb1", colorId: "green", x: 65, y: 85, layer: 0, plateIds: ["p0"] },
      { id: "sb2", colorId: "purple", x: 145, y: 145, layer: 0, plateIds: ["p0"] },
      { id: "sb3", colorId: "cyan", x: 225, y: 200, layer: 0, plateIds: ["p0"] },
      // Layer 1 (Top plates)
      { id: "s1", colorId: "green", x: 65, y: 55, layer: 1, plateIds: ["p1"] },
      { id: "s2", colorId: "green", x: 145, y: 55, layer: 1, plateIds: ["p1"] },
      { id: "s3", colorId: "purple", x: 225, y: 55, layer: 1, plateIds: ["p1"] },
      { id: "s4", colorId: "purple", x: 65, y: 170, layer: 1, plateIds: ["p2"] },
      { id: "s5", colorId: "cyan", x: 145, y: 170, layer: 1, plateIds: ["p2"] },
      { id: "s6", colorId: "cyan", x: 225, y: 170, layer: 1, plateIds: ["p2"] },
    ];
  } else {
    // Level 8 & Multi-Layered Levels: Exact match to uploaded reference image!
    // Layer 0: Central outer frame plate with 6 screws underneath
    // Layer 1: 4 Corner square plates with 4 screws each
    plates = [
      { id: "p0", color: "rgba(200, 150, 140, 0.45)", x: 45, y: 10, width: 200, height: 260, borderRadius: 36, layer: 0, screwIds: ["sb1", "sb2", "sb3", "sb4", "sb5", "sb6"] },
      { id: "p1", color: "rgba(235, 175, 165, 0.75)", x: 25, y: 20, width: 115, height: 115, borderRadius: 22, layer: 1, screwIds: ["s1", "s2", "s3", "s4"] },
      { id: "p2", color: "rgba(235, 175, 165, 0.75)", x: 155, y: 20, width: 115, height: 115, borderRadius: 22, layer: 1, screwIds: ["s5", "s6", "s7", "s8"] },
      { id: "p3", color: "rgba(235, 175, 165, 0.75)", x: 25, y: 150, width: 115, height: 115, borderRadius: 22, layer: 1, screwIds: ["s9", "s10", "s11", "s12"] },
      { id: "p4", color: "rgba(235, 175, 165, 0.75)", x: 155, y: 150, width: 115, height: 115, borderRadius: 22, layer: 1, screwIds: ["s13", "s14", "s15", "s16"] },
    ];

    screws = [
      // Layer 0 Screws (Underneath - Faded until top plates detach!)
      { id: "sb1", colorId: "yellow", x: 100, y: 35, layer: 0, plateIds: ["p0"] },
      { id: "sb2", colorId: "purple", x: 145, y: 35, layer: 0, plateIds: ["p0"] },
      { id: "sb3", colorId: "pink", x: 100, y: 90, layer: 0, plateIds: ["p0"] },
      { id: "sb4", colorId: "yellow", x: 195, y: 90, layer: 0, plateIds: ["p0"] },
      { id: "sb5", colorId: "pink", x: 100, y: 190, layer: 0, plateIds: ["p0"] },
      { id: "sb6", colorId: "yellow", x: 195, y: 190, layer: 0, plateIds: ["p0"] },

      // Layer 1 Screws (Top Corner Plates)
      // Plate 1 (Top Left)
      { id: "s1", colorId: "blue", x: 45, y: 40, layer: 1, plateIds: ["p1"] },
      { id: "s2", colorId: "purple", x: 120, y: 40, layer: 1, plateIds: ["p1"] },
      { id: "s3", colorId: "purple", x: 45, y: 115, layer: 1, plateIds: ["p1"] },
      { id: "s4", colorId: "yellow", x: 120, y: 115, layer: 1, plateIds: ["p1"] },

      // Plate 2 (Top Right)
      { id: "s5", colorId: "cyan", x: 175, y: 40, layer: 1, plateIds: ["p2"] },
      { id: "s6", colorId: "green", x: 250, y: 40, layer: 1, plateIds: ["p2"] },
      { id: "s7", colorId: "purple", x: 175, y: 115, layer: 1, plateIds: ["p2"] },
      { id: "s8", colorId: "yellow", x: 250, y: 115, layer: 1, plateIds: ["p2"] },

      // Plate 3 (Bottom Left)
      { id: "s9", colorId: "green", x: 45, y: 170, layer: 1, plateIds: ["p3"] },
      { id: "s10", colorId: "purple", x: 120, y: 170, layer: 1, plateIds: ["p3"] },
      { id: "s11", colorId: "purple", x: 45, y: 245, layer: 1, plateIds: ["p3"] },
      { id: "s12", colorId: "cyan", x: 120, y: 245, layer: 1, plateIds: ["p3"] },

      // Plate 4 (Bottom Right)
      { id: "s13", colorId: "blue", x: 175, y: 170, layer: 1, plateIds: ["p4"] },
      { id: "s14", colorId: "purple", x: 250, y: 170, layer: 1, plateIds: ["p4"] },
      { id: "s15", colorId: "purple", x: 175, y: 245, layer: 1, plateIds: ["p4"] },
      { id: "s16", colorId: "green", x: 250, y: 245, layer: 1, plateIds: ["p4"] },
    ];
  }

  // AUTOMATICALLY derive boxesQueue from exact screws placed on board
  const colorCounts: Record<string, number> = {};
  screws.forEach((s) => {
    colorCounts[s.colorId] = (colorCounts[s.colorId] || 0) + 1;
  });

  const boxesQueue: CollectorBox[] = [];
  let boxIdCounter = 1;

  const preferredOrder = ["green", "purple", "cyan", "yellow", "pink", "blue", "orange", "red"];
  const sortedColors = Object.keys(colorCounts).sort(
    (a, b) => preferredOrder.indexOf(a) - preferredOrder.indexOf(b)
  );

  sortedColors.forEach((colorId) => {
    let remaining = colorCounts[colorId];
    while (remaining > 0) {
      const boxCap = remaining >= 4 ? 4 : remaining;
      boxesQueue.push({
        id: `box_${boxIdCounter++}`,
        colorId,
        requiredCount: boxCap,
        currentCount: 0,
      });
      remaining -= boxCap;
    }
  });

  return {
    levelNumber: levelNum,
    boxesQueue,
    plates,
    screws,
    coinsReward: 150 + levelNum * 5,
  };
};

export default function ScrewSpinScreen() {
  const router = useRouter();

  // Navigation & Screen States
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [userCoins, setUserCoins] = useState(1250);

  // Active Game State
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [boxesQueue, setBoxesQueue] = useState<CollectorBox[]>([]);
  const [screws, setScrews] = useState<ScrewItem[]>([]);
  const [plates, setPlates] = useState<PlateItem[]>([]);
  const [bufferSlots, setBufferSlots] = useState<(ScrewItem | null)[]>([null, null, null, null, null]);
  
  // Game Status Modals
  const [isVictoryModalVisible, setIsVictoryModalVisible] = useState(false);
  const [isDefeatModalVisible, setIsDefeatModalVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

  // Load Saved Progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const savedLvl = await AsyncStorage.getItem(STORAGE_KEY_LEVEL);
        if (savedLvl) setCurrentLevel(parseInt(savedLvl, 10));
        const savedCoins = await AsyncStorage.getItem(STORAGE_KEY_COINS);
        if (savedCoins) setUserCoins(parseInt(savedCoins, 10));
      } catch (err) {
        console.error("Failed to load screw spin progress", err);
      }
    };
    loadProgress();
  }, []);

  // Initialize Level
  const initLevel = (lvlNum: number) => {
    const data = generateLevel(lvlNum);
    setLevelData(data);
    setBoxesQueue(data.boxesQueue);
    setScrews(data.screws);
    setPlates(data.plates);
    setBufferSlots([null, null, null, null, null]);
    setIsVictoryModalVisible(false);
    setIsDefeatModalVisible(false);
  };

  const handleStartGame = () => {
    if (soundEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    initLevel(currentLevel);
    setIsGameStarted(true);
  };

  const handleRestartLevel = () => {
    if (soundEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    initLevel(currentLevel);
  };

  const handleResetProgress = async () => {
    Alert.alert(
      "Reset Level",
      "Apakah Anda yakin ingin mengulang dari Level 1?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setCurrentLevel(1);
            await AsyncStorage.setItem(STORAGE_KEY_LEVEL, "1");
            if (isGameStarted) initLevel(1);
          },
        },
      ]
    );
  };

  // Active Boxes (Max 2 visible boxes at a time)
  const activeBoxes = useMemo(() => {
    return boxesQueue.filter((b) => b.currentCount < b.requiredCount).slice(0, 2);
  }, [boxesQueue]);

  // Helper to check if a screw is covered by an active higher layer plate
  const isScrewCovered = (screw: ScrewItem): boolean => {
    return plates.some((p) => {
      if (p.isDetached) return false;
      if (p.layer <= screw.layer) return false;

      // Check bounding box overlap
      const inX = screw.x >= p.x - 5 && screw.x <= p.x + p.width + 5;
      const inY = screw.y >= p.y - 5 && screw.y <= p.y + p.height + 5;
      return inX && inY;
    });
  };

  // Screw Click Handler
  const handleScrewClick = (screw: ScrewItem) => {
    if (screw.isRemoved || isScrewCovered(screw)) return;
    if (soundEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Check if screw matches any visible top box with remaining capacity
    const targetBoxIndex = boxesQueue.findIndex(
      (b) =>
        b.currentCount < b.requiredCount &&
        b.colorId === screw.colorId &&
        activeBoxes.some((ab) => ab.id === b.id)
    );

    if (targetBoxIndex !== -1) {
      // 1. Move directly to active Collector Box!
      const updatedScrews = screws.map((s) => (s.id === screw.id ? { ...s, isRemoved: true } : s));
      setScrews(updatedScrews);
      checkPlatesDetachment(updatedScrews);

      // Increment box count
      updateBoxCount(targetBoxIndex, 1, updatedScrews, bufferSlots);
    } else {
      // 2. No matching box active -> Move screw to Buffer Slot
      const emptySlotIdx = bufferSlots.findIndex((slot) => slot === null);
      if (emptySlotIdx === -1) {
        // Buffer full & no matching box -> Fail!
        if (soundEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setIsDefeatModalVisible(true);
        return;
      }

      const updatedScrews = screws.map((s) => (s.id === screw.id ? { ...s, isRemoved: true } : s));
      setScrews(updatedScrews);
      checkPlatesDetachment(updatedScrews);

      const nextBuffer = [...bufferSlots];
      nextBuffer[emptySlotIdx] = screw;
      setBufferSlots(nextBuffer);

      // Check if buffer is completely filled and no active box can take any buffer screw
      if (nextBuffer.every((s) => s !== null)) {
        const canAnyBufferClear = nextBuffer.some((bufScrew) =>
          bufScrew && activeBoxes.some((ab) => ab.colorId === bufScrew.colorId && ab.currentCount < ab.requiredCount)
        );
        if (!canAnyBufferClear) {
          setTimeout(() => {
            if (soundEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setIsDefeatModalVisible(true);
          }, 300);
        }
      }
    }
  };

  // Update Box Count & Auto-Clear Buffer Screws
  const updateBoxCount = (
    boxIdx: number,
    increment: number,
    currentScrews: ScrewItem[],
    currentBuffer: (ScrewItem | null)[]
  ) => {
    let nextQueue = [...boxesQueue];
    nextQueue[boxIdx] = {
      ...nextQueue[boxIdx],
      currentCount: nextQueue[boxIdx].currentCount + increment,
    };

    let nextBuffer = [...currentBuffer];

    // Check if any buffer screw can now fill active boxes!
    let changed = true;
    while (changed) {
      changed = false;
      const currentActive = nextQueue.filter((b) => b.currentCount < b.requiredCount).slice(0, 2);
      
      for (let i = 0; i < nextBuffer.length; i++) {
        const bufScrew = nextBuffer[i];
        if (!bufScrew) continue;

        const targetBox = currentActive.find(
          (b) => b.colorId === bufScrew.colorId && b.currentCount < b.requiredCount
        );

        if (targetBox) {
          const qIdx = nextQueue.findIndex((b) => b.id === targetBox.id);
          nextQueue[qIdx] = {
            ...nextQueue[qIdx],
            currentCount: nextQueue[qIdx].currentCount + 1,
          };
          nextBuffer[i] = null;
          changed = true;
          break;
        }
      }
    }

    setBoxesQueue(nextQueue);
    setBufferSlots(nextBuffer);

    // Check Level Completion
    const isLevelCleared = nextQueue.every((b) => b.currentCount >= b.requiredCount);
    if (isLevelCleared) {
      setTimeout(() => {
        handleLevelComplete();
      }, 400);
    }
  };

  // Check if plates detach after screw removal
  const checkPlatesDetachment = (currentScrews: ScrewItem[]) => {
    setPlates((prevPlates) =>
      prevPlates.map((p) => {
        const allScrewsRemoved = p.screwIds.every((sId) => {
          const sc = currentScrews.find((s) => s.id === sId);
          return sc ? sc.isRemoved : true;
        });
        return allScrewsRemoved ? { ...p, isDetached: true } : p;
      })
    );
  };

  // Victory Handler
  const handleLevelComplete = async () => {
    if (soundEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const reward = levelData ? levelData.coinsReward : 150;
    const newCoins = userCoins + reward;
    setUserCoins(newCoins);
    await AsyncStorage.setItem(STORAGE_KEY_COINS, newCoins.toString());

    setIsVictoryModalVisible(true);
  };

  const handleNextLevel = async () => {
    const nextLvl = currentLevel >= TOTAL_LEVELS ? 1 : currentLevel + 1;
    setCurrentLevel(nextLvl);
    await AsyncStorage.setItem(STORAGE_KEY_LEVEL, nextLvl.toString());
    initLevel(nextLvl);
  };

  // ----------------------------------------------------
  // RENDER TITLE / SPLASH SCREEN
  // ----------------------------------------------------
  if (!isGameStarted) {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#4C1378" />

        {/* Top Header Buttons */}
        <View style={styles.splashHeader}>
          <Pressable
            style={({ pressed }) => [styles.circleIconButton, styles.backCircleBtn, pressed && styles.btnPressed]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.circleIconButton, styles.soundCircleBtn, pressed && styles.btnPressed]}
            onPress={() => setSoundEnabled(!soundEnabled)}
          >
            <Ionicons name={soundEnabled ? "volume-high" : "volume-mute"} size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Centered Portrait Game Container */}
        <View style={styles.splashCardContainer}>
          {/* 3D Glossy SCREW SPIN Logo */}
          <View style={styles.titleWrapper}>
            <Text style={styles.titleText3DBack}>SCREW</Text>
            <Text style={styles.titleText3DFront}>SCREW</Text>
            <Text style={styles.subTitleText3DBack}>SPIN</Text>
            <Text style={styles.subTitleText3DFront}>SPIN</Text>
          </View>

          {/* Level Progress Indicator */}
          <View style={styles.levelBadgeContainer}>
            <Text style={styles.levelBadgeText}>
              LEVEL.{String(currentLevel).padStart(2, "0")}/{TOTAL_LEVELS}
            </Text>
          </View>

          {/* Play Button */}
          <Pressable
            style={({ pressed }) => [styles.playButton3D, pressed && styles.playButton3DPressed]}
            onPress={handleStartGame}
          >
            <Text style={styles.playButtonText}>PLAY</Text>
          </Pressable>

          {/* Reset progress note */}
          <Pressable onPress={handleResetProgress} style={styles.resetFooter}>
            <Text style={styles.resetFooterText}>Hold here to reset level progress only</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------
  // RENDER GAMEPLAY SCREEN
  // ----------------------------------------------------
  return (
    <SafeAreaView style={styles.gameContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#4C1378" />

      {/* Outer Purple Frame Layout */}
      <View style={styles.gameCanvas}>
        {/* Game Header */}
        <View style={styles.gameHeader}>
          <Pressable
            style={({ pressed }) => [styles.circleIconButton, styles.backCircleBtn, pressed && styles.btnPressed]}
            onPress={() => setIsGameStarted(false)}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>

          <View style={styles.headerLevelContainer}>
            <Text style={styles.headerLevelText}>LEVEL.{String(currentLevel).padStart(2, "0")}</Text>
          </View>

          <View style={styles.headerRightGroup}>
            <Pressable
              style={({ pressed }) => [styles.smallSquareBtn, pressed && styles.btnPressed]}
              onPress={() => setIsSettingsModalVisible(true)}
            >
              <Ionicons name="settings-sharp" size={20} color="#FFFFFF" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.smallSquareBtn, styles.restartBtn, pressed && styles.btnPressed]}
              onPress={handleRestartLevel}
            >
              <Ionicons name="refresh-sharp" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* Top Area: Active Collector Boxes */}
        <View style={styles.boxesArea}>
          {activeBoxes.map((box) => {
            const colorDef = SCREW_COLORS[box.colorId] || SCREW_COLORS.green;
            return (
              <View key={box.id} style={[styles.collectorBoxContainer, { backgroundColor: colorDef.primary }]}>
                <View style={styles.collectorBoxInner}>
                  {box.requiredCount === 3 ? (
                    <View style={{ alignItems: "center", gap: 4 }}>
                      <View
                        style={[
                          styles.hexSocket,
                          { backgroundColor: 0 < box.currentCount ? colorDef.light : "#1A1A1A" },
                        ]}
                      >
                        {0 < box.currentCount && <View style={[styles.hexScrewHead, { backgroundColor: colorDef.dark }]} />}
                      </View>
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        {[1, 2].map((idx) => {
                          const isFilled = idx < box.currentCount;
                          return (
                            <View
                              key={idx}
                              style={[
                                styles.hexSocket,
                                { backgroundColor: isFilled ? colorDef.light : "#1A1A1A" },
                              ]}
                            >
                              {isFilled && <View style={[styles.hexScrewHead, { backgroundColor: colorDef.dark }]} />}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  ) : box.requiredCount === 4 ? (
                    <View style={{ alignItems: "center", gap: 4 }}>
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        {[0, 1].map((idx) => {
                          const isFilled = idx < box.currentCount;
                          return (
                            <View
                              key={idx}
                              style={[
                                styles.hexSocket,
                                { backgroundColor: isFilled ? colorDef.light : "#1A1A1A" },
                              ]}
                            >
                              {isFilled && <View style={[styles.hexScrewHead, { backgroundColor: colorDef.dark }]} />}
                            </View>
                          );
                        })}
                      </View>
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        {[2, 3].map((idx) => {
                          const isFilled = idx < box.currentCount;
                          return (
                            <View
                              key={idx}
                              style={[
                                styles.hexSocket,
                                { backgroundColor: isFilled ? colorDef.light : "#1A1A1A" },
                              ]}
                            >
                              {isFilled && <View style={[styles.hexScrewHead, { backgroundColor: colorDef.dark }]} />}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  ) : (
                    <View style={styles.socketsRow}>
                      {Array.from({ length: box.requiredCount }).map((_, idx) => {
                        const isFilled = idx < box.currentCount;
                        return (
                          <View
                            key={idx}
                            style={[
                              styles.hexSocket,
                              { backgroundColor: isFilled ? colorDef.light : "#1A1A1A" },
                            ]}
                          >
                            {isFilled && <View style={[styles.hexScrewHead, { backgroundColor: colorDef.dark }]} />}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Middle Buffer Row (5 Empty Slots) */}
        <View style={styles.bufferArea}>
          {bufferSlots.map((item, idx) => (
            <View key={idx} style={styles.bufferSlotCircle}>
              {item && (
                <View
                  style={[
                    styles.screwBufferItem,
                    { backgroundColor: (SCREW_COLORS[item.colorId] || SCREW_COLORS.green).primary },
                  ]}
                >
                  <View
                    style={[
                      styles.screwBufferCross,
                      { backgroundColor: (SCREW_COLORS[item.colorId] || SCREW_COLORS.green).dark },
                    ]}
                  />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Main Game Board (Plates & Screws) */}
        <View style={styles.boardArea}>
          <View style={styles.boardSurface}>
            {/* Render Plates (Sorted by Layer) */}
            {plates
              .slice()
              .sort((a, b) => a.layer - b.layer)
              .map((plate) => {
                if (plate.isDetached) return null;
                return (
                  <View
                    key={plate.id}
                    style={[
                      styles.plateView,
                      {
                        left: plate.x,
                        top: plate.y,
                        width: plate.width,
                        height: plate.height,
                        backgroundColor: plate.color,
                        borderRadius: plate.borderRadius || 20,
                        zIndex: plate.layer * 2,
                      },
                    ]}
                  />
                );
              })}

            {/* Render Screws (With Layer Opacity and Covered State) */}
            {screws.map((screw) => {
              if (screw.isRemoved) return null;
              const colorDef = SCREW_COLORS[screw.colorId] || SCREW_COLORS.green;
              const covered = isScrewCovered(screw);

              return (
                <Pressable
                  key={screw.id}
                  style={({ pressed }) => [
                    styles.screwWrapper,
                    {
                      left: screw.x - 22,
                      top: screw.y - 22,
                      opacity: covered ? 0.35 : 1,
                      zIndex: covered ? screw.layer * 2 + 1 : screw.layer * 2 + 10,
                    },
                    pressed && !covered && { transform: [{ scale: 0.9 }] },
                  ]}
                  onPress={() => handleScrewClick(screw)}
                >
                  <View style={[styles.screwOuterCircle, { backgroundColor: colorDef.primary }]}>
                    <View style={[styles.screwInnerBevel, { backgroundColor: colorDef.light }]}>
                      {/* Cross pattern */}
                      <View style={[styles.screwCrossLineH, { backgroundColor: colorDef.dark }]} />
                      <View style={[styles.screwCrossLineV, { backgroundColor: colorDef.dark }]} />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* VICTORY MODAL */}
      <Modal visible={isVictoryModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="trophy-sharp" size={60} color="#FFD600" />
            <Text style={styles.modalTitleText}>LEVEL SELESAI!</Text>
            <Text style={styles.modalSubText}>Selamat, kamu berhasil menyelesaikan tantangan level ini!</Text>

            <View style={styles.rewardContainer}>
              <Ionicons name="logo-bitcoin" size={24} color="#FFD600" />
              <Text style={styles.rewardText}>+{levelData?.coinsReward || 150} Koin</Text>
            </View>

            <Pressable
              style={({ pressed }) => [styles.modalPrimaryBtn, pressed && styles.btnPressed]}
              onPress={handleNextLevel}
            >
              <Text style={styles.modalPrimaryBtnText}>LEVEL BERIKUTNYA</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* DEFEAT MODAL */}
      <Modal visible={isDefeatModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="alert-circle-sharp" size={60} color="#FF4081" />
            <Text style={[styles.modalTitleText, { color: "#FF4081" }]}>LUBANG PENAMPUNG PENUH!</Text>
            <Text style={styles.modalSubText}>
              Semua 5 lubang cadangan telah terisi dan tidak ada tempat untuk baut lagi.
            </Text>

            <Pressable
              style={({ pressed }) => [styles.modalPrimaryBtn, { backgroundColor: "#FF4081" }, pressed && styles.btnPressed]}
              onPress={handleRestartLevel}
            >
              <Text style={styles.modalPrimaryBtnText}>COBA LAGI</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* SETTINGS MODAL */}
      <Modal visible={isSettingsModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitleText}>PENGATURAN</Text>

            <Pressable
              style={styles.settingRow}
              onPress={() => setSoundEnabled(!soundEnabled)}
            >
              <Text style={styles.settingLabel}>Efek Suara / Suara</Text>
              <Ionicons name={soundEnabled ? "volume-high" : "volume-mute"} size={26} color="#4CD964" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.modalSecondaryBtn, pressed && styles.btnPressed]}
              onPress={() => setIsSettingsModalVisible(false)}
            >
              <Text style={styles.modalSecondaryBtnText}>TUTUP</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// STYLESHEET - ROBOTIC MECHA CYBERPUNK THEME
const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#090E1A",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  splashHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  circleIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#00F0FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  backCircleBtn: {
    backgroundColor: "#FF6D00",
  },
  soundCircleBtn: {
    backgroundColor: "#00E5FF",
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  splashCardContainer: {
    width: GAME_CANVAS_WIDTH,
    height: 520,
    backgroundColor: "#0F172A",
    borderRadius: 32,
    borderWidth: 3,
    borderColor: "#00E5FF",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 30,
    elevation: 12,
    shadowColor: "#00F0FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  titleWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  titleText3DBack: {
    fontSize: 44,
    fontWeight: "900",
    color: "#0B132B",
    letterSpacing: 3,
    position: "absolute",
    top: 4,
  },
  titleText3DFront: {
    fontSize: 44,
    fontWeight: "900",
    color: "#00F0FF",
    letterSpacing: 3,
    textShadowColor: "#00B8D4",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 8,
  },
  subTitleText3DBack: {
    fontSize: 40,
    fontWeight: "900",
    color: "#0B132B",
    letterSpacing: 3,
    position: "absolute",
    top: 56,
  },
  subTitleText3DFront: {
    fontSize: 40,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 3,
    marginTop: -4,
    textShadowColor: "#38BDF8",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 8,
  },
  levelBadgeContainer: {
    backgroundColor: "rgba(0, 229, 255, 0.12)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(0, 229, 255, 0.3)",
  },
  levelBadgeText: {
    color: "#00E5FF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  playButton3D: {
    width: 190,
    height: 56,
    backgroundColor: "#00E5FF",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#84FFFF",
    elevation: 8,
    shadowColor: "#00F0FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  playButton3DPressed: {
    transform: [{ translateY: 2 }],
    backgroundColor: "#00B8D4",
  },
  playButtonText: {
    color: "#0F172A",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 2,
    textShadowColor: "#E0F7FA",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  resetFooter: {
    marginTop: 10,
  },
  resetFooterText: {
    color: "rgba(148, 163, 184, 0.7)",
    fontSize: 11,
    fontWeight: "500",
  },

  // Game Play Screen
  gameContainer: {
    flex: 1,
    backgroundColor: "#090E1A",
    alignItems: "center",
  },
  gameCanvas: {
    width: GAME_CANVAS_WIDTH,
    flex: 1,
    backgroundColor: "#0F172A",
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: "rgba(0, 229, 255, 0.35)",
    marginVertical: 10,
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 20,
    overflow: "hidden",
  },
  gameHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerLevelContainer: {
    backgroundColor: "rgba(0, 229, 255, 0.12)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.3)",
  },
  headerLevelText: {
    color: "#00E5FF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
  headerRightGroup: {
    flexDirection: "row",
    gap: 8,
  },
  smallSquareBtn: {
    width: 38,
    height: 38,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  restartBtn: {
    backgroundColor: "#FF1744",
  },

  // Top Collector Boxes (Robotic Energy Battery Chambers)
  boxesArea: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  collectorBoxContainer: {
    width: 110,
    height: 90,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    elevation: 6,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  collectorBoxInner: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  socketsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
  },
  hexSocket: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0B132B",
  },
  hexScrewHead: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },

  // Middle Buffer Row (High-Tech Electromagnetic Port Sockets)
  bufferArea: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(11, 19, 43, 0.8)",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "rgba(0, 229, 255, 0.25)",
  },
  bufferSlotCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1E293B",
    borderWidth: 2.5,
    borderColor: "rgba(0, 229, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  screwBufferItem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  screwBufferCross: {
    width: 12,
    height: 4,
    borderRadius: 2,
  },

  // Main Game Board (Robotic Grid Surface)
  boardArea: {
    flex: 1,
    width: "92%",
    backgroundColor: "#0B132B",
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#1E293B",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00F0FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  boardSurface: {
    width: 290,
    height: 320,
    position: "relative",
  },
  plateView: {
    position: "absolute",
    borderWidth: 2.5,
    borderColor: "rgba(0, 229, 255, 0.5)",
  },
  screwWrapper: {
    position: "absolute",
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  screwOuterCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    borderWidth: 2.5,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  screwInnerBevel: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  screwCrossLineH: {
    position: "absolute",
    width: 14,
    height: 4,
    borderRadius: 2,
  },
  screwCrossLineV: {
    position: "absolute",
    width: 4,
    height: 14,
    borderRadius: 2,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(9, 14, 26, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#0F172A",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#00E5FF",
    elevation: 12,
  },
  modalTitleText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#00E5FF",
    marginTop: 12,
    textAlign: "center",
  },
  modalSubText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#94A3B8",
    textAlign: "center",
    marginVertical: 12,
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0, 229, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.3)",
  },
  rewardText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFD700",
  },
  modalPrimaryBtn: {
    width: "100%",
    height: 50,
    backgroundColor: "#00E5FF",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  modalPrimaryBtnText: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  settingRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#E2E8F0",
  },
  modalSecondaryBtn: {
    width: "100%",
    height: 46,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSecondaryBtnText: {
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "700",
  },
});
