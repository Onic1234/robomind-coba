import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  Modal,
  StatusBar,
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
  withSequence,
  cancelAnimation,
} from "react-native-reanimated";
import Svg, { Path, Circle, Rect, Polygon, G, Line, Text as SvgText } from "react-native-svg";
import { SPACING } from "../constants/Theme";
import Button from "../components/ui/Button";
import { saveGameSession } from "../lib/gameProgressService";

const STORAGE_KEY_COINS = "user_coins_balance";
const STORAGE_KEY_LEVEL = "robot_circuit_current_level";
const GRID_SIZE = 6;

type Port = "N" | "E" | "S" | "W";
type TileKind = "SOURCE" | "TARGET" | "WIRE" | "NOT" | "OBSTACLE";
type WireType = "STRAIGHT" | "CORNER" | "T" | "CROSS";

interface CircuitCell {
  id: string;
  gridX: number;
  gridY: number;
  kind: TileKind;
  wireType?: WireType;
  rotation: number;
  basePorts?: Port[];
  sourceValue?: 0 | 1;
  locked?: boolean;
}

interface LevelConfig {
  level: number;
  title: string;
  rewardCoins: number;
  rewardXP: number;
  teaches: string;
  par: number;
  grid: CircuitCell[];
}



const ROT: Record<Port, Port> = { N: "E", E: "S", S: "W", W: "N" };
const OPP: Record<Port, Port> = { N: "S", S: "N", E: "W", W: "E" };
const DIRS: Record<Port, [number, number]> = {
  N: [0, -1],
  E: [1, 0],
  S: [0, 1],
  W: [-1, 0],
};

const BASE_PORTS: Record<WireType, Port[]> = {
  STRAIGHT: ["N", "S"],
  CORNER: ["N", "E"],
  T: ["N", "E", "S"],
  CROSS: ["N", "E", "S", "W"],
};

const rotatePorts = (ports: Port[], rotation: number): Port[] => {
  const steps = ((rotation / 90) % 4 + 4) % 4;
  let out = ports;
  for (let i = 0; i < steps; i++) out = out.map((p) => ROT[p]);
  return out;
};

const getPorts = (cell: CircuitCell): Port[] => {
  if (cell.kind === "WIRE") return rotatePorts(BASE_PORTS[cell.wireType!], cell.rotation);
  if (cell.kind === "NOT") return rotatePorts(BASE_PORTS.STRAIGHT, cell.rotation);
  if (cell.kind === "SOURCE" || cell.kind === "TARGET") return rotatePorts(cell.basePorts || [], cell.rotation);
  return [];
};

interface CircuitResult {
  powered: Record<string, number[]>;
  targetValue: number | null;
  targetOn: boolean;
}

const computeCircuit = (cells: CircuitCell[]): CircuitResult => {
  const byKey: Record<string, CircuitCell> = {};
  const byId: Record<string, CircuitCell> = {};
  const portMap: Record<string, Port[]> = {};
  for (const c of cells) {
    byKey[c.gridX + "," + c.gridY] = c;
    byId[c.id] = c;
    portMap[c.id] = getPorts(c);
  }
  const powered: Record<string, number[]> = {};
  const visited = new Set<string>();
  const queue: { id: string; p: Port; value: number }[] = [];

  for (const cell of cells) {
    if (cell.kind !== "SOURCE") continue;
    for (const p of portMap[cell.id] || []) {
      const [dx, dy] = DIRS[p];
      const n = byKey[cell.gridX + dx + "," + (cell.gridY + dy)];
      if (!n) continue;
      const opp = OPP[p];
      if (!portMap[n.id]?.includes(opp)) continue;
      const key = n.id + "|" + opp + "|" + cell.sourceValue;
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push({ id: n.id, p: opp, value: cell.sourceValue ?? 1 });
    }
  }

  while (queue.length) {
    const item = queue.shift()!;
    const cell = byId[item.id];
    if (!cell) continue;
    if (!powered[item.id]) powered[item.id] = [];
    if (!powered[item.id].includes(item.value)) powered[item.id].push(item.value);

    for (const outP of portMap[item.id] || []) {
      if (outP === item.p) continue;
      const outValue = cell.kind === "NOT" ? 1 - item.value : item.value;
      const [dx, dy] = DIRS[outP];
      const n = byKey[cell.gridX + dx + "," + (cell.gridY + dy)];
      if (!n) continue;
      const opp = OPP[outP];
      if (!portMap[n.id]?.includes(opp)) continue;
      const key = n.id + "|" + opp + "|" + outValue;
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push({ id: n.id, p: opp, value: outValue });
    }
  }

  let targetValue: number | null = null;
  for (const cell of cells) {
    if (cell.kind !== "TARGET") continue;
    const vals = powered[cell.id];
    if (vals && vals.length) targetValue = vals.includes(1) ? 1 : 0;
  }
  return { powered, targetValue, targetOn: targetValue === 1 };
};



const LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: "Sirkuit Pertama",
    rewardCoins: 50,
    rewardXP: 20,
    teaches: "Putar kabel agar sinyal mengalir dari Sumber menuju Lampu.",
    par: 3,
    grid: [
      { id: "s1", gridX: 2, gridY: 0, kind: "SOURCE", basePorts: ["S"], sourceValue: 1, rotation: 0, locked: true },
      { id: "w1", gridX: 2, gridY: 1, kind: "WIRE", wireType: "STRAIGHT", rotation: 90 },
      { id: "w2", gridX: 2, gridY: 2, kind: "WIRE", wireType: "STRAIGHT", rotation: 0 },
      { id: "w3", gridX: 2, gridY: 3, kind: "WIRE", wireType: "STRAIGHT", rotation: 90 },
      { id: "w4", gridX: 2, gridY: 4, kind: "WIRE", wireType: "STRAIGHT", rotation: 270 },
      { id: "t1", gridX: 2, gridY: 5, kind: "TARGET", basePorts: ["N"], rotation: 0, locked: true },
    ],
  },
  {
    level: 2,
    title: "Belokan Daya",
    rewardCoins: 75,
    rewardXP: 25,
    teaches: "Kabel siku mengubah arah sinyal menjadi belok.",
    par: 4,
    grid: [
      { id: "s1", gridX: 1, gridY: 0, kind: "SOURCE", basePorts: ["S"], sourceValue: 1, rotation: 0, locked: true },
      { id: "w1", gridX: 1, gridY: 1, kind: "WIRE", wireType: "STRAIGHT", rotation: 90 },
      { id: "w2", gridX: 1, gridY: 2, kind: "WIRE", wireType: "STRAIGHT", rotation: 0 },
      { id: "c1", gridX: 1, gridY: 3, kind: "WIRE", wireType: "CORNER", rotation: 180 },
      { id: "w3", gridX: 2, gridY: 3, kind: "WIRE", wireType: "STRAIGHT", rotation: 0 },
      { id: "w4", gridX: 3, gridY: 3, kind: "WIRE", wireType: "STRAIGHT", rotation: 90 },
      { id: "t1", gridX: 4, gridY: 3, kind: "TARGET", basePorts: ["W"], rotation: 0, locked: true },
    ],
  },
  {
    level: 3,
    title: "Gerbang NOT",
    rewardCoins: 100,
    rewardXP: 30,
    teaches: "Gerbang NOT membalik sinyal: 1 jadi 0, 0 jadi 1.",
    par: 3,
    grid: [
      { id: "s1", gridX: 2, gridY: 0, kind: "SOURCE", basePorts: ["S"], sourceValue: 1, rotation: 0, locked: true },
      { id: "w1", gridX: 2, gridY: 1, kind: "WIRE", wireType: "STRAIGHT", rotation: 90 },
      { id: "n1", gridX: 2, gridY: 2, kind: "NOT", rotation: 90 },
      { id: "w2", gridX: 2, gridY: 3, kind: "WIRE", wireType: "STRAIGHT", rotation: 0 },
      { id: "n2", gridX: 2, gridY: 4, kind: "NOT", rotation: 90 },
      { id: "t1", gridX: 2, gridY: 5, kind: "TARGET", basePorts: ["N"], rotation: 0, locked: true },
    ],
  },
  {
    level: 4,
    title: "Belokan & Gerbang NOT",
    rewardCoins: 125,
    rewardXP: 35,
    teaches: "Kombinasikan kabel siku dan gerbang NOT untuk sampai ke lampu.",
    par: 8,
    grid: [
      { id: "s1", gridX: 1, gridY: 0, kind: "SOURCE", basePorts: ["S"], sourceValue: 1, rotation: 0, locked: true },
      { id: "w1", gridX: 1, gridY: 1, kind: "WIRE", wireType: "STRAIGHT", rotation: 90 },
      { id: "n1", gridX: 1, gridY: 2, kind: "NOT", rotation: 90 },
      { id: "w2", gridX: 1, gridY: 3, kind: "WIRE", wireType: "STRAIGHT", rotation: 0 },
      { id: "c1", gridX: 1, gridY: 4, kind: "WIRE", wireType: "CORNER", rotation: 90 },
      { id: "w3", gridX: 2, gridY: 4, kind: "WIRE", wireType: "STRAIGHT", rotation: 0 },
      { id: "c2", gridX: 3, gridY: 4, kind: "WIRE", wireType: "CORNER", rotation: 0 },
      { id: "w5", gridX: 3, gridY: 3, kind: "WIRE", wireType: "STRAIGHT", rotation: 90 },
      { id: "n2", gridX: 3, gridY: 2, kind: "NOT", rotation: 90 },
      { id: "w6", gridX: 3, gridY: 1, kind: "WIRE", wireType: "STRAIGHT", rotation: 90 },
      { id: "t1", gridX: 3, gridY: 0, kind: "TARGET", basePorts: ["S"], rotation: 0, locked: true },
    ],
  },
  {
    level: 5,
    title: "Sirkuit Bercabang",
    rewardCoins: 150,
    rewardXP: 40,
    teaches: "Percabangan T bisa menuju jalan buntu. Pilih jalur yang benar!",
    par: 6,
    grid: [
      { id: "s1", gridX: 1, gridY: 0, kind: "SOURCE", basePorts: ["S"], sourceValue: 1, rotation: 0, locked: true },
      { id: "w1", gridX: 1, gridY: 1, kind: "WIRE", wireType: "STRAIGHT", rotation: 90 },
      { id: "w2", gridX: 1, gridY: 2, kind: "WIRE", wireType: "STRAIGHT", rotation: 0 },
      { id: "tj", gridX: 1, gridY: 3, kind: "WIRE", wireType: "T", rotation: 90 },
      { id: "w3", gridX: 1, gridY: 4, kind: "WIRE", wireType: "STRAIGHT", rotation: 0 },
      { id: "c1", gridX: 1, gridY: 5, kind: "WIRE", wireType: "CORNER", rotation: 90 },
      { id: "w4", gridX: 2, gridY: 5, kind: "WIRE", wireType: "STRAIGHT", rotation: 0 },
      { id: "w5", gridX: 3, gridY: 5, kind: "WIRE", wireType: "STRAIGHT", rotation: 90 },
      { id: "c2", gridX: 4, gridY: 5, kind: "WIRE", wireType: "CORNER", rotation: 0 },
      { id: "w6", gridX: 4, gridY: 4, kind: "WIRE", wireType: "STRAIGHT", rotation: 90 },
      { id: "bd", gridX: 2, gridY: 3, kind: "WIRE", wireType: "STRAIGHT", rotation: 0 },
      { id: "ob1", gridX: 0, gridY: 3, kind: "OBSTACLE", rotation: 0, locked: true },
      { id: "ob2", gridX: 5, gridY: 3, kind: "OBSTACLE", rotation: 0, locked: true },
      { id: "t1", gridX: 4, gridY: 3, kind: "TARGET", basePorts: ["S"], rotation: 0, locked: true },
    ],
  },
  {
    level: 6,
    title: "Jaringan Kompleks",
    rewardCoins: 200,
    rewardXP: 50,
    teaches: "Rangkai jaringan penuh: dua gerbang NOT dan dua belokan.",
    par: 9,
    grid: [
      { id: "s1", gridX: 2, gridY: 0, kind: "SOURCE", basePorts: ["S"], sourceValue: 1, rotation: 0, locked: true },
      { id: "w1", gridX: 2, gridY: 1, kind: "WIRE", wireType: "STRAIGHT", rotation: 90 },
      { id: "n1", gridX: 2, gridY: 2, kind: "NOT", rotation: 90 },
      { id: "w2", gridX: 2, gridY: 3, kind: "WIRE", wireType: "STRAIGHT", rotation: 90 },
      { id: "c1", gridX: 2, gridY: 4, kind: "WIRE", wireType: "CORNER", rotation: 90 },
      { id: "w3", gridX: 3, gridY: 4, kind: "WIRE", wireType: "STRAIGHT", rotation: 0 },
      { id: "c2", gridX: 4, gridY: 4, kind: "WIRE", wireType: "CORNER", rotation: 0 },
      { id: "w5", gridX: 4, gridY: 3, kind: "WIRE", wireType: "STRAIGHT", rotation: 90 },
      { id: "n2", gridX: 4, gridY: 2, kind: "NOT", rotation: 90 },
      { id: "w6", gridX: 4, gridY: 1, kind: "WIRE", wireType: "STRAIGHT", rotation: 90 },
      { id: "t1", gridX: 4, gridY: 0, kind: "TARGET", basePorts: ["S"], rotation: 0, locked: true },
    ],
  },
];

