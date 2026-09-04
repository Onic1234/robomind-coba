import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  StyleSheet,
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
import AsyncStorage from "@react-native-async-storage/async-storage";
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

interface LevelConfig {
  level: number;
  title: string;
  tip: string;
  reward: number;
  par: number;
  robots: Omit<EscapeRobot, "status">[];
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

const pathCells = (r: { cell: { x: number; y: number }; approach: Dir; turn: Turn }) => {
  const cells: { x: number; y: number }[] = [];
  let cur = { ...r.cell };
  while (!(cur.x === CENTER.x && cur.y === CENTER.y)) {
    const [dx, dy] = DIRS[r.approach];
    cur = { x: cur.x + dx, y: cur.y + dy };
    if (!inGrid(cur.x, cur.y)) break;
    cells.push(cur);
  }
  const newDir = applyTurn(r.approach, r.turn);
  cur = { x: CENTER.x, y: CENTER.y };
  for (let i = 0; i < GRID; i++) {
    const [dx, dy] = DIRS[newDir];
    cur = { x: cur.x + dx, y: cur.y + dy };
    if (!inGrid(cur.x, cur.y)) break;
    cells.push(cur);
  }
  return cells;
};

const canEscape = (r: EscapeRobot, all: EscapeRobot[]): boolean => {
  const blockers = new Set(pathCells(r).map(cellKey));
  return all.every((o) => o.id === r.id || o.status !== "idle" || !blockers.has(cellKey(o.cell)));
};

const LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: "Persimpangan Pertama",
    tip: "Ketuk robot yang jalurnya kosong untuk membiarkannya keluar dari persimpangan.",
    reward: 50,
    par: 2,
    robots: [
      { id: 1, cell: { x: 3, y: 2 }, approach: "DOWN", turn: "straight" },
      { id: 2, cell: { x: 2, y: 3 }, approach: "RIGHT", turn: "straight" },
    ],
  },
  {
    level: 2,
    title: "Jalur Satu Arah",
    tip: "Robot di depan harus keluar dulu sebelum robot di belakangnya bisa maju.",
    reward: 80,
    par: 3,
    robots: [
      { id: 1, cell: { x: 3, y: 0 }, approach: "DOWN", turn: "straight" },
      { id: 2, cell: { x: 3, y: 2 }, approach: "DOWN", turn: "straight" },
      { id: 3, cell: { x: 4, y: 3 }, approach: "LEFT", turn: "straight" },
    ],
  },
  {
    level: 3,
    title: "Belokan Kanan",
    tip: "Perhatikan arah panah. Robot yang belok bisa terhalang oleh robot di jalur keluarnya.",
    reward: 100,
    par: 4,
    robots: [
      { id: 1, cell: { x: 3, y: 0 }, approach: "DOWN", turn: "right" },
      { id: 2, cell: { x: 4, y: 3 }, approach: "LEFT", turn: "straight" },
      { id: 3, cell: { x: 3, y: 4 }, approach: "UP", turn: "straight" },
      { id: 4, cell: { x: 3, y: 6 }, approach: "UP", turn: "straight" },
    ],
  },
  {
    level: 4,
    title: "Dua Rantai",
    tip: "Ada dua antrean sekaligus. Selesaikan antrean satu per satu.",
    reward: 120,
    par: 4,
    robots: [
      { id: 1, cell: { x: 3, y: 0 }, approach: "DOWN", turn: "straight" },
      { id: 2, cell: { x: 3, y: 2 }, approach: "DOWN", turn: "straight" },
      { id: 3, cell: { x: 0, y: 3 }, approach: "RIGHT", turn: "straight" },
      { id: 4, cell: { x: 2, y: 3 }, approach: "RIGHT", turn: "straight" },
    ],
  },
  {
    level: 5,
    title: "Belokan & Blokade",
    tip: "Cari robot yang paling depan di antrean — itulah kunci untuk membuka jalur.",
    reward: 150,
    par: 4,
    robots: [
      { id: 1, cell: { x: 3, y: 0 }, approach: "DOWN", turn: "right" },
      { id: 2, cell: { x: 3, y: 2 }, approach: "DOWN", turn: "straight" },
      { id: 3, cell: { x: 3, y: 4 }, approach: "UP", turn: "right" },
      { id: 4, cell: { x: 6, y: 3 }, approach: "LEFT", turn: "straight" },
    ],
  },
  {
    level: 6,
    title: "Simpul Empat",
    tip: "Robot yang belok ke jalur kanan terhalang oleh robot di jalur itu. Atur urutannya!",
    reward: 180,
    par: 5,
    robots: [
      { id: 1, cell: { x: 3, y: 0 }, approach: "DOWN", turn: "straight" },
      { id: 2, cell: { x: 3, y: 2 }, approach: "DOWN", turn: "straight" },
      { id: 3, cell: { x: 4, y: 3 }, approach: "LEFT", turn: "straight" },
      { id: 4, cell: { x: 5, y: 3 }, approach: "LEFT", turn: "straight" },
      { id: 5, cell: { x: 3, y: 4 }, approach: "UP", turn: "right" },
    ],
  },
  {
    level: 7,
    title: "Antrean Tiga",
    tip: "Tiga robot mengantre di satu jalur. Keluarkan dari yang paling dekat persimpangan.",
    reward: 200,
    par: 6,
    robots: [
      { id: 1, cell: { x: 3, y: 0 }, approach: "DOWN", turn: "straight" },
      { id: 2, cell: { x: 3, y: 1 }, approach: "DOWN", turn: "straight" },
      { id: 3, cell: { x: 3, y: 2 }, approach: "DOWN", turn: "straight" },
      { id: 4, cell: { x: 4, y: 3 }, approach: "LEFT", turn: "straight" },
      { id: 5, cell: { x: 6, y: 3 }, approach: "LEFT", turn: "straight" },
      { id: 6, cell: { x: 3, y: 4 }, approach: "UP", turn: "right" },
    ],
  },
  {
    level: 8,
    title: "Tiga Berjejer",
    tip: "Kombinasi antrean panjang dan belokan. Analisis dulu baru bertindak!",
    reward: 220,
    par: 6,
    robots: [
      { id: 1, cell: { x: 3, y: 0 }, approach: "DOWN", turn: "straight" },
      { id: 2, cell: { x: 3, y: 2 }, approach: "DOWN", turn: "straight" },
      { id: 3, cell: { x: 4, y: 3 }, approach: "LEFT", turn: "straight" },
      { id: 4, cell: { x: 5, y: 3 }, approach: "LEFT", turn: "straight" },
      { id: 5, cell: { x: 6, y: 3 }, approach: "LEFT", turn: "straight" },
      { id: 6, cell: { x: 3, y: 4 }, approach: "UP", turn: "right" },
    ],
  },
  {
    level: 9,
    title: "Kemacetan Tujuh",
    tip: "Tujuh robot di persimpangan. Tenang, selalu ada robot yang bisa keluar lebih dulu.",
    reward: 250,
    par: 7,
    robots: [
      { id: 1, cell: { x: 3, y: 0 }, approach: "DOWN", turn: "straight" },
      { id: 2, cell: { x: 3, y: 1 }, approach: "DOWN", turn: "straight" },
      { id: 3, cell: { x: 3, y: 2 }, approach: "DOWN", turn: "straight" },
      { id: 4, cell: { x: 4, y: 3 }, approach: "LEFT", turn: "straight" },
      { id: 5, cell: { x: 5, y: 3 }, approach: "LEFT", turn: "straight" },
      { id: 6, cell: { x: 6, y: 3 }, approach: "LEFT", turn: "straight" },
      { id: 7, cell: { x: 3, y: 4 }, approach: "UP", turn: "right" },
    ],
  },
  {
    level: 10,
    title: "Persimpangan Super",
    tip: "Delapan robot! Pecahkan rantai dari ujung jalur yang paling bebas.",
    reward: 300,
    par: 8,
    robots: [
      { id: 1, cell: { x: 3, y: 0 }, approach: "DOWN", turn: "straight" },
      { id: 2, cell: { x: 3, y: 1 }, approach: "DOWN", turn: "straight" },
      { id: 3, cell: { x: 3, y: 2 }, approach: "DOWN", turn: "straight" },
      { id: 4, cell: { x: 4, y: 3 }, approach: "LEFT", turn: "straight" },
      { id: 5, cell: { x: 5, y: 3 }, approach: "LEFT", turn: "straight" },
      { id: 6, cell: { x: 6, y: 3 }, approach: "LEFT", turn: "straight" },
      { id: 7, cell: { x: 3, y: 4 }, approach: "UP", turn: "right" },
      { id: 8, cell: { x: 3, y: 6 }, approach: "UP", turn: "right" },
    ],
  },
];

