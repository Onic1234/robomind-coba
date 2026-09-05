import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { ScrollView, StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  Modal,
  StatusBar,
  LayoutChangeEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Storage } from "../lib/storage";
import { HowToPlayModal } from "../components/HowToPlayModal";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  cancelAnimation,
  runOnJS,
  type SharedValue,
} from "react-native-reanimated";
import Svg, { Path, Rect, Circle, G } from "react-native-svg";
import { SPACING } from "../constants/Theme";
import Button from "../components/ui/Button";
import { saveGameSession } from "../lib/gameProgressService";

const COINS_STORAGE_KEY = "user_coins_balance";
const STORAGE_KEY_LEVEL = "robot_escape_current_level";

const GRID = 7;
const CENTER = { x: 3, y: 3 };
const ROBOT_SIZE = 64;
const MAX_ROBOTS = 8;

type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Turn = "straight" | "left" | "right";

interface EscapeRobot {
  id: number;
  cell: { x: number; y: number };
  approach: Dir;
  turn: Turn;
  status: "idle" | "moving" | "escaped";
}

interface Obstacle {
  cell: { x: number; y: number };
  type: "cone" | "barrier" | "hazard";
}

interface LevelConfig {
  level: number;
  title: string;
  tip: string;
  reward: number;
  par: number;
  hRoads: number[];
  vRoads: number[];
  robots: Omit<EscapeRobot, "status">[];
  obstacles?: Obstacle[];
}

const DIRS: Record<Dir, [number, number]> = {
  UP: [0, -1],
  DOWN: [0, 1],
  LEFT: [-1, 0],
  RIGHT: [1, 0],
};

const applyTurn = (approach: Dir, turn: Turn): Dir => {
  if (turn === "straight") return approach;
  if (approach === "UP") return turn === "left" ? "LEFT" : "RIGHT";
  if (approach === "DOWN") return turn === "left" ? "RIGHT" : "LEFT";
  if (approach === "LEFT") return turn === "left" ? "DOWN" : "UP";
  return turn === "left" ? "UP" : "DOWN";
};

const inGrid = (x: number, y: number) => x >= 0 && x < GRID && y >= 0 && y < GRID;
const cellKey = (c: { x: number; y: number }) => `${c.x},${c.y}`;

const pathCells = (
  r: { cell: { x: number; y: number }; approach: Dir; turn: Turn },
  hRoads: number[] = [3],
  vRoads: number[] = [3]
) => {
  const cells: { x: number; y: number }[] = [];
  const intersections = new Set<string>();
  vRoads.forEach((vx) => hRoads.forEach((hy) => intersections.add(`${vx},${hy}`)));

  let cur = { ...r.cell };
  const [dx, dy] = DIRS[r.approach];
  let turnPoint: { x: number; y: number } | null = null;

  while (inGrid(cur.x + dx, cur.y + dy)) {
    cur = { x: cur.x + dx, y: cur.y + dy };
    cells.push(cur);
    if (intersections.has(`${cur.x},${cur.y}`)) {
      turnPoint = cur;
      break;
    }
  }

  if (turnPoint) {
    const newDir = applyTurn(r.approach, r.turn);
    const [dx2, dy2] = DIRS[newDir];
    cur = { ...turnPoint };
    while (inGrid(cur.x + dx2, cur.y + dy2)) {
      cur = { x: cur.x + dx2, y: cur.y + dy2 };
      cells.push(cur);
    }
  }

  return cells;
};

const canEscape = (
  r: EscapeRobot,
  all: EscapeRobot[],
  obstacles: Obstacle[] = [],
  hRoads: number[] = [3],
  vRoads: number[] = [3]
): boolean => {
  const path = pathCells(r, hRoads, vRoads);
  const pathSet = new Set(path.map(cellKey));
  const robotBlocked = all.some((o) => o.id !== r.id && o.status === "idle" && pathSet.has(cellKey(o.cell)));
  if (robotBlocked) return false;
  const obstacleBlocked = obstacles.some((obs) => pathSet.has(cellKey(obs.cell)));
  if (obstacleBlocked) return false;
  return true;
};