const cloneCells = (cells: CircuitCell[]): CircuitCell[] => JSON.parse(JSON.stringify(cells));

const PORT_POS = (S: number): Record<Port, { x: number; y: number }> => ({
  N: { x: S / 2, y: 0 },
  E: { x: S, y: S / 2 },
  S: { x: S / 2, y: S },
  W: { x: 0, y: S / 2 },
});

const starsFor = (moves: number, par: number) => (moves <= par ? 3 : moves <= par + 2 ? 2 : 1);

const TileView = React.memo(function TileView({
  cell,
  cellSize,
  poweredVals,
  isHint,
  onPress,
}: {
  cell: CircuitCell;
  cellSize: number;
  poweredVals: number[] | undefined;
  isHint: boolean;
  onPress: () => void;
}) {
    const rotSV = useSharedValue(cell.rotation);
    const pulse = useSharedValue(0);

    const powered = !!poweredVals && poweredVals.length > 0;
    const poweredHigh = powered && poweredVals.includes(1);

    useEffect(() => {
      rotSV.value = withTiming(cell.rotation, { duration: 260 });
    }, [cell.rotation, rotSV]);

    useEffect(() => {
      if (powered) {
        pulse.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
      } else {
        cancelAnimation(pulse);
        pulse.value = 0;
      }
    }, [powered, pulse]);

    const rotStyle = useAnimatedStyle(() => ({
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
      opacity: powered ? 0.45 + pulse.value * 0.55 : 1,
    }));

    const S = cellSize;
    const basePorts = cell.kind === "WIRE"
      ? BASE_PORTS[cell.wireType!]
      : cell.kind === "NOT"
      ? BASE_PORTS.STRAIGHT
      : (cell.basePorts || []);
    const pp = PORT_POS(S);

    const renderWire = () => {
      const core = poweredHigh ? "#22d3ee" : powered ? "#0ea5e9" : "#334155";
      const glow = poweredHigh ? "#a5f3fc" : powered ? "#38bdf8" : "#475569";
      const wMain = Math.max(5, S * 0.18);
      const wGlow = wMain * 1.7;
      return (
        <G>
          {basePorts.map((p) => (
            <G key={p}>
              <Path
                d={`M ${S / 2} ${S / 2} L ${pp[p].x} ${pp[p].y}`}
                stroke={glow}
                strokeWidth={wGlow}
                strokeLinecap="round"
                opacity={powered ? 0.35 : 0.2}
              />
              <Path
                d={`M ${S / 2} ${S / 2} L ${pp[p].x} ${pp[p].y}`}
                stroke={core}
                strokeWidth={wMain}
                strokeLinecap="round"
              />
              <Circle cx={pp[p].x} cy={pp[p].y} r={wMain * 0.62} fill={powered ? "#0e7490" : "#1e293b"} stroke={glow} strokeWidth={1.5} />
            </G>
          ))}
        </G>
      );
    };

    const renderNot = () => {
      const [inP, outP] = basePorts;
      const ix = pp[inP].x;
      const iy = pp[inP].y;
      const ox = pp[outP].x;
      const oy = pp[outP].y;
      const cx = (ix + ox) / 2;
      const cy = (iy + oy) / 2;
      const dx = ox - ix;
      const dy = oy - iy;
      const len = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / len;
      const uy = dy / len;
      const half = S * 0.16;
      const gateCol = powered ? "#06b6d4" : "#475569";
      const gateGlow = powered ? "#67e8f9" : "#64748b";
      return (
        <G>
          <Rect x={S * 0.12} y={S * 0.12} width={S * 0.76} height={S * 0.76} rx={S * 0.14} fill="#0f172a" stroke={gateGlow} strokeWidth={2} />
          <Polygon
            points={`${ix + ux * half + -uy * half},${iy + uy * half + ux * half} ${ix + ux * half + uy * half},${iy + uy * half - ux * half} ${ox - ux * half},${oy - uy * half}`}
            fill={gateCol}
            stroke={gateGlow}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <Circle cx={ox - ux * half} cy={oy - uy * half} r={S * 0.09} fill="#0f172a" stroke={gateGlow} strokeWidth={2} />
          <Circle cx={cx} cy={cy} r={S * 0.34} fill="transparent" stroke={gateGlow} strokeWidth={1} opacity={0.5} />
        </G>
      );
    };

    const renderSource = () => {
      const w = S * 0.56;
      const h = S * 0.5;
      return (
        <G>
          <Path d={`M ${S / 2} ${S / 2} L ${pp[basePorts[0]].x} ${pp[basePorts[0]].y}`} stroke="#f59e0b" strokeWidth={Math.max(5, S * 0.16)} strokeLinecap="round" />
          <Rect x={(S - w) / 2} y={(S - h) / 2} width={w} height={h} rx={S * 0.1} fill="#1c1917" stroke="#fbbf24" strokeWidth={2.5} />
          <Rect x={(S - w) / 2 + S * 0.05} y={(S - h) / 2 + S * 0.06} width={w * 0.4} height={h * 0.88} rx={S * 0.05} fill="#f59e0b" />
          <Circle cx={S / 2 + w * 0.22} cy={S / 2} r={S * 0.08} fill="#fde68a" />
        </G>
      );
    };

    const renderTarget = () => {
      const on = poweredHigh;
      const lamp = on ? "#fde047" : powered ? "#f87171" : "#334155";
      const glowC = on ? "#fde047" : "#94a3b8";
      return (
        <G>
          <Path d={`M ${S / 2} ${S / 2} L ${pp[basePorts[0]].x} ${pp[basePorts[0]].y}`} stroke={on ? "#facc15" : powered ? "#ef4444" : "#334155"} strokeWidth={Math.max(5, S * 0.16)} strokeLinecap="round" />
          {on && <Circle cx={S / 2} cy={S / 2} r={S * 0.42} fill="#fde047" opacity={0.28} />}
          <Circle cx={S / 2} cy={S / 2} r={S * 0.28} fill="#1e293b" stroke={glowC} strokeWidth={3} />
          <Circle cx={S / 2} cy={S / 2} r={S * 0.18} fill={lamp} />
          {on && (
            <>
              <Circle cx={S / 2} cy={S / 2 - S * 0.34} r={S * 0.05} fill="#fde047" />
              <Circle cx={S / 2} cy={S / 2 + S * 0.34} r={S * 0.05} fill="#fde047" />
              <Circle cx={S / 2 - S * 0.34} cy={S / 2} r={S * 0.05} fill="#fde047" />
              <Circle cx={S / 2 + S * 0.34} cy={S / 2} r={S * 0.05} fill="#fde047" />
            </>
          )}
        </G>
      );
    };

    const renderObstacle = () => (
      <G>
        <Rect x={S * 0.08} y={S * 0.08} width={S * 0.84} height={S * 0.84} rx={S * 0.12} fill="#0b1120" stroke="#1e293b" strokeWidth={2} />
        {[
          [S * 0.22, S * 0.22],
          [S * 0.78, S * 0.22],
          [S * 0.22, S * 0.78],
          [S * 0.78, S * 0.78],
        ].map(([rx, ry], i) => (
          <Circle key={i} cx={rx} cy={ry} r={S * 0.05} fill="#1e293b" />
        ))}
      </G>
    );

    const renderContent = () => {
      switch (cell.kind) {
        case "WIRE":
          return renderWire();
        case "NOT":
          return renderNot();
        case "SOURCE":
          return renderSource();
        case "TARGET":
          return renderTarget();
        case "OBSTACLE":
          return renderObstacle();
      }
    };

    const interactive = !cell.locked;

    return (
      <Animated.View
        style={[
          styles.tileWrap,
          { width: S, height: S },
          rotStyle,
        ]}
      >
        <Pressable onPress={onPress} disabled={!interactive} style={{ width: S, height: S }}>
          <Animated.View style={[pulseStyle, { width: S, height: S }]}>
            <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
              {renderContent()}
            </Svg>
          </Animated.View>
        </Pressable>
      </Animated.View>
    );
  }
);