const starsFor = (taps: number, n: number) => (taps <= n ? 3 : taps <= n + 2 ? 2 : 1);

const dirAngle = (d: Dir) => (d === "UP" ? 0 : d === "RIGHT" ? 90 : d === "DOWN" ? 180 : 270);

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
      { scale: flash.value > 0 ? 1.05 : 1 },
    ],
  }));

  const S = size;
  const turn = robot.turn;
  return (
    <Animated.View style={[styles.robotContainer, { width: S, height: S }, animStyle]}>
      <Svg width={S} height={S} viewBox={`0 0 64 64`}>
        <G>
          <Rect x={10} y={14} width={44} height={40} rx={12} fill={blocked ? "#FEE2E2" : "#E0F2FE"} stroke={blocked ? "#EF4444" : "#0284C7"} strokeWidth={3} />
          <Rect x={6} y={20} width={7} height={28} rx={3} fill="#334155" />
          <Rect x={51} y={20} width={7} height={28} rx={3} fill="#334155" />
          <Rect x={9} y={15} width={46} height={12} rx={6} fill="#0F172A" />
          <Rect x={14} y={19} width={36} height={4} rx={2} fill="#22D3EE" />
          <Circle cx={20} cy={34} r={4} fill="#22D3EE" />
          <Circle cx={44} cy={34} r={4} fill="#22D3EE" />
          <Rect x={16} y={44} width={32} height={4} rx={2} fill="#0EA5E9" opacity={0.8} />
          <Path
            d={
              turn === "straight"
                ? "M32 8 L38 16 L35 16 L35 24 L29 24 L29 16 L26 16 Z"
                : turn === "left"
                ? "M32 6 L40 6 L32 12 L36 16 L30 20 L24 16 L28 12 L32 12 Z"
                : "M32 6 L24 6 L32 12 L28 16 L34 20 L40 16 L36 12 L32 12 Z"
            }
            fill="#F59E0B"
            stroke="#FFFFFF"
            strokeWidth={1.5}
          />
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
  const [userCoins, setUserCoins] = useState(0);
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
        const coins = await AsyncStorage.getItem(COINS_STORAGE_KEY);
        if (coins !== null) setUserCoins(parseInt(coins));
        const lvl = await AsyncStorage.getItem(STORAGE_KEY_LEVEL);
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
      const blockList = robotsRef.current.filter((o) => o.id !== robot.id && o.status === "idle");
      const path = pathCells(robot);
      const pathSet = new Set(path.map(cellKey));
      const blocker = blockList.find((o) => pathSet.has(cellKey(o.cell)));

      if (blocker) {
        // BLOCKED
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        const bIdx = robotsRef.current.findIndex((o) => o.id === blocker.id);
        setBlockedId(robot.id);
        setCompanionText(`🔒 Robot ini terhalang oleh robot di depannya. Keluarkan robot itu terlebih dahulu!`);
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
        setTimeout(() => setBlockedId(null), 700);
        return;
      }

      // ESCAPE
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setRobotStatus(robot.id, "moving");
      setCompanionText(`🚀 Robot ${idx + 1} melaju keluar persimpangan!`);

      const start = cellToPixel(robot.cell);
      const center = { x: centerX, y: centerY };
      const newDir = applyTurn(robot.approach, robot.turn);
      const reach = Math.max(areaSize.w, areaSize.h) + 300;
      const [ex, ey] = DIRS[newDir];
      const exit = { x: center.x + ex * reach, y: center.y + ey * reach };

      const d1 = Math.hypot(center.x - start.x, center.y - start.y);
      const dur1 = Math.max(150, d1 / 0.9);
      const d2 = Math.hypot(exit.x - center.x, exit.y - center.y);
      const dur2 = Math.max(200, d2 / 1.6);

      const stage2 = () => {
        robotRot[idx].value = withTiming(dirAngle(newDir), { duration: 200 });
        robotX[idx].value = withTiming(exit.x - start.x, { duration: dur2 }, (fin) => {
          if (fin) runOnJS(done)();
        });
        robotY[idx].value = withTiming(exit.y - start.y, { duration: dur2 });
      };
      const done = () => {
        setRobotStatus(robot.id, "escaped");
      };
      robotX[idx].value = withTiming(center.x - start.x, { duration: dur1 }, (fin) => {
        if (fin) runOnJS(stage2)();
      });
      robotY[idx].value = withTiming(center.y - start.y, { duration: dur1 });
    },
    [gameState, cellToPixel, centerX, centerY, areaSize, robotX, robotY, robotRot, robotShake, robotFlash]
  );

  const handleHint = () => {
    if (gameState !== "playing" || userCoins < 20) return;
    const movable = robotsRef.current.find((r) => r.status === "idle" && canEscape(r, robotsRef.current));
    const newCoins = userCoins - 20;
    setUserCoins(newCoins);
    AsyncStorage.setItem(COINS_STORAGE_KEY, String(newCoins));
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

  const handleNextLevel = async () => {
    saveGameSession({
      gameId: "robot-escape",
      level: level,
      score: 100,
      xpEarned: 120,
      coinsEarned: 50,
      completed: true,
    });
    const nextLvl = level + 1;
    const balance = userCoins + coinsReward;
    setUserCoins(balance);
    await AsyncStorage.setItem(COINS_STORAGE_KEY, String(balance));
    if (nextLvl > LEVELS.length) {
      setGameState("completed");
      setLevel(1);
      await AsyncStorage.setItem(STORAGE_KEY_LEVEL, "1");
    } else {
      setLevel(nextLvl);
      await AsyncStorage.setItem(STORAGE_KEY_LEVEL, String(nextLvl));
    }
  };

  const handleExit = async () => {
    const balance = userCoins + coinsReward;
    setUserCoins(balance);
    await AsyncStorage.setItem(COINS_STORAGE_KEY, String(balance));
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
        <View style={styles.levelBadgeContainer}>
          <Text style={styles.levelTag}>LEVEL {level}</Text>
          <Text style={styles.levelTitle}>{currentLevel.title}</Text>
        </View>
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
        {/* Roads */}
        <View style={[styles.verticalRoad, { left: centerX - 45, height: areaSize.h }]} />
        <View style={[styles.horizontalRoad, { top: centerY - 45, width: areaSize.w }]} />
        <View style={[styles.intersection, { left: centerX - 45, top: centerY - 45 }]} />
        <View style={[styles.laneDividerV, { left: centerX }]} />
        <View style={[styles.laneDividerH, { top: centerY }]} />
        <View style={[styles.zebra, { left: centerX - 45, top: centerY - 70, width: 90, flexDirection: "row", justifyContent: "space-evenly" }]}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.zebraBarH} />
          ))}
        </View>
        <View style={[styles.zebra, { left: centerX - 45, top: centerY + 54, width: 90, flexDirection: "row", justifyContent: "space-evenly" }]}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.zebraBarH} />
          ))}
        </View>
        <View style={[styles.zebra, { left: centerX - 70, top: centerY - 45, height: 90, justifyContent: "space-evenly" }]}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.zebraBarV} />
          ))}
        </View>
        <View style={[styles.zebra, { left: centerX + 54, top: centerY - 45, height: 90, justifyContent: "space-evenly" }]}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.zebraBarV} />
          ))}
        </View>

        {/* Robots */}
        {robots.map((robot, index) => {
          if (robot.status === "escaped") return null;
          const start = cellToPixel(robot.cell);
          return (
            <Pressable
              key={robot.id}
              onPress={() => handleTap(index)}
              disabled={robot.status !== "idle"}
              style={[styles.robotHitbox, { left: start.x - ROBOT_SIZE / 2, top: start.y - ROBOT_SIZE / 2 }]}
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
          <Text style={styles.actionLabel}>Petunjuk (-20)</Text>
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
              Panah di atas robot menunjukkan arah belokannya. Ketuk robot yang jalurnya kosong untuk mengeluarkannya.
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
            <Text style={[styles.modalSubtitle, { marginBottom: 24 }]}>Pilih opsi untuk melanjutkan:</Text>
            <Button
              title="Lanjutkan Bermain"
              onPress={() => setShowPause(false)}
              variant="primary"
              style={{ width: "100%", marginBottom: 12 }}
            />
            <Button
              title="Ulangi Level"
              onPress={() => {
                setShowPause(false);
                handleRestart();
              }}
              variant="accent"
              style={{ width: "100%", marginBottom: 12 }}
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

      <Modal visible={gameState === "victory"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.victoryIcon}>
              <Ionicons name="trophy" size={46} color="#FBBF24" />
            </View>
            <Text style={styles.modalTitle}>Persimpangan Bersih!</Text>
            <Text style={styles.modalSubtitle}>{currentLevel.title} selesai — semua robot berhasil keluar.</Text>
            <View style={styles.starRow}>
              {[1, 2, 3].map((s) => (
                <Ionicons
                  key={s}
                  name="star"
                  size={s === 2 ? 54 : 42}
                  color={s <= starsFor(taps, currentLevel.robots.length) ? "#FBBF24" : "#CBD5E1"}
                  style={{ marginTop: s === 2 ? -15 : 0 }}
                />
              ))}
            </View>
            <View style={styles.rewardCard}>
              <View style={styles.rewardItem}>
                <MaterialCommunityIcons name="cash-multiple" size={26} color="#FBBF24" />
                <Text style={styles.rewardAmount}>+{coinsReward} Koin</Text>
              </View>
              <View style={styles.rewardItem}>
                <MaterialCommunityIcons name="trophy-outline" size={26} color="#38BDF8" />
                <Text style={styles.rewardAmount}>+{15 + level * 5} XP</Text>
              </View>
            </View>
            <Button
              title={level === LEVELS.length ? "Selesai" : "Misi Berikutnya"}
              onPress={handleNextLevel}
              variant="accent"
              style={styles.fullBtn}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={gameState === "completed"} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.victoryIcon}>
              <Ionicons name="medal" size={54} color="#D97706" />
            </View>
            <Text style={styles.modalTitle}>Semua Selesai!</Text>
            <Text style={styles.modalSubtitle}>Luar biasa! Kamu membersihkan semua persimpangan robot di kota RoboMind.</Text>
            <Button
              title="Klaim Hadiah & Keluar"
              onPress={handleExit}
              variant="primary"
              style={styles.fullBtn}
            />
          </View>
        </View>
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
});