const LEVELS: LevelConfig[] = [
  // Tier 1: 1 Horizontal Road (y=3), 1 Vertical Road (x=3) -> 1 Persimpangan Utama
  {
    level: 1,
    title: "Persimpangan Dasar (1x1)",
    tip: "Ketuk robot yang jalurnya kosong untuk membiarkannya keluar dari persimpangan.",
    reward: 50,
    par: 2,
    hRoads: [3],
    vRoads: [3],
    robots: [
      { id: 1, cell: { x: 3, y: 2 }, approach: "DOWN", turn: "straight" },
      { id: 2, cell: { x: 2, y: 3 }, approach: "RIGHT", turn: "straight" },
    ],
  },
  {
    level: 2,
    title: "Jalur Satu Arah (1x1)",
    tip: "Robot di depan harus keluar dulu sebelum robot di belakangnya bisa maju.",
    reward: 80,
    par: 3,
    hRoads: [3],
    vRoads: [3],
    robots: [
      { id: 1, cell: { x: 3, y: 0 }, approach: "DOWN", turn: "straight" },
      { id: 2, cell: { x: 3, y: 2 }, approach: "DOWN", turn: "straight" },
      { id: 3, cell: { x: 4, y: 3 }, approach: "LEFT", turn: "straight" },
    ],
  },
  {
    level: 3,
    title: "Rintangan Kerucut (Kelipatan 3)",
    tip: "Jalur Utara terhalang Kerucut! Arahkan robot ke jalur Timur atau Barat.",
    reward: 120,
    par: 4,
    hRoads: [3],
    vRoads: [3],
    robots: [
      { id: 1, cell: { x: 3, y: 2 }, approach: "DOWN", turn: "right" },
      { id: 2, cell: { x: 4, y: 3 }, approach: "LEFT", turn: "straight" },
      { id: 3, cell: { x: 3, y: 4 }, approach: "UP", turn: "right" },
      { id: 4, cell: { x: 3, y: 6 }, approach: "UP", turn: "right" },
    ],
    obstacles: [{ cell: { x: 3, y: 1 }, type: "cone" }],
  },

  // Tier 2: 2 Horizontal Roads (y=2, y=4), 1 Vertical Road (x=3) -> 2 Persimpangan Ganda
  {
    level: 4,
    title: "Jalur Ganda Horizontal (2x1)",
    tip: "Jalan raya bertambah menjadi 2 jalur horizontal! Perhatikan persimpangan ganda.",
    reward: 140,
    par: 4,
    hRoads: [2, 4],
    vRoads: [3],
    robots: [
      { id: 1, cell: { x: 3, y: 0 }, approach: "DOWN", turn: "straight" },
      { id: 2, cell: { x: 3, y: 1 }, approach: "DOWN", turn: "straight" },
      { id: 3, cell: { x: 0, y: 2 }, approach: "RIGHT", turn: "straight" },
      { id: 4, cell: { x: 0, y: 4 }, approach: "RIGHT", turn: "straight" },
    ],
  },
  {
    level: 5,
    title: "Belokan Jalur Ganda (2x1)",
    tip: "Dua persimpangan horizontal. Analisis persimpangan mana yang dituju robot.",
    reward: 160,
    par: 4,
    hRoads: [2, 4],
    vRoads: [3],
    robots: [
      { id: 1, cell: { x: 3, y: 0 }, approach: "DOWN", turn: "right" },
      { id: 2, cell: { x: 3, y: 1 }, approach: "DOWN", turn: "straight" },
      { id: 3, cell: { x: 3, y: 5 }, approach: "UP", turn: "right" },
      { id: 4, cell: { x: 6, y: 4 }, approach: "LEFT", turn: "straight" },
    ],
  },
  {
    level: 6,
    title: "Barikade Ganda (Kelipatan 3)",
    tip: "Jalur Ganda + 2 Barikade! Rencanakan urutan pelepasan secara rinci.",
    reward: 200,
    par: 5,
    hRoads: [2, 4],
    vRoads: [3],
    robots: [
      { id: 1, cell: { x: 3, y: 1 }, approach: "DOWN", turn: "right" },
      { id: 2, cell: { x: 4, y: 2 }, approach: "LEFT", turn: "straight" },
      { id: 3, cell: { x: 5, y: 2 }, approach: "LEFT", turn: "straight" },
      { id: 4, cell: { x: 3, y: 5 }, approach: "UP", turn: "left" },
      { id: 5, cell: { x: 3, y: 6 }, approach: "UP", turn: "left" },
    ],
    obstacles: [
      { cell: { x: 3, y: 0 }, type: "barrier" },
      { cell: { x: 6, y: 2 }, type: "cone" },
    ],
  },

  // Tier 3: 2 Horizontal Roads (y=2, y=4), 2 Vertical Roads (x=2, x=4) -> 4 Persimpangan Grid Kota
  {
    level: 7,
    title: "Grid Kota 2x2 Jalan",
    tip: "Jalan bertambah menjadi 2 Horizontal & 2 Vertikal! Ada 4 titik persimpangan kota.",
    reward: 220,
    par: 6,
    hRoads: [2, 4],
    vRoads: [2, 4],
    robots: [
      { id: 1, cell: { x: 2, y: 0 }, approach: "DOWN", turn: "straight" },
      { id: 2, cell: { x: 4, y: 0 }, approach: "DOWN", turn: "straight" },
      { id: 3, cell: { x: 2, y: 1 }, approach: "DOWN", turn: "straight" },
      { id: 4, cell: { x: 0, y: 2 }, approach: "RIGHT", turn: "straight" },
      { id: 5, cell: { x: 0, y: 4 }, approach: "RIGHT", turn: "straight" },
      { id: 6, cell: { x: 2, y: 5 }, approach: "UP", turn: "right" },
    ],
  },
  {
    level: 8,
    title: "Empat Persimpangan Grid",
    tip: "Antrean di 4 persimpangan! Tentukan robot paling bebas untuk unblock jalur.",
    reward: 240,
    par: 6,
    hRoads: [2, 4],
    vRoads: [2, 4],
    robots: [
      { id: 1, cell: { x: 2, y: 0 }, approach: "DOWN", turn: "right" },
      { id: 2, cell: { x: 4, y: 0 }, approach: "DOWN", turn: "left" },
      { id: 3, cell: { x: 6, y: 2 }, approach: "LEFT", turn: "straight" },
      { id: 4, cell: { x: 6, y: 4 }, approach: "LEFT", turn: "straight" },
      { id: 5, cell: { x: 2, y: 6 }, approach: "UP", turn: "left" },
      { id: 6, cell: { x: 4, y: 6 }, approach: "UP", turn: "right" },
    ],
  },
  {
    level: 9,
    title: "Zona Hazard Grid 2x2 (Kelipatan 3)",
    tip: "Grid 4 persimpangan + 3 Rintangan! Analisis titik aman keluar.",
    reward: 280,
    par: 7,
    hRoads: [2, 4],
    vRoads: [2, 4],
    robots: [
      { id: 1, cell: { x: 2, y: 0 }, approach: "DOWN", turn: "right" },
      { id: 2, cell: { x: 4, y: 0 }, approach: "DOWN", turn: "right" },
      { id: 3, cell: { x: 2, y: 1 }, approach: "DOWN", turn: "right" },
      { id: 4, cell: { x: 6, y: 2 }, approach: "LEFT", turn: "straight" },
      { id: 5, cell: { x: 6, y: 4 }, approach: "LEFT", turn: "straight" },
      { id: 6, cell: { x: 2, y: 5 }, approach: "UP", turn: "left" },
      { id: 7, cell: { x: 4, y: 5 }, approach: "UP", turn: "left" },
    ],
    obstacles: [
      { cell: { x: 2, y: 0 }, type: "hazard" },
      { cell: { x: 6, y: 2 }, type: "barrier" },
      { cell: { x: 2, y: 6 }, type: "cone" },
    ],
  },

  // Tier 4: 3 Horizontal Roads (y=1, y=3, y=5), 2 Vertical Roads (x=2, x=4) -> 6 Persimpangan Megapolitan
  {
    level: 10,
    title: "Metropolitan Megagrid (3x2)",
    tip: "Tingkat Megapolitan! 3 Jalan Horizontal & 2 Jalan Vertikal (6 Persimpangan).",
    reward: 300,
    par: 8,
    hRoads: [1, 3, 5],
    vRoads: [2, 4],
    robots: [
      { id: 1, cell: { x: 2, y: 0 }, approach: "DOWN", turn: "right" },
      { id: 2, cell: { x: 4, y: 0 }, approach: "DOWN", turn: "right" },
      { id: 3, cell: { x: 0, y: 3 }, approach: "RIGHT", turn: "left" },
      { id: 4, cell: { x: 6, y: 3 }, approach: "LEFT", turn: "right" },
      { id: 5, cell: { x: 0, y: 5 }, approach: "RIGHT", turn: "straight" },
      { id: 6, cell: { x: 5, y: 5 }, approach: "LEFT", turn: "right" },
      { id: 7, cell: { x: 2, y: 6 }, approach: "UP", turn: "left" },
      { id: 8, cell: { x: 4, y: 6 }, approach: "UP", turn: "right" },
    ],
  },
  {
    level: 11,
    title: "Kemacetan Megapolitan (3x2)",
    tip: "6 Persimpangan padat 8 robot dan 1 rintangan kerucut.",
    reward: 350,
    par: 8,
    hRoads: [1, 3, 5],
    vRoads: [2, 4],
    robots: [
      { id: 1, cell: { x: 2, y: 0 }, approach: "DOWN", turn: "right" },
      { id: 2, cell: { x: 4, y: 0 }, approach: "DOWN", turn: "right" },
      { id: 3, cell: { x: 0, y: 3 }, approach: "RIGHT", turn: "left" },
      { id: 4, cell: { x: 6, y: 3 }, approach: "LEFT", turn: "right" },
      { id: 5, cell: { x: 0, y: 5 }, approach: "RIGHT", turn: "straight" },
      { id: 6, cell: { x: 5, y: 5 }, approach: "LEFT", turn: "right" },
      { id: 7, cell: { x: 2, y: 6 }, approach: "UP", turn: "left" },
      { id: 8, cell: { x: 4, y: 6 }, approach: "UP", turn: "right" },
    ],
    obstacles: [{ cell: { x: 6, y: 1 }, type: "cone" }],
  },
  {
    level: 12,
    title: "Puncak Logika Megagrid (Kelipatan 3)",
    tip: "Tantangan Puncak Megapolitan! 6 Persimpangan, 8 Robot & 3 Rintangan Kompleks.",
    reward: 400,
    par: 9,
    hRoads: [1, 3, 5],
    vRoads: [2, 4],
    robots: [
      { id: 1, cell: { x: 2, y: 0 }, approach: "DOWN", turn: "right" },
      { id: 2, cell: { x: 4, y: 0 }, approach: "DOWN", turn: "right" },
      { id: 3, cell: { x: 0, y: 3 }, approach: "RIGHT", turn: "left" },
      { id: 4, cell: { x: 6, y: 3 }, approach: "LEFT", turn: "right" },
      { id: 5, cell: { x: 0, y: 5 }, approach: "RIGHT", turn: "straight" },
      { id: 6, cell: { x: 5, y: 5 }, approach: "LEFT", turn: "right" },
      { id: 7, cell: { x: 2, y: 6 }, approach: "UP", turn: "left" },
      { id: 8, cell: { x: 4, y: 6 }, approach: "UP", turn: "right" },
    ],
    obstacles: [
      { cell: { x: 6, y: 1 }, type: "barrier" },
      { cell: { x: 0, y: 0 }, type: "cone" },
      { cell: { x: 6, y: 6 }, type: "hazard" },
    ],
  },
];

