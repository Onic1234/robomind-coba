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
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { GameBackButton } from "../components/GameBackButton";
import { HowToPlayModal } from "../components/HowToPlayModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { usePlaytimeGuard, formatDurationHMS } from "../hooks/usePlaytimeGuard";
import { saveGameSession } from "../lib/gameProgressService";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import Svg, {
  Rect,
  Circle,
  Path,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Polygon,
  Line,
  G,
  Text as SvgText,
} from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAME_CANVAS_WIDTH = Math.min(SCREEN_WIDTH - 24, 380);
const STORAGE_KEY_LEVEL = "screw_spin_current_level";
const STORAGE_KEY_COINS = "user_coins_balance";
const STORAGE_KEY_COOLDOWN = "screw_spin_cooldown_until";
const TOTAL_LEVELS = 55;
const BUFFER_CAPACITY = 5;
const GAME_TIME_LIMIT_SEC = 90;
const COOLDOWN_DURATION_SEC = 60;

const formatTimeSeconds = (totalSec: number) => {
  const m = Math.floor(Math.max(0, totalSec) / 60);
  const s = Math.max(0, totalSec) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// Vibrant Sci-Fi Metallic Screw Color Palette
export interface ScrewColorDef {
  id: string;
  name: string;
  primary: string;
  dark: string;
  light: string;
  rim: string;
  glow: string;
}

export const SCREW_COLORS: Record<string, ScrewColorDef> = {
  green: { id: "green", name: "Hijau", primary: "#10B981", dark: "#047857", light: "#A7F3D0", rim: "#059669", glow: "#34D399" },
  purple: { id: "purple", name: "Ungu", primary: "#8B5CF6", dark: "#5B21B6", light: "#DDD6FE", rim: "#7C3AED", glow: "#C4B5FD" },
  pink: { id: "pink", name: "Pink", primary: "#EC4899", dark: "#9D174D", light: "#FBCFE8", rim: "#DB2777", glow: "#F472B6" },
  cyan: { id: "cyan", name: "Cyan", primary: "#06B6D4", dark: "#0E7490", light: "#CFFAFE", rim: "#0891B2", glow: "#67E8F9" },
  yellow: { id: "yellow", name: "Kuning", primary: "#F59E0B", dark: "#B45309", light: "#FEF3C7", rim: "#D97706", glow: "#FBBF24" },
  blue: { id: "blue", name: "Biru", primary: "#3B82F6", dark: "#1D4ED8", light: "#DBEAFE", rim: "#2563EB", glow: "#60A5FA" },
  orange: { id: "orange", name: "Oranye", primary: "#F97316", dark: "#C2410C", light: "#FFEDD5", rim: "#EA580C", glow: "#FB923C" },
  red: { id: "red", name: "Merah", primary: "#EF4444", dark: "#B91C1C", light: "#FEE2E2", rim: "#DC2626", glow: "#F87171" },
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
  borderColor?: string;
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

// ----------------------------------------------------
// 3D VIBRANT METALLIC SCREW SVG COMPONENT
// ----------------------------------------------------
const MetallicScrewHead = ({
  colorId,
  size = 48,
}: {
  colorId: string;
  size?: number;
}) => {
  const colorDef = SCREW_COLORS[colorId] || SCREW_COLORS.green;

  return (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Defs>
        {/* Stainless Steel Outer Flange Ring */}
        <LinearGradient id={`steel_rim_${colorId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="30%" stopColor="#E2E8F0" />
          <Stop offset="65%" stopColor="#94A3B8" />
          <Stop offset="90%" stopColor="#475569" />
          <Stop offset="100%" stopColor="#CBD5E1" />
        </LinearGradient>

        {/* 3D Vibrant Screw Head Dome Gradient */}
        <RadialGradient id={`screw_head_${colorId}`} cx="35%" cy="30%" r="70%">
          <Stop offset="0%" stopColor={colorDef.light} />
          <Stop offset="40%" stopColor={colorDef.primary} />
          <Stop offset="85%" stopColor={colorDef.rim} />
          <Stop offset="100%" stopColor={colorDef.dark} />
        </RadialGradient>

        {/* Specular White Gloss Arc */}
        <RadialGradient id={`specular_${colorId}`} cx="30%" cy="25%" r="40%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <Stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.2" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* 3D Elevation Drop Shadow */}
      <Circle cx="25" cy="27" r="22" fill="#000000" opacity="0.4" />

      {/* Steel Chrome Outer Ring */}
      <Circle cx="25" cy="25" r="23" fill={`url(#steel_rim_${colorId})`} />
      <Circle cx="25" cy="25" r="20" fill={colorDef.dark} opacity="0.5" />

      {/* Main Vibrant 3D Screw Head Dome */}
      <Circle cx="25" cy="25" r="19.5" fill={`url(#screw_head_${colorId})`} stroke={colorDef.light} strokeWidth="1" />

      {/* Glossy Specular Highlight Arc */}
      <Path
        d="M 10 22 A 16 16 0 0 1 40 22 A 18 18 0 0 0 10 22 Z"
        fill={`url(#specular_${colorId})`}
      />

      {/* Specular White Reflection Dot */}
      <Circle cx="18" cy="15" r="2.8" fill="#FFFFFF" opacity="0.75" />

      {/* Inset Philips Precision Cross Slot Drive */}
      <G transform="rotate(45 25 25)">
        {/* Recessed Socket Outline */}
        <Circle cx="25" cy="25" r="9" fill={colorDef.dark} opacity="0.5" stroke={colorDef.primary} strokeWidth="0.8" />

        {/* Bright Philips Cross Lines */}
        <Rect x="16" y="23.2" width="18" height="3.6" rx="1.8" fill="#090E1A" />
        <Rect x="17" y="23.8" width="16" height="2.4" rx="1.2" fill={colorDef.light} opacity="0.95" />

        <Rect x="23.2" y="16" width="3.6" height="18" rx="1.8" fill="#090E1A" />
        <Rect x="23.8" y="17" width="2.4" height="16" rx="1.2" fill={colorDef.light} opacity="0.95" />

        {/* Center Metal Pin */}
        <Circle cx="25" cy="25" r="2.8" fill="#F8FAFC" stroke={colorDef.dark} strokeWidth="0.8" />
      </G>

      {/* Bevel Outer Highlight Ring */}
      <Circle cx="25" cy="25" r="23" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.8" />
    </Svg>
  );
};

// ----------------------------------------------------
// COUNTERSUNK SCREW HOLE (Visual socket left on plates)
// ----------------------------------------------------
const CountersunkSocket = ({ size = 44 }: { size?: number }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44">
      {/* Outer Shadow Inset */}
      <Circle cx="22" cy="22" r="19" fill="#030712" opacity="0.8" />

      {/* Metallic Countersink Edge */}
      <Circle cx="22" cy="22" r="17" fill="none" stroke="#475569" strokeWidth="2.5" />
      <Circle cx="22" cy="22" r="14" fill="#0F172A" />

      {/* Thread Rings */}
      <Circle cx="22" cy="22" r="11" fill="none" stroke="rgba(0, 229, 255, 0.3)" strokeWidth="1.2" strokeDasharray="5 3" />
      <Circle cx="22" cy="22" r="7.5" fill="none" stroke="#1E293B" strokeWidth="1" />
      <Circle cx="22" cy="22" r="4.5" fill="#020408" />

      {/* Cross alignment marks in hole */}
      <Line x1="14" y1="22" x2="30" y2="22" stroke="rgba(0, 229, 255, 0.25)" strokeWidth="1" />
      <Line x1="22" y1="14" x2="22" y2="30" stroke="rgba(0, 229, 255, 0.25)" strokeWidth="1" />
    </Svg>
  );
};

// ----------------------------------------------------
// ANIMATED SCI-FI MECHA SCREWDRIVER TOOL COMPONENT
// ----------------------------------------------------
const SciFiMechaScrewdriver = ({
  x,
  y,
  visible,
}: {
  x: number;
  y: number;
  visible: boolean;
}) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);
  const translateY = useSharedValue(-70);
  const sparkScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Phase 1: Descend & Engage (0 -> 150ms)
      scale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.back(1.2)) });
      translateY.value = withSequence(
        withTiming(0, { duration: 150, easing: Easing.out(Easing.quad) }),
        // Phase 2: Back out / lift up while unscrewing (150 -> 550ms)
        withTiming(-18, { duration: 400, easing: Easing.linear }),
        // Phase 3: Lift off & retract (550 -> 700ms)
        withTiming(-90, { duration: 150, easing: Easing.in(Easing.quad) })
      );

      // 3 Full Realistic Revolutions (1080 deg) over 450ms
      rotation.value = withSequence(
        withTiming(0, { duration: 120 }),
        withTiming(1080, { duration: 450, easing: Easing.out(Easing.cubic) })
      );

      // Energy Spark Ring Pulse
      sparkScale.value = withSequence(
        withTiming(0, { duration: 120 }),
        withTiming(1.4, { duration: 350, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 150 })
      );
    } else {
      scale.value = withTiming(0, { duration: 120 });
      translateY.value = withTiming(-70, { duration: 120 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: x - 30 },
        { translateY: y - 110 + translateY.value },
        { scale: scale.value },
      ],
      opacity: scale.value,
    };
  });

  const bitAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const sparkAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: sparkScale.value }],
      opacity: Math.min(1, sparkScale.value),
    };
  });

  if (!visible) return null;

  return (
    <Animated.View style={[styles.screwdriverContainer, animatedStyle]} pointerEvents="none">
      {/* High-Tech Mecha Screwdriver Body */}
      <Svg width={60} height={120} viewBox="0 0 60 120">
        <Defs>
          {/* Mecha Armor Plate Gradient */}
          <LinearGradient id="mecha_armor" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#1E293B" />
            <Stop offset="30%" stopColor="#00E5FF" />
            <Stop offset="70%" stopColor="#0F172A" />
            <Stop offset="100%" stopColor="#090E1A" />
          </LinearGradient>

          {/* Steel Chrome Shaft */}
          <LinearGradient id="chrome_shaft" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#64748B" />
            <Stop offset="30%" stopColor="#F8FAFC" />
            <Stop offset="70%" stopColor="#CBD5E1" />
            <Stop offset="100%" stopColor="#334155" />
          </LinearGradient>

          {/* Neon Glow Accent */}
          <LinearGradient id="neon_accent" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#00FF88" />
            <Stop offset="100%" stopColor="#00E5FF" />
          </LinearGradient>
        </Defs>

        {/* Ergonomic Mecha Tool Body */}
        <Rect x="18" y="0" width="24" height="56" rx="10" fill="url(#mecha_armor)" stroke="#00E5FF" strokeWidth="1.8" />

        {/* Carbon Fiber Grip Panels */}
        <Rect x="16" y="12" width="28" height="4" rx="2" fill="#090E1A" />
        <Rect x="16" y="22" width="28" height="4" rx="2" fill="#090E1A" />
        <Rect x="16" y="32" width="28" height="4" rx="2" fill="#090E1A" />

        {/* Neon Power Line */}
        <Rect x="28" y="8" width="4" height="32" rx="2" fill="url(#neon_accent)" />

        {/* LED Battery Status Lights */}
        <Circle cx="30" cy="46" r="3.2" fill="#00FF88" stroke="#FFFFFF" strokeWidth="0.8" />
        <Circle cx="22" cy="46" r="2" fill="#00E5FF" />
        <Circle cx="38" cy="46" r="2" fill="#00E5FF" />

        {/* Metallic Collar & Precision Rotary Chuck */}
        <Rect x="20" y="56" width="20" height="14" rx="4" fill="#334155" stroke="#94A3B8" strokeWidth="1.2" />
        <Line x1="20" y1="63" x2="40" y2="63" stroke="#64748B" strokeWidth="1" />

        {/* Heavy Steel Drive Shaft */}
        <Rect x="26.5" y="70" width="7" height="28" fill="url(#chrome_shaft)" stroke="#475569" strokeWidth="0.6" />

        {/* Hardened Magnetic Bit Head Tip */}
        <G transform="translate(30, 102)">
          <Polygon points="-4,-6 4,-6 2.5,9 -2.5,9" fill="#F8FAFC" stroke="#475569" strokeWidth="1" />
        </G>
      </Svg>

      {/* Rotating Magnetic Torque Bit Overlay */}
      <Animated.View style={[styles.torqueBitOverlay, bitAnimatedStyle]}>
        <Svg width={28} height={28} viewBox="0 0 28 28">
          <Circle cx="14" cy="14" r="12" fill="none" stroke="#00E5FF" strokeWidth="1.8" strokeDasharray="6 4" />
          <Polygon points="14,2 16.5,9 24,9 18,14 20.5,21 14,16.5 7.5,21 10,14 4,9 11.5,9" fill="none" stroke="#FFD700" strokeWidth="1.2" />
        </Svg>
      </Animated.View>

      {/* Energy Sparks & Unbolting Pulse Effect at Tip */}
      <Animated.View style={[styles.sparkPulseOverlay, sparkAnimatedStyle]}>
        <Svg width={36} height={36} viewBox="0 0 36 36">
          <Circle cx="18" cy="18" r="16" fill="none" stroke="#00FF88" strokeWidth="1.5" opacity="0.8" strokeDasharray="4 6" />
          <Circle cx="18" cy="18" r="10" fill="none" stroke="#FFCC00" strokeWidth="1" opacity="0.6" />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
};