TileView.displayName = "TileView";

export default function RobotCircuitPuzzleScreen() {
  const router = useRouter();

  const [level, setLevel] = useState(1);
  const [cells, setCells] = useState<CircuitCell[]>([]);
  const [history, setHistory] = useState<{ cells: CircuitCell[]; moves: number }[]>([]);
  const [moves, setMoves] = useState(0);
  const [userCoins, setUserCoins] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "victory" | "completed">("playing");
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showTeachModal, setShowTeachModal] = useState(true);

  const [hintCellId, setHintCellId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [companionText, setCompanionText] = useState(
    "Putar kabel di papan sirkuit agar sinyal dari Sumber bisa sampai ke Lampu. Ketuk kabel untuk memutarnya 90°!"
  );

  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const boardPadding = SPACING.md;
  const boardSize = Math.min(windowWidth - boardPadding * 2, 430, windowHeight * 0.46);
  const cellSize = boardSize / GRID_SIZE;

  const currentLevel = useMemo(() => LEVELS.find((l) => l.level === level) || LEVELS[0], [level]);


  const circuit = useMemo(() => computeCircuit(cells), [cells]);

  useEffect(() => {
    const loadGameData = async () => {
      try {
        const storedCoins = await AsyncStorage.getItem(STORAGE_KEY_COINS);
        if (storedCoins !== null) setUserCoins(parseInt(storedCoins));
        const storedLevel = await AsyncStorage.getItem(STORAGE_KEY_LEVEL);
        if (storedLevel !== null) {
          const l = parseInt(storedLevel);
          if (l >= 1 && l <= LEVELS.length) setLevel(l);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadGameData();
  }, []);

  useEffect(() => {
    const config = LEVELS.find((l) => l.level === level) || LEVELS[0];
    setCells(cloneCells(config.grid));
    setHistory([]);
    setMoves(0);
    setGameState((prev) => (prev === "completed" ? prev : "playing"));
    setHintCellId(null);

    setShowTeachModal(true);
    setCompanionText(
      `Misi Level ${level}: ${config.title}. ${config.teaches} Sinyal sumber bernilai 1, lampu menyala jika menerima 1.`
    );
  }, [level]);

  useEffect(() => {
    if (circuit.targetOn && gameState === "playing") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCompanionText("⚡ Lampu menyala! Sirkuit berhasil terhubung. Hebat!");
      const t = setTimeout(() => setGameState("victory"), 600);
      return () => clearTimeout(t);
    }
  }, [circuit.targetOn, gameState]);

  const handleRotate = useCallback(
    (id: string) => {
      if (gameState !== "playing") return;
      const idx = cells.findIndex((c) => c.id === id);
      if (idx === -1 || cells[idx].locked) return;
      setHistory((h) => [...h, { cells: cloneCells(cells), moves }]);
      const next = cloneCells(cells);
      next[idx].rotation = next[idx].rotation + 90;
      setCells(next);
      setMoves((m) => m + 1);
      setHintCellId(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [gameState, cells, moves]
  );

  const handleUndo = () => {
    if (history.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const last = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCells(last.cells);
    setMoves(last.moves);
  };

  const handleRestart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setCells(cloneCells(currentLevel.grid));
    setHistory([]);
    setMoves(0);
    setHintCellId(null);
  };

  const handleHint = () => {
    if (gameState !== "playing" || userCoins < 20) return;
    const live = Object.keys(circuit.powered).length;
    let target = null;
    for (const cell of cells) {
      if (cell.locked || (cell.kind !== "WIRE" && cell.kind !== "NOT")) continue;
      for (const rot of [0, 90, 180, 270]) {
        if (rot === cell.rotation) continue;
        const trial = cloneCells(cells);
        const idx = trial.findIndex((c) => c.id === cell.id);
        trial[idx].rotation = rot;
        const res = computeCircuit(trial);
        if (res.targetOn || Object.keys(res.powered).length > live) {
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
      setCompanionText(`💡 Petunjuk: coba putar kabel di baris ${(c?.gridY ?? 0) + 1}, kolom ${(c?.gridX ?? 0) + 1}!`);
    } else {
      setCompanionText("💡 Semua kabel sudah nyambung, coba periksa gerbang NOT-nya!");
    }
  };



  const handleVictoryNext = async () => {
    const nextLevelNum = level + 1;
    const newCoins = userCoins + currentLevel.rewardCoins;
    setUserCoins(newCoins);
    await AsyncStorage.setItem(STORAGE_KEY_COINS, String(newCoins));
    if (nextLevelNum > LEVELS.length) {
      setGameState("completed");
      setLevel(1);
      await AsyncStorage.setItem(STORAGE_KEY_LEVEL, "1");
    } else {
      setLevel(nextLevelNum);
      await AsyncStorage.setItem(STORAGE_KEY_LEVEL, String(nextLevelNum));
    saveGameSession({ gameId: "robot-circuit-puzzle", level: level, score: 100, xpEarned: 130, coinsEarned: 50, completed: true });
    }
  };

  const targetStatusText =
    circuit.targetValue === null
      ? "Sirkuit belum terhubung"
      : circuit.targetOn
      ? "Lampu MENYALA ✓"
      : "Sinyal sampai tapi 0 (periksa gerbang NOT)";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      <View style={styles.header}>
        <View style={styles.headerLeftRow}>
          <Pressable style={styles.iconButton} onPress={() => setShowPauseModal(true)}>
            <Ionicons name="menu" size={22} color="#94A3B8" />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => setShowHelp(true)}>
            <Ionicons name="help-circle-outline" size={22} color="#94A3B8" />
          </Pressable>
        </View>
        <View style={styles.levelBadgeContainer}>
          <Text style={styles.levelText}>SIRKUIT {String(level).padStart(2, "0")}</Text>
        </View>
        <View style={styles.topHud}>
          <View style={[styles.hudBadge, { backgroundColor: "#F59E0B" }]}>
            <Ionicons name="bulb" size={16} color="#FFFFFF" />
            <Text style={styles.hudText}>{userCoins}</Text>
          </View>
        </View>
      </View>

      <View style={styles.mainGameArea}>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>
            ⚡ Sinyal: 1  •  {targetStatusText}
          </Text>
        </View>

        <View style={[styles.boardContainer, { width: boardSize, height: boardSize }]}>
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
            const gx = idx % GRID_SIZE;
            const gy = Math.floor(idx / GRID_SIZE);
            const cell = cells.find((c) => c.gridX === gx && c.gridY === gy);
            return (
              <View
                key={idx}
                style={[
                  styles.gridCellSocket,
                  {
                    left: gx * cellSize,
                    top: gy * cellSize,
                    width: cellSize,
                    height: cellSize,
                  },
                ]}
              >
                <View style={styles.socketInnerDot} />
                {cell && (
                  <TileView
                    key={cell.id}
                    cell={cell}
                    cellSize={cellSize}
                    poweredVals={circuit.powered[cell.id]}
                    isHint={hintCellId === cell.id}
                    onPress={() => handleRotate(cell.id)}
                  />
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.movesPill}>
          <MaterialCommunityIcons name="gesture-tap-hold" size={18} color="#67e8f9" />
          <Text style={styles.movesPillText}>Langkah: {moves}</Text>
        </View>
      </View>

      <View style={styles.companionPanel}>
        <View style={styles.ronBontaAvatarContainer}>
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
        <Pressable style={styles.actionBtn} onPress={handleUndo}>
          <View style={[styles.actionIconBg, { backgroundColor: "#3B82F6" }]}>
            <Ionicons name="arrow-undo" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionBtnLabel}>Undo</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={handleHint}>
          <View style={[styles.actionIconBg, { backgroundColor: "#F59E0B" }]}>
            <Ionicons name="bulb" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionBtnLabel}>Petunjuk (-20)</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={handleRestart}>
          <View style={[styles.actionIconBg, { backgroundColor: "#EF4444" }]}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.actionBtnLabel}>Restart</Text>
        </Pressable>
      </View>

      <Modal visible={showTeachModal && gameState === "playing"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.victoryCard}>
            <View style={styles.teachIcon}>
              <Ionicons name="git-network" size={34} color="#22d3ee" />
            </View>
            <Text style={styles.victoryTitle}>Level {level}</Text>
            <Text style={[styles.victorySubtitle, { fontWeight: "800", color: "#0EA5E9", marginBottom: 10 }]}>
              {currentLevel.title}
            </Text>
            <Text style={styles.teachText}>{currentLevel.teaches}</Text>

            <Button
              title="Mulai Bermain"
              onPress={() => setShowTeachModal(false)}
              variant="accent"
              style={{ width: "100%", marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={showPauseModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.victoryCard}>
            <Text style={[styles.victoryTitle, { marginBottom: 6 }]}>Game Berhenti</Text>
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

      {/* VICTORY / MISSION COMPLETED MODAL WITH COGNITIVE RADAR CHART */}
      <Modal visible={gameState === "victory"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.victoryCardContainer}>
            {/* Header Tag & Title */}
            <Text style={styles.missionTagText}>MISSION COMPLETED</Text>
            <Text style={styles.victoryTitleText}>
              EXCELLENT! SIRKUIT {String(level).padStart(2, "0")} CLEARED!
            </Text>
            <Text style={styles.victorySubText}>
              Transmisi Robot Circuit: Level {level} → Selesai!
            </Text>

            {/* Main Content Row */}
            <View style={{ width: "100%", maxHeight: 420 }}>
              <View style={styles.victoryContentRow}>
                {/* Left Column: Mission Achievements */}
                <View style={styles.victoryLeftCol}>
                  <Text style={styles.columnTitle}>PENCAPAIAN MISI</Text>

                  {/* 3 Stars */}
                  <View style={styles.starRowGroup}>
                    {[1, 2, 3].map((s) => (
                      <Ionicons
                        key={s}
                        name="star"
                        size={s === 2 ? 32 : 26}
                        color={s <= starsFor(moves, currentLevel.par) ? "#FFD700" : "#475569"}
                        style={{ marginTop: s === 2 ? -4 : 0 }}
                      />
                    ))}
                  </View>

                  {/* Checklist */}
                  <View style={styles.checklistGroup}>
                    <View style={styles.checkItem}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text style={styles.checkText}>Sirkuit Terhubung (100%)</Text>
                    </View>
                    <View style={styles.checkItem}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text style={styles.checkText}>Efisiensi Gerbang NOT</Text>
                    </View>
                    <View style={styles.checkItem}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text style={styles.checkText}>Selesai Dalam {moves} Langkah (Par: {currentLevel.par})</Text>
                    </View>
                  </View>

                  {/* Loot Breakdown */}
                  <View style={styles.lootDivider} />
                  <View style={styles.lootRow}>
                    <Text style={styles.lootLabel}>Loot Koin Terkumpul:</Text>
                    <Text style={styles.lootValue}>+{currentLevel.rewardCoins} Koin</Text>
                  </View>
                  <View style={styles.lootRow}>
                    <Text style={styles.lootLabel}>Bonus Transmisi XP:</Text>
                    <Text style={styles.lootValue}>+{currentLevel.rewardXP} XP</Text>
                  </View>
                  <View style={[styles.lootRow, { marginTop: 6 }]}>
                    <Text style={styles.totalLabel}>TOTAL SOULONS / KOIN:</Text>
                    <Text style={styles.totalValue}>{currentLevel.rewardCoins + currentLevel.rewardXP} KOIN</Text>
                  </View>
                </View>

                {/* Right Column: Brain Cognitive Analysis Radar Chart */}
                <View style={styles.victoryRightCol}>
                  <Text style={styles.columnTitle}>🧠 Analisis Perkembangan Otak</Text>
                  <Text style={styles.columnSubTitle}>(Prefrontal Cortex & Logika Sirkuit)</Text>

                  {/* SVG Radar Chart */}
                  <View style={styles.victoryRadarWrapper}>
                    <Svg width={180} height={180} viewBox="0 0 200 200">
                      {/* Grid Pentagons */}
                      {[0.3, 0.6, 1.0].map((lvlVal, idx) => {
                        const pts = [0, 1, 2, 3, 4].map((i) => {
                          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                          const x = 100 + 55 * lvlVal * Math.cos(angle);
                          const y = 100 + 55 * lvlVal * Math.sin(angle);
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
                        const vals = [0.9, 0.94, 0.88, 0.92, 0.96];
                        const pts = vals.map((val, i) => {
                          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                          const x = 100 + 55 * val * Math.cos(angle);
                          const y = 100 + 55 * val * Math.sin(angle);
                          return `${x.toFixed(1)},${y.toFixed(1)}`;
                        }).join(" ");

                        return (
                          <Polygon
                            points={pts}
                            fill="rgba(168, 85, 247, 0.45)"
                            stroke="#C084FC"
                            strokeWidth="2.5"
                          />
                        );
                      })()}

                      {/* Data Node Dots */}
                      {[0, 1, 2, 3, 4].map((i) => {
                        const vals = [0.9, 0.94, 0.88, 0.92, 0.96];
                        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                        const x = 100 + 55 * vals[i] * Math.cos(angle);
                        const y = 100 + 55 * vals[i] * Math.sin(angle);
                        return <Circle key={i} cx={x} cy={y} r="3.5" fill="#FFFFFF" stroke="#A855F7" strokeWidth="1.5" />;
                      })}

                      {/* Axis Text Labels */}
                      {["Spasial", "Keputusan", "Kontrol Diri", "Memori Kerja", "Fokus"].map((lbl, i) => {
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
              </View>
            </View>

            {/* Bottom Action Buttons */}
            <View style={styles.victoryActionRow}>
              <Pressable
                style={({ pressed }) => [styles.backToMapBtn, pressed && styles.btnPressed]}
                onPress={() => router.back()}
              >
                <Text style={styles.backToMapText}>[ Kembali Ke Menu Utama ]</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.continueBtn, pressed && styles.btnPressed]}
                onPress={handleVictoryNext}
              >
                <Text style={styles.continueText}>[ CONTINUE (Lanjut Level) → ]</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={gameState === "completed"} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.victoryCard}>
            <MaterialCommunityIcons name="party-popper" size={60} color="#FF5E36" />
            <Text style={styles.victoryTitle}>Semua Sirkuit Selesai!</Text>
            <Text style={styles.victorySubtitle}>Hebat! Seluruh sirkuit robot berhasil kamu rangkai.</Text>
            <Button
              title="Keluar"
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
        title="Cara Main Robot Circuit"
        goal="Keluarkan semua modul robot dari papan sirkuit sebelum energi habis!"
        accentColor="#F97316"
        subtitleColor="#C2410C"
        steps={[
          { emoji: "1️⃣", text: "Ketuk modul robot yang panahnya menunjuk ke jalur kosong untuk menggesernya keluar." },
          { emoji: "2️⃣", text: "Modul yang terhalang modul lain harus dilepas lebih dulu — pikirkan urutannya!" },
          { emoji: "3️⃣", text: "Setiap langkah mengurangi energi (mulai dari 100, minimum 10)." },
          { emoji: "4️⃣", text: "Gunakan tombol Undo, Petunjuk (−20 koin), dan Restart jika diperlukan." },
        ]}
        tips={[
          "Cari modul yang panahnya langsung mengarah ke sisi luar papan.",
          "Level 5 punya tantangan kuis komputasi — jawab dengan benar!",
        ]}
      />
    </SafeAreaView>
  );
}

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
    paddingVertical: SPACING.sm + 4,
    backgroundColor: "#0F172A",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  headerLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    backgroundColor: "rgba(0, 229, 255, 0.12)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.3)",
  },
  levelText: {
    color: "#00F0FF",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1,
  },
  topHud: {
    flexDirection: "row",
    gap: 8,
  },
  hudBadge: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
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
    paddingVertical: 8,
  },
  statusPill: {
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.35)",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 10,
  },
  statusPillText: {
    color: "#BAE6FD",
    fontSize: 12,
    fontWeight: "700",
  },
  boardContainer: {
    backgroundColor: "#0F172A",
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#1E293B",
    position: "relative",
    shadowColor: "#00F0FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  gridCellSocket: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  socketInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(0, 240, 255, 0.12)",
  },
  tileWrap: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  tileLabel: {
    position: "absolute",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
    width: "100%",
    top: "30%",
  },
  movesPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  movesPillText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "700",
  },
  companionPanel: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(0, 240, 255, 0.3)",
    padding: 12,
  },
  ronBontaAvatarContainer: {
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    elevation: 4,
  },
  actionBtnLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
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
    backgroundColor: "rgba(34, 211, 238, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  teachText: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 12,
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
    marginBottom: 20,
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

  // Victory / Mission Completed Popup Styles
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
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