const starsFor = (taps: number, n: number) => (taps <= n ? 3 : taps <= n + 2 ? 2 : 1);

const dirAngle = (d: Dir) => (d === "UP" ? 0 : d === "RIGHT" ? 90 : d === "DOWN" ? 180 : 270);

// ----------------------------------------------------------------------
// 🧠 RADAR CHART COMPONENT FOR ROBOT ESCAPE (5 Pentagon Axes)
// ----------------------------------------------------------------------
const EscapeRadarChart = ({
  scores,
}: {
  scores: { spasial: number; keputusan: number; kontrolDiri: number; memori: number; fokus: number };
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const cssWidth = 220;
    const cssHeight = 190;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    canvas.style.width = cssWidth + "px";
    canvas.style.height = cssHeight + "px";

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    const centerX = cssWidth / 2;
    const centerY = cssHeight / 2 + 4;
    const radius = 52;

    const axes = [
      { name: "Spasial", val: scores.spasial || 88, align: "center", dy: -12 },
      { name: "Keputusan", val: scores.keputusan || 92, align: "left", dy: 2 },
      { name: "Kontrol Diri", val: scores.kontrolDiri || 85, align: "left", dy: 10 },
      { name: "Memori Kerja", val: scores.memori || 90, align: "right", dy: 10 },
      { name: "Fokus", val: scores.fokus || 95, align: "right", dy: 2 },
    ];
    const numAxes = axes.length;

    // Grid Pentagon rings
    [0.25, 0.5, 0.75, 1.0].forEach((rFactor) => {
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const x = centerX + radius * rFactor * Math.cos(angle);
        const y = centerY + radius * rFactor * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = "rgba(0, 229, 255, 0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Spokes
    for (let i = 0; i < numAxes; i++) {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
      ctx.stroke();
    }

    // Data polygon
    ctx.beginPath();
    axes.forEach((axis, i) => {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const r = radius * (axis.val / 100);
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();

    ctx.fillStyle = "rgba(0, 229, 255, 0.35)";
    ctx.fill();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Vertices dots & text labels
    axes.forEach((axis, i) => {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const r = radius * (axis.val / 100);
      const vx = centerX + r * Math.cos(angle);
      const vy = centerY + r * Math.sin(angle);

      // Point dot
      ctx.beginPath();
      ctx.arc(vx, vy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Outer Label
      const lx = centerX + (radius + 18) * Math.cos(angle);
      const ly = centerY + (radius + 18) * Math.sin(angle) + (axis.dy || 0);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 10px system-ui, sans-serif";
      ctx.textAlign = axis.align as CanvasTextAlign;
      ctx.fillText(axis.name, lx, ly);
    });
  }, [scores]);

  return <canvas ref={canvasRef} style={{ width: 220, height: 190 }} />;
};

const ObstacleItem = React.memo(function ObstacleItem({
  type,
  size,
}: {
  type: "cone" | "barrier" | "hazard";
  size: number;
}) {
  return (
    <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
      <Svg width={size * 0.75} height={size * 0.75} viewBox="0 0 48 48">
        {type === "cone" && (
          <G>
            <Rect x="8" y="38" width="32" height="6" rx="2" fill="#B45309" stroke="#F59E0B" strokeWidth="1.5" />
            <Path d="M12 38 L21 8 L27 8 L36 38 Z" fill="#F97316" stroke="#EA580C" strokeWidth="1.5" />
            <Path d="M15 28 L18 18 L30 18 L33 28 Z" fill="#FFFFFF" opacity="0.9" />
            <Path d="M18 18 L21 8 L27 8 L30 18 Z" fill="#F97316" />
            <Circle cx="24" cy="8" r="3" fill="#FED7AA" />
          </G>
        )}

        {type === "barrier" && (
          <G>
            <Path d="M10 40 L14 26 L18 40" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
            <Path d="M38 40 L34 26 L30 40" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
            <Rect x="4" y="14" width="40" height="16" rx="4" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1.5" />
            <Path d="M6 14 L14 30 M16 14 L24 30 M26 14 L34 30 M36 14 L42 26" stroke="#F59E0B" strokeWidth="4" strokeLinecap="square" />
            <Circle cx="8" cy="10" r="3.5" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1" />
            <Circle cx="40" cy="10" r="3.5" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1" />
          </G>
        )}

        {type === "hazard" && (
          <G>
            <Circle cx="24" cy="24" r="18" fill="rgba(239, 68, 68, 0.2)" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 3" />
            <Path d="M24 8 L38 34 L10 34 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          </G>
        )}
      </Svg>
    </View>
  );
});

const RobotItem = React.memo(function RobotItem({
  robot,
  size,
  blocked,
  isHint,
  x,
  y,
  rot,
  shake,
  flash,
}: {
  robot: EscapeRobot;
  size: number;
  blocked: boolean;
  isHint: boolean;
  x: SharedValue<number>;
  y: SharedValue<number>;
  rot: SharedValue<number>;
  shake: SharedValue<number>;
  flash: SharedValue<number>;
}) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value + shake.value },
      { translateY: y.value },
      { rotate: `${rot.value}deg` },
      { scale: flash.value > 0 ? 1.08 : 1 },
    ],
  }));

  const S = size;
  const turn = robot.turn;
  const mainColor = blocked ? "#EF4444" : turn === "left" ? "#F59E0B" : turn === "right" ? "#10B981" : "#00E5FF";

  return (
    <Animated.View style={[styles.robotContainer, { width: S, height: S }, animStyle]}>
      <Svg width={S} height={S} viewBox="0 0 64 64">
        <G>
          {/* Front Headlight Beams */}
          <Path d="M14 12 L2 0 L26 0 Z" fill="rgba(254, 240, 138, 0.35)" />
          <Path d="M50 12 L38 0 L62 0 Z" fill="rgba(254, 240, 138, 0.35)" />

          {/* Left & Right Tread Wheels */}
          <Rect x="4" y="16" width="8" height="32" rx="4" fill="#1E293B" stroke={mainColor} strokeWidth="1.5" />
          <Rect x="52" y="16" width="8" height="32" rx="4" fill="#1E293B" stroke={mainColor} strokeWidth="1.5" />

          {/* Main Chassis Body */}
          <Rect
            x="10"
            y="12"
            width="44"
            height="42"
            rx="14"
            fill={blocked ? "#450A0A" : "#0F172A"}
            stroke={mainColor}
            strokeWidth="3.5"
          />

          {/* Headlight LEDs */}
          <Circle cx="14" cy="12" r="3.5" fill="#FEF08A" />
          <Circle cx="50" cy="12" r="3.5" fill="#FEF08A" />

          {/* Rear Red Taillights */}
          <Circle cx="16" cy="52" r="3" fill="#EF4444" />
          <Circle cx="48" cy="52" r="3" fill="#EF4444" />

          {/* Glass Visor & Glowing Eyes */}
          <Rect x="14" y="16" width="36" height="14" rx="7" fill="#091428" stroke="#38BDF8" strokeWidth="1.5" />
          <Circle cx="24" cy="23" r="3.5" fill={blocked ? "#EF4444" : "#00E5FF"} />
          <Circle cx="40" cy="23" r="3.5" fill={blocked ? "#EF4444" : "#00E5FF"} />

          {/* Turn Signal & Arrow Indicators (Shown only when waiting/idle) */}
          {robot.status === "idle" && (
            <G>
              {turn === "straight" && (
                <Path
                  d="M32 30 L40 40 L35 40 L35 52 L29 52 L29 40 L24 40 Z"
                  fill="#00E5FF"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              )}

              {turn === "left" && (
                <G>
                  <Circle cx="10" cy="14" r="4" fill="#F59E0B" />
                  <Path
                    d="M40 50 L40 40 Q40 32 32 32 L22 32 L22 37 L12 28 L22 19 L22 24 L32 24 Q48 24 48 40 L48 50 Z"
                    fill="#F59E0B"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                </G>
              )}

              {turn === "right" && (
                <G>
                  <Circle cx="54" cy="14" r="4" fill="#10B981" />
                  <Path
                    d="M24 50 L24 40 Q24 32 32 32 L42 32 L42 37 L52 28 L42 19 L42 24 L32 24 Q16 24 16 40 L16 50 Z"
                    fill="#10B981"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                </G>
              )}
            </G>
          )}
        </G>
      </Svg>
      {isHint && <View style={styles.hintRing} />}
    </Animated.View>
  );
});