// ----------------------------------------------------
// SCI-FI DETACHABLE PLATE COMPONENT WITH PHYSICS DROP
// ----------------------------------------------------
const SciFiPlateView = ({
  plate,
  screws,
}: {
  plate: PlateItem;
  screws: ScrewItem[];
}) => {
  const dropY = useSharedValue(0);
  const rotateDeg = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (plate.isDetached) {
      dropY.value = withTiming(350, { duration: 550, easing: Easing.in(Easing.quad) });
      rotateDeg.value = withTiming(25, { duration: 550 });
      opacity.value = withTiming(0, { duration: 500 });
    } else {
      dropY.value = 0;
      rotateDeg.value = 0;
      opacity.value = 1;
    }
  }, [plate.isDetached]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: dropY.value },
        { rotate: `${rotateDeg.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  if (opacity.value === 0 && plate.isDetached) return null;

  // Find all screw locations attached to this plate to render countersunk holes
  const plateScrews = screws.filter((s) => plate.screwIds.includes(s.id));

  return (
    <Animated.View
      style={[
        styles.plateView,
        {
          left: plate.x,
          top: plate.y,
          width: plate.width,
          height: plate.height,
          backgroundColor: plate.color,
          borderRadius: plate.borderRadius || 20,
          borderColor: plate.borderColor || "rgba(0, 229, 255, 0.45)",
          zIndex: plate.layer * 2,
        },
        animatedStyle,
      ]}
    >
      {/* Sci-Fi Glass Highlight & Metallic Frame Border */}
      <View style={styles.plateGlassReflection} />
      <View style={styles.plateCornerRivetTL} />
      <View style={styles.plateCornerRivetTR} />
      <View style={styles.plateCornerRivetBL} />
      <View style={styles.plateCornerRivetBR} />

      {/* Render Countersunk Holes at all screw positions on this plate */}
      {plateScrews.map((screw) => {
        const relX = screw.x - plate.x - 22;
        const relY = screw.y - plate.y - 22;

        return (
          <View key={`socket_${screw.id}`} style={{ position: "absolute", left: relX, top: relY }}>
            <CountersunkSocket size={44} />
          </View>
        );
      })}
    </Animated.View>
  );
};

// ----------------------------------------------------
// GENERATE BALANCED & PROCEDURAL LEVELS (1 TO 55)
// ----------------------------------------------------
const PLATE_STYLES = [
  { color: "rgba(16, 185, 129, 0.25)", border: "#10B981" }, // green
  { color: "rgba(139, 92, 246, 0.25)", border: "#8B5CF6" }, // purple
  { color: "rgba(236, 72, 153, 0.25)", border: "#EC4899" }, // pink
  { color: "rgba(6, 182, 212, 0.25)", border: "#06B6D4" },  // cyan
  { color: "rgba(245, 158, 11, 0.25)", border: "#F59E0B" }, // yellow
  { color: "rgba(59, 130, 246, 0.25)", border: "#3B82F6" }, // blue
  { color: "rgba(249, 115, 22, 0.25)", border: "#F97316" }, // orange
];

function pseudoRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function choice<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

const generateLevel = (levelNum: number): LevelData => {
  let plates: PlateItem[] = [];
  let screws: ScrewItem[] = [];

  const rand = pseudoRandom(levelNum * 1000 + 42);
  const colorKeys = Object.keys(SCREW_COLORS);

  if (levelNum === 1) {
    // Level 1: 1 Plate, 3 Screws
    plates = [
      { id: `l${levelNum}_p1`, color: "rgba(6, 182, 212, 0.25)", borderColor: "#00E5FF", x: 35, y: 50, width: 220, height: 160, borderRadius: 24, layer: 0, screwIds: [`l${levelNum}_s1`, `l${levelNum}_s2`, `l${levelNum}_s3`] },
    ];
    screws = [
      { id: `l${levelNum}_s1`, colorId: "green", x: 65, y: 90, layer: 0, plateIds: [`l${levelNum}_p1`] },
      { id: `l${levelNum}_s2`, colorId: "green", x: 225, y: 90, layer: 0, plateIds: [`l${levelNum}_p1`] },
      { id: `l${levelNum}_s3`, colorId: "green", x: 145, y: 170, layer: 0, plateIds: [`l${levelNum}_p1`] },
    ];
  } else if (levelNum === 2) {
    // Level 2: 2 Plates (3 Green, 3 Purple)
    plates = [
      { id: `l${levelNum}_p1`, color: "rgba(16, 185, 129, 0.25)", borderColor: "#10B981", x: 25, y: 30, width: 240, height: 100, borderRadius: 20, layer: 0, screwIds: [`l${levelNum}_s1`, `l${levelNum}_s2`, `l${levelNum}_s3`] },
      { id: `l${levelNum}_p2`, color: "rgba(139, 92, 246, 0.25)", borderColor: "#8B5CF6", x: 25, y: 140, width: 240, height: 100, borderRadius: 20, layer: 0, screwIds: [`l${levelNum}_s4`, `l${levelNum}_s5`, `l${levelNum}_s6`] },
    ];
    screws = [
      { id: `l${levelNum}_s1`, colorId: "green", x: 55, y: 80, layer: 0, plateIds: [`l${levelNum}_p1`] },
      { id: `l${levelNum}_s2`, colorId: "green", x: 145, y: 80, layer: 0, plateIds: [`l${levelNum}_p1`] },
      { id: `l${levelNum}_s3`, colorId: "green", x: 235, y: 80, layer: 0, plateIds: [`l${levelNum}_p1`] },
      { id: `l${levelNum}_s4`, colorId: "purple", x: 55, y: 190, layer: 0, plateIds: [`l${levelNum}_p2`] },
      { id: `l${levelNum}_s5`, colorId: "purple", x: 145, y: 190, layer: 0, plateIds: [`l${levelNum}_p2`] },
      { id: `l${levelNum}_s6`, colorId: "purple", x: 235, y: 190, layer: 0, plateIds: [`l${levelNum}_p2`] },
    ];
  } else {
    // Level 3 & up: Procedural & 100% solvable
    const numPlates = Math.min(6, 2 + Math.floor(levelNum / 8));
    const numColors = Math.min(6, 2 + Math.floor(levelNum / 10));
    const colorsUsed = colorKeys.slice(0, numColors);

    // Layer 0 Base Plate
    const basePlate: PlateItem = {
      id: `l${levelNum}_p0`,
      color: "rgba(15, 23, 42, 0.92)",
      borderColor: "rgba(0, 229, 255, 0.4)",
      x: 35, y: 15, width: 220, height: 250, borderRadius: 32,
      layer: 0,
      screwIds: [],
    };
    plates.push(basePlate);

    const gridCols = 2;
    const gridRows = Math.min(3, Math.max(2, Math.floor((numPlates + 1) / 2)));
    const boxW = 105;
    const boxH = 105;
    const marginX = 25;
    const marginY = 20;
    const gapX = 20;
    const gapY = 15;

    let plateIdx = 1;
    let screwCounter = 1;

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        if (plateIdx > numPlates) break;

        const px = marginX + c * (boxW + gapX);
        const py = marginY + r * (boxH + gapY);
        const style = PLATE_STYLES[(plateIdx - 1) % PLATE_STYLES.length];
        const pId = `l${levelNum}_p${plateIdx}`;
        const pScrews: string[] = [];

        const corners = [
          { x: px + 20, y: py + 20 },
          { x: px + boxW - 20, y: py + 20 },
          { x: px + 20, y: py + boxH - 20 },
          { x: px + boxW - 20, y: py + boxH - 20 },
        ];

        for (const pt of corners) {
          const sId = `l${levelNum}_s${screwCounter++}`;
          const cId = choice(colorsUsed, rand);
          screws.push({
            id: sId,
            colorId: cId,
            x: pt.x,
            y: pt.y,
            layer: 1,
            plateIds: [pId],
          });
          pScrews.push(sId);
        }

        plates.push({
          id: pId,
          color: style.color,
          borderColor: style.border,
          x: px,
          y: py,
          width: boxW,
          height: boxH,
          borderRadius: 20,
          layer: 1,
          screwIds: pScrews,
        });
        plateIdx++;
      }
    }

    // Add Layer 0 Screws under base plate
    const bottomScrewCount = Math.min(6, 2 + Math.floor(levelNum / 5));
    for (let b = 0; b < bottomScrewCount; b++) {
      const bx = marginX + 35 + (b % 2) * 110;
      const by = marginY + 30 + Math.floor(b / 2) * 75;
      const sId = `l${levelNum}_sb${b + 1}`;
      const cId = choice(colorsUsed, rand);

      screws.push({
        id: sId,
        colorId: cId,
        x: bx,
        y: by,
        layer: 0,
        plateIds: [`l${levelNum}_p0`],
      });
      plates[0].screwIds.push(sId);
    }
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
  const [userCoins, setUserCoins] = useState(0);

  // Active Game State
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [boxesQueue, setBoxesQueue] = useState<CollectorBox[]>([]);
  const [screws, setScrews] = useState<ScrewItem[]>([]);
  const [plates, setPlates] = useState<PlateItem[]>([]);
  const [bufferSlots, setBufferSlots] = useState<(ScrewItem | null)[]>([null, null, null, null, null]);

  // Screwdriver Interactive State
  const [activeScrewPos, setActiveScrewPos] = useState<{ x: number; y: number } | null>(null);
  const [isScrewdriverActive, setIsScrewdriverActive] = useState(false);

  // Game Status Modals
  const [isVictoryModalVisible, setIsVictoryModalVisible] = useState(false);
  const [isDefeatModalVisible, setIsDefeatModalVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [showHelp, setShowHelp] = useState(true);

  // Playtime Guard (1 Hour Limit & Rest Cooldown)
  const playtimeGuard = usePlaytimeGuard();

  // Time Limit & Cooldown States
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_LIMIT_SEC);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [isDefeatDueToTimeout, setIsDefeatDueToTimeout] = useState(false);

  // Effective Cooldown (takes maximum of level cooldown or 1-hour rest cooldown)
  const activeCooldownRemaining = Math.max(cooldownRemaining, playtimeGuard.cooldownRemainingSeconds);

  const startCooldown = async (durationSec = COOLDOWN_DURATION_SEC) => {
    const until = Date.now() + durationSec * 1000;
    await AsyncStorage.setItem(STORAGE_KEY_COOLDOWN, until.toString());
    setCooldownRemaining(durationSec);
  };

  const clearCooldown = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY_COOLDOWN);
    setCooldownRemaining(0);
  };

  const checkCooldownState = async () => {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEY_COOLDOWN);
      if (val) {
        const until = parseInt(val, 10);
        const now = Date.now();
        if (until > now) {
          const rem = Math.ceil((until - now) / 1000);
          setCooldownRemaining(rem);
        } else {
          setCooldownRemaining(0);
        }
      } else {
        setCooldownRemaining(0);
      }
    } catch (err) {
      console.error("Failed to read cooldown status", err);
    }
  };

  useEffect(() => {
    checkCooldownState();
    const timer = setInterval(() => {
      checkCooldownState();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Show 50-minute warning alert
  useEffect(() => {
    if (playtimeGuard.isWarning && !playtimeGuard.isWarningShown) {
      Alert.alert(
        "⚠️ Peringatan Waktu Bermain",
        "Anda sudah bermain selama 50 menit hari ini! Dalam 10 menit game akan terkunci untuk waktu istirahat (cooldown).",
        [{ text: "Mengerti" }]
      );
      playtimeGuard.setIsWarningShown(true);
    }
  }, [playtimeGuard.isWarning, playtimeGuard.isWarningShown]);

  // If 1-hour limit is reached while playing, trigger rest modal & exit gameplay
  useEffect(() => {
    if (playtimeGuard.isCooldownActive && isGameStarted) {
      setIsGameStarted(false);
      setIsDefeatModalVisible(true);
      setIsDefeatDueToTimeout(true);
    }
  }, [playtimeGuard.isCooldownActive, isGameStarted]);

  // Gameplay timer tick (ticks both level time and accumulated 1-hour playtime)
  useEffect(() => {
    if (!isGameStarted || isVictoryModalVisible || isDefeatModalVisible || isSettingsModalVisible) {
      return;
    }

    const timer = setInterval(() => {
      playtimeGuard.tickPlaytime(1);
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameStarted, isVictoryModalVisible, isDefeatModalVisible, isSettingsModalVisible, playtimeGuard.tickPlaytime]);

  const handleTimeOut = () => {
    if (soundEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setIsDefeatDueToTimeout(true);
    setIsDefeatModalVisible(true);
    startCooldown(COOLDOWN_DURATION_SEC);
  };

  const triggerDefeat = (isTimeout = false) => {
    if (soundEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setIsDefeatDueToTimeout(isTimeout);
    setIsDefeatModalVisible(true);
    startCooldown(COOLDOWN_DURATION_SEC);
  };

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
    setTimeLeft(GAME_TIME_LIMIT_SEC);
    setIsDefeatDueToTimeout(false);
    setIsVictoryModalVisible(false);
    setIsDefeatModalVisible(false);
    setIsScrewdriverActive(false);
    setActiveScrewPos(null);
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

  // Screw Click Handler with Screwdriver Unbolting Animation
  const handleScrewClick = (screw: ScrewItem) => {
    if (screw.isRemoved || isScrewCovered(screw) || isScrewdriverActive) return;

    if (soundEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Trigger Animated Screwdriver positioning & rotation
    setActiveScrewPos({ x: screw.x, y: screw.y });
    setIsScrewdriverActive(true);

    // After screwdriver 3-phase animation completes (~650ms), execute removal
    setTimeout(() => {
      setIsScrewdriverActive(false);
      processScrewRemoval(screw);
    }, 650);
  };

  const processScrewRemoval = (screw: ScrewItem) => {
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
        triggerDefeat(false);
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
            triggerDefeat(false);
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
    saveGameSession({
      gameId: "screw-spin",
      level: currentLevel,
      score: 100,
      xpEarned: 150,
      coinsEarned: levelData ? levelData.coinsReward : 150,
      completed: true,
    });
    saveGameSession({
      gameId: "screw-spin",
      level: currentLevel,
      score: 100,
      xpEarned: 150,
      coinsEarned: levelData ? levelData.coinsReward : 150,
      completed: true,
    });
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
        <StatusBar barStyle="light-content" backgroundColor="#090E1A" />

        {/* Top Header Buttons */}
        <View style={styles.splashHeader}>
          <GameBackButton bgColor="#006874" borderColor="#006874" bottomBorderColor="#004E57" />

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

          {/* Play / Cooldown Locked Button */}
          <Pressable
            style={({ pressed }) => [
              styles.playButton3D,
              activeCooldownRemaining > 0 && styles.playButtonLocked,
              pressed && activeCooldownRemaining === 0 && styles.playButton3DPressed,
            ]}
            onPress={() => {
              if (activeCooldownRemaining > 0) {
                Alert.alert(
                  "Game Terkunci (Waktu Istirahat)",
                  `Game sedang dalam masa cooldown istirahat (${formatTimeSeconds(activeCooldownRemaining)}). Silakan istirahat sejenak atau reset di menu Pengaturan.`,
                  [{ text: "OK" }]
                );
                return;
              }
              handleStartGame();
            }}
          >
            {activeCooldownRemaining > 0 ? (
              <View style={styles.lockedBtnRow}>
                <Ionicons name="lock-closed" size={20} color="#FFFFFF" />
                <Text style={styles.playButtonTextLocked}>
                  LOCKED ({formatTimeSeconds(activeCooldownRemaining)})
                </Text>
              </View>
            ) : (
              <Text style={styles.playButtonText}>PLAY</Text>
            )}
          </Pressable>

          {/* Reset progress note */}
          <Pressable onPress={handleResetProgress} style={styles.resetFooter}>
            <Text style={styles.resetFooterText}>Hold here to reset level progress only</Text>
          </Pressable>
        </View>

        <HowToPlayModal
          visible={showHelp}
          onClose={() => setShowHelp(false)}
          title="Cara Main Screw Spin"
          goal="Buka semua baut dari papan dan masukkan ke kotak kolektor yang warnanya sesuai!"
          accentColor="#7C3AED"
          subtitleColor="#6D28D9"
          steps={[
            { emoji: "1️⃣", text: "Ketuk baut di papan untuk mengambilnya." },
            { emoji: "2️⃣", text: "Baut yang warnanya cocok dengan kotak aktif akan langsung terisi." },
            { emoji: "3️⃣", text: "Kalau warnanya tidak cocok, baut masuk ke slot buffer (penampung)." },
            { emoji: "4️⃣", text: "Jangan sampai buffer penuh — kalau penuh dan tidak ada kotak cocok, kamu kalah!" },
          ]}
          tips={[
            "Perhatikan warna kotak aktif yang terlihat sebelum mengambil baut.",
            "Urutan baut itu penting — susun strategi agar buffer tidak cepat penuh.",
          ]}
        />
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------
  // RENDER GAMEPLAY SCREEN
  // ----------------------------------------------------
  return (
    <SafeAreaView style={styles.gameContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#090E1A" />

      {/* Outer Purple/Sci-Fi Frame Layout */}
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

          {/* Sci-Fi Neon Time Limit HUD */}
          <View
            style={[
              styles.headerTimerContainer,
              timeLeft <= 10 && styles.headerTimerDanger,
              timeLeft <= 30 && timeLeft > 10 && styles.headerTimerWarning,
            ]}
          >
            <Ionicons
              name={timeLeft <= 10 ? "alert-circle" : "time-outline"}
              size={16}
              color={timeLeft <= 10 ? "#FF4081" : timeLeft <= 30 ? "#F59E0B" : "#00E5FF"}
            />
            <Text
              style={[
                styles.headerTimerText,
                timeLeft <= 10 && { color: "#FF4081" },
                timeLeft <= 30 && timeLeft > 10 && { color: "#F59E0B" },
              ]}
            >
              {formatTimeSeconds(timeLeft)}
            </Text>
          </View>

          <View style={styles.headerRightGroup}>
            <Pressable
              style={({ pressed }) => [styles.smallSquareBtn, pressed && styles.btnPressed]}
              onPress={() => setShowHelp(true)}
            >
              <Ionicons name="help-circle-sharp" size={20} color="#FFFFFF" />
            </Pressable>

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

        {/* Top Area: Active Collector Boxes (Robotic Energy Modules) */}
        <View style={styles.boxesArea}>
          {activeBoxes.map((box) => {
            const colorDef = SCREW_COLORS[box.colorId] || SCREW_COLORS.green;
            return (
              <View key={box.id} style={[styles.collectorBoxContainer, { borderColor: colorDef.glow }]}>
                <View style={styles.collectorBoxInner}>
                  <View style={styles.socketsRow}>
                    {Array.from({ length: box.requiredCount }).map((_, idx) => {
                      const isFilled = idx < box.currentCount;
                      return (
                        <View
                          key={idx}
                          style={[
                            styles.collectorSocketSlot,
                            { borderColor: isFilled ? colorDef.glow : "rgba(0, 229, 255, 0.25)" },
                          ]}
                        >
                          {isFilled ? (
                            <MetallicScrewHead colorId={box.colorId} size={28} />
                          ) : (
                            <View style={styles.emptySocketSlotInner}>
                              <Ionicons name="add" size={12} color="rgba(0, 229, 255, 0.3)" />
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Middle Buffer Row (5 Electromagnetic Dock Slots) */}
        <View style={styles.bufferArea}>
          {bufferSlots.map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.bufferSlotCircle,
                item && { borderColor: (SCREW_COLORS[item.colorId] || SCREW_COLORS.green).glow },
              ]}
            >
              {item ? (
                <MetallicScrewHead colorId={item.colorId} size={38} />
              ) : (
                <View style={styles.bufferSlotEmpty}>
                  <Text style={styles.bufferSlotNumber}>{idx + 1}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Main Game Board (Sci-Fi Metallic Grid & Plates) */}
        <View style={styles.boardArea}>
          <View style={styles.boardSurface}>
            {/* Render Sci-Fi Detachable Plates (Sorted by Layer) */}
            {plates
              .slice()
              .sort((a, b) => a.layer - b.layer)
              .map((plate) => (
                <SciFiPlateView key={`lvl_${currentLevel}_${plate.id}`} plate={plate} screws={screws} />
              ))}

            {/* Render 3D Realistic Metallic Screws */}
            {screws.map((screw) => {
              if (screw.isRemoved) return null;
              const covered = isScrewCovered(screw);

              return (
                <Pressable
                  key={`lvl_${currentLevel}_${screw.id}`}
                  style={({ pressed }) => [
                    styles.screwWrapper,
                    {
                      left: screw.x - 24,
                      top: screw.y - 24,
                      opacity: covered ? 0.35 : 1,
                      zIndex: covered ? screw.layer * 2 + 1 : screw.layer * 2 + 10,
                    },
                    pressed && !covered && { transform: [{ scale: 0.9 }] },
                  ]}
                  onPress={() => handleScrewClick(screw)}
                >
                  <MetallicScrewHead colorId={screw.colorId} size={48} />
                </Pressable>
              );
            })}

            {/* Interactive Screwdriver Tool Overlay */}
            {activeScrewPos && (
              <SciFiMechaScrewdriver
                x={activeScrewPos.x}
                y={activeScrewPos.y}
                visible={isScrewdriverActive}
              />
            )}
          </View>
        </View>
      </View>

      {/* VICTORY / MISSION COMPLETED MODAL */}
      <Modal visible={isVictoryModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.victoryCardContainer}>
            {/* Header Tag & Title */}
            <Text style={styles.missionTagText}>MISSION COMPLETED</Text>
            <Text style={styles.victoryTitleText}>
              LEVEL {String(currentLevel).padStart(2, "0")} CLEARED!
            </Text>
            <Text style={styles.victorySubText}>
              Rute Sirkuit Baut Logam: Level {currentLevel} → Selesai!
            </Text>

            {/* Main Content Area */}
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
                    <Text style={styles.checkText}>Melepaskan seluruh baut (100%)</Text>
                  </View>
                  <View style={styles.checkItem}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.checkText}>Soket cadangan bebas penuh</Text>
                  </View>
                  <View style={styles.checkItem}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.checkText}>Urutan Tepat (+Bonus)</Text>
                  </View>
                </View>

                {/* Loot Breakdown */}
                <View style={styles.lootDivider} />
                <View style={styles.lootRow}>
                  <Text style={styles.lootLabel}>Loot Baut Terkumpul:</Text>
                  <Text style={styles.lootValue}>+{levelData?.coinsReward || 100} Koin</Text>
                </View>
                <View style={styles.lootRow}>
                  <Text style={styles.lootLabel}>Bonus Kombinasi Warna:</Text>
                  <Text style={styles.lootValue}>+36 Koin</Text>
                </View>
                <View style={[styles.lootRow, { marginTop: 6 }]}>
                  <Text style={styles.totalLabel}>TOTAL KOIN / XP:</Text>
                  <Text style={styles.totalValue}>{(levelData?.coinsReward || 100) + 36} KOIN</Text>
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
                          stroke="rgba(0, 229, 255, 0.3)"
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
                        <Line key={i} x1={100} y1={100} x2={endX} y2={endY} stroke="rgba(0, 229, 255, 0.3)" strokeWidth="1" />
                      );
                    })}

                    {/* Polygon Fill */}
                    {(() => {
                      const vals = [0.85, 0.75, 0.9, 0.8, 0.7];
                      const pts = vals.map((val, i) => {
                        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                        const x = 100 + 55 * val * Math.cos(angle);
                        const y = 100 + 55 * val * Math.sin(angle);
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      }).join(" ");

                      return (
                        <Polygon
                          points={pts}
                          fill="rgba(139, 92, 246, 0.45)"
                          stroke="#A78BFA"
                          strokeWidth="2.5"
                        />
                      );
                    })()}

                    {/* Data Node Dots */}
                    {[0, 1, 2, 3, 4].map((i) => {
                      const vals = [0.85, 0.75, 0.9, 0.8, 0.7];
                      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                      const x = 100 + 55 * vals[i] * Math.cos(angle);
                      const y = 100 + 55 * vals[i] * Math.sin(angle);
                      return <Circle key={i} cx={x} cy={y} r="3.5" fill="#FFFFFF" stroke="#A78BFA" strokeWidth="1.5" />;
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
                onPress={() => {
                  setIsVictoryModalVisible(false);
                  setIsGameStarted(false);
                }}
              >
                <Text style={styles.backToMapText}>Kembali Ke Menu Utama</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.continueBtn, pressed && styles.btnPressed]}
                onPress={handleNextLevel}
              >
                <Text style={styles.continueText}>Lanjut Level →</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* DEFEAT / REST COOLDOWN MODAL */}
      <Modal visible={isDefeatModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons
              name={playtimeGuard.isCooldownActive ? "moon" : isDefeatDueToTimeout ? "time" : "alert-circle-sharp"}
              size={60}
              color="#FF4081"
            />
            <Text style={[styles.modalTitleText, { color: "#FF4081" }]}>
              {playtimeGuard.isCooldownActive
                ? "SAATNYA BERISTIRAHAT!"
                : isDefeatDueToTimeout
                ? "WAKTU HABIS!"
                : "LUBANG PENAMPUNG PENUH!"}
            </Text>
            <Text style={styles.modalSubText}>
              {playtimeGuard.isCooldownActive
                ? "Batas waktu bermain 1 jam telah terlampaui. Saatnya mengistirahatkan mata dan tubuh sejenak!"
                : isDefeatDueToTimeout
                ? "Batas waktu 90 detik telah berakhir. Game terkunci untuk masa cooldown."
                : "Semua 5 lubang cadangan telah terisi dan tidak ada tempat untuk baut lagi."}
            </Text>

            {activeCooldownRemaining > 0 && (
              <View style={styles.cooldownModalBadge}>
                <Ionicons name="lock-closed" size={14} color="#FFD700" />
                <Text style={styles.cooldownModalBadgeText}>
                  Cooldown Istirahat: {formatTimeSeconds(activeCooldownRemaining)}
                </Text>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [styles.modalPrimaryBtn, { backgroundColor: "#FF4081", marginTop: 12 }, pressed && styles.btnPressed]}
              onPress={() => {
                setIsDefeatModalVisible(false);
                setIsGameStarted(false);
              }}
            >
              <Text style={styles.modalPrimaryBtnText}>KEMBALI KE MENU</Text>
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

            {/* Parent Playtime & Cooldown Reset Button */}
            <Pressable
              style={[styles.settingRow, { borderColor: "rgba(0, 229, 255, 0.4)" }]}
              onPress={async () => {
                await playtimeGuard.resetPlaytimeGuard();
                await clearCooldown();
                Alert.alert("Reset Berhasil", "Waktu bermain 1 jam & status cooldown telah di-reset oleh Orang Tua.");
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: "#00E5FF", fontWeight: "700" }]}>
                  Reset Waktu Bermain (Orang Tua)
                </Text>
                <Text style={{ fontSize: 11, color: "#94A3B8" }}>
                  Main Hari Ini: {formatDurationHMS(playtimeGuard.playtimeSeconds)} / 1 Jam
                </Text>
              </View>
              <Ionicons name="shield-checkmark" size={26} color="#00E5FF" />
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

      <HowToPlayModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title="Cara Main Screw Spin"
        goal="Buka semua baut dari papan dan masukkan ke kotak kolektor yang warnanya sesuai!"
        accentColor="#7C3AED"
        subtitleColor="#6D28D9"
        steps={[
          { emoji: "1️⃣", text: "Ketuk baut di papan untuk mengambilnya." },
          { emoji: "2️⃣", text: "Baut yang warnanya cocok dengan kotak aktif akan langsung terisi." },
          { emoji: "3️⃣", text: "Kalau warnanya tidak cocok, baut masuk ke slot buffer (penampung)." },
          { emoji: "4️⃣", text: "Jangan sampai buffer penuh — kalau penuh dan tidak ada kotak cocok, kamu kalah!" },
        ]}
        tips={[
          "Perhatikan warna kotak aktif yang terlihat sebelum mengambil baut.",
          "Urutan baut itu penting — susun strategi agar buffer tidak cepat penuh.",
        ]}
      />
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

  // Game Play Screen Layout
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

  // Top Collector Boxes (Robotic Energy Modules)
  boxesArea: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  collectorBoxContainer: {
    width: 120,
    height: 94,
    borderRadius: 22,
    backgroundColor: "rgba(11, 19, 43, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    elevation: 8,
    borderWidth: 2,
    shadowColor: "#00F0FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: "hidden",
  },
  collectorBoxInner: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  socketsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    maxWidth: 88,
  },
  collectorSocketSlot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(11, 19, 43, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  emptySocketSlotInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#050811",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.15)",
  },

  // Middle Buffer Row (High-Tech Electromagnetic Dock Ports)
  bufferArea: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(11, 19, 43, 0.85)",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "rgba(0, 229, 255, 0.3)",
    elevation: 4,
  },
  bufferSlotCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0B132B",
    borderWidth: 2,
    borderColor: "rgba(0, 229, 255, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  bufferSlotEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.2)",
  },
  bufferSlotNumber: {
    color: "rgba(0, 229, 255, 0.4)",
    fontSize: 11,
    fontWeight: "800",
  },

  // Main Game Board (Sci-Fi Grid Surface)
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
    overflow: "hidden",
    shadowColor: "#00F0FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  plateGlassReflection: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  plateCornerRivetTL: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#475569",
    borderWidth: 0.8,
    borderColor: "#94A3B8",
  },
  plateCornerRivetTR: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#475569",
    borderWidth: 0.8,
    borderColor: "#94A3B8",
  },
  plateCornerRivetBL: {
    position: "absolute",
    bottom: 6,
    left: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#475569",
    borderWidth: 0.8,
    borderColor: "#94A3B8",
  },
  plateCornerRivetBR: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#475569",
    borderWidth: 0.8,
    borderColor: "#94A3B8",
  },
  screwWrapper: {
    position: "absolute",
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  screwdriverContainer: {
    position: "absolute",
    width: 60,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
  torqueBitOverlay: {
    position: "absolute",
    bottom: 8,
  },
  sparkPulseOverlay: {
    position: "absolute",
    bottom: 4,
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

  // Victory / Mission Completed Popup Styles
  victoryCardContainer: {
    width: Math.min(SCREEN_WIDTH - 20, 520),
    backgroundColor: "#0B132B",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(0, 229, 255, 0.4)",
    padding: 16,
    alignItems: "center",
    elevation: 12,
    shadowColor: "#00F0FF",
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
    color: "#00FF88",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1.5,
    textAlign: "center",
    textShadowColor: "#00E5FF",
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
    borderColor: "rgba(0, 229, 255, 0.2)",
    padding: 12,
  },
  victoryRightCol: {
    flex: 1,
    minWidth: 210,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.2)",
    padding: 12,
    alignItems: "center",
  },
  columnTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#00F0FF",
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
    backgroundColor: "#00E5FF",
    alignItems: "center",
    elevation: 4,
  },
  continueText: {
    color: "#0F172A",
    fontSize: 11,
    fontWeight: "900",
  },
  playButtonLocked: {
    backgroundColor: "#DC2626",
    borderColor: "#EF4444",
  },
  lockedBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playButtonTextLocked: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  headerTimerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0, 229, 255, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.3)",
  },
  headerTimerWarning: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderColor: "rgba(245, 158, 11, 0.4)",
  },
  headerTimerDanger: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderColor: "#EF4444",
  },
  headerTimerText: {
    color: "#00E5FF",
    fontSize: 15,
    fontWeight: "800",
  },
  cooldownModalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    borderColor: "rgba(255, 215, 0, 0.4)",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginVertical: 8,
  },
  cooldownModalBadgeText: {
    color: "#FFD700",
    fontSize: 13,
    fontWeight: "800",
  },
});
