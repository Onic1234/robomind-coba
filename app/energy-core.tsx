import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  Modal,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  cancelAnimation,
} from "react-native-reanimated";
import Svg, { Path, Rect, Circle, G } from "react-native-svg";
import { SPACING } from "../constants/Theme";
import Button from "../components/ui/Button";

const STORAGE_KEY_COINS = "user_coins_balance";
const STORAGE_KEY_LEVEL = "energy_core_current_level";
const STORAGE_KEY_EVOLUTION = "robomind_robot_evolution";

const playRotateSound = () => {
  if (Platform.OS !== "web") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(740, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {}
};

const playVictorySound = () => {
  if (Platform.OS !== "web") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.09);
      gain.gain.setValueAtTime(0.22, ctx.currentTime + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.09);
      osc.stop(ctx.currentTime + i * 0.09 + 0.28);
    });
  } catch {}
};

type Port = "UP" | "RIGHT" | "DOWN" | "LEFT";
type CellType = "SOURCE" | "STRAIGHT" | "CORNER" | "TJUNC" | "CROSS" | "NODE";
type EnergyType = "LOGIC" | "MATH" | "CREATIVITY" | "LITERACY" | "MORAL";

interface GridCell {
  id: string;
  gridX: number;
  gridY: number;
  type: CellType;
  name: string;
  energyType: EnergyType;
  basePorts?: Port[];
  rotation: number;
  locked?: boolean;
}

interface LevelConfig {
  level: number;
  title: string;
  tip: string;
  gridWidth: number;
  gridHeight: number;
  rewardCoins: number;
  rewardXP: number;
  par: number;
  cells: GridCell[];
}

const ENERGY_COLORS: Record<EnergyType, { name: string; color: string; glow: string; xpType: string }> = {
  LOGIC: { name: "Energi Logika", color: "#00E5FF", glow: "rgba(0, 229, 255, 0.45)", xpType: "Logic XP" },
  MATH: { name: "Energi Matematika", color: "#10B981", glow: "rgba(16, 185, 129, 0.45)", xpType: "Math XP" },
  CREATIVITY: { name: "Energi Kreativitas", color: "#F59E0B", glow: "rgba(245, 158, 11, 0.45)", xpType: "Creativity XP" },
  LITERACY: { name: "Energi Literasi", color: "#A855F7", glow: "rgba(168, 85, 247, 0.45)", xpType: "Literacy XP" },
  MORAL: { name: "Energi Moral & Empati", color: "#EF4444", glow: "rgba(239, 68, 68, 0.45)", xpType: "Moral XP" },
};

const LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: "Sirkuit Pemula",
    tip: "Putar kabel pipa agar listrik mengalir dari reaktor sampai ke baterai.",
    gridWidth: 4,
    gridHeight: 2,
    rewardCoins: 40,
    rewardXP: 15,
    par: 2,
    cells: [
      { id: "s1", gridX: 0, gridY: 0, type: "SOURCE", name: "AI Core", basePorts: ["RIGHT"], energyType: "LOGIC", rotation: 0, locked: true },
      { id: "w1", gridX: 1, gridY: 0, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 0 },
      { id: "w2", gridX: 2, gridY: 0, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 0 },
      { id: "n1", gridX: 3, gridY: 0, type: "NODE", name: "Battery Core", basePorts: ["LEFT"], energyType: "LOGIC", rotation: 0, locked: true },
    ],
  },
  {
    level: 2,
    title: "Belokan Daya",
    tip: "Kabel siku memutar arah aliran. Sambungkan ke CPU Chip.",
    gridWidth: 3,
    gridHeight: 3,
    rewardCoins: 60,
    rewardXP: 20,
    par: 3,
    cells: [
      { id: "s1", gridX: 0, gridY: 2, type: "SOURCE", name: "Power Source", basePorts: ["UP"], energyType: "LOGIC", rotation: 0, locked: true },
      { id: "w1", gridX: 0, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 90 },
      { id: "c1", gridX: 0, gridY: 0, type: "CORNER", name: "Jalur Sirkuit", energyType: "LOGIC", rotation: 0 },
      { id: "w2", gridX: 1, gridY: 0, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 0 },
      { id: "n1", gridX: 2, gridY: 0, type: "NODE", name: "CPU Chip", basePorts: ["LEFT"], energyType: "LOGIC", rotation: 0, locked: true },
    ],
  },
  {
    level: 3,
    title: "Distributor Daya",
    tip: "Distributor T bisa membagi aliran ke dua arah sekaligus.",
    gridWidth: 4,
    gridHeight: 4,
    rewardCoins: 90,
    rewardXP: 30,
    par: 3,
    cells: [
      { id: "s1", gridX: 1, gridY: 0, type: "SOURCE", name: "Math Power Core", basePorts: ["DOWN"], energyType: "MATH", rotation: 0, locked: true },
      { id: "tj", gridX: 1, gridY: 1, type: "TJUNC", name: "Distributor Daya", energyType: "MATH", rotation: 0 },
      { id: "w1", gridX: 1, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 90 },
      { id: "n1", gridX: 1, gridY: 3, type: "NODE", name: "Servo Motor", basePorts: ["UP"], energyType: "MATH", rotation: 0, locked: true },
      { id: "w2", gridX: 2, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 0 },
      { id: "n2", gridX: 3, gridY: 1, type: "NODE", name: "Battery Core", basePorts: ["LEFT"], energyType: "MATH", rotation: 0, locked: true },
    ],
  },
  {
    level: 4,
    title: "Jalur Distributor AI",
    tip: "Kombinasi siku dan distributor. Rangkai jaringan hingga dua inti menyala.",
    gridWidth: 4,
    gridHeight: 4,
    rewardCoins: 120,
    rewardXP: 40,
    par: 7,
    cells: [
      { id: "s1", gridX: 0, gridY: 3, type: "SOURCE", name: "Math Source", basePorts: ["UP"], energyType: "MATH", rotation: 0, locked: true },
      { id: "w1", gridX: 0, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 90 },
      { id: "w2", gridX: 0, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 90 },
      { id: "c1", gridX: 0, gridY: 0, type: "CORNER", name: "Jalur Sirkuit", energyType: "MATH", rotation: 0 },
      { id: "w3", gridX: 1, gridY: 0, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 0 },
      { id: "tj", gridX: 2, gridY: 0, type: "TJUNC", name: "Distributor Daya", energyType: "MATH", rotation: 0 },
      { id: "n1", gridX: 3, gridY: 0, type: "NODE", name: "Neural Processor", basePorts: ["LEFT"], energyType: "MATH", rotation: 0, locked: true },
      { id: "w4", gridX: 2, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 90 },
      { id: "w5", gridX: 2, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 0 },
      { id: "n2", gridX: 2, gridY: 3, type: "NODE", name: "Energy Crystal", basePorts: ["UP"], energyType: "MATH", rotation: 0, locked: true },
    ],
  },
  {
    level: 5,
    title: "Sirkuit Ganda",
    tip: "Dua jaringan terpisah harus menyala sekaligus. Kerjakan satu per satu!",
    gridWidth: 4,
    gridHeight: 4,
    rewardCoins: 150,
    rewardXP: 50,
    par: 4,
    cells: [
      { id: "sa", gridX: 0, gridY: 0, type: "SOURCE", name: "Creativity Core", basePorts: ["RIGHT"], energyType: "CREATIVITY", rotation: 0, locked: true },
      { id: "wa1", gridX: 1, gridY: 0, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 0 },
      { id: "wa2", gridX: 2, gridY: 0, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 0 },
      { id: "na", gridX: 3, gridY: 0, type: "NODE", name: "AI Core", basePorts: ["LEFT"], energyType: "CREATIVITY", rotation: 0, locked: true },
      { id: "sb", gridX: 0, gridY: 3, type: "SOURCE", name: "Moral Power Core", basePorts: ["RIGHT"], energyType: "MORAL", rotation: 0, locked: true },
      { id: "wb1", gridX: 1, gridY: 3, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MORAL", rotation: 0 },
      { id: "wb2", gridX: 2, gridY: 3, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MORAL", rotation: 0 },
      { id: "nb", gridX: 3, gridY: 3, type: "NODE", name: "Energy Crystal", basePorts: ["LEFT"], energyType: "MORAL", rotation: 0, locked: true },
    ],
  },
  {
    level: 6,
    title: "Jaringan Quantum",
    tip: "Jaringan silang bisa membagi energi ke semua arah. Lengkapi dua jalur menuju hub.",
    gridWidth: 4,
    gridHeight: 4,
    rewardCoins: 200,
    rewardXP: 60,
    par: 6,
    cells: [
      { id: "s1", gridX: 1, gridY: 0, type: "SOURCE", name: "Quantum Source", basePorts: ["DOWN"], energyType: "LITERACY", rotation: 0, locked: true },
      { id: "x1", gridX: 1, gridY: 1, type: "CROSS", name: "Jaringan Silang", energyType: "LITERACY", rotation: 0, locked: true },
      { id: "w1", gridX: 2, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LITERACY", rotation: 0 },
      { id: "c1", gridX: 3, gridY: 1, type: "CORNER", name: "Jalur Sirkuit", energyType: "LITERACY", rotation: 0 },
      { id: "w2", gridX: 3, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LITERACY", rotation: 90 },
      { id: "n1", gridX: 3, gridY: 3, type: "NODE", name: "Satellite Node", basePorts: ["UP"], energyType: "LITERACY", rotation: 0, locked: true },
      { id: "w3", gridX: 1, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LITERACY", rotation: 90 },
      { id: "c2", gridX: 1, gridY: 3, type: "CORNER", name: "Jalur Sirkuit", energyType: "LITERACY", rotation: 90 },
      { id: "n2", gridX: 2, gridY: 3, type: "NODE", name: "Quantum Hub", basePorts: ["LEFT"], energyType: "LITERACY", rotation: 0, locked: true },
    ],
  },
  {
    level: 7,
    title: "Sirkuit Bercabang",
    tip: "Distributor T membagi aliran ke baterai dan servo.",
    gridWidth: 4,
    gridHeight: 4,
    rewardCoins: 220,
    rewardXP: 65,
    par: 4,
    cells: [
      { id: "s1", gridX: 0, gridY: 0, type: "SOURCE", name: "AI Core", basePorts: ["RIGHT"], energyType: "LOGIC", rotation: 0, locked: true },
      { id: "w1", gridX: 1, gridY: 0, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 0 },
      { id: "tj", gridX: 2, gridY: 0, type: "TJUNC", name: "Distributor Daya", energyType: "LOGIC", rotation: 90 },
      { id: "n1", gridX: 3, gridY: 0, type: "NODE", name: "Battery Core", basePorts: ["LEFT"], energyType: "LOGIC", rotation: 0, locked: true },
      { id: "w2", gridX: 2, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 90 },
      { id: "w3", gridX: 2, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 90 },
      { id: "n2", gridX: 2, gridY: 3, type: "NODE", name: "Servo Motor", basePorts: ["UP"], energyType: "LOGIC", rotation: 0, locked: true },
    ],
  },
  {
    level: 8,
    title: "Jalur Zigzag",
    tip: "Sambungkan jalur berliku dengan siku dan distributor.",
    gridWidth: 5,
    gridHeight: 5,
    rewardCoins: 240,
    rewardXP: 70,
    par: 8,
    cells: [
      { id: "s1", gridX: 0, gridY: 0, type: "SOURCE", name: "Power Source", basePorts: ["RIGHT"], energyType: "LOGIC", rotation: 0, locked: true },
      { id: "w1", gridX: 1, gridY: 0, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 0 },
      { id: "c1", gridX: 2, gridY: 0, type: "CORNER", name: "Jalur Sirkuit", energyType: "LOGIC", rotation: 90 },
      { id: "w2", gridX: 2, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 90 },
      { id: "tj", gridX: 2, gridY: 2, type: "TJUNC", name: "Distributor Daya", energyType: "LOGIC", rotation: 180 },
      { id: "w3", gridX: 2, gridY: 3, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 90 },
      { id: "n1", gridX: 2, gridY: 4, type: "NODE", name: "CPU Chip", basePorts: ["UP"], energyType: "LOGIC", rotation: 0, locked: true },
      { id: "w4", gridX: 3, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 0 },
      { id: "c2", gridX: 4, gridY: 2, type: "CORNER", name: "Jalur Sirkuit", energyType: "LOGIC", rotation: 90 },
      { id: "w5", gridX: 4, gridY: 3, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 90 },
      { id: "n2", gridX: 4, gridY: 4, type: "NODE", name: "Memory Chip", basePorts: ["UP"], energyType: "LOGIC", rotation: 0, locked: true },
    ],
  },
  {
    level: 9,
    title: "Trifurka Daya",
    tip: "Dua distributor menyebar energi ke tiga inti.",
    gridWidth: 6,
    gridHeight: 4,
    rewardCoins: 260,
    rewardXP: 75,
    par: 5,
    cells: [
      { id: "s1", gridX: 1, gridY: 0, type: "SOURCE", name: "Math Power Core", basePorts: ["DOWN"], energyType: "MATH", rotation: 0, locked: true },
      { id: "tj1", gridX: 1, gridY: 1, type: "TJUNC", name: "Distributor Daya", energyType: "MATH", rotation: 180 },
      { id: "w1", gridX: 1, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 90 },
      { id: "n1", gridX: 1, gridY: 3, type: "NODE", name: "Servo Motor", basePorts: ["UP"], energyType: "MATH", rotation: 0, locked: true },
      { id: "w2", gridX: 2, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 0 },
      { id: "tj2", gridX: 3, gridY: 1, type: "TJUNC", name: "Distributor Daya", energyType: "MATH", rotation: 90 },
      { id: "n2", gridX: 3, gridY: 0, type: "NODE", name: "Neural Processor", basePorts: ["DOWN"], energyType: "MATH", rotation: 0, locked: true },
      { id: "w3", gridX: 4, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 0 },
      { id: "n3", gridX: 5, gridY: 1, type: "NODE", name: "Battery Core", basePorts: ["LEFT"], energyType: "MATH", rotation: 0, locked: true },
    ],
  },
  {
    level: 10,
    title: "Dua Jaringan",
    tip: "Dua sumber dengan jalurnya masing-masing harus menyala.",
    gridWidth: 4,
    gridHeight: 5,
    rewardCoins: 280,
    rewardXP: 80,
    par: 7,
    cells: [
      { id: "sa", gridX: 0, gridY: 0, type: "SOURCE", name: "Creativity Core", basePorts: ["RIGHT"], energyType: "CREATIVITY", rotation: 0, locked: true },
      { id: "wa1", gridX: 1, gridY: 0, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 0 },
      { id: "wa2", gridX: 2, gridY: 0, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 0 },
      { id: "ca", gridX: 3, gridY: 0, type: "CORNER", name: "Jalur Sirkuit", energyType: "CREATIVITY", rotation: 90 },
      { id: "wa3", gridX: 3, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 90 },
      { id: "na", gridX: 3, gridY: 2, type: "NODE", name: "AI Core", basePorts: ["UP"], energyType: "CREATIVITY", rotation: 0, locked: true },
      { id: "sb", gridX: 3, gridY: 4, type: "SOURCE", name: "Moral Power Core", basePorts: ["LEFT"], energyType: "MORAL", rotation: 0, locked: true },
      { id: "wb1", gridX: 2, gridY: 4, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 0 },
      { id: "cb", gridX: 1, gridY: 4, type: "CORNER", name: "Jalur Sirkuit", energyType: "CREATIVITY", rotation: 90 },
      { id: "wb2", gridX: 1, gridY: 3, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 0 },
      { id: "wb3", gridX: 1, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 90 },
      { id: "nb", gridX: 1, gridY: 1, type: "NODE", name: "Energy Crystal", basePorts: ["DOWN"], energyType: "CREATIVITY", rotation: 0, locked: true },
    ],
  },
  {
    level: 11,
    title: "Rangkaian Silang",
    tip: "Jaringan silang membagi energi ke tiga arah.",
    gridWidth: 6,
    gridHeight: 5,
    rewardCoins: 300,
    rewardXP: 85,
    par: 8,
    cells: [
      { id: "s1", gridX: 1, gridY: 0, type: "SOURCE", name: "Quantum Source", basePorts: ["DOWN"], energyType: "LITERACY", rotation: 0, locked: true },
      { id: "x1", gridX: 1, gridY: 1, type: "CROSS", name: "Jaringan Silang", energyType: "LITERACY", rotation: 0, locked: true },
      { id: "w1", gridX: 2, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LITERACY", rotation: 0 },
      { id: "c1", gridX: 3, gridY: 1, type: "CORNER", name: "Jalur Sirkuit", energyType: "LITERACY", rotation: 90 },
      { id: "w2", gridX: 3, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LITERACY", rotation: 90 },
      { id: "w7", gridX: 3, gridY: 3, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LITERACY", rotation: 90 },
      { id: "n1", gridX: 3, gridY: 4, type: "NODE", name: "Satellite Node", basePorts: ["UP"], energyType: "LITERACY", rotation: 0, locked: true },
      { id: "w3", gridX: 1, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LITERACY", rotation: 90 },
      { id: "w5", gridX: 1, gridY: 3, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LITERACY", rotation: 90 },
      { id: "c2", gridX: 1, gridY: 4, type: "CORNER", name: "Jalur Sirkuit", energyType: "LITERACY", rotation: 90 },
      { id: "n2", gridX: 0, gridY: 4, type: "NODE", name: "Quantum Hub", basePorts: ["RIGHT"], energyType: "LITERACY", rotation: 0, locked: true },
    ],
  },
  {
    level: 12,
    title: "Ular Listrik",
    tip: "Jalur panjang berliku sampai ke ujung papan.",
    gridWidth: 6,
    gridHeight: 5,
    rewardCoins: 320,
    rewardXP: 90,
    par: 10,
    cells: [
      { id: "s1", gridX: 0, gridY: 0, type: "SOURCE", name: "AI Core", basePorts: ["RIGHT"], energyType: "LOGIC", rotation: 0, locked: true },
      { id: "w1", gridX: 1, gridY: 0, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 0 },
      { id: "c1", gridX: 2, gridY: 0, type: "CORNER", name: "Jalur Sirkuit", energyType: "LOGIC", rotation: 90 },
      { id: "w2", gridX: 2, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 90 },
      { id: "c2", gridX: 2, gridY: 2, type: "CORNER", name: "Jalur Sirkuit", energyType: "LOGIC", rotation: 90 },
      { id: "w3", gridX: 3, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 0 },
      { id: "c3", gridX: 4, gridY: 2, type: "CORNER", name: "Jalur Sirkuit", energyType: "LOGIC", rotation: 90 },
      { id: "w4", gridX: 4, gridY: 3, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 90 },
      { id: "c4", gridX: 4, gridY: 4, type: "CORNER", name: "Jalur Sirkuit", energyType: "LOGIC", rotation: 180 },
      { id: "w5", gridX: 3, gridY: 4, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 0 },
      { id: "w6", gridX: 2, gridY: 4, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 0 },
      { id: "n1", gridX: 1, gridY: 4, type: "NODE", name: "Battery Core", basePorts: ["RIGHT"], energyType: "LOGIC", rotation: 0, locked: true },
    ],
  },
  {
    level: 13,
    title: "Distributor Ganda",
    tip: "Dua distributor membagi aliran ke tiga inti.",
    gridWidth: 6,
    gridHeight: 6,
    rewardCoins: 340,
    rewardXP: 95,
    par: 7,
    cells: [
      { id: "s1", gridX: 0, gridY: 2, type: "SOURCE", name: "Math Source", basePorts: ["RIGHT"], energyType: "MATH", rotation: 0, locked: true },
      { id: "w1", gridX: 1, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 0 },
      { id: "tj1", gridX: 2, gridY: 2, type: "TJUNC", name: "Distributor Daya", energyType: "MATH", rotation: 90 },
      { id: "w4", gridX: 3, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 0 },
      { id: "n1", gridX: 4, gridY: 2, type: "NODE", name: "Servo Motor", basePorts: ["LEFT"], energyType: "MATH", rotation: 0, locked: true },
      { id: "w2", gridX: 2, gridY: 3, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 90 },
      { id: "tj2", gridX: 2, gridY: 4, type: "TJUNC", name: "Distributor Daya", energyType: "MATH", rotation: 180 },
      { id: "n2", gridX: 2, gridY: 5, type: "NODE", name: "Battery Core", basePorts: ["UP"], energyType: "MATH", rotation: 0, locked: true },
      { id: "w3", gridX: 3, gridY: 4, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 0 },
      { id: "w5", gridX: 4, gridY: 4, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 0 },
      { id: "n3", gridX: 5, gridY: 4, type: "NODE", name: "Energy Crystal", basePorts: ["LEFT"], energyType: "MATH", rotation: 0, locked: true },
    ],
  },
  {
    level: 14,
    title: "Jaringan Terpisah",
    tip: "Dua sumber, tiga inti, dan banyak belokan.",
    gridWidth: 6,
    gridHeight: 6,
    rewardCoins: 360,
    rewardXP: 100,
    par: 10,
    cells: [
      { id: "s1", gridX: 0, gridY: 0, type: "SOURCE", name: "AI Core", basePorts: ["RIGHT"], energyType: "LOGIC", rotation: 0, locked: true },
      { id: "w1", gridX: 1, gridY: 0, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 0 },
      { id: "w2", gridX: 2, gridY: 0, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 0 },
      { id: "c1", gridX: 3, gridY: 0, type: "CORNER", name: "Jalur Sirkuit", energyType: "LOGIC", rotation: 90 },
      { id: "w3", gridX: 3, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 90 },
      { id: "tj1", gridX: 3, gridY: 2, type: "TJUNC", name: "Distributor Daya", energyType: "LOGIC", rotation: 180 },
      { id: "n1", gridX: 4, gridY: 2, type: "NODE", name: "Neural Processor", basePorts: ["LEFT"], energyType: "LOGIC", rotation: 0, locked: true },
      { id: "w4", gridX: 3, gridY: 3, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 90 },
      { id: "n2", gridX: 3, gridY: 4, type: "NODE", name: "Memory Chip", basePorts: ["UP"], energyType: "LOGIC", rotation: 0, locked: true },
      { id: "s2", gridX: 5, gridY: 5, type: "SOURCE", name: "Moral Power Core", basePorts: ["LEFT"], energyType: "MORAL", rotation: 0, locked: true },
      { id: "w5", gridX: 4, gridY: 5, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 0 },
      { id: "w6", gridX: 3, gridY: 5, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 0 },
      { id: "c2", gridX: 2, gridY: 5, type: "CORNER", name: "Jalur Sirkuit", energyType: "LOGIC", rotation: 90 },
      { id: "w7", gridX: 2, gridY: 4, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LOGIC", rotation: 90 },
      { id: "n3", gridX: 2, gridY: 3, type: "NODE", name: "Energy Crystal", basePorts: ["DOWN"], energyType: "LOGIC", rotation: 0, locked: true },
    ],
  },
  {
    level: 15,
    title: "Sirkuit Berliku",
    tip: "Dua distributor dan jalur panjang bercabang.",
    gridWidth: 6,
    gridHeight: 6,
    rewardCoins: 380,
    rewardXP: 105,
    par: 8,
    cells: [
      { id: "s1", gridX: 0, gridY: 0, type: "SOURCE", name: "Creativity Core", basePorts: ["RIGHT"], energyType: "CREATIVITY", rotation: 0, locked: true },
      { id: "w1", gridX: 1, gridY: 0, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 0 },
      { id: "c1", gridX: 2, gridY: 0, type: "CORNER", name: "Jalur Sirkuit", energyType: "CREATIVITY", rotation: 90 },
      { id: "w2", gridX: 2, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 90 },
      { id: "tj1", gridX: 2, gridY: 2, type: "TJUNC", name: "Distributor Daya", energyType: "CREATIVITY", rotation: 180 },
      { id: "w3", gridX: 3, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 0 },
      { id: "n1", gridX: 4, gridY: 2, type: "NODE", name: "AI Core", basePorts: ["LEFT"], energyType: "CREATIVITY", rotation: 0, locked: true },
      { id: "w4", gridX: 2, gridY: 3, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 90 },
      { id: "tj2", gridX: 2, gridY: 4, type: "TJUNC", name: "Distributor Daya", energyType: "CREATIVITY", rotation: 180 },
      { id: "n2", gridX: 2, gridY: 5, type: "NODE", name: "Battery Core", basePorts: ["UP"], energyType: "CREATIVITY", rotation: 0, locked: true },
      { id: "w6", gridX: 3, gridY: 4, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 0 },
      { id: "n3", gridX: 4, gridY: 4, type: "NODE", name: "Servo Motor", basePorts: ["LEFT"], energyType: "CREATIVITY", rotation: 0, locked: true },
    ],
  },
  {
    level: 16,
    title: "Jaringan Silang Penuh",
    tip: "Jaringan silang dengan empat cabang inti.",
    gridWidth: 6,
    gridHeight: 5,
    rewardCoins: 400,
    rewardXP: 110,
    par: 9,
    cells: [
      { id: "s1", gridX: 1, gridY: 0, type: "SOURCE", name: "Quantum Source", basePorts: ["DOWN"], energyType: "LITERACY", rotation: 0, locked: true },
      { id: "x1", gridX: 1, gridY: 1, type: "CROSS", name: "Jaringan Silang", energyType: "LITERACY", rotation: 0, locked: true },
      { id: "w1", gridX: 2, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LITERACY", rotation: 0 },
      { id: "c1", gridX: 3, gridY: 1, type: "CORNER", name: "Jalur Sirkuit", energyType: "LITERACY", rotation: 90 },
      { id: "w2", gridX: 3, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LITERACY", rotation: 90 },
      { id: "c3", gridX: 3, gridY: 3, type: "CORNER", name: "Jalur Sirkuit", energyType: "LITERACY", rotation: 90 },
      { id: "w6", gridX: 4, gridY: 3, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LITERACY", rotation: 0 },
      { id: "n4", gridX: 5, gridY: 3, type: "NODE", name: "Satellite Node", basePorts: ["LEFT"], energyType: "LITERACY", rotation: 0, locked: true },
      { id: "w3", gridX: 1, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LITERACY", rotation: 90 },
      { id: "n2", gridX: 1, gridY: 3, type: "NODE", name: "Quantum Hub", basePorts: ["UP"], energyType: "LITERACY", rotation: 0, locked: true },
      { id: "c4", gridX: 0, gridY: 1, type: "CORNER", name: "Jalur Sirkuit", energyType: "LITERACY", rotation: 270 },
      { id: "w7", gridX: 0, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LITERACY", rotation: 90 },
      { id: "n3", gridX: 0, gridY: 3, type: "NODE", name: "Energy Crystal", basePorts: ["UP"], energyType: "LITERACY", rotation: 0, locked: true },
    ],
  },
  {
    level: 17,
    title: "Serpentin Ganda",
    tip: "Dua sumber: jalur berliku dan jalur lurus.",
    gridWidth: 6,
    gridHeight: 6,
    rewardCoins: 420,
    rewardXP: 115,
    par: 10,
    cells: [
      { id: "s1", gridX: 0, gridY: 0, type: "SOURCE", name: "Math Power Core", basePorts: ["RIGHT"], energyType: "MATH", rotation: 0, locked: true },
      { id: "w1", gridX: 1, gridY: 0, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 0 },
      { id: "c1", gridX: 2, gridY: 0, type: "CORNER", name: "Jalur Sirkuit", energyType: "MATH", rotation: 90 },
      { id: "w2", gridX: 2, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 90 },
      { id: "c2", gridX: 2, gridY: 2, type: "CORNER", name: "Jalur Sirkuit", energyType: "MATH", rotation: 90 },
      { id: "tj1", gridX: 3, gridY: 2, type: "TJUNC", name: "Distributor Daya", energyType: "MATH", rotation: 90 },
      { id: "n1", gridX: 3, gridY: 1, type: "NODE", name: "Neural Processor", basePorts: ["DOWN"], energyType: "MATH", rotation: 0, locked: true },
      { id: "w3", gridX: 4, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 0 },
      { id: "c3", gridX: 5, gridY: 2, type: "CORNER", name: "Jalur Sirkuit", energyType: "MATH", rotation: 90 },
      { id: "w4", gridX: 5, gridY: 3, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 90 },
      { id: "n2", gridX: 5, gridY: 4, type: "NODE", name: "Battery Core", basePorts: ["UP"], energyType: "MATH", rotation: 0, locked: true },
      { id: "s2", gridX: 0, gridY: 5, type: "SOURCE", name: "Moral Power Core", basePorts: ["RIGHT"], energyType: "MORAL", rotation: 0, locked: true },
      { id: "w5", gridX: 1, gridY: 5, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 0 },
      { id: "w6", gridX: 2, gridY: 5, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 0 },
      { id: "n3", gridX: 3, gridY: 5, type: "NODE", name: "Energy Crystal", basePorts: ["LEFT"], energyType: "MATH", rotation: 0, locked: true },
    ],
  },
  {
    level: 18,
    title: "Triple Jaringan",
    tip: "Tiga sumber dengan tiga warna energi berbeda.",
    gridWidth: 6,
    gridHeight: 6,
    rewardCoins: 440,
    rewardXP: 120,
    par: 8,
    cells: [
      { id: "sa", gridX: 0, gridY: 0, type: "SOURCE", name: "Creativity Core", basePorts: ["RIGHT"], energyType: "CREATIVITY", rotation: 0, locked: true },
      { id: "wa1", gridX: 1, gridY: 0, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 0 },
      { id: "ca", gridX: 2, gridY: 0, type: "CORNER", name: "Jalur Sirkuit", energyType: "CREATIVITY", rotation: 90 },
      { id: "wa2", gridX: 2, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 90 },
      { id: "na", gridX: 2, gridY: 2, type: "NODE", name: "AI Core", basePorts: ["UP"], energyType: "CREATIVITY", rotation: 0, locked: true },
      { id: "sb", gridX: 5, gridY: 0, type: "SOURCE", name: "Math Power Core", basePorts: ["DOWN"], energyType: "MATH", rotation: 0, locked: true },
      { id: "wb1", gridX: 5, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 90 },
      { id: "cb", gridX: 5, gridY: 2, type: "CORNER", name: "Jalur Sirkuit", energyType: "MATH", rotation: 270 },
      { id: "wb2", gridX: 4, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 0 },
      { id: "nb", gridX: 3, gridY: 2, type: "NODE", name: "Servo Motor", basePorts: ["RIGHT"], energyType: "MATH", rotation: 0, locked: true },
      { id: "sc", gridX: 0, gridY: 5, type: "SOURCE", name: "Literacy Core", basePorts: ["RIGHT"], energyType: "LITERACY", rotation: 0, locked: true },
      { id: "wc1", gridX: 1, gridY: 5, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LITERACY", rotation: 0 },
      { id: "wc2", gridX: 2, gridY: 5, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LITERACY", rotation: 0 },
      { id: "cc", gridX: 3, gridY: 5, type: "CORNER", name: "Jalur Sirkuit", energyType: "LITERACY", rotation: 270 },
      { id: "wc3", gridX: 3, gridY: 4, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "LITERACY", rotation: 90 },
      { id: "nc", gridX: 3, gridY: 3, type: "NODE", name: "Quantum Hub", basePorts: ["DOWN"], energyType: "LITERACY", rotation: 0, locked: true },
    ],
  },
  {
    level: 19,
    title: "Jaringan Besar",
    tip: "Distributor berjenjang sampai ke tiga inti.",
    gridWidth: 6,
    gridHeight: 6,
    rewardCoins: 460,
    rewardXP: 125,
    par: 9,
    cells: [
      { id: "s1", gridX: 0, gridY: 0, type: "SOURCE", name: "Creativity Core", basePorts: ["RIGHT"], energyType: "CREATIVITY", rotation: 0, locked: true },
      { id: "w1", gridX: 1, gridY: 0, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 0 },
      { id: "tj1", gridX: 2, gridY: 0, type: "TJUNC", name: "Distributor Daya", energyType: "CREATIVITY", rotation: 90 },
      { id: "w2", gridX: 3, gridY: 0, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 0 },
      { id: "n1", gridX: 4, gridY: 0, type: "NODE", name: "AI Core", basePorts: ["LEFT"], energyType: "CREATIVITY", rotation: 0, locked: true },
      { id: "w3", gridX: 2, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 90 },
      { id: "tj2", gridX: 2, gridY: 2, type: "TJUNC", name: "Distributor Daya", energyType: "CREATIVITY", rotation: 180 },
      { id: "w4", gridX: 3, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 0 },
      { id: "n2", gridX: 4, gridY: 2, type: "NODE", name: "Neural Processor", basePorts: ["LEFT"], energyType: "CREATIVITY", rotation: 0, locked: true },
      { id: "w5", gridX: 2, gridY: 3, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 90 },
      { id: "c1", gridX: 2, gridY: 4, type: "CORNER", name: "Jalur Sirkuit", energyType: "CREATIVITY", rotation: 270 },
      { id: "n3", gridX: 1, gridY: 4, type: "NODE", name: "Battery Core", basePorts: ["RIGHT"], energyType: "CREATIVITY", rotation: 0, locked: true },
      { id: "s2", gridX: 5, gridY: 5, type: "SOURCE", name: "Moral Power Core", basePorts: ["LEFT"], energyType: "MORAL", rotation: 0, locked: true },
      { id: "w7", gridX: 4, gridY: 5, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 0 },
      { id: "w8", gridX: 3, gridY: 5, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "CREATIVITY", rotation: 0 },
      { id: "n4", gridX: 2, gridY: 5, type: "NODE", name: "Energy Crystal", basePorts: ["RIGHT"], energyType: "CREATIVITY", rotation: 0, locked: true },
    ],
  },
  {
    level: 20,
    title: "Jaringan Master",
    tip: "Jaringan silang dan dua distributor terbesar.",
    gridWidth: 6,
    gridHeight: 6,
    rewardCoins: 500,
    rewardXP: 130,
    par: 8,
    cells: [
      { id: "s1", gridX: 1, gridY: 0, type: "SOURCE", name: "Quantum Source", basePorts: ["DOWN"], energyType: "MATH", rotation: 0, locked: true },
      { id: "x1", gridX: 1, gridY: 1, type: "CROSS", name: "Jaringan Silang", energyType: "MATH", rotation: 0, locked: true },
      { id: "w1", gridX: 2, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 0 },
      { id: "tj1", gridX: 3, gridY: 1, type: "TJUNC", name: "Distributor Daya", energyType: "MATH", rotation: 90 },
      { id: "n1", gridX: 3, gridY: 0, type: "NODE", name: "AI Core", basePorts: ["DOWN"], energyType: "MATH", rotation: 0, locked: true },
      { id: "w3", gridX: 4, gridY: 1, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 0 },
      { id: "n2", gridX: 5, gridY: 1, type: "NODE", name: "Servo Motor", basePorts: ["LEFT"], energyType: "MATH", rotation: 0, locked: true },
      { id: "w4", gridX: 1, gridY: 2, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 90 },
      { id: "tj2", gridX: 1, gridY: 3, type: "TJUNC", name: "Distributor Daya", energyType: "MATH", rotation: 90 },
      { id: "c1", gridX: 0, gridY: 3, type: "CORNER", name: "Jalur Sirkuit", energyType: "MATH", rotation: 90 },
      { id: "n3", gridX: 0, gridY: 4, type: "NODE", name: "Neural Processor", basePorts: ["UP"], energyType: "MATH", rotation: 0, locked: true },
      { id: "w7", gridX: 2, gridY: 3, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 0 },
      { id: "c2", gridX: 3, gridY: 3, type: "CORNER", name: "Jalur Sirkuit", energyType: "MATH", rotation: 90 },
      { id: "w8", gridX: 3, gridY: 4, type: "STRAIGHT", name: "Kabel Transmisi", energyType: "MATH", rotation: 90 },
      { id: "n4", gridX: 3, gridY: 5, type: "NODE", name: "Energy Crystal", basePorts: ["UP"], energyType: "MATH", rotation: 0, locked: true },
    ],
  },
];

const DIRS: Record<Port, [number, number]> = {
  UP: [0, -1],
  RIGHT: [1, 0],
  DOWN: [0, 1],
  LEFT: [-1, 0],
};
const OPP: Record<Port, Port> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
const ROTD: Record<Port, Port> = { UP: "RIGHT", RIGHT: "DOWN", DOWN: "LEFT", LEFT: "UP" };

const BASE_PORTS: Record<Exclude<CellType, "SOURCE" | "NODE">, Port[]> = {
  STRAIGHT: ["UP", "DOWN"],
  CORNER: ["UP", "RIGHT"],
  TJUNC: ["LEFT", "UP", "RIGHT"],
  CROSS: ["UP", "RIGHT", "DOWN", "LEFT"],
};

const rotatePorts = (ports: Port[], rotation: number): Port[] => {
  const steps = (((rotation / 90) % 4) + 4) % 4;
  let out = ports;
  for (let i = 0; i < steps; i++) out = out.map((p) => ROTD[p]);
  return out;
};

const getPorts = (cell: GridCell): Port[] => {
  if (cell.type === "SOURCE" || cell.type === "NODE") return rotatePorts(cell.basePorts || [], cell.rotation);
  return rotatePorts(BASE_PORTS[cell.type], cell.rotation);
};

interface EnergizedInfo {
  energized: boolean;
  color: string;
}

const computeEnergized = (cells: GridCell[]): Record<string, EnergizedInfo> => {
  const byKey: Record<string, GridCell> = {};
  const portMap: Record<string, Port[]> = {};
  for (const c of cells) {
    byKey[c.gridX + "," + c.gridY] = c;
    portMap[c.id] = getPorts(c);
  }
  const result: Record<string, EnergizedInfo> = {};
  const queue: GridCell[] = [];
  for (const c of cells) {
    if (c.type === "SOURCE") {
      result[c.id] = { energized: true, color: ENERGY_COLORS[c.energyType].color };
      queue.push(c);
    }
  }
  while (queue.length) {
    const cur = queue.shift()!;
    const color = result[cur.id].color;
    for (const p of portMap[cur.id]) {
      const [dx, dy] = DIRS[p];
      const n = byKey[cur.gridX + dx + "," + (cur.gridY + dy)];
      if (!n) continue;
      const need = OPP[p];
      if (!portMap[n.id].includes(need)) continue;
      if (!result[n.id]) {
        result[n.id] = { energized: true, color };
        queue.push(n);
      }
    }
  }
  return result;
};

const PORT_POS = (S: number): Record<Port, { x: number; y: number }> => ({
  UP: { x: S / 2, y: 0 },
  RIGHT: { x: S, y: S / 2 },
  DOWN: { x: S / 2, y: S },
  LEFT: { x: 0, y: S / 2 },
});

const cloneCells = (cells: GridCell[]): GridCell[] => JSON.parse(JSON.stringify(cells));

const starsFor = (moves: number, par: number) => (moves <= par ? 3 : moves <= par + 2 ? 2 : 1);

const GridCellItem = React.memo(function GridCellItem({
  cell,
  cellSize,
  energized,
  energyColor,
  isHint,
  onPress,
}: {
  cell: GridCell;
  cellSize: number;
  energized: boolean;
  energyColor: string;
  isHint: boolean;
  onPress: () => void;
}) {
  const rotSV = useSharedValue(cell.rotation);
  const pulse = useSharedValue(0);

  useEffect(() => {
    rotSV.value = withSpring(cell.rotation, { mass: 0.7, stiffness: 220, damping: 14 });
  }, [cell.rotation, rotSV]);

  useEffect(() => {
    if (energized) {
      pulse.value = withRepeat(withTiming(1, { duration: 650 }), -1, true);
    } else {
      cancelAnimation(pulse);
      pulse.value = 0;
    }
  }, [energized, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotSV.value}deg` },
      {
        translateY: isHint
          ? withRepeat(withSequence(withTiming(-6, { duration: 150 }), withTiming(6, { duration: 150 })), 3, true)
          : 0,
      },
    ],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: energized ? 0.5 + pulse.value * 0.5 : 1,
  }));

  const S = cellSize;
  const C = S / 2;
  const basePorts = (cell.type === "SOURCE" || cell.type === "NODE") ? (cell.basePorts || ["UP"]) : BASE_PORTS[cell.type];
  const pp = PORT_POS(S);

  const renderTraces = () => {
    const core = energized ? energyColor : "#334155";
    const glow = energized ? "#FFFFFF" : "#475569";
    const wMain = Math.max(6, Math.floor(S * 0.13));
    const wGlow = wMain + 6;
    return (
      <G>
        {basePorts.map((p) => (
          <G key={p}>
            <Path
              d={`M ${C} ${C} L ${pp[p].x} ${pp[p].y}`}
              stroke={energyColor}
              strokeWidth={wGlow}
              strokeLinecap="round"
              opacity={energized ? 0.4 : 0}
            />
            <Path
              d={`M ${C} ${C} L ${pp[p].x} ${pp[p].y}`}
              stroke={core}
              strokeWidth={wMain}
              strokeLinecap="round"
            />
            {energized && (
              <Path
                d={`M ${C} ${C} L ${pp[p].x} ${pp[p].y}`}
                stroke={glow}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeOpacity={0.9}
              />
            )}
          </G>
        ))}
      </G>
    );
  };

  const renderBody = () => {
    switch (cell.type) {
      case "SOURCE":
        return (
          <G>
            <Circle cx={C} cy={C} r={S * 0.3} fill={energized ? energyColor : "#1E293B"} opacity={energized ? 0.35 : 0.2} />
            <Circle cx={C} cy={C} r={S * 0.24} fill={energized ? energyColor : "#334155"} stroke={energized ? "#FFFFFF" : "#475569"} strokeWidth={2} />
            <Path
              d={`M ${C} ${C - S * 0.13} L ${C - S * 0.07} ${C + S * 0.02} L ${C + S * 0.02} ${C + S * 0.02} L ${C - S * 0.02} ${C + S * 0.13} L ${C + S * 0.09} ${C - S * 0.02} L ${C} ${C - S * 0.02} Z`}
              fill="#FFFFFF"
            />
          </G>
        );
      case "NODE":
        return (
          <G>
            <Rect
              x={C - S * 0.26}
              y={C - S * 0.26}
              width={S * 0.52}
              height={S * 0.52}
              rx={S * 0.14}
              fill={energized ? energyColor : "#1E293B"}
              stroke={energized ? "#FFFFFF" : "#475569"}
              strokeWidth={2}
            />
            <Circle cx={C} cy={C} r={S * 0.11} fill="#FFFFFF" opacity={energized ? 1 : 0.4} />
          </G>
        );
      default:
        return null;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={cell.locked}
      style={[
        styles.cellContainer,
        {
          width: cellSize - 6,
          height: cellSize - 6,
          margin: 3,
          borderColor: energized ? energyColor : "#334155",
        },
      ]}
    >
      <Animated.View style={[styles.cellWrapper, animatedStyle]}>
        <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
          {renderTraces()}
          {renderBody()}
        </Svg>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFillObject, pulseStyle, styles.cellGlow]}>
        <View style={[styles.cellGlowInner, { borderColor: energized ? energyColor : "transparent" }]} />
      </Animated.View>
      {cell.type === "NODE" && (
        <View
          style={[
            styles.chargeBadge,
            {
              backgroundColor: energized ? energyColor : "#0F172A",
              borderColor: energized ? "#FFFFFF" : "#334155",
            },
          ]}
        >
          <Text style={styles.chargeText}>{energized ? "100%" : "0%"}</Text>
        </View>
      )}
    </Pressable>
  );
});

export default function EnergyCoreScreen() {
  const router = useRouter();

  const [level, setLevel] = useState(1);
  const [cells, setCells] = useState<GridCell[]>([]);
  const [history, setHistory] = useState<{ cells: GridCell[]; moves: number }[]>([]);
  const [moves, setMoves] = useState(0);
  const [userCoins, setUserCoins] = useState(1250);
  const [robotEvolution, setRobotEvolution] = useState(52);
  const [gameState, setGameState] = useState<"playing" | "victory" | "completed">("playing");
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [hintCellId, setHintCellId] = useState<string | null>(null);
  const [companionText, setCompanionText] = useState(
    "Putar kabel pipa agar energi mengalir dari reaktor ke semua inti. Ketuk pipa untuk memutarnya 90°!"
  );

  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;

  const currentLevel = useMemo(() => LEVELS.find((l) => l.level === level) || LEVELS[0], [level]);
  const gridWidth = currentLevel.gridWidth;
  const gridHeight = currentLevel.gridHeight;
  const levelEnergy = ENERGY_COLORS[currentLevel.cells[0].energyType];
  const levelColor = levelEnergy.color;

  const maxBoardSize = Math.min(windowWidth - 32, 400, windowHeight * 0.5);
  const cellSize = Math.min(maxBoardSize / gridWidth, maxBoardSize / gridHeight);
  const boardW = cellSize * gridWidth;
  const boardH = cellSize * gridHeight;

  useEffect(() => {
    const loadStats = async () => {
      try {
        const storedCoins = await AsyncStorage.getItem(STORAGE_KEY_COINS);
        if (storedCoins !== null) setUserCoins(parseInt(storedCoins));
        const storedLevel = await AsyncStorage.getItem(STORAGE_KEY_LEVEL);
        if (storedLevel !== null) {
          const l = parseInt(storedLevel);
          if (l >= 1 && l <= LEVELS.length) setLevel(l);
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
    setCells(cloneCells(currentLevel.cells));
    setHistory([]);
    setMoves(0);
    setGameState((prev) => (prev === "completed" ? prev : "playing"));
    setHintCellId(null);
    setShowIntroModal(true);
    setCompanionText(`Misi Level ${level}: ${currentLevel.title}. ${currentLevel.tip}`);
  }, [level, currentLevel]);

  const energizedMap = useMemo(() => computeEnergized(cells), [cells]);

  const nodeStats = useMemo(() => {
    const nodes = cells.filter((c) => c.type === "NODE");
    const active = nodes.filter((c) => energizedMap[c.id]?.energized).length;
    const total = nodes.length;
    return { active, total, percent: total > 0 ? Math.round((active / total) * 100) : 0 };
  }, [cells, energizedMap]);

  const allEnergized = useMemo(
    () => cells.length > 0 && cells.every((c) => energizedMap[c.id]?.energized),
    [cells, energizedMap]
  );

  useEffect(() => {
    if (allEnergized && gameState === "playing") {
      playVictorySound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCompanionText("⚡ Sirkuit sempurna menyala! Seluruh jaringan daya pulih 100%!");
      const t = setTimeout(() => setGameState("victory"), 700);
      return () => clearTimeout(t);
    }
  }, [allEnergized, gameState]);

  const handleRotate = useCallback(
    (id: string) => {
      if (gameState !== "playing") return;
      const idx = cells.findIndex((c) => c.id === id);
      if (idx === -1 || cells[idx].locked) return;
      playRotateSound();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setHistory((h) => [...h, { cells: cloneCells(cells), moves }]);
      const next = cloneCells(cells);
      next[idx].rotation = (next[idx].rotation + 90) % 360;
      setCells(next);
      setMoves((m) => m + 1);
      setHintCellId(null);
    },
    [gameState, cells, moves]
  );

  const handleUndo = () => {
    if (history.length === 0) return;
    playRotateSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const last = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCells(last.cells);
    setMoves(last.moves);
  };

  const handleRestart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setCells(cloneCells(currentLevel.cells));
    setHistory([]);
    setMoves(0);
    setHintCellId(null);
  };

  const handleHint = () => {
    if (gameState !== "playing" || userCoins < 20) return;
    const live = Object.keys(energizedMap).length;
    let target: string | null = null;
    for (const cell of cells) {
      if (cell.locked) continue;
      for (const rot of [0, 90, 180, 270]) {
        if (rot === cell.rotation) continue;
        const trial = cloneCells(cells);
        const idx = trial.findIndex((c) => c.id === cell.id);
        trial[idx].rotation = rot;
        const res = computeEnergized(trial);
        if (cells.every((c) => res[c.id]?.energized) || Object.keys(res).length > live) {
          target = cell.id;
          break;
        }
      }
      if (target) break;
    }
    const newCoins = userCoins - 20;
    setUserCoins(newCoins);
    AsyncStorage.setItem(STORAGE_KEY_COINS, String(newCoins));
    if (target) {
      setHintCellId(target);
      const c = cells.find((x) => x.id === target);
      setCompanionText(`💡 Petunjuk: coba putar pipa di baris ${(c?.gridY ?? 0) + 1}, kolom ${(c?.gridX ?? 0) + 1}!`);
    } else {
      setCompanionText("💡 Periksa pipa yang belum tersambung ke jaringan!");
    }
  };

  const handleNextLevel = async () => {
    const nextLvl = level + 1;
    const finalCoins = userCoins + currentLevel.rewardCoins;
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

  const statusColor = nodeStats.percent === 100 ? "#00FF88" : levelColor;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#080D1A" />

      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => setShowPauseModal(true)}>
          <Ionicons name="menu" size={22} color="#94A3B8" />
        </Pressable>
        <View style={styles.levelBadgeContainer}>
          <Text style={[styles.levelBadgeTag, { color: levelColor }]}>STAGE {level} / {LEVELS.length}</Text>
          <Text style={styles.levelText}>{currentLevel.title}</Text>
        </View>
        <View style={styles.topHud}>
          <View style={styles.hudBadge}>
            <MaterialCommunityIcons name="cash-multiple" size={18} color="#FFD700" />
            <Text style={styles.hudText}>{userCoins}</Text>
          </View>
        </View>
      </View>

      <View style={styles.powerStatusBar}>
        <View style={styles.powerStatusHeader}>
          <View style={styles.statusIndicatorGroup}>
            <Ionicons name="flash" size={16} color={statusColor} />
            <Text style={styles.powerStatusTitle}>
              TRANSMISI DAYA: {nodeStats.active} / {nodeStats.total} INTI ({nodeStats.percent}%)
            </Text>
          </View>
          <View style={styles.movesBadge}>
            <MaterialCommunityIcons name="gesture-tap-hold" size={14} color="#94A3B8" />
            <Text style={styles.movesText}>{moves}</Text>
          </View>
        </View>
        <View style={styles.powerProgressBg}>
          <View style={[styles.powerProgressFill, { width: `${nodeStats.percent}%`, backgroundColor: statusColor }]} />
        </View>
      </View>

      <View style={styles.mainGameArea}>
        <View
          style={[
            styles.boardContainer,
            {
              width: boardW + 16,
              height: boardH + 16,
              shadowColor: levelColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 18,
            },
          ]}
        >
          {Array.from({ length: gridHeight }).map((_, y) => (
            <View key={y} style={{ flexDirection: "row" }}>
              {Array.from({ length: gridWidth }).map((_, x) => {
                const cell = cells.find((c) => c.gridX === x && c.gridY === y);
                if (!cell) return <View key={x} style={{ width: cellSize, height: cellSize }} />;
                const status = energizedMap[cell.id] || { energized: false, color: "#334155" };
                return (
                  <GridCellItem
                    key={cell.id}
                    cell={cell}
                    cellSize={cellSize}
                    energized={status.energized}
                    energyColor={status.color}
                    isHint={hintCellId === cell.id}
                    onPress={() => handleRotate(cell.id)}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.evolutionPanel}>
        <View style={styles.evolutionHeader}>
          <Text style={styles.evolutionTitle}>EVOLUSI RON-BONTA CORE</Text>
          <Text style={[styles.evolutionPercent, { color: levelColor }]}>{robotEvolution}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${robotEvolution}%`, backgroundColor: levelColor }]} />
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
          <View style={[styles.actionIconBg, { backgroundColor: "rgba(59,130,246,0.2)", borderColor: "#3B82F6" }]}>
            <Ionicons name="arrow-undo" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionBtnLabel}>Undo</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={handleHint}>
          <View style={[styles.actionIconBg, { backgroundColor: "rgba(245,158,11,0.2)", borderColor: "#F59E0B" }]}>
            <Ionicons name="bulb" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionBtnLabel}>Petunjuk (-20)</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={handleRestart}>
          <View style={[styles.actionIconBg, { backgroundColor: "rgba(239,68,68,0.2)", borderColor: "#EF4444" }]}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionBtnLabel}>Restart</Text>
        </Pressable>
      </View>

      <Modal visible={showIntroModal && gameState === "playing"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.victoryCard}>
            <View style={[styles.teachIcon, { borderColor: levelColor }]}>
              <MaterialCommunityIcons name="power-plug" size={34} color={levelColor} />
            </View>
            <Text style={styles.victoryTitle}>Energy Core</Text>
            <Text style={[styles.victorySubtitle, { fontWeight: "900", color: levelColor, marginBottom: 10 }]}>
              Level {level}: {currentLevel.title}
            </Text>
            <View style={styles.energyTypeBadge}>
              <View style={[styles.energyDot, { backgroundColor: levelColor }]} />
              <Text style={styles.energyTypeText}>{levelEnergy.name}</Text>
            </View>
            <Text style={styles.teachText}>{currentLevel.tip}</Text>
            <Button
              title="Mulai Menyambung"
              onPress={() => setShowIntroModal(false)}
              variant="accent"
              style={{ width: "100%", marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={showPauseModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.victoryCard}>
            <Text style={styles.victoryTitle}>Game Berhenti</Text>
            <Text style={[styles.victorySubtitle, { marginBottom: 24 }]}>Pilih opsi untuk melanjutkan:</Text>
            <Button
              title="Lanjutkan Bermain"
              onPress={() => setShowPauseModal(false)}
              variant="primary"
              style={{ width: "100%", marginBottom: 12 }}
            />
            <Button
              title="Mulai Ulang Level"
              onPress={() => {
                setShowPauseModal(false);
                handleRestart();
              }}
              variant="accent"
              style={{ width: "100%", marginBottom: 12 }}
            />
            <Button
              title="Kembali ke Menu Utama"
              onPress={() => {
                setShowPauseModal(false);
                router.back();
              }}
              variant="secondary"
              style={{ width: "100%", backgroundColor: "#EF4444" }}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={gameState === "victory"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.victoryCard}>
            <Text style={[styles.victoryTag, { color: levelColor }]}>MISSION COMPLETED</Text>
            <Text style={styles.victoryTitle}>Jaringan Daya Pulih!</Text>
            <Text style={styles.victorySubtitle}>
              {currentLevel.title} terselesaikan — semua inti menyala 100%.
            </Text>
            <View style={styles.starRow}>
              {[1, 2, 3].map((s) => (
                <Ionicons
                  key={s}
                  name="star"
                  size={s === 2 ? 54 : 42}
                  color={s <= starsFor(moves, currentLevel.par) ? "#FFD700" : "#CBD5E1"}
                  style={{ marginTop: s === 2 ? -15 : 0 }}
                />
              ))}
            </View>
            <View style={styles.rewardCardContainer}>
              <View style={styles.rewardItem}>
                <Ionicons name="sparkles" size={26} color="#FFD700" />
                <Text style={styles.rewardAmount}>+{currentLevel.rewardCoins} Koin</Text>
              </View>
              <View style={styles.rewardItem}>
                <MaterialCommunityIcons name="trophy-outline" size={26} color={levelColor} />
                <Text style={styles.rewardAmount}>+{currentLevel.rewardXP} XP</Text>
              </View>
            </View>
            <Button
              title={level === LEVELS.length ? "Selesai" : "Misi Berikutnya"}
              onPress={handleNextLevel}
              variant="accent"
              style={styles.nextLevelButton}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={gameState === "completed"} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.victoryCard}>
            <MaterialCommunityIcons name="party-popper" size={60} color={levelColor} />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#080D1A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: "#0F172A",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  levelBadgeContainer: {
    alignItems: "center",
  },
  levelBadgeTag: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  levelText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  topHud: {
    flexDirection: "row",
    gap: 8,
  },
  hudBadge: {
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 215, 0, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.4)",
    gap: 6,
  },
  hudText: {
    color: "#FFD700",
    fontWeight: "900",
    fontSize: 14,
  },
  powerStatusBar: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  powerStatusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  statusIndicatorGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  powerStatusTitle: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  movesBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  movesText: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "800",
  },
  powerProgressBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1E293B",
    overflow: "hidden",
  },
  powerProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  mainGameArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  boardContainer: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },
  cellContainer: {
    backgroundColor: "#16213B",
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cellWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  cellGlow: {
    borderRadius: 12,
  },
  cellGlowInner: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
  },
  chargeBadge: {
    position: "absolute",
    bottom: 3,
    right: 3,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  chargeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
  },
  evolutionPanel: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  evolutionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  evolutionTitle: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  evolutionPercent: {
    fontSize: 11,
    fontWeight: "900",
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1E293B",
    width: "100%",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  companionPanel: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: SPACING.md,
    marginVertical: 8,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
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
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  actionBtn: {
    alignItems: "center",
  },
  actionIconBg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  teachIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 2,
  },
  energyTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },
  energyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  energyTypeText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "800",
  },
  teachText: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 6,
  },
  victoryTag: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 4,
  },
  victoryTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1E2937",
    textAlign: "center",
    marginBottom: 8,
  },
  victorySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 18,
  },
  starRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  rewardCardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F3F4F6",
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
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
  },
  nextLevelButton: {
    width: "100%",
  },
});