export default function RobotEscapeScreen() {
  const router = useRouter();

  const [level, setLevel] = useState(1);
  const [robots, setRobots] = useState<EscapeRobot[]>([]);
  const [taps, setTaps] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [userCoins, setUserCoins] = useState(1250);
  const [coinsReward, setCoinsReward] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "victory" | "completed">("playing");
  const [showIntro, setShowIntro] = useState(true);
  const [showPause, setShowPause] = useState(false);
  const [blockedId, setBlockedId] = useState<number | null>(null);
  const [hintId, setHintId] = useState<number | null>(null);
  const [companionText, setCompanionText] = useState(
    "Ketuk robot yang jalurnya kosong agar ia bisa keluar dari persimpangan! Perhatikan arah panahnya."
  );
  const [areaSize, setAreaSize] = useState({ w: Dimensions.get("window").width, h: Dimensions.get("window").height * 0.5 });

  const robotsRef = useRef<EscapeRobot[]>([]);

  const rX0 = useSharedValue(0); const rX1 = useSharedValue(0); const rX2 = useSharedValue(0); const rX3 = useSharedValue(0);
  const rX4 = useSharedValue(0); const rX5 = useSharedValue(0); const rX6 = useSharedValue(0); const rX7 = useSharedValue(0);
  const rY0 = useSharedValue(0); const rY1 = useSharedValue(0); const rY2 = useSharedValue(0); const rY3 = useSharedValue(0);
  const rY4 = useSharedValue(0); const rY5 = useSharedValue(0); const rY6 = useSharedValue(0); const rY7 = useSharedValue(0);
  const rT0 = useSharedValue(0); const rT1 = useSharedValue(0); const rT2 = useSharedValue(0); const rT3 = useSharedValue(0);
  const rT4 = useSharedValue(0); const rT5 = useSharedValue(0); const rT6 = useSharedValue(0); const rT7 = useSharedValue(0);
  const rS0 = useSharedValue(0); const rS1 = useSharedValue(0); const rS2 = useSharedValue(0); const rS3 = useSharedValue(0);
  const rS4 = useSharedValue(0); const rS5 = useSharedValue(0); const rS6 = useSharedValue(0); const rS7 = useSharedValue(0);
  const rF0 = useSharedValue(0); const rF1 = useSharedValue(0); const rF2 = useSharedValue(0); const rF3 = useSharedValue(0);
  const rF4 = useSharedValue(0); const rF5 = useSharedValue(0); const rF6 = useSharedValue(0); const rF7 = useSharedValue(0);

  const robotX = useMemo(() => [rX0, rX1, rX2, rX3, rX4, rX5, rX6, rX7], [rX0, rX1, rX2, rX3, rX4, rX5, rX6, rX7]);
  const robotY = useMemo(() => [rY0, rY1, rY2, rY3, rY4, rY5, rY6, rY7], [rY0, rY1, rY2, rY3, rY4, rY5, rY6, rY7]);
  const robotRot = useMemo(() => [rT0, rT1, rT2, rT3, rT4, rT5, rT6, rT7], [rT0, rT1, rT2, rT3, rT4, rT5, rT6, rT7]);
  const robotShake = useMemo(() => [rS0, rS1, rS2, rS3, rS4, rS5, rS6, rS7], [rS0, rS1, rS2, rS3, rS4, rS5, rS6, rS7]);
  const robotFlash = useMemo(() => [rF0, rF1, rF2, rF3, rF4, rF5, rF6, rF7], [rF0, rF1, rF2, rF3, rF4, rF5, rF6, rF7]);

  const currentLevel = useMemo(() => LEVELS.find((l) => l.level === level) || LEVELS[0], [level]);

  const spacing = useMemo(() => {
    const w = (areaSize.w - ROBOT_SIZE - 20) / (2 * 3);
    const h = (areaSize.h - ROBOT_SIZE - 16) / (2 * 3);
    return Math.max(34, Math.min(w, h, 58));
  }, [areaSize]);

  const centerX = areaSize.w / 2;
  const centerY = areaSize.h / 2;

  const cellToPixel = useCallback(
    (cell: { x: number; y: number }) => ({
      x: centerX + (cell.x - CENTER.x) * spacing,
      y: centerY + (cell.y - CENTER.y) * spacing,
    }),
    [centerX, centerY, spacing]
  );

  useEffect(() => {
    const load = async () => {
      try {
        const coins = await Storage.getItem(COINS_STORAGE_KEY);
        if (coins !== null) setUserCoins(parseInt(coins));
        const lvl = await Storage.getItem(STORAGE_KEY_LEVEL);
        if (lvl !== null) {
          const l = parseInt(lvl);
          if (l >= 1 && l <= LEVELS.length) setLevel(l);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const init = currentLevel.robots.map((r) => ({ ...r, status: "idle" as const }));
    setRobots(init);
    robotsRef.current = init;
    setTaps(0);
    setGameState((prev) => (prev === "completed" ? prev : "playing"));
    setBlockedId(null);
    setHintId(null);
    setShowIntro(true);
    setCompanionText(`Misi Level ${level}: ${currentLevel.tip}`);
    for (let i = 0; i < MAX_ROBOTS; i++) {
      cancelAnimation(robotX[i]);
      cancelAnimation(robotY[i]);
      cancelAnimation(robotRot[i]);
      cancelAnimation(robotShake[i]);
      cancelAnimation(robotFlash[i]);
      robotX[i].value = 0;
      robotY[i].value = 0;
      robotRot[i].value = i < init.length ? dirAngle(init[i].approach) : 0;
      robotShake[i].value = 0;
      robotFlash[i].value = 0;
    }
  }, [level, currentLevel, robotX, robotY, robotRot, robotShake, robotFlash]);

  const escapedCount = robots.filter((r) => r.status === "escaped").length;

  useEffect(() => {
    if (escapedCount === robots.length && robots.length > 0 && gameState === "playing") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCompanionText("🎉 Semua robot berhasil keluar! Persimpangan bersih kembali!");
      const t = setTimeout(() => {
        setCoinsReward(currentLevel.reward);
        saveGameSession({ gameId: "robot-escape", level, score: 100, xpEarned: 50, coinsEarned: 50, completed: true });
        if (level < LEVELS.length) setGameState("victory");
        else setGameState("completed");
      }, 800);
      return () => clearTimeout(t);
    }
  }, [escapedCount, robots.length, gameState, level, currentLevel.reward]);

  const setRobotStatus = (id: number, status: EscapeRobot["status"]) => {
    setRobots((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, status } : r));
      robotsRef.current = next;
      return next;
    });
  };

  const handleTap = useCallback(
    (index: number) => {
      if (gameState !== "playing") return;
      const robot = robotsRef.current[index];
      if (!robot || robot.status !== "idle") return;

      setTaps((t) => t + 1);
      setHintId(null);
      const idx = index;
      const hRoads = currentLevel.hRoads || [3];
      const vRoads = currentLevel.vRoads || [3];
      const blockList = robotsRef.current.filter((o) => o.id !== robot.id && o.status === "idle");
      const path = pathCells(robot, hRoads, vRoads);
      const pathSet = new Set(path.map(cellKey));
      const robotBlocker = blockList.find((o) => pathSet.has(cellKey(o.cell)));
      const obsBlocker = (currentLevel.obstacles || []).find((obs) => pathSet.has(cellKey(obs.cell)));

      if (robotBlocker || obsBlocker) {
        // BLOCKED
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setBlockedId(robot.id);
        if (obsBlocker) {
          setCompanionText(
            `🚧 Jalur robot terhalang oleh Rintangan ${
              obsBlocker.type === "cone" ? "Kerucut" : obsBlocker.type === "barrier" ? "Barikade" : "Bahaya"
            }! Analisis dan cari jalur bebas.`
          );
        } else {
          setCompanionText(`🔒 Robot ini terhalang oleh robot di depannya. Keluarkan robot itu terlebih dahulu!`);
        }
        robotFlash[idx].value = withSequence(
          withTiming(1, { duration: 90 }),
          withTiming(0, { duration: 90 }),
          withTiming(1, { duration: 90 }),
          withTiming(0, { duration: 90 })
        );
        robotShake[idx].value = withSequence(
          withTiming(-10, { duration: 45 }),
          withTiming(10, { duration: 45 }),
          withTiming(-8, { duration: 45 }),
          withTiming(8, { duration: 45 }),
          withTiming(0, { duration: 45 })
        );
        if (robotBlocker) {
          const bIdx = robotsRef.current.findIndex((o) => o.id === robotBlocker.id);
          if (bIdx >= 0) {
            robotFlash[bIdx].value = withSequence(
              withTiming(1, { duration: 120 }),
              withTiming(0, { duration: 120 }),
              withTiming(1, { duration: 120 }),
              withTiming(0, { duration: 120 })
            );
            robotShake[bIdx].value = withSequence(
              withTiming(-8, { duration: 50 }),
              withTiming(8, { duration: 50 }),
              withTiming(0, { duration: 50 })
            );
          }
        }
        setTimeout(() => setBlockedId(null), 700);
        return;
      }

      // ESCAPE
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setRobotStatus(robot.id, "moving");
      setCompanionText(`🚀 Robot ${idx + 1} melaju keluar persimpangan!`);

      const start = cellToPixel(robot.cell);
      
      // Calculate intersection turn point
      let turnCell = { x: 3, y: 3 };
      let curCell = { ...robot.cell };
      const [adx, ady] = DIRS[robot.approach];
      const interSet = new Set<string>();
      vRoads.forEach((vx) => hRoads.forEach((hy) => interSet.add(`${vx},${hy}`)));

      while (inGrid(curCell.x + adx, curCell.y + ady)) {
        curCell = { x: curCell.x + adx, y: curCell.y + ady };
        if (interSet.has(`${curCell.x},${curCell.y}`)) {
          turnCell = curCell;
          break;
        }
      }

      const turnPos = cellToPixel(turnCell);
      const newDir = applyTurn(robot.approach, robot.turn);

      // Exact reach distance to drive cleanly off-screen based on exit direction
      const isVerticalExit = newDir === "UP" || newDir === "DOWN";
      const reach = isVerticalExit ? areaSize.h / 2 + ROBOT_SIZE + 60 : areaSize.w / 2 + ROBOT_SIZE + 60;
      const [ex, ey] = DIRS[newDir];
      const exit = { x: turnPos.x + ex * reach, y: turnPos.y + ey * reach };

      // Constant drive speed (~0.30 px/ms -> 300px/s)
      const SPEED = 0.30;
      const d1 = Math.hypot(turnPos.x - start.x, turnPos.y - start.y);
      const dur1 = Math.max(450, Math.round(d1 / SPEED)); // smooth drive into intersection box

      const d2 = Math.hypot(exit.x - turnPos.x, exit.y - turnPos.y);
      const dur2 = Math.max(600, Math.round(d2 / SPEED)); // smooth drive out through exit gate

      // Stage 1: Smooth drive to intersection box
      robotX[idx].value = withTiming(turnPos.x - start.x, { duration: dur1 });
      robotY[idx].value = withTiming(turnPos.y - start.y, { duration: dur1 });

      // Stage 2: Turn (if turning) & drive out
      setTimeout(() => {
        if (robot.turn !== "straight") {
          const turnDur = 260;
          robotRot[idx].value = withTiming(dirAngle(newDir), { duration: turnDur });
          setTimeout(() => {
            robotX[idx].value = withTiming(exit.x - start.x, { duration: dur2 });
            robotY[idx].value = withTiming(exit.y - start.y, { duration: dur2 });
            setTimeout(() => {
              setRobotStatus(robot.id, "escaped");
            }, dur2);
          }, turnDur);
        } else {
          robotX[idx].value = withTiming(exit.x - start.x, { duration: dur2 });
          robotY[idx].value = withTiming(exit.y - start.y, { duration: dur2 });
          setTimeout(() => {
            setRobotStatus(robot.id, "escaped");
          }, dur2);
        }
      }, dur1);
    },
    [gameState, cellToPixel, centerX, centerY, areaSize, robotX, robotY, robotRot, robotShake, robotFlash, currentLevel]
  );

  const handleHint = () => {
    if (gameState !== "playing") return;
    if (userCoins < 20) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setCompanionText("⚠️ Koin tidak cukup! Butuh 20 koin untuk petunjuk.");
      return;
    }
    const movable = robotsRef.current.find(
      (r) =>
        r.status === "idle" &&
        canEscape(
          r,
          robotsRef.current,
          currentLevel.obstacles || [],
          currentLevel.hRoads || [3],
          currentLevel.vRoads || [3]
        )
    );
    const newCoins = userCoins - 20;
    setUserCoins(newCoins);
    Storage.setItem(COINS_STORAGE_KEY, String(newCoins));
    if (movable) {
      const idx = robotsRef.current.findIndex((r) => r.id === movable.id);
      setHintId(movable.id);
      setCompanionText(`💡 Petunjuk: robot di posisi ${idx + 1} bisa keluar duluan! Coba ketuk dia.`);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      setCompanionText("💡 Semua robot masih terhalang. Periksa kembali panah setiap robot.");
    }
  };

  const handleRestart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    const init = currentLevel.robots.map((r) => ({ ...r, status: "idle" as const }));
    setRobots(init);
    robotsRef.current = init;
    setTaps(0);
    setBlockedId(null);
    setHintId(null);
    for (let i = 0; i < MAX_ROBOTS; i++) {
      cancelAnimation(robotX[i]);
      cancelAnimation(robotY[i]);
      cancelAnimation(robotRot[i]);
      robotX[i].value = 0;
      robotY[i].value = 0;
      robotRot[i].value = i < init.length ? dirAngle(init[i].approach) : 0;
    }
  };

  const handleSelectLevel = async (targetLvl: number) => {
    if (targetLvl < 1 || targetLvl > LEVELS.length) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLevel(targetLvl);
    setGameState("playing");
    setCoinsReward(0);
    setShowPause(false);
    setShowLevelSelect(false);
    setShowIntro(true);
    await Storage.setItem(STORAGE_KEY_LEVEL, String(targetLvl));
  };

  const handleNextLevel = async () => {
    const nextLvl = level + 1;
    const balance = userCoins + coinsReward;
    setUserCoins(balance);
    setCoinsReward(0);
    await Storage.setItem(COINS_STORAGE_KEY, String(balance));
    if (nextLvl > LEVELS.length) {
      setGameState("completed");
      setLevel(1);
      await Storage.setItem(STORAGE_KEY_LEVEL, "1");
    } else {
      setLevel(nextLvl);
      setGameState("playing");
      setShowIntro(true);
      await Storage.setItem(STORAGE_KEY_LEVEL, String(nextLvl));
    }
  };

  const handleExit = async () => {
    const balance = userCoins + coinsReward;
    setUserCoins(balance);
    await Storage.setItem(COINS_STORAGE_KEY, String(balance));
    router.back();
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setAreaSize({ w: width, h: height });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pressable style={styles.iconButton} onPress={() => setShowPause(true)}>
            <Ionicons name="menu" size={22} color="#94A3B8" />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => setShowHelp(true)}>
            <Ionicons name="help-circle" size={22} color="#94A3B8" />
          </Pressable>
        </View>
        <Pressable style={styles.levelBadgeContainer} onPress={() => setShowLevelSelect(true)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={styles.levelTag}>LEVEL {level}</Text>
            <Ionicons name="chevron-down" size={12} color="#67E8F9" />
          </View>
          <Text style={styles.levelTitle}>{currentLevel.title}</Text>
        </Pressable>
        <View style={styles.coinsBadge}>
          <MaterialCommunityIcons name="cash-multiple" size={17} color="#FBBF24" />
          <Text style={styles.coinsText}>{userCoins}</Text>
        </View>
      </View>

      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <Ionicons name="trail-sign" size={16} color="#67E8F9" />
          <Text style={styles.statusText}>
            {escapedCount} / {robots.length} keluar
          </Text>
        </View>
        <View style={styles.statusItem}>
          <MaterialCommunityIcons name="gesture-tap-hold" size={16} color="#94A3B8" />
          <Text style={styles.statusText}>Ketukan: {taps}</Text>
        </View>
      </View>

      <View style={styles.gameplayArea} onLayout={onLayout}>
        {/* Cyber Grid Ground Texture */}
        <View style={styles.cyberGridLines} />

        {/* Dynamic High-Tech Slate Roads */}
        {(currentLevel.vRoads || [3]).map((vx) => {
          const posX = cellToPixel({ x: vx, y: 3 }).x;
          return (
            <React.Fragment key={`vroad-${vx}`}>
              <View style={[styles.verticalRoad, { left: posX - 48, height: areaSize.h }]} />
              <View style={[styles.roadBorderV, { left: posX - 48, height: areaSize.h }]} />
              <View style={[styles.roadBorderV, { left: posX + 48, height: areaSize.h }]} />
              <View style={[styles.laneDividerV, { left: posX }]} />
              <View style={[styles.exitGateH, { left: posX - 45, top: 4 }]}>
                <Text style={styles.exitGateText}>▲ KELUAR ▲</Text>
              </View>
              <View style={[styles.exitGateH, { left: posX - 45, top: areaSize.h - 26 }]}>
                <Text style={styles.exitGateText}>▼ KELUAR ▼</Text>
              </View>
            </React.Fragment>
          );
        })}

        {(currentLevel.hRoads || [3]).map((hy) => {
          const posY = cellToPixel({ x: 3, y: hy }).y;
          return (
            <React.Fragment key={`hroad-${hy}`}>
              <View style={[styles.horizontalRoad, { top: posY - 48, width: areaSize.w }]} />
              <View style={[styles.roadBorderH, { top: posY - 48, width: areaSize.w }]} />
              <View style={[styles.roadBorderH, { top: posY + 48, width: areaSize.w }]} />
              <View style={[styles.laneDividerH, { top: posY }]} />
              <View style={[styles.exitGateV, { left: 4, top: posY - 45 }]}>
                <Text style={styles.exitGateTextV}>◄ KELUAR ◄</Text>
              </View>
              <View style={[styles.exitGateV, { left: areaSize.w - 26, top: posY - 45 }]}>
                <Text style={styles.exitGateTextV}>► KELUAR ►</Text>
              </View>
            </React.Fragment>
          );
        })}

        {/* Dynamic Intersections & Zebra Crossings */}
        {(currentLevel.vRoads || [3]).map((vx) =>
          (currentLevel.hRoads || [3]).map((hy) => {
            const pos = cellToPixel({ x: vx, y: hy });
            return (
              <React.Fragment key={`inter-${vx}-${hy}`}>
                <View style={[styles.intersection, { left: pos.x - 48, top: pos.y - 48 }]} />
                <View style={[styles.zebra, { left: pos.x - 48, top: pos.y - 72, width: 96, flexDirection: "row", justifyContent: "space-evenly" }]}>
                  {[0, 1, 2, 3].map((i) => (
                    <View key={i} style={styles.zebraBarH} />
                  ))}
                </View>
                <View style={[styles.zebra, { left: pos.x - 48, top: pos.y + 56, width: 96, flexDirection: "row", justifyContent: "space-evenly" }]}>
                  {[0, 1, 2, 3].map((i) => (
                    <View key={i} style={styles.zebraBarH} />
                  ))}
                </View>
                <View style={[styles.zebra, { left: pos.x - 72, top: pos.y - 48, height: 96, justifyContent: "space-evenly" }]}>
                  {[0, 1, 2, 3].map((i) => (
                    <View key={i} style={styles.zebraBarV} />
                  ))}
                </View>
                <View style={[styles.zebra, { left: pos.x + 56, top: pos.y - 48, height: 96, justifyContent: "space-evenly" }]}>
                  {[0, 1, 2, 3].map((i) => (
                    <View key={i} style={styles.zebraBarV} />
                  ))}
                </View>
              </React.Fragment>
            );
          })
        )}

        {/* Level Rintangan / Road Obstacles */}
        {currentLevel.obstacles?.map((obs, idx) => {
          const pos = cellToPixel(obs.cell);
          return (
            <View
              key={`obs-${idx}`}
              style={{
                position: "absolute",
                left: pos.x - ROBOT_SIZE / 2,
                top: pos.y - ROBOT_SIZE / 2,
                width: ROBOT_SIZE,
                height: ROBOT_SIZE,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 40,
              }}
            >
              <ObstacleItem type={obs.type} size={ROBOT_SIZE} />
            </View>
          );
        })}

        {/* Robots */}
        {robots.map((robot, index) => {
          if (robot.status === "escaped") return null;
          const start = cellToPixel(robot.cell);
          return (
            <Pressable
              key={robot.id}
              onPress={() => handleTap(index)}
              disabled={robot.status !== "idle"}
              style={[
                styles.robotHitbox,
                {
                  left: start.x - ROBOT_SIZE / 2,
                  top: start.y - ROBOT_SIZE / 2,
                  width: ROBOT_SIZE,
                  height: ROBOT_SIZE,
                },
              ]}
            >
              <RobotItem
                robot={robot}
                size={ROBOT_SIZE}
                blocked={blockedId === robot.id}
                isHint={hintId === robot.id}
                x={robotX[index]}
                y={robotY[index]}
                rot={robotRot[index]}
                shake={robotShake[index]}
                flash={robotFlash[index]}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.companionPanel}>
        <View style={styles.avatar}>
          <Svg width="44" height="44" viewBox="0 0 64 64">
            <Rect x="8" y="14" width="48" height="40" rx="14" fill="#00E5FF" stroke="#FFFFFF" strokeWidth="2.5" />
            <Circle cx="22" cy="32" r="6" fill="#0B132B" />
            <Circle cx="22" cy="32" r="2.5" fill="#00F0FF" />
            <Circle cx="42" cy="32" r="6" fill="#0B132B" />
            <Circle cx="42" cy="32" r="2.5" fill="#00F0FF" />
            <Rect x="29" y="4" width="6" height="10" rx="3" fill="#FFD700" />
            <Circle cx="32" cy="4" r="5" fill="#FFD700" />
          </Svg>
        </View>
        <View style={styles.dialogBubble}>
          <Text style={styles.dialogText}>{companionText}</Text>
        </View>
      </View>

      <View style={styles.bottomBar}>
        <Pressable style={styles.actionBtn} onPress={handleHint}>
          <View style={[styles.actionIconBg, { backgroundColor: "rgba(245,158,11,0.2)", borderColor: "#F59E0B" }]}>
            <Ionicons name="bulb" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionLabel}>Petunjuk -20</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={handleRestart}>
          <View style={[styles.actionIconBg, { backgroundColor: "rgba(239,68,68,0.2)", borderColor: "#EF4444" }]}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionLabel}>Ulangi</Text>
        </Pressable>
      </View>

      <Modal visible={showIntro && gameState === "playing"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.introIcon}>
              <MaterialCommunityIcons name="traffic-light" size={36} color="#22D3EE" />
            </View>
            <Text style={styles.modalTitle}>Robot Escape</Text>
            <Text style={[styles.modalSubtitle, { fontWeight: "900", color: "#0EA5E9", marginBottom: 10 }]}>
              Level {level}: {currentLevel.title}
            </Text>
            <Text style={styles.introText}>{currentLevel.tip}</Text>
            <Text style={styles.introHint}>
              Panah & lampu indikator pada robot menunjukkan arah belokannya. Ketuk robot yang jalurnya kosong untuk mengeluarkannya.
            </Text>
            <Button
              title="Mulai"
              onPress={() => setShowIntro(false)}
              variant="accent"
              style={{ width: "100%", marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={showPause} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Game Berhenti</Text>
            <Text style={[styles.modalSubtitle, { marginBottom: 20 }]}>Pilih opsi untuk melanjutkan:</Text>
            <Button
              title="Lanjutkan Bermain"
              onPress={() => setShowPause(false)}
              variant="primary"
              style={{ width: "100%", marginBottom: 10 }}
            />
            <Button
              title="Pilih Level (Mulai dari Level 1)"
              onPress={() => {
                setShowPause(false);
                setShowLevelSelect(true);
              }}
              variant="accent"
              style={{ width: "100%", marginBottom: 10 }}
            />
            <Button
              title="Ulangi Level Ini"
              onPress={() => {
                setShowPause(false);
                handleRestart();
              }}
              variant="secondary"
              style={{ width: "100%", marginBottom: 10 }}
            />
            <Button
              title="Kembali ke Menu Utama"
              onPress={() => {
                setShowPause(false);
                router.back();
              }}
              variant="secondary"
              style={{ width: "100%", backgroundColor: "#EF4444" }}
            />
          </View>
        </View>
      </Modal>

      {/* LEVEL SELECTOR MODAL */}
      <Modal visible={showLevelSelect} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 520, padding: 20 }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: 14 }}>
              <View>
                <Text style={[styles.modalTitle, { textAlign: "left", fontSize: 20, marginBottom: 2 }]}>Pilih Level</Text>
                <Text style={[styles.modalSubtitle, { textAlign: "left", marginBottom: 0 }]}>Pilih persimpangan yang ingin dimainkan:</Text>
              </View>
              <Pressable style={styles.iconButton} onPress={() => setShowLevelSelect(false)}>
                <Ionicons name="close" size={22} color="#94A3B8" />
              </Pressable>
            </View>

            <View style={styles.levelGridWrap}>
              {LEVELS.map((lvl) => {
                const isActive = lvl.level === level;
                return (
                  <Pressable
                    key={lvl.level}
                    onPress={() => handleSelectLevel(lvl.level)}
                    style={[
                      styles.levelGridCard,
                      isActive && styles.levelGridCardActive,
                    ]}
                  >
                    <Text style={[styles.levelGridNum, isActive && styles.levelGridNumActive]}>
                      Level {lvl.level}
                    </Text>
                    <Text style={styles.levelGridName} numberOfLines={1}>
                      {lvl.title}
                    </Text>
                    <Text style={styles.levelGridRobotCount}>
                      🤖 {lvl.robots.length} Robot
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Button
              title="Mulai dari Level 1"
              onPress={() => handleSelectLevel(1)}
              variant="accent"
              style={{ width: "100%", marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>

      {/* TWO-COLUMN VICTORY & COMPLETED RESULT MODAL WITH 5-AXIS RADAR CHART */}
      <Modal visible={gameState === "victory" || gameState === "completed"} transparent animationType="fade">
        {(() => {
          const isFinished = gameState === "completed";
          const starsEarned = starsFor(taps, currentLevel.robots.length);
          const totalCoins = userCoins + coinsReward;
          const radarScores = {
            spasial: Math.min(100, Math.max(70, 95 - (taps - currentLevel.robots.length) * 5)),
            keputusan: Math.min(100, Math.max(65, 88 + level * 2)),
            kontrolDiri: Math.min(100, Math.max(75, starsEarned === 3 ? 98 : 82)),
            memori: Math.min(100, Math.max(70, 85 + level * 1.5)),
            fokus: Math.min(100, Math.max(65, 90 - (taps - currentLevel.robots.length) * 4)),
          };

          return (
            <View style={styles.modalOverlay}>
              <View style={styles.resultBoxContainer}>
                {/* HEADER TITLE */}
                <View style={styles.modalHeaderSec}>
                  <Text style={styles.modalSubBadge}>
                    {isFinished ? "ALL MISSIONS CLEARED" : "PERSIMPANGAN BERSIH"}
                  </Text>
                  <Text style={styles.modalMainTitle}>
                    {isFinished ? "SEMUA LEVEL SELESAI!" : `PERSIMPANGAN BERSIH! LEVEL ${level}`}
                  </Text>
                  <Text style={styles.modalSubTitle}>
                    {currentLevel.title} selesai — semua robot berhasil keluar tanpa tabrakan.
                  </Text>
                </View>

                {/* TWO COLUMNS BODY */}
                <View style={styles.modalBodyTwoCols}>
                  {/* LEFT COLUMN: PENCAPAIAN MISI */}
                  <View style={styles.leftPencapaianCard}>
                    <Text style={styles.colSectionHeader}>PENCAPAIAN MISI</Text>

                    <View style={styles.starsRowNew}>
                      {[1, 2, 3].map((s) => (
                        <Ionicons
                          key={s}
                          name={s <= starsEarned ? "star" : "star-outline"}
                          size={26}
                          color="#F59E0B"
                        />
                      ))}
                    </View>

                    <View style={styles.bulletListSec}>
                      <Text style={styles.bulletItemText}>
                        ⭐ Ketukan Digunakan: <Text style={{ color: "#34D399", fontWeight: "bold" }}>{taps} Ketukan</Text>
                      </Text>
                      <Text style={styles.bulletItemText}>
                        ⭐ Efisiensi Navigasi: <Text style={{ color: "#38BDF8", fontWeight: "bold" }}>
                          {taps <= currentLevel.robots.length ? "Akurasi Sempurna!" : "Sangat Baik"}
                        </Text>
                      </Text>
                      <Text style={styles.bulletItemText}>
                        ⭐ Robot Dikeluarkan: <Text style={{ color: "#FACC15", fontWeight: "bold" }}>{currentLevel.robots.length} / {currentLevel.robots.length} Robot</Text>
                      </Text>
                    </View>

                    <View style={styles.colDividerLine} />

                    <View style={styles.lootRowLine}>
                      <Text style={styles.lootLabelText}>Hadiah Koin Misi:</Text>
                      <Text style={styles.lootValText}>+{coinsReward} Koin</Text>
                    </View>
                    <View style={styles.lootRowLine}>
                      <Text style={styles.lootLabelText}>Bonus Efisiensi:</Text>
                      <Text style={styles.lootValText}>+{starsEarned * 10} Koin</Text>
                    </View>

                    <View style={styles.totalCoinsHighlightBox}>
                      <Text style={styles.totalCoinsBoxLabel}>TOTAL KOIN SAYA:</Text>
                      <Text style={styles.totalCoinsBoxVal}>{totalCoins} KOIN</Text>
                    </View>
                  </View>

                  {/* RIGHT COLUMN: ANALISIS PERKEMBANGAN OTAK & RADAR CHART */}
                  <View style={styles.rightRadarCard}>
                    <Text style={styles.colSectionHeader}>🧠 Analisis Perkembangan Otak</Text>
                    <Text style={styles.radarSubHeader}>Prefrontal Cortex & Kontrol Emosi</Text>

                    <View style={styles.radarChartCanvasWrap}>
                      <EscapeRadarChart scores={radarScores} />
                    </View>
                  </View>
                </View>

                {/* BOTTOM ACTION BUTTONS */}
                <View style={styles.resultActionsRowNew}>
                  <Pressable style={styles.btnMenuPill} onPress={handleExit}>
                    <Text style={styles.btnMenuPillText}>Kembali Ke Peta Utama</Text>
                  </Pressable>

                  <Pressable style={styles.btnMenuPill} onPress={() => setShowLevelSelect(true)}>
                    <Text style={styles.btnMenuPillText}>Pilih Level</Text>
                  </Pressable>

                  <Pressable style={styles.btnRetryPill} onPress={isFinished ? handleExit : handleNextLevel}>
                    <Text style={styles.btnRetryPillText}>
                      {isFinished ? "Klaim Hadiah & Selesai" : "Misi Berikutnya"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })()}
      </Modal>

      <HowToPlayModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title="Cara Main Robot Escape"
        goal="Bantu semua robot keluar dari persimpangan lalu lintas tanpa menabrak!"
        accentColor="#16A34A"
        subtitleColor="#15803D"
        steps={[
          { emoji: "1️⃣", text: "Ketuk robot untuk menggerakkannya keluar sepanjang jalurnya (lurus atau belok)." },
          { emoji: "2️⃣", text: "Perhatikan arah panah dan hindari tabrakan antar robot atau rintangan (kerucut, robot rusak)." },
          { emoji: "3️⃣", text: "Kalau robot menabrak, dia kembali ke posisi awal — coba lagi!" },
          { emoji: "4️⃣", text: "Keluarkan semua robot dari persimpangan untuk menyelesaikan level." },
        ]}
        tips={[
          "Pilih robot yang jalannya paling bebas lebih dulu.",
          "Urutan pelepasan itu kunci — bayangkan jalur tiap robot sebelum mengetuk.",
        ]}
      />
    </SafeAreaView>
  );
}

// worklet helper referenced from handlers
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B1120",
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
  levelTag: {
    color: "#67E8F9",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  levelTitle: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  coinsBadge: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(251, 191, 36, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.4)",
    gap: 6,
  },
  coinsText: {
    color: "#FBBF24",
    fontWeight: "900",
    fontSize: 14,
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "800",
  },
  gameplayArea: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#0B1120",
  },
  verticalRoad: {
    position: "absolute",
    top: 0,
    width: 90,
    backgroundColor: "#1E293B",
    borderLeftWidth: 3,
    borderLeftColor: "#334155",
    borderRightWidth: 3,
    borderRightColor: "#334155",
  },
  horizontalRoad: {
    position: "absolute",
    left: 0,
    height: 90,
    backgroundColor: "#1E293B",
    borderTopWidth: 3,
    borderTopColor: "#334155",
    borderBottomWidth: 3,
    borderBottomColor: "#334155",
  },
  intersection: {
    position: "absolute",
    width: 90,
    height: 90,
    backgroundColor: "#1E293B",
  },
  laneDividerV: {
    position: "absolute",
    top: 0,
    width: 2,
    borderWidth: 1,
    borderColor: "#FBBF24",
    borderStyle: "dashed",
    opacity: 0.7,
    height: "100%",
  },
  laneDividerH: {
    position: "absolute",
    left: 0,
    height: 2,
    borderWidth: 1,
    borderColor: "#FBBF24",
    borderStyle: "dashed",
    opacity: 0.7,
    width: "100%",
  },
  zebra: {
    position: "absolute",
    zIndex: 1,
  },
  zebraBarH: {
    width: 12,
    height: 16,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  zebraBarV: {
    width: 16,
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  robotHitbox: {
    position: "absolute",
    zIndex: 50,
  },
  robotContainer: {
    position: "relative",
  },
  hintRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#FBBF24",
    opacity: 0.9,
  },
  companionPanel: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: SPACING.md,
    marginVertical: 8,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(0, 240, 255, 0.3)",
    padding: 12,
  },
  avatar: {
    marginRight: 12,
  },
  dialogBubble: {
    flex: 1,
  },
  dialogText: {
    color: "#E2E8F0",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    backgroundColor: "#0F172A",
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
  actionLabel: {
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
  modalCard: {
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
  introIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(34, 211, 238, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  introText: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
  introHint: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 18,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1E2937",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 19,
  },
  victoryIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFBEB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  starRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  rewardCard: {
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
  fullBtn: {
    width: "100%",
  },
  cyberGridLines: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
    borderWidth: 1,
    borderColor: "#00E5FF",
  },
  roadBorderV: {
    position: "absolute",
    top: 0,
    width: 2,
    backgroundColor: "#00E5FF",
    shadowColor: "#00E5FF",
    shadowRadius: 6,
    shadowOpacity: 0.8,
  },
  roadBorderH: {
    position: "absolute",
    left: 0,
    height: 2,
    backgroundColor: "#00E5FF",
    shadowColor: "#00E5FF",
    shadowRadius: 6,
    shadowOpacity: 0.8,
  },
  exitGateH: {
    position: "absolute",
    width: 90,
    height: 22,
    borderRadius: 6,
    backgroundColor: "rgba(16, 185, 129, 0.25)",
    borderWidth: 1.5,
    borderColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  exitGateText: {
    color: "#34D399",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  exitGateV: {
    position: "absolute",
    width: 22,
    height: 90,
    borderRadius: 6,
    backgroundColor: "rgba(16, 185, 129, 0.25)",
    borderWidth: 1.5,
    borderColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  exitGateTextV: {
    color: "#34D399",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  resultBoxContainer: {
    width: "92%",
    maxWidth: 600,
    backgroundColor: "#0B132B",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(0, 229, 255, 0.4)",
    padding: 20,
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
  modalHeaderSec: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalSubBadge: {
    color: "#00E5FF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  modalMainTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 4,
  },
  modalSubTitle: {
    color: "#94A3B8",
    fontSize: 12,
    textAlign: "center",
  },
  modalBodyTwoCols: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  leftPencapaianCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 14,
  },
  rightRadarCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.25)",
    padding: 14,
    alignItems: "center",
  },
  colSectionHeader: {
    color: "#38BDF8",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  starsRowNew: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  bulletListSec: {
    gap: 6,
    marginBottom: 12,
  },
  bulletItemText: {
    color: "#CBD5E1",
    fontSize: 12,
    lineHeight: 18,
  },
  colDividerLine: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 10,
  },
  lootRowLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  lootLabelText: {
    color: "#94A3B8",
    fontSize: 12,
  },
  lootValText: {
    color: "#34D399",
    fontSize: 12,
    fontWeight: "700",
  },
  totalCoinsHighlightBox: {
    marginTop: 10,
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    borderWidth: 1,
    borderColor: "#FBBF24",
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalCoinsBoxLabel: {
    color: "#FBBF24",
    fontSize: 11,
    fontWeight: "900",
  },
  totalCoinsBoxVal: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  radarSubHeader: {
    color: "#94A3B8",
    fontSize: 11,
    marginBottom: 10,
  },
  radarChartCanvasWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  resultActionsRowNew: {
    flexDirection: "row",
    gap: 12,
  },
  btnMenuPill: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  btnMenuPillText: {
    color: "#E2E8F0",
    fontSize: 13,
    fontWeight: "800",
  },
  btnRetryPill: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#00E5FF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00E5FF",
    shadowRadius: 8,
    shadowOpacity: 0.5,
  },
  btnRetryPillText: {
    color: "#0B132B",
    fontSize: 13,
    fontWeight: "900",
  },
  levelGridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    width: "100%",
    justifyContent: "space-between",
  },
  levelGridCard: {
    width: "48%",
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  levelGridCardActive: {
    backgroundColor: "#ECFEFF",
    borderColor: "#06B6D4",
  },
  levelGridNum: {
    fontSize: 12,
    fontWeight: "900",
    color: "#64748B",
    marginBottom: 2,
  },
  levelGridNumActive: {
    color: "#0891B2",
  },
  levelGridName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  levelGridRobotCount: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "600",
  },
});
