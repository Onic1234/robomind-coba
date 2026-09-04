import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
  Modal,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const ARENA_SIZE = Math.min(310, Math.max(230, SCREEN_WIDTH - 104), Math.max(230, SCREEN_HEIGHT - 380));
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { GameBackButton } from "../components/GameBackButton";
import { HowToPlayModal } from "../components/HowToPlayModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  runOnJS,
} from "react-native-reanimated";
import Svg, { Line, Circle, Path, Rect, G, Polygon } from "react-native-svg";
import { COLORS, SPACING, SHAPES, FONTS, SHADOWS } from "../constants/Theme";
import Button from "../components/ui/Button";

const COINS_STORAGE_KEY = "user_coins_balance";
const LIVES_STORAGE_KEY = "robo_link_lives";
const LAST_LOSS_STORAGE_KEY = "robo_link_last_loss";
const MAX_LIVES = 5;
const LIFE_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes

const RadarChart = ({ data, size = 140 }: { data: { axis: string; score: number }[]; size?: number }) => {
  const center = size / 2;
  const radius = Math.round(size * 0.27);
  const numAxes = data.length;

  const getPolygonPoints = (rFactor: number) => {
    return data
      .map((_, i) => {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const x = center + radius * rFactor * Math.cos(angle);
        const y = center + radius * rFactor * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(" ");
  };

  const dataPoints = data
    .map((d, i) => {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const r = radius * (Math.min(100, Math.max(20, d.score)) / 100);
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(" ");

  const labelWidth = 52;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((rFactor, idx) => (
          <Polygon
            key={idx}
            points={getPolygonPoints(rFactor)}
            fill="none"
            stroke="rgba(56, 189, 248, 0.25)"
            strokeWidth="1"
          />
        ))}

        {data.map((_, i) => {
          const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <Line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(56, 189, 248, 0.3)"
              strokeWidth="1"
            />
          );
        })}

        <Polygon
          points={dataPoints}
          fill="rgba(168, 85, 247, 0.45)"
          stroke="#C084FC"
          strokeWidth="2"
        />

        {data.map((d, i) => {
          const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
          const r = radius * (Math.min(100, Math.max(20, d.score)) / 100);
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
          return (
            <G key={i}>
              <Circle cx={x} cy={y} r="3.5" fill="#FFFFFF" stroke="#A855F7" strokeWidth="1.5" />
            </G>
          );
        })}
      </Svg>

      {data.map((d, i) => {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const labelR = radius + 17;
        const x = center + labelR * Math.cos(angle) - labelWidth / 2;
        const y = center + labelR * Math.sin(angle) - 7;
        return (
          <View
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: labelWidth,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 8.5, fontWeight: "800", color: "#F8FAFC", textAlign: "center" }}>
              {d.axis}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

interface Tile {
  id: string;
  col: number;
  row: number;
  type: "straight" | "elbow" | "t_junction";
  rotation: number; // 0, 90, 180, 270 degrees
}

interface LevelConfig {
  level: number;
  cols: number;
  rows: number;
  startCol: number;
  startRow: number;
  startDir: "top" | "right" | "bottom" | "left";
  endCol: number;
  endRow: number;
  endDir: "top" | "right" | "bottom" | "left";
  tiles: {
    col: number;
    row: number;
    type: "straight" | "elbow" | "t_junction";
    initialRotation: number;
  }[];
  rewardCoins: number;
  rewardXP: number;
  instructions: string;
  timeLimit: number; // in seconds
}

const LEVEL_CONFIGS: LevelConfig[] = [
  {
    level: 1,
    cols: 3,
    rows: 3,
    startCol: 0,
    startRow: 2,
    startDir: "left",
    endCol: 2,
    endRow: 0,
    endDir: "top",
    tiles: [
      { col: 0, row: 2, type: "elbow", initialRotation: 270 },
      { col: 0, row: 1, type: "straight", initialRotation: 270 },
      { col: 0, row: 0, type: "elbow", initialRotation: 270 },
      { col: 1, row: 0, type: "straight", initialRotation: 270 },
      { col: 2, row: 0, type: "elbow", initialRotation: 90 },
      { col: 1, row: 1, type: "t_junction", initialRotation: 90 }
    ],
    rewardCoins: 70,
    rewardXP: 45,
    instructions: "Level 1. Sambungkan sirkuit dari Generator (LEFT) ke PC Target (TOP)!",
    timeLimit: 45
  },
  {
    level: 2,
    cols: 4,
    rows: 4,
    startCol: 0,
    startRow: 3,
    startDir: "left",
    endCol: 3,
    endRow: 0,
    endDir: "right",
    tiles: [
      { col: 0, row: 3, type: "elbow", initialRotation: 90 },
      { col: 0, row: 2, type: "straight", initialRotation: 0 },
      { col: 0, row: 1, type: "elbow", initialRotation: 180 },
      { col: 1, row: 1, type: "straight", initialRotation: 270 },
      { col: 2, row: 1, type: "elbow", initialRotation: 90 },
      { col: 2, row: 0, type: "elbow", initialRotation: 270 },
      { col: 3, row: 0, type: "straight", initialRotation: 180 },
      { col: 3, row: 2, type: "t_junction", initialRotation: 0 },
      { col: 1, row: 3, type: "straight", initialRotation: 0 }
    ],
    rewardCoins: 90,
    rewardXP: 60,
    instructions: "Level 2. Sambungkan sirkuit dari Generator (LEFT) ke PC Target (RIGHT)!",
    timeLimit: 44
  },
  {
    level: 3,
    cols: 4,
    rows: 4,
    startCol: 1,
    startRow: 3,
    startDir: "bottom",
    endCol: 3,
    endRow: 0,
    endDir: "top",
    tiles: [
      { col: 1, row: 3, type: "straight", initialRotation: 270 },
      { col: 1, row: 2, type: "straight", initialRotation: 180 },
      { col: 1, row: 1, type: "t_junction", initialRotation: 180 },
      { col: 2, row: 1, type: "straight", initialRotation: 90 },
      { col: 3, row: 1, type: "t_junction", initialRotation: 0 },
      { col: 3, row: 0, type: "straight", initialRotation: 270 },
      { col: 2, row: 0, type: "elbow", initialRotation: 270 },
      { col: 0, row: 3, type: "elbow", initialRotation: 180 }
    ],
    rewardCoins: 110,
    rewardXP: 75,
    instructions: "Level 3. Sambungkan sirkuit dari Generator (BOTTOM) ke PC Target (TOP)!",
    timeLimit: 44
  },
  {
    level: 4,
    cols: 5,
    rows: 5,
    startCol: 0,
    startRow: 4,
    startDir: "left",
    endCol: 4,
    endRow: 0,
    endDir: "right",
    tiles: [
      { col: 0, row: 4, type: "straight", initialRotation: 180 },
      { col: 1, row: 4, type: "straight", initialRotation: 270 },
      { col: 2, row: 4, type: "elbow", initialRotation: 90 },
      { col: 2, row: 3, type: "straight", initialRotation: 0 },
      { col: 2, row: 2, type: "elbow", initialRotation: 90 },
      { col: 3, row: 2, type: "straight", initialRotation: 270 },
      { col: 4, row: 2, type: "elbow", initialRotation: 0 },
      { col: 4, row: 1, type: "straight", initialRotation: 180 },
      { col: 4, row: 0, type: "elbow", initialRotation: 270 },
      { col: 2, row: 1, type: "t_junction", initialRotation: 90 },
      { col: 1, row: 0, type: "straight", initialRotation: 180 },
      { col: 1, row: 3, type: "elbow", initialRotation: 180 }
    ],
    rewardCoins: 130,
    rewardXP: 90,
    instructions: "Level 4. Sambungkan sirkuit dari Generator (LEFT) ke PC Target (RIGHT)!",
    timeLimit: 43
  },
  {
    level: 5,
    cols: 5,
    rows: 5,
    startCol: 0,
    startRow: 4,
    startDir: "bottom",
    endCol: 4,
    endRow: 0,
    endDir: "top",
    tiles: [
      { col: 0, row: 4, type: "straight", initialRotation: 270 },
      { col: 0, row: 3, type: "straight", initialRotation: 270 },
      { col: 0, row: 2, type: "elbow", initialRotation: 90 },
      { col: 1, row: 2, type: "straight", initialRotation: 180 },
      { col: 2, row: 2, type: "straight", initialRotation: 270 },
      { col: 3, row: 2, type: "elbow", initialRotation: 90 },
      { col: 3, row: 1, type: "straight", initialRotation: 270 },
      { col: 3, row: 0, type: "elbow", initialRotation: 90 },
      { col: 4, row: 0, type: "elbow", initialRotation: 0 },
      { col: 4, row: 4, type: "elbow", initialRotation: 180 },
      { col: 2, row: 0, type: "t_junction", initialRotation: 270 },
      { col: 2, row: 3, type: "t_junction", initialRotation: 0 }
    ],
    rewardCoins: 150,
    rewardXP: 105,
    instructions: "Level 5. Sambungkan sirkuit dari Generator (BOTTOM) ke PC Target (TOP)!",
    timeLimit: 43
  },
  {
    level: 6,
    cols: 4,
    rows: 4,
    startCol: 0,
    startRow: 0,
    startDir: "top",
    endCol: 3,
    endRow: 3,
    endDir: "bottom",
    tiles: [
      { col: 0, row: 0, type: "straight", initialRotation: 180 },
      { col: 0, row: 1, type: "straight", initialRotation: 180 },
      { col: 0, row: 2, type: "t_junction", initialRotation: 270 },
      { col: 1, row: 2, type: "straight", initialRotation: 270 },
      { col: 2, row: 2, type: "t_junction", initialRotation: 270 },
      { col: 2, row: 3, type: "t_junction", initialRotation: 90 },
      { col: 3, row: 3, type: "elbow", initialRotation: 180 },
      { col: 3, row: 0, type: "elbow", initialRotation: 90 },
      { col: 3, row: 1, type: "straight", initialRotation: 90 }
    ],
    rewardCoins: 170,
    rewardXP: 120,
    instructions: "Level 6. Sambungkan sirkuit dari Generator (TOP) ke PC Target (BOTTOM)!",
    timeLimit: 42
  },
  {
    level: 7,
    cols: 4,
    rows: 4,
    startCol: 3,
    startRow: 3,
    startDir: "right",
    endCol: 0,
    endRow: 0,
    endDir: "left",
    tiles: [
      { col: 3, row: 3, type: "straight", initialRotation: 270 },
      { col: 2, row: 3, type: "straight", initialRotation: 270 },
      { col: 1, row: 3, type: "elbow", initialRotation: 90 },
      { col: 1, row: 2, type: "straight", initialRotation: 0 },
      { col: 1, row: 1, type: "elbow", initialRotation: 270 },
      { col: 0, row: 1, type: "elbow", initialRotation: 180 },
      { col: 0, row: 0, type: "elbow", initialRotation: 0 },
      { col: 2, row: 1, type: "t_junction", initialRotation: 180 },
      { col: 3, row: 0, type: "elbow", initialRotation: 270 }
    ],
    rewardCoins: 190,
    rewardXP: 135,
    instructions: "Level 7. Sambungkan sirkuit dari Generator (RIGHT) ke PC Target (LEFT)!",
    timeLimit: 42
  },
  {
    level: 8,
    cols: 5,
    rows: 5,
    startCol: 2,
    startRow: 4,
    startDir: "bottom",
    endCol: 2,
    endRow: 0,
    endDir: "top",
    tiles: [
      { col: 2, row: 4, type: "elbow", initialRotation: 270 },
      { col: 1, row: 4, type: "straight", initialRotation: 90 },
      { col: 0, row: 4, type: "elbow", initialRotation: 90 },
      { col: 0, row: 3, type: "straight", initialRotation: 270 },
      { col: 0, row: 2, type: "elbow", initialRotation: 90 },
      { col: 1, row: 2, type: "straight", initialRotation: 90 },
      { col: 2, row: 2, type: "straight", initialRotation: 90 },
      { col: 3, row: 2, type: "straight", initialRotation: 270 },
      { col: 4, row: 2, type: "elbow", initialRotation: 90 },
      { col: 4, row: 1, type: "straight", initialRotation: 270 },
      { col: 4, row: 0, type: "elbow", initialRotation: 0 },
      { col: 3, row: 0, type: "straight", initialRotation: 180 },
      { col: 2, row: 0, type: "elbow", initialRotation: 90 },
      { col: 1, row: 1, type: "t_junction", initialRotation: 270 },
      { col: 1, row: 3, type: "elbow", initialRotation: 270 },
      { col: 3, row: 1, type: "elbow", initialRotation: 0 }
    ],
    rewardCoins: 210,
    rewardXP: 150,
    instructions: "Level 8. Sambungkan sirkuit dari Generator (BOTTOM) ke PC Target (TOP)!",
    timeLimit: 41
  },
  {
    level: 9,
    cols: 5,
    rows: 5,
    startCol: 0,
    startRow: 2,
    startDir: "left",
    endCol: 4,
    endRow: 2,
    endDir: "right",
    tiles: [
      { col: 0, row: 2, type: "elbow", initialRotation: 270 },
      { col: 0, row: 3, type: "straight", initialRotation: 270 },
      { col: 0, row: 4, type: "t_junction", initialRotation: 270 },
      { col: 1, row: 4, type: "straight", initialRotation: 180 },
      { col: 2, row: 4, type: "t_junction", initialRotation: 0 },
      { col: 2, row: 3, type: "straight", initialRotation: 0 },
      { col: 2, row: 2, type: "straight", initialRotation: 0 },
      { col: 2, row: 1, type: "straight", initialRotation: 270 },
      { col: 2, row: 0, type: "t_junction", initialRotation: 180 },
      { col: 3, row: 0, type: "straight", initialRotation: 90 },
      { col: 4, row: 0, type: "t_junction", initialRotation: 180 },
      { col: 4, row: 1, type: "straight", initialRotation: 0 },
      { col: 4, row: 2, type: "elbow", initialRotation: 90 },
      { col: 0, row: 1, type: "elbow", initialRotation: 270 },
      { col: 4, row: 3, type: "straight", initialRotation: 0 },
      { col: 1, row: 2, type: "straight", initialRotation: 270 }
    ],
    rewardCoins: 230,
    rewardXP: 165,
    instructions: "Level 9. Sambungkan sirkuit dari Generator (LEFT) ke PC Target (RIGHT)!",
    timeLimit: 41
  },
  {
    level: 10,
    cols: 5,
    rows: 5,
    startCol: 4,
    startRow: 0,
    startDir: "top",
    endCol: 0,
    endRow: 4,
    endDir: "bottom",
    tiles: [
      { col: 4, row: 0, type: "elbow", initialRotation: 0 },
      { col: 3, row: 0, type: "straight", initialRotation: 90 },
      { col: 2, row: 0, type: "straight", initialRotation: 90 },
      { col: 1, row: 0, type: "elbow", initialRotation: 90 },
      { col: 1, row: 1, type: "straight", initialRotation: 270 },
      { col: 1, row: 2, type: "elbow", initialRotation: 180 },
      { col: 2, row: 2, type: "straight", initialRotation: 270 },
      { col: 3, row: 2, type: "elbow", initialRotation: 180 },
      { col: 3, row: 3, type: "straight", initialRotation: 0 },
      { col: 3, row: 4, type: "elbow", initialRotation: 270 },
      { col: 2, row: 4, type: "straight", initialRotation: 90 },
      { col: 1, row: 4, type: "straight", initialRotation: 90 },
      { col: 0, row: 4, type: "elbow", initialRotation: 270 },
      { col: 0, row: 0, type: "straight", initialRotation: 90 },
      { col: 4, row: 1, type: "t_junction", initialRotation: 180 },
      { col: 1, row: 3, type: "t_junction", initialRotation: 270 },
      { col: 2, row: 1, type: "t_junction", initialRotation: 90 }
    ],
    rewardCoins: 250,
    rewardXP: 180,
    instructions: "Level 10. Sambungkan sirkuit dari Generator (TOP) ke PC Target (BOTTOM)!",
    timeLimit: 40
  },
  {
    level: 11,
    cols: 5,
    rows: 5,
    startCol: 0,
    startRow: 4,
    startDir: "left",
    endCol: 2,
    endRow: 0,
    endDir: "top",
    tiles: [
      { col: 0, row: 4, type: "straight", initialRotation: 90 },
      { col: 1, row: 4, type: "straight", initialRotation: 180 },
      { col: 2, row: 4, type: "straight", initialRotation: 270 },
      { col: 3, row: 4, type: "elbow", initialRotation: 270 },
      { col: 3, row: 3, type: "straight", initialRotation: 0 },
      { col: 3, row: 2, type: "elbow", initialRotation: 0 },
      { col: 2, row: 2, type: "straight", initialRotation: 270 },
      { col: 1, row: 2, type: "elbow", initialRotation: 90 },
      { col: 1, row: 1, type: "straight", initialRotation: 180 },
      { col: 1, row: 0, type: "elbow", initialRotation: 180 },
      { col: 2, row: 0, type: "elbow", initialRotation: 90 },
      { col: 0, row: 2, type: "elbow", initialRotation: 270 },
      { col: 4, row: 4, type: "t_junction", initialRotation: 90 },
      { col: 4, row: 0, type: "elbow", initialRotation: 90 },
      { col: 1, row: 3, type: "straight", initialRotation: 0 }
    ],
    rewardCoins: 270,
    rewardXP: 195,
    instructions: "Level 11. Sambungkan sirkuit dari Generator (LEFT) ke PC Target (TOP)!",
    timeLimit: 40
  },
  {
    level: 12,
    cols: 5,
    rows: 5,
    startCol: 4,
    startRow: 4,
    startDir: "bottom",
    endCol: 0,
    endRow: 1,
    endDir: "left",
    tiles: [
      { col: 4, row: 4, type: "elbow", initialRotation: 270 },
      { col: 3, row: 4, type: "straight", initialRotation: 90 },
      { col: 2, row: 4, type: "straight", initialRotation: 90 },
      { col: 1, row: 4, type: "t_junction", initialRotation: 0 },
      { col: 1, row: 3, type: "straight", initialRotation: 0 },
      { col: 1, row: 2, type: "t_junction", initialRotation: 180 },
      { col: 2, row: 2, type: "straight", initialRotation: 90 },
      { col: 3, row: 2, type: "t_junction", initialRotation: 180 },
      { col: 3, row: 1, type: "t_junction", initialRotation: 270 },
      { col: 2, row: 1, type: "straight", initialRotation: 180 },
      { col: 1, row: 1, type: "straight", initialRotation: 180 },
      { col: 0, row: 1, type: "straight", initialRotation: 270 },
      { col: 1, row: 0, type: "elbow", initialRotation: 270 },
      { col: 3, row: 0, type: "straight", initialRotation: 90 },
      { col: 2, row: 0, type: "elbow", initialRotation: 90 },
      { col: 0, row: 2, type: "elbow", initialRotation: 180 }
    ],
    rewardCoins: 290,
    rewardXP: 210,
    instructions: "Level 12. Sambungkan sirkuit dari Generator (BOTTOM) ke PC Target (LEFT)!",
    timeLimit: 39
  },
  {
    level: 13,
    cols: 5,
    rows: 5,
    startCol: 1,
    startRow: 0,
    startDir: "top",
    endCol: 4,
    endRow: 3,
    endDir: "right",
    tiles: [
      { col: 1, row: 0, type: "straight", initialRotation: 0 },
      { col: 1, row: 1, type: "straight", initialRotation: 180 },
      { col: 1, row: 2, type: "straight", initialRotation: 0 },
      { col: 1, row: 3, type: "straight", initialRotation: 0 },
      { col: 1, row: 4, type: "elbow", initialRotation: 0 },
      { col: 2, row: 4, type: "straight", initialRotation: 270 },
      { col: 3, row: 4, type: "elbow", initialRotation: 0 },
      { col: 3, row: 3, type: "straight", initialRotation: 180 },
      { col: 3, row: 2, type: "straight", initialRotation: 180 },
      { col: 3, row: 1, type: "elbow", initialRotation: 270 },
      { col: 4, row: 1, type: "elbow", initialRotation: 180 },
      { col: 4, row: 2, type: "straight", initialRotation: 180 },
      { col: 4, row: 3, type: "elbow", initialRotation: 180 },
      { col: 2, row: 3, type: "t_junction", initialRotation: 270 },
      { col: 0, row: 0, type: "straight", initialRotation: 0 },
      { col: 2, row: 2, type: "t_junction", initialRotation: 90 },
      { col: 0, row: 3, type: "straight", initialRotation: 90 }
    ],
    rewardCoins: 310,
    rewardXP: 225,
    instructions: "Level 13. Sambungkan sirkuit dari Generator (TOP) ke PC Target (RIGHT)!",
    timeLimit: 39
  },
  {
    level: 14,
    cols: 5,
    rows: 5,
    startCol: 0,
    startRow: 1,
    startDir: "left",
    endCol: 3,
    endRow: 4,
    endDir: "bottom",
    tiles: [
      { col: 0, row: 1, type: "straight", initialRotation: 270 },
      { col: 1, row: 1, type: "straight", initialRotation: 90 },
      { col: 2, row: 1, type: "straight", initialRotation: 180 },
      { col: 3, row: 1, type: "straight", initialRotation: 180 },
      { col: 4, row: 1, type: "elbow", initialRotation: 270 },
      { col: 4, row: 2, type: "straight", initialRotation: 0 },
      { col: 4, row: 3, type: "elbow", initialRotation: 0 },
      { col: 3, row: 3, type: "straight", initialRotation: 90 },
      { col: 2, row: 3, type: "straight", initialRotation: 180 },
      { col: 1, row: 3, type: "elbow", initialRotation: 180 },
      { col: 1, row: 4, type: "elbow", initialRotation: 0 },
      { col: 2, row: 4, type: "straight", initialRotation: 180 },
      { col: 3, row: 4, type: "elbow", initialRotation: 180 },
      { col: 1, row: 0, type: "elbow", initialRotation: 180 },
      { col: 2, row: 2, type: "elbow", initialRotation: 90 },
      { col: 4, row: 0, type: "elbow", initialRotation: 270 },
      { col: 2, row: 0, type: "t_junction", initialRotation: 0 }
    ],
    rewardCoins: 330,
    rewardXP: 240,
    instructions: "Level 14. Sambungkan sirkuit dari Generator (LEFT) ke PC Target (BOTTOM)!",
    timeLimit: 38
  },
  {
    level: 15,
    cols: 5,
    rows: 5,
    startCol: 4,
    startRow: 4,
    startDir: "right",
    endCol: 0,
    endRow: 0,
    endDir: "left",
    tiles: [
      { col: 4, row: 4, type: "elbow", initialRotation: 180 },
      { col: 4, row: 3, type: "straight", initialRotation: 270 },
      { col: 4, row: 2, type: "t_junction", initialRotation: 90 },
      { col: 3, row: 2, type: "straight", initialRotation: 90 },
      { col: 2, row: 2, type: "t_junction", initialRotation: 90 },
      { col: 2, row: 3, type: "straight", initialRotation: 180 },
      { col: 2, row: 4, type: "t_junction", initialRotation: 180 },
      { col: 1, row: 4, type: "straight", initialRotation: 180 },
      { col: 0, row: 4, type: "t_junction", initialRotation: 90 },
      { col: 0, row: 3, type: "straight", initialRotation: 270 },
      { col: 0, row: 2, type: "straight", initialRotation: 270 },
      { col: 0, row: 1, type: "straight", initialRotation: 0 },
      { col: 0, row: 0, type: "elbow", initialRotation: 0 },
      { col: 1, row: 2, type: "t_junction", initialRotation: 180 },
      { col: 1, row: 0, type: "straight", initialRotation: 90 },
      { col: 2, row: 1, type: "t_junction", initialRotation: 180 },
      { col: 4, row: 1, type: "t_junction", initialRotation: 90 }
    ],
    rewardCoins: 350,
    rewardXP: 255,
    instructions: "Level 15. Sambungkan sirkuit dari Generator (RIGHT) ke PC Target (LEFT)!",
    timeLimit: 38
  },
  {
    level: 16,
    cols: 5,
    rows: 5,
    startCol: 1,
    startRow: 4,
    startDir: "bottom",
    endCol: 3,
    endRow: 0,
    endDir: "top",
    tiles: [
      { col: 1, row: 4, type: "straight", initialRotation: 270 },
      { col: 1, row: 3, type: "straight", initialRotation: 0 },
      { col: 1, row: 2, type: "straight", initialRotation: 270 },
      { col: 1, row: 1, type: "straight", initialRotation: 0 },
      { col: 1, row: 0, type: "elbow", initialRotation: 270 },
      { col: 2, row: 0, type: "elbow", initialRotation: 180 },
      { col: 2, row: 1, type: "straight", initialRotation: 180 },
      { col: 2, row: 2, type: "straight", initialRotation: 270 },
      { col: 2, row: 3, type: "elbow", initialRotation: 0 },
      { col: 3, row: 3, type: "straight", initialRotation: 180 },
      { col: 4, row: 3, type: "elbow", initialRotation: 270 },
      { col: 4, row: 2, type: "straight", initialRotation: 180 },
      { col: 4, row: 1, type: "straight", initialRotation: 0 },
      { col: 4, row: 0, type: "elbow", initialRotation: 180 },
      { col: 3, row: 0, type: "elbow", initialRotation: 90 },
      { col: 0, row: 2, type: "elbow", initialRotation: 0 },
      { col: 0, row: 1, type: "straight", initialRotation: 180 },
      { col: 2, row: 4, type: "elbow", initialRotation: 180 },
      { col: 4, row: 4, type: "straight", initialRotation: 0 }
    ],
    rewardCoins: 370,
    rewardXP: 270,
    instructions: "Level 16. Sambungkan sirkuit dari Generator (BOTTOM) ke PC Target (TOP)!",
    timeLimit: 37
  },
  {
    level: 17,
    cols: 5,
    rows: 5,
    startCol: 0,
    startRow: 0,
    startDir: "top",
    endCol: 4,
    endRow: 4,
    endDir: "right",
    tiles: [
      { col: 0, row: 0, type: "elbow", initialRotation: 90 },
      { col: 1, row: 0, type: "straight", initialRotation: 180 },
      { col: 2, row: 0, type: "straight", initialRotation: 180 },
      { col: 3, row: 0, type: "elbow", initialRotation: 180 },
      { col: 3, row: 1, type: "straight", initialRotation: 180 },
      { col: 3, row: 2, type: "elbow", initialRotation: 270 },
      { col: 2, row: 2, type: "straight", initialRotation: 90 },
      { col: 1, row: 2, type: "elbow", initialRotation: 90 },
      { col: 1, row: 3, type: "straight", initialRotation: 270 },
      { col: 1, row: 4, type: "elbow", initialRotation: 0 },
      { col: 2, row: 4, type: "straight", initialRotation: 90 },
      { col: 3, row: 4, type: "straight", initialRotation: 270 },
      { col: 4, row: 4, type: "straight", initialRotation: 270 },
      { col: 4, row: 1, type: "elbow", initialRotation: 0 },
      { col: 2, row: 1, type: "t_junction", initialRotation: 180 },
      { col: 4, row: 2, type: "t_junction", initialRotation: 90 },
      { col: 3, row: 3, type: "elbow", initialRotation: 270 }
    ],
    rewardCoins: 390,
    rewardXP: 285,
    instructions: "Level 17. Sambungkan sirkuit dari Generator (TOP) ke PC Target (RIGHT)!",
    timeLimit: 37
  },
  {
    level: 18,
    cols: 5,
    rows: 5,
    startCol: 0,
    startRow: 3,
    startDir: "left",
    endCol: 4,
    endRow: 0,
    endDir: "top",
    tiles: [
      { col: 0, row: 3, type: "elbow", initialRotation: 90 },
      { col: 0, row: 2, type: "straight", initialRotation: 180 },
      { col: 0, row: 1, type: "t_junction", initialRotation: 270 },
      { col: 1, row: 1, type: "straight", initialRotation: 180 },
      { col: 2, row: 1, type: "t_junction", initialRotation: 270 },
      { col: 2, row: 2, type: "straight", initialRotation: 0 },
      { col: 2, row: 3, type: "straight", initialRotation: 270 },
      { col: 2, row: 4, type: "t_junction", initialRotation: 0 },
      { col: 3, row: 4, type: "straight", initialRotation: 180 },
      { col: 4, row: 4, type: "t_junction", initialRotation: 270 },
      { col: 4, row: 3, type: "straight", initialRotation: 180 },
      { col: 4, row: 2, type: "straight", initialRotation: 0 },
      { col: 4, row: 1, type: "straight", initialRotation: 0 },
      { col: 4, row: 0, type: "straight", initialRotation: 270 },
      { col: 0, row: 0, type: "elbow", initialRotation: 0 },
      { col: 1, row: 3, type: "elbow", initialRotation: 270 },
      { col: 1, row: 4, type: "t_junction", initialRotation: 0 },
      { col: 3, row: 2, type: "straight", initialRotation: 180 }
    ],
    rewardCoins: 410,
    rewardXP: 300,
    instructions: "Level 18. Sambungkan sirkuit dari Generator (LEFT) ke PC Target (TOP)!",
    timeLimit: 36
  },
  {
    level: 19,
    cols: 5,
    rows: 5,
    startCol: 4,
    startRow: 2,
    startDir: "right",
    endCol: 0,
    endRow: 2,
    endDir: "left",
    tiles: [
      { col: 4, row: 2, type: "elbow", initialRotation: 270 },
      { col: 4, row: 3, type: "straight", initialRotation: 180 },
      { col: 4, row: 4, type: "elbow", initialRotation: 90 },
      { col: 3, row: 4, type: "straight", initialRotation: 90 },
      { col: 2, row: 4, type: "elbow", initialRotation: 0 },
      { col: 2, row: 3, type: "straight", initialRotation: 0 },
      { col: 2, row: 2, type: "straight", initialRotation: 180 },
      { col: 2, row: 1, type: "straight", initialRotation: 180 },
      { col: 2, row: 0, type: "elbow", initialRotation: 180 },
      { col: 1, row: 0, type: "straight", initialRotation: 90 },
      { col: 0, row: 0, type: "elbow", initialRotation: 270 },
      { col: 0, row: 1, type: "straight", initialRotation: 270 },
      { col: 0, row: 2, type: "elbow", initialRotation: 90 },
      { col: 4, row: 0, type: "t_junction", initialRotation: 270 },
      { col: 4, row: 1, type: "elbow", initialRotation: 90 },
      { col: 1, row: 3, type: "elbow", initialRotation: 270 },
      { col: 0, row: 3, type: "straight", initialRotation: 270 }
    ],
    rewardCoins: 430,
    rewardXP: 315,
    instructions: "Level 19. Sambungkan sirkuit dari Generator (RIGHT) ke PC Target (LEFT)!",
    timeLimit: 36
  },
  {
    level: 20,
    cols: 5,
    rows: 5,
    startCol: 0,
    startRow: 4,
    startDir: "bottom",
    endCol: 4,
    endRow: 0,
    endDir: "top",
    tiles: [
      { col: 0, row: 4, type: "straight", initialRotation: 270 },
      { col: 0, row: 3, type: "straight", initialRotation: 0 },
      { col: 0, row: 2, type: "straight", initialRotation: 180 },
      { col: 0, row: 1, type: "elbow", initialRotation: 90 },
      { col: 1, row: 1, type: "straight", initialRotation: 90 },
      { col: 2, row: 1, type: "elbow", initialRotation: 0 },
      { col: 2, row: 2, type: "straight", initialRotation: 180 },
      { col: 2, row: 3, type: "elbow", initialRotation: 180 },
      { col: 3, row: 3, type: "straight", initialRotation: 270 },
      { col: 4, row: 3, type: "elbow", initialRotation: 90 },
      { col: 4, row: 2, type: "straight", initialRotation: 0 },
      { col: 4, row: 1, type: "straight", initialRotation: 0 },
      { col: 4, row: 0, type: "straight", initialRotation: 270 },
      { col: 1, row: 4, type: "t_junction", initialRotation: 180 },
      { col: 1, row: 2, type: "elbow", initialRotation: 270 },
      { col: 1, row: 3, type: "elbow", initialRotation: 180 },
      { col: 0, row: 0, type: "t_junction", initialRotation: 90 },
      { col: 3, row: 1, type: "straight", initialRotation: 0 }
    ],
    rewardCoins: 450,
    rewardXP: 330,
    instructions: "Level 20. Sambungkan sirkuit dari Generator (BOTTOM) ke PC Target (TOP)!",
    timeLimit: 35
  },
];

const getTilePorts = (type: "straight" | "elbow" | "t_junction", rotation: number): string[] => {
  let basePorts: string[] = [];
  if (type === "straight") {
    basePorts = ["left", "right"];
  } else if (type === "elbow") {
    basePorts = ["bottom", "right"];
  } else if (type === "t_junction") {
    basePorts = ["left", "right", "bottom"];
  }

  const dirs = ["top", "right", "bottom", "left"];
  const steps = (rotation / 90) % 4;

  return basePorts.map((port) => {
    const idx = dirs.indexOf(port);
    const nextIdx = (idx + steps) % 4;
    return dirs[nextIdx];
  });
};

const computeConnectivity = (
  tiles: Tile[],
  cols: number,
  rows: number,
  startCol: number,
  startRow: number,
  startDir: "top" | "right" | "bottom" | "left",
  endCol: number,
  endRow: number,
  endDir: "top" | "right" | "bottom" | "left"
): { poweredIds: string[]; isTargetConnected: boolean } => {
  const poweredIds: string[] = [];
  const visited = new Set<string>();

  const tileMap = new Map<string, Tile>();
  tiles.forEach((t) => {
    tileMap.set(`${t.col},${t.row}`, t);
  });

  const getTile = (c: number, r: number) => tileMap.get(`${c},${r}`);
  const queue: { col: number; row: number; enterDir: string }[] = [];

  const startTile = getTile(startCol, startRow);
  if (startTile) {
    const ports = getTilePorts(startTile.type, startTile.rotation);
    if (ports.includes(startDir)) {
      queue.push({ col: startCol, row: startRow, enterDir: startDir });
    }
  }

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const key = `${curr.col},${curr.row}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const tile = getTile(curr.col, curr.row);
    if (!tile) continue;

    poweredIds.push(tile.id);
    const ports = getTilePorts(tile.type, tile.rotation);

    ports.forEach((p) => {
      let nc = curr.col;
      let nr = curr.row;
      let targetEnterDir = "";

      if (p === "top") {
        nr = curr.row - 1;
        targetEnterDir = "bottom";
      } else if (p === "right") {
        nc = curr.col + 1;
        targetEnterDir = "left";
      } else if (p === "bottom") {
        nr = curr.row + 1;
        targetEnterDir = "top";
      } else if (p === "left") {
        nc = curr.col - 1;
        targetEnterDir = "right";
      }

      const neighbor = getTile(nc, nr);
      if (neighbor) {
        const neighborPorts = getTilePorts(neighbor.type, neighbor.rotation);
        if (neighborPorts.includes(targetEnterDir) && !visited.has(`${nc},${nr}`)) {
          queue.push({ col: nc, row: nr, enterDir: targetEnterDir });
        }
      }
    });
  }

  let isTargetConnected = false;
  if (visited.has(`${endCol},${endRow}`)) {
    const endTile = getTile(endCol, endRow)!;
    const ports = getTilePorts(endTile.type, endTile.rotation);
    if (ports.includes(endDir)) {
      isTargetConnected = true;
    }
  }

  return {
    poweredIds,
    isTargetConnected,
  };
};

const ICChip = ({ style }: { style: any }) => (
  <View style={[styles.icChipContainer, style]} pointerEvents="none">
    <View style={styles.icPin} />
    <View style={styles.icPin} />
    <View style={styles.icPin} />
    <View style={styles.icBody}>
      <View style={styles.icDot} />
    </View>
    <View style={styles.icPin} />
    <View style={styles.icPin} />
    <View style={styles.icPin} />
  </View>
);

const Resistor = ({ style }: { style: any }) => (
  <View style={[styles.resistorContainer, style]} pointerEvents="none">
    <View style={styles.resistorWire} />
    <View style={styles.resistorBody}>
      <View style={[styles.resistorBand, { backgroundColor: "#B45309" }]} />
      <View style={[styles.resistorBand, { backgroundColor: "#FBBF24" }]} />
      <View style={[styles.resistorBand, { backgroundColor: "#EF4444" }]} />
    </View>
    <View style={styles.resistorWire} />
  </View>
);

const ConfettiPiece = ({
  xPercent,
  color,
  size,
  isRibbon,
  delay,
  duration,
}: {
  xPercent: number;
  color: string;
  size: number;
  isRibbon: boolean;
  delay: number;
  duration: number;
}) => {
  const translateY = useSharedValue(-50);
  const rotation = useSharedValue(0);

  useEffect(() => {
    translateY.value = -50;
    rotation.value = 0;

    const timeout = setTimeout(() => {
      translateY.value = withRepeat(
        withSequence(
          withTiming(650, { duration }),
          withTiming(-50, { duration: 0 })
        ),
        -1,
        false
      );
      rotation.value = withRepeat(
        withTiming(720, { duration }),
        -1,
        false
      );
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay, duration, translateY, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: `${xPercent}%`,
          top: 0,
          backgroundColor: color,
          width: isRibbon ? size * 0.4 : size,
          height: isRibbon ? size * 2.5 : size,
          borderRadius: isRibbon ? 2 : size / 2,
          opacity: 0.85,
          zIndex: 999,
        },
        animatedStyle,
      ]}
    />
  );
};

let audioCtx: AudioContext | null = null;
const playSynthSound = (type: "connect" | "victory" | "fail") => {
  if (Platform.OS !== "web") return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    if (type === "connect") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === "victory") {
      const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
      freqs.forEach((freq, idx) => {
        const osc = audioCtx!.createOscillator();
        const gain = audioCtx!.createGain();
        osc.connect(gain);
        gain.connect(audioCtx!.destination);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.15, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } else if (type === "fail") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.6);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    }
  } catch (e) {
    console.warn("Failed to play synth sound:", e);
  }
};

const traceConnectionPath = (
  tiles: Tile[],
  config: LevelConfig,
  tileSize: number
): { x: number; y: number }[] => {
  const tileMap = new Map<string, Tile>();
  tiles.forEach((t) => {
    tileMap.set(`${t.col},${t.row}`, t);
  });

  const getTile = (c: number, r: number) => tileMap.get(`${c},${r}`);
  const points: { x: number; y: number }[] = [];

  let startPtX = config.startCol * tileSize + tileSize / 2;
  let startPtY = config.startRow * tileSize + tileSize / 2;
  if (config.startDir === "left") startPtX = -12;
  else if (config.startDir === "right") startPtX = ARENA_SIZE + 12;
  else if (config.startDir === "top") startPtY = -12;
  else if (config.startDir === "bottom") startPtY = ARENA_SIZE + 12;

  points.push({ x: startPtX, y: startPtY });

  const startTileCenterX = config.startCol * tileSize + tileSize / 2;
  const startTileCenterY = config.startRow * tileSize + tileSize / 2;
  let currentX = startTileCenterX;
  let currentY = startTileCenterY;
  if (config.startDir === "left") currentX = config.startCol * tileSize;
  else if (config.startDir === "right") currentX = (config.startCol + 1) * tileSize;
  else if (config.startDir === "top") currentY = config.startRow * tileSize;
  else if (config.startDir === "bottom") currentY = (config.startRow + 1) * tileSize;

  points.push({ x: currentX, y: currentY });

  let col = config.startCol;
  let row = config.startRow;
  let enterDir = config.startDir;
  const visited = new Set<string>();

  let loopCount = 0;
  while (loopCount < 100) {
    loopCount++;
    const key = `${col},${row}`;
    visited.add(key);

    const tile = getTile(col, row);
    if (!tile) break;

    const tileCenterX = col * tileSize + tileSize / 2;
    const tileCenterY = row * tileSize + tileSize / 2;
    points.push({ x: tileCenterX, y: tileCenterY });

    const ports = getTilePorts(tile.type, tile.rotation);
    if (!ports.includes(enterDir)) break;

    const exitPorts = ports.filter((p) => p !== enterDir);
    let chosenExit: string | null = null;
    let nextCol = col;
    let nextRow = row;
    let nextEnterDir: "top" | "right" | "bottom" | "left" = "left";

    for (const p of exitPorts) {
      let nc = col;
      let nr = row;
      let targetEnterDir: "top" | "right" | "bottom" | "left" = "left";

      if (p === "top") {
        nr = row - 1;
        targetEnterDir = "bottom";
      } else if (p === "right") {
        nc = col + 1;
        targetEnterDir = "left";
      } else if (p === "bottom") {
        nr = row + 1;
        targetEnterDir = "top";
      } else if (p === "left") {
        nc = col - 1;
        targetEnterDir = "right";
      }

      if (col === config.endCol && row === config.endRow && p === config.endDir) {
        chosenExit = p;
        nextCol = nc;
        nextRow = nr;
        nextEnterDir = targetEnterDir;
        break;
      }

      const neighbor = getTile(nc, nr);
      if (neighbor && !visited.has(`${nc},${nr}`)) {
        const neighborPorts = getTilePorts(neighbor.type, neighbor.rotation);
        if (neighborPorts.includes(targetEnterDir)) {
          chosenExit = p;
          nextCol = nc;
          nextRow = nr;
          nextEnterDir = targetEnterDir;
          break;
        }
      }
    }

    if (!chosenExit) break;

    let exitX = tileCenterX;
    let exitY = tileCenterY;
    if (chosenExit === "left") exitX = col * tileSize;
    else if (chosenExit === "right") exitX = (col + 1) * tileSize;
    else if (chosenExit === "top") exitY = row * tileSize;
    else if (chosenExit === "bottom") exitY = (row + 1) * tileSize;

    points.push({ x: exitX, y: exitY });

    if (col === config.endCol && row === config.endRow && chosenExit === config.endDir) {
      let endPtX = config.endCol * tileSize + tileSize / 2;
      let endPtY = config.endRow * tileSize + tileSize / 2;
      if (config.endDir === "right") endPtX = ARENA_SIZE + 12;
      else if (config.endDir === "left") endPtX = -12;
      else if (config.endDir === "top") endPtY = -12;
      else if (config.endDir === "bottom") endPtY = ARENA_SIZE + 12;

      points.push({ x: endPtX, y: endPtY });
      break;
    }

    col = nextCol;
    row = nextRow;
    enterDir = nextEnterDir;
  }

  return points;
};

export default function RoboLinkScreen() {
  const router = useRouter();
  const [level, setLevel] = useState(1);
  const [highestUnlocked, setHighestUnlocked] = useState(1);
  const [view, setView] = useState<"map" | "game">("map");
  const [userCoins, setUserCoins] = useState(1250);
  const [gameState, setGameState] = useState<"playing" | "victory" | "completed" | "failed" | "outOfLives">("playing");
  const [showHelp, setShowHelp] = useState(true);

  const [tiles, setTiles] = useState<Tile[]>([]);
  const [timeCounter, setTimeCounter] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAnimatingFinish, setIsAnimatingFinish] = useState(false);

  const [lives, setLives] = useState(MAX_LIVES);
  const [lastLossTime, setLastLossTime] = useState<number | null>(null);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  const pulseScale = useSharedValue(1);
  const pulseProgress = useSharedValue(0);
  const sharedPoints = useSharedValue<{ x: number; y: number }[]>([]);

  const currentConfig = useMemo(() => {
    return LEVEL_CONFIGS.find((l) => l.level === level) || LEVEL_CONFIGS[0];
  }, [level]);

  // Compute active connection traces Reactively
  const connectivity = useMemo(() => {
    return computeConnectivity(
      tiles,
      currentConfig.cols,
      currentConfig.rows,
      currentConfig.startCol,
      currentConfig.startRow,
      currentConfig.startDir,
      currentConfig.endCol,
      currentConfig.endRow,
      currentConfig.endDir
    );
  }, [tiles, currentConfig]);

  // Haptic trigger
  const triggerHaptic = (type: "success" | "error" | "light") => {
    try {
      if (Platform.OS !== "web") {
        if (type === "success") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (type === "error") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    } catch {
      // Ignored
    }
  };

  // Timer countdown effect
  useEffect(() => {
    if (gameState !== "playing" || isAnimatingFinish) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          playSynthSound("fail");
          triggerHaptic("error");
          
          setLives((l) => {
            const nextLives = Math.max(0, l - 1);
            AsyncStorage.setItem(LIVES_STORAGE_KEY, nextLives.toString());
            if (l === MAX_LIVES) {
              const now = Date.now();
              setLastLossTime(now);
              AsyncStorage.setItem(LAST_LOSS_STORAGE_KEY, now.toString());
            }
            if (nextLives === 0) {
              setGameState("outOfLives");
            } else {
              setGameState("failed");
            }
            return nextLives;
          });
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, isAnimatingFinish, level]);

  // Clock frame loop
  useEffect(() => {
    if (gameState !== "playing" && !isAnimatingFinish) return;

    let isRunning = true;
    let frameId: number;

    const loop = () => {
      if (!isRunning) return;
      setTimeCounter((t) => t + 1);
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => {
      isRunning = false;
      cancelAnimationFrame(frameId);
    };
  }, [gameState, isAnimatingFinish, level]);

  // Load progress
  useEffect(() => {
    const loadGameData = async () => {
      try {
        const storedCoins = await AsyncStorage.getItem(COINS_STORAGE_KEY);
        if (storedCoins !== null) {
          setUserCoins(parseInt(storedCoins));
        }
        const storedLevel = await AsyncStorage.getItem("robo_link_current_level");
        if (storedLevel !== null) {
          setHighestUnlocked(parseInt(storedLevel));
        }

        const storedLives = await AsyncStorage.getItem(LIVES_STORAGE_KEY);
        const storedLossTime = await AsyncStorage.getItem(LAST_LOSS_STORAGE_KEY);
        
        let currentLives = storedLives ? parseInt(storedLives) : MAX_LIVES;
        let lossTime = storedLossTime ? parseInt(storedLossTime) : null;

        if (lossTime !== null && currentLives < MAX_LIVES) {
          const now = Date.now();
          const elapsed = now - lossTime;
          const restored = Math.floor(elapsed / LIFE_COOLDOWN_MS);
          
          if (restored > 0) {
            currentLives = Math.min(MAX_LIVES, currentLives + restored);
            if (currentLives === MAX_LIVES) {
              lossTime = null;
            } else {
              lossTime = lossTime + restored * LIFE_COOLDOWN_MS;
            }
            await AsyncStorage.setItem(LIVES_STORAGE_KEY, currentLives.toString());
            if (lossTime) {
              await AsyncStorage.setItem(LAST_LOSS_STORAGE_KEY, lossTime.toString());
            } else {
              await AsyncStorage.removeItem(LAST_LOSS_STORAGE_KEY);
            }
          }
        }
        
        setLives(currentLives);
        setLastLossTime(lossTime);
        if (currentLives === 0) setGameState("outOfLives");

      } catch (e) {
        console.error("Failed to load game data", e);
      }
    };
    loadGameData();
  }, []);

  // Cooldown countdown
  useEffect(() => {
    if (lives >= MAX_LIVES || !lastLossTime) return;
    const timer = setInterval(() => {
      const now = Date.now();
      const nextLifeTime = lastLossTime + LIFE_COOLDOWN_MS;
      const remaining = Math.max(0, nextLifeTime - now);
      
      if (remaining <= 0) {
        setLives(prevLives => {
          const newLives = prevLives + 1;
          AsyncStorage.setItem(LIVES_STORAGE_KEY, newLives.toString());
          if (newLives < MAX_LIVES) {
            const newLossTime = Date.now();
            setLastLossTime(newLossTime);
            AsyncStorage.setItem(LAST_LOSS_STORAGE_KEY, newLossTime.toString());
          } else {
            setLastLossTime(null);
            AsyncStorage.removeItem(LAST_LOSS_STORAGE_KEY);
          }
          return newLives;
        });
        setGameState(prev => prev === "outOfLives" ? "playing" : prev);
      } else {
        setCooldownLeft(Math.floor(remaining / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lives, lastLossTime]);

  const handleRestartLevel = () => {
    if (lives <= 0) {
      setGameState("outOfLives");
      return;
    }
    triggerHaptic("light");
    initLevel(level);
  };

  const initLevel = (levelIndex: number) => {
    const config = LEVEL_CONFIGS.find((l) => l.level === levelIndex);
    if (!config) return;

    const initialTiles = config.tiles.map((t, idx) => ({
      id: `tile-${idx}`,
      col: t.col,
      row: t.row,
      type: t.type,
      rotation: t.initialRotation,
    }));

    setTiles(initialTiles);
    setTimeLeft(config.timeLimit || 30);
    setIsAnimatingFinish(false);
    pulseProgress.value = 0;
    sharedPoints.value = [];
    setGameState("playing");
  };

  useEffect(() => {
    initLevel(level);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const handleFinishTransition = () => {
    playSynthSound("victory");
    triggerHaptic("success");
    pulseScale.value = withSequence(withTiming(1.2, { duration: 150 }), withTiming(1, { duration: 180 }));
    
    setTimeout(() => {
      if (level < LEVEL_CONFIGS.length) {
        setGameState("victory");
      } else {
        setGameState("completed");
      }
      setIsAnimatingFinish(false);
    }, 450);
  };

  // Handle tile rotaton clicks
  const handleTilePress = (tileId: string) => {
    if (gameState !== "playing" || isAnimatingFinish) return;
    triggerHaptic("light");

    setTiles((prevTiles) => {
      const nextTiles = prevTiles.map((t) => {
        if (t.id === tileId) {
          return { ...t, rotation: (t.rotation + 90) % 360 };
        }
        return t;
      });

      const { isTargetConnected } = computeConnectivity(
        nextTiles,
        currentConfig.cols,
        currentConfig.rows,
        currentConfig.startCol,
        currentConfig.startRow,
        currentConfig.startDir,
        currentConfig.endCol,
        currentConfig.endRow,
        currentConfig.endDir
      );

      if (isTargetConnected) {
        playSynthSound("connect");
        const path = traceConnectionPath(nextTiles, currentConfig, tileSize);
        sharedPoints.value = path;
        setIsAnimatingFinish(true);
        pulseProgress.value = 0;
        pulseProgress.value = withTiming(1, { duration: 1500 }, (finished) => {
          if (finished) {
            runOnJS(handleFinishTransition)();
          }
        });
      }

      return nextTiles;
    });
  };

  const handleNextLevel = async () => {
    triggerHaptic("light");
    const nextLvl = level + 1;
    const finalBalance = userCoins + currentConfig.rewardCoins;
    const newHighest = Math.max(highestUnlocked, nextLvl);

    try {
      await AsyncStorage.setItem(COINS_STORAGE_KEY, finalBalance.toString());
      await AsyncStorage.setItem("robo_link_current_level", newHighest.toString());
      setUserCoins(finalBalance);
      setHighestUnlocked(newHighest);
      
      // Lanjut main ke level berikutnya
      setLevel(nextLvl);
    } catch (e) {
      console.error("Failed to save progress", e);
      setLevel(nextLvl);
    }
  };

  const handleClaimAndExit = async () => {
    triggerHaptic("success");
    const finalBalance = userCoins + currentConfig.rewardCoins;

    try {
      await AsyncStorage.setItem(COINS_STORAGE_KEY, finalBalance.toString());
      setView("map");
    } catch (e) {
      console.error("Failed to save progress", e);
      setView("map");
    }
  };

  const isBlinking = (timeCounter % 60) < 30;
  const isEnergyDelivered = gameState === "victory" || gameState === "completed";

  const targetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => {
    const points = sharedPoints.value;
    if (!points || points.length === 0) {
      return {
        opacity: 0,
        transform: [{ translateX: 0 }, { translateY: 0 }],
      };
    }

    const p = pulseProgress.value;
    if (p <= 0) {
      return {
        opacity: 1,
        transform: [{ translateX: points[0].x - 10 }, { translateY: points[0].y - 10 }],
      };
    }
    if (p >= 1) {
      const lastPoint = points[points.length - 1];
      return {
        opacity: 1,
        transform: [{ translateX: lastPoint.x - 10 }, { translateY: lastPoint.y - 10 }],
      };
    }

    let totalLength = 0;
    const segmentLengths = [];
    for (let i = 0; i < points.length - 1; i++) {
      const dx = points[i + 1].x - points[i].x;
      const dy = points[i + 1].y - points[i].y;
      const len = Math.sqrt(dx * dx + dy * dy);
      segmentLengths.push(len);
      totalLength += len;
    }

    const targetDist = p * totalLength;
    let accumulatedDist = 0;
    let x = points[0].x;
    let y = points[0].y;

    for (let i = 0; i < points.length - 1; i++) {
      const len = segmentLengths[i];
      if (targetDist <= accumulatedDist + len) {
        const segProgress = (targetDist - accumulatedDist) / len;
        const p1 = points[i];
        const p2 = points[i + 1];
        x = p1.x + (p2.x - p1.x) * segProgress;
        y = p1.y + (p2.y - p1.y) * segProgress;
        break;
      }
      accumulatedDist += len;
    }

    return {
      opacity: 1,
      transform: [
        { translateX: x - 10 },
        { translateY: y - 10 },
      ],
    };
  });

  // Dynamic Tile size based on grid columns
  const tileSize = ARENA_SIZE / currentConfig.cols;

  // Dynamic Node Robot positions (Generator)
  const robotPosition = useMemo(() => {
    let x = -46;
    let y = currentConfig.startRow * tileSize + (tileSize - 50) / 2;
    if (currentConfig.startDir === "right") {
      x = ARENA_SIZE - 4;
    } else if (currentConfig.startDir === "top") {
      x = currentConfig.startCol * tileSize + (tileSize - 50) / 2;
      y = -46;
    } else if (currentConfig.startDir === "bottom") {
      x = currentConfig.startCol * tileSize + (tileSize - 50) / 2;
      y = ARENA_SIZE - 4;
    }
    return { x, y };
  }, [currentConfig, tileSize]);

  // Dynamic Node Target PC positions
  const pcPosition = useMemo(() => {
    let x = ARENA_SIZE - 4;
    let y = currentConfig.endRow * tileSize + (tileSize - 50) / 2;
    if (currentConfig.endDir === "left") {
      x = -46;
    } else if (currentConfig.endDir === "top") {
      x = currentConfig.endCol * tileSize + (tileSize - 50) / 2;
      y = -46;
    } else if (currentConfig.endDir === "bottom") {
      x = currentConfig.endCol * tileSize + (tileSize - 50) / 2;
      y = ARENA_SIZE - 4;
    }
    return { x, y };
  }, [currentConfig, tileSize]);


  if (view === "map") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#F0FDF4" }]} edges={["top", "bottom"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#86EFAC" />
        <View style={[styles.header, { backgroundColor: "#86EFAC", borderBottomColor: "#4ADE80" }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <GameBackButton bgColor="#006874" borderColor="#006874" bottomBorderColor="#004E57" />
            <Text style={{ ...FONTS.heading, fontSize: 18, color: "#14532D" }}>Peta Sirkuit</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Pressable
              onPress={() => setShowHelp(true)}
              style={({ pressed }) => [styles.resetBtn, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="help-circle" size={18} color="#FFFFFF" />
            </Pressable>
            <View style={[styles.coinsHeaderBadge, { borderColor: "#EF4444", backgroundColor: "#FEF2F2" }]}>
              <Ionicons name="heart" size={16} color="#EF4444" />
              <Text style={[styles.coinsHeaderVal, { color: "#B91C1C" }]}>{lives}</Text>
            </View>
            <View style={styles.coinsHeaderBadge}>
              <MaterialCommunityIcons name="currency-usd" size={18} color="#D97706" />
              <Text style={styles.coinsHeaderVal}>{userCoins}</Text>
            </View>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 40, alignItems: 'center' }}>
          {/* Path SVG behind the levels */}
          <View style={{ position: 'absolute', top: 40, bottom: 40, left: 0, right: 0, alignItems: 'center' }}>
            <Svg width="200" height={LEVEL_CONFIGS.length * 85}>
              <Path
                d={`M 100 30 ` + LEVEL_CONFIGS.slice().reverse().map((lvl, idx) => {
                  const x = 100 + Math.sin(lvl.level * 0.8) * 80;
                  const y = idx * 85 + 30;
                  return `L ${x} ${y}`;
                }).join(" ")}
                fill="none"
                stroke="#4ADE80"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d={`M 100 30 ` + LEVEL_CONFIGS.slice().reverse().map((lvl, idx) => {
                  const x = 100 + Math.sin(lvl.level * 0.8) * 80;
                  const y = idx * 85 + 30;
                  return `L ${x} ${y}`;
                }).join(" ")}
                fill="none"
                stroke="#BBF7D0"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          
          {LEVEL_CONFIGS.slice().reverse().map((lvl, idx) => {
            const isUnlocked = lvl.level <= highestUnlocked;
            const isCurrent = lvl.level === highestUnlocked;
            const offsetX = Math.sin(lvl.level * 0.8) * 80;
            
            return (
              <View key={lvl.level} style={{ height: 85, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Pressable
                  onPress={() => {
                    if (isUnlocked) {
                      if (lives <= 0) {
                        setGameState("outOfLives");
                      } else {
                        setLevel(lvl.level);
                        setView("game");
                      }
                    }
                  }}
                  style={({ pressed }) => [
                    {
                      width: 60, height: 60, borderRadius: 30,
                      backgroundColor: isUnlocked ? (isCurrent ? "#F59E0B" : "#10B981") : "#CBD5E1",
                      justifyContent: 'center', alignItems: 'center',
                      borderWidth: 4, borderColor: isUnlocked ? "#FFFFFF" : "#94A3B8",
                      shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5,
                      transform: [
                        { translateX: offsetX },
                        { scale: pressed && isUnlocked ? 0.9 : (isCurrent ? 1.1 : 1) }
                      ]
                    }
                  ]}
                >
                  {isUnlocked ? (
                     <Text style={{ ...FONTS.heading, fontSize: 24, color: "#FFF" }}>{lvl.level}</Text>
                  ) : (
                     <Ionicons name="lock-closed" size={24} color="#94A3B8" />
                  )}
                </Pressable>
              </View>
            );
          })}
        </ScrollView>

        {/* OUT OF LIVES MODAL IN MAP */}
        <Modal visible={gameState === "outOfLives"} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={[styles.victoryIconCircle, { backgroundColor: "#FEF2F2" }]}>
                <Ionicons name="heart-half" size={50} color="#EF4444" />
              </View>
              <Text style={styles.modalTitle}>NYAWA HABIS!</Text>
              <Text style={styles.modalSubtitle}>Tunggu energi pulih untuk melanjutkan main. 1 Nyawa pulih dalam 15 menit.</Text>
              <View style={styles.rewardSummary}>
                <Text style={styles.rewardLabel}>WAKTU TUNGGU</Text>
                <Text style={{ fontSize: 24, fontWeight: "bold", color: "#EF4444" }}>
                  {Math.floor(cooldownLeft / 60)}:{(cooldownLeft % 60).toString().padStart(2, "0")}
                </Text>
              </View>
              <Button title="Kembali" onPress={() => setGameState("playing")} variant="primary" style={{ width: "100%", backgroundColor: "#64748B" }} />
            </View>
          </View>
        </Modal>

        <HowToPlayModal
          visible={showHelp}
          onClose={() => setShowHelp(false)}
          title="Cara Main Robo Link"
          goal="Sambungkan jalur sirkuit dari Robot sumber ke PC tujuan sebelum waktu habis!"
          accentColor="#0D9488"
          subtitleColor="#0F766E"
          steps={[
            { emoji: "1️⃣", text: "Ketuk ubin sirkuit untuk memutarnya sebesar 90°." },
            { emoji: "2️⃣", text: "Putar hingga terbentuk jalur tersambung dari Robot (sumber) ke PC (tujuan)." },
            { emoji: "3️⃣", text: "Waktu terbatas (30–45 detik). Jika waktu habis, nyawa berkurang — hati-hati ubin jebakan!" },
            { emoji: "4️⃣", text: "Level terbuka berurutan. Nyawa pulih 1 setiap 15 menit (maksimal 5)." },
          ]}
          tips={[
            "Mulai putar tile dari dekat sumber, lalu telusuri terus sampai ke PC.",
            "Rencanakan jalur sebelum waktu habis — cek bentuk tile di sekitarnya.",
          ]}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#99F6E4" />

      {/* HEADER HUD BAR */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pressable
            onPress={() => {
              triggerHaptic("light");
              setView("map");
            }}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="map" size={16} color="#0F766E" />
          </Pressable>

          {/* TIMER BADGE */}
          <View style={[styles.timerBadge, timeLeft <= 10 && styles.timerBadgeUrgent]}>
            <Ionicons name="time" size={16} color={timeLeft <= 10 ? "#EF4444" : "#0D9488"} />
            <Text style={[styles.timerText, timeLeft <= 10 && styles.timerTextUrgent]}>{timeLeft}s</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Pressable
            onPress={() => setShowHelp(true)}
            style={({ pressed }) => [styles.resetBtn, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="help-circle" size={18} color="#FFFFFF" />
          </Pressable>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Level {level}</Text>
          </View>
          <Pressable
            onPress={handleRestartLevel}
            style={({ pressed }) => [styles.resetBtn, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="reload" size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={[styles.coinsHeaderBadge, { borderColor: "#EF4444", backgroundColor: "#FEF2F2" }]}>
            <Ionicons name="heart" size={16} color="#EF4444" />
            <Text style={[styles.coinsHeaderVal, { color: "#B91C1C" }]}>{lives}</Text>
          </View>
          <View style={styles.coinsHeaderBadge}>
            <MaterialCommunityIcons name={"currency-usd" as any} size={18} color="#D97706" />
            <Text style={styles.coinsHeaderVal}>{userCoins}</Text>
          </View>
        </View>
      </View>

      {/* TIMER PROGRESS BAR */}
      <View style={styles.timerProgressContainer}>
        <View
          style={[
            styles.timerProgressBar,
            {
              width: `${(timeLeft / (currentConfig.timeLimit || 30)) * 100}%`,
              backgroundColor: timeLeft <= 10 ? "#EF4444" : "#10B981",
            },
          ]}
        />
      </View>

      {/* HAZARD TAPE ACCENTS */}
      <View style={styles.hazardTapeTop} />

      {/* FULL-SCREEN CIRCUIT BOARD VIEWPORT */}
      <View style={styles.gameplayArea}>
        
        {/* PCB Background copper circuit traces decoration (Bright grid style) */}
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Path d="M40,160 L120,240 L340,240" stroke="rgba(20, 184, 166, 0.18)" strokeWidth={3} fill="none" />
          <Path d="M320,60 L280,100 L280,180" stroke="rgba(20, 184, 166, 0.18)" strokeWidth={3} fill="none" />
          <Path d="M80,420 L160,340 L160,280" stroke="rgba(20, 184, 166, 0.18)" strokeWidth={3} fill="none" />
          
          <Circle cx={120} cy={240} r={4} fill="rgba(20, 184, 166, 0.3)" />
          <Circle cx={280} cy={100} r={4} fill="rgba(20, 184, 166, 0.3)" />
        </Svg>

        {/* Scattered hardware components */}
        <ICChip style={{ left: 16, top: 140 }} />
        <ICChip style={{ right: 20, top: 220 }} />
        <Resistor style={{ left: 80, top: 80 }} />
        <Resistor style={{ right: 80, top: 410 }} />

        {/* Blinking diagnostic LEDs */}
        <View style={[styles.ledNode, { left: 40, top: 60, backgroundColor: isBlinking ? "#10B981" : "#0F766E" }]} />
        <View style={[styles.ledNode, { right: 40, top: 60, backgroundColor: !isBlinking ? "#F59E0B" : "#0F766E" }]} />

        {/* Floating Instruction Card at the Top */}
        <View style={styles.topCardBanner}>
          <MaterialCommunityIcons name="information" size={16} color="#0D9488" />
          <Text style={styles.topCardBannerText}>
            KETUK UBIN UNTUK MEMUTAR SIRKUIT KUNING ⚡ SAMPAI MENYALAKAN PC!
          </Text>
        </View>

        {/* CENTERED ADAPTING PLAY ZONE */}
        <View style={styles.arenaContainer}>
          <View style={styles.arenaWrapper}>
            
            {/* Source Robot Port Casing (Left) */}
            <View style={[styles.sourceRobotNode, { left: robotPosition.x, top: robotPosition.y }]}>
              <View style={styles.robotConnectorHead}>
                <View style={styles.robotConnectorHeadFace}>
                  <View style={styles.connectorEye} />
                  <View style={styles.connectorEye} />
                </View>
              </View>
              <View style={styles.robotConnectorBody} />
              
              {/* Silver pins connecting into starting tile */}
              <View style={styles.silverPinRow}>
                <View style={styles.silverPin} />
                <View style={styles.silverPin} />
              </View>

              <View style={styles.nodeLabel}>
                <Text style={styles.nodeLabelText}>GENERATOR</Text>
              </View>
            </View>

            {/* Target PC Receptor Casing (Right) */}
            <Animated.View
              style={[
                styles.targetNodeContainer,
                isEnergyDelivered && targetAnimatedStyle,
                { left: pcPosition.x, top: pcPosition.y },
              ]}
            >
              <View
                style={[
                  styles.pcMonitor,
                  {
                    backgroundColor: isEnergyDelivered ? "#10B981" : "#475569",
                    borderColor: isEnergyDelivered ? "#A7F3D0" : "#64748B",
                  },
                ]}
              >
                {isEnergyDelivered ? (
                  <>
                    <MaterialCommunityIcons name="lan-connect" size={14} color="#FFFFFF" />
                    <Text style={styles.pcFaceText}>(^.^)</Text>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons name="lan-disconnect" size={14} color="#CBD5E1" />
                    <Text style={[styles.pcFaceText, { color: "#CBD5E1" }]}>OFFLINE</Text>
                  </>
                )}
              </View>
              <View style={styles.pcStand} />
              <View style={styles.pcBase} />

              {/* Silver pins connecting from end tile */}
              <View style={[styles.silverPinRow, { left: -10 }]}>
                <View style={styles.silverPin} />
                <View style={styles.silverPin} />
              </View>

              <View style={styles.nodeLabel}>
                <Text style={styles.nodeLabelText}>PC TARGET</Text>
              </View>
            </Animated.View>

            {/* Grid Arena */}
            {/* Grid Arena */}
            <View style={styles.gameArena}>
              {isAnimatingFinish && (
                <Animated.View
                  style={[
                    styles.energyPulse,
                    pulseAnimatedStyle,
                  ]}
                />
              )}
              {tiles.map((tile) => {
                const leftPos = tile.col * tileSize;
                const topPos = tile.row * tileSize;

                return (
                  <Pressable
                    key={tile.id}
                    onPress={() => handleTilePress(tile.id)}
                    style={[
                      styles.tileCard,
                      {
                        left: leftPos + 1.5,
                        top: topPos + 1.5,
                        width: tileSize - 3,
                        height: tileSize - 3,
                      },
                    ]}
                  >
                    {/* Metal Solder Pads in corners */}
                    <View style={[styles.solderPad, { top: 3, left: 3 }]} />
                    <View style={[styles.solderPad, { top: 3, right: 3 }]} />
                    <View style={[styles.solderPad, { bottom: 3, left: 3 }]} />
                    <View style={[styles.solderPad, { bottom: 3, right: 3 }]} />
                  </Pressable>
                );
              })}

              {/* Single Parent SVG Canvas covering the entire grid + overflow bounds */}
              <Svg width={ARENA_SIZE} height={ARENA_SIZE} style={[StyleSheet.absoluteFill, { overflow: "visible" }]} pointerEvents="none">
                {/* 1. Generator Source Input Lead */}
                {(() => {
                  let x1 = -12, y1 = currentConfig.startRow * tileSize + tileSize / 2;
                  let x2 = 0, y2 = currentConfig.startRow * tileSize + tileSize / 2;
                  if (currentConfig.startDir === "right") {
                    x1 = ARENA_SIZE + 12; x2 = ARENA_SIZE;
                  } else if (currentConfig.startDir === "top") {
                    x1 = currentConfig.startCol * tileSize + tileSize / 2; y1 = -12;
                    x2 = currentConfig.startCol * tileSize + tileSize / 2; y2 = 0;
                  } else if (currentConfig.startDir === "bottom") {
                    x1 = currentConfig.startCol * tileSize + tileSize / 2; y1 = ARENA_SIZE + 12;
                    x2 = currentConfig.startCol * tileSize + tileSize / 2; y2 = ARENA_SIZE;
                  }
                  return (
                    <>
                      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FBBF24" strokeWidth={8} strokeLinecap="round" />
                      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F97316" strokeWidth={4} strokeLinecap="round" />
                    </>
                  );
                })()}

                {/* 2. PC Target Receptor Output Lead */}
                {(() => {
                  let x1 = ARENA_SIZE, y1 = currentConfig.endRow * tileSize + tileSize / 2;
                  let x2 = ARENA_SIZE + 12, y2 = currentConfig.endRow * tileSize + tileSize / 2;
                  if (currentConfig.endDir === "left") {
                    x1 = 0; x2 = -12;
                  } else if (currentConfig.endDir === "top") {
                    x1 = currentConfig.endCol * tileSize + tileSize / 2; y1 = 0;
                    x2 = currentConfig.endCol * tileSize + tileSize / 2; y2 = -12;
                  } else if (currentConfig.endDir === "bottom") {
                    x1 = currentConfig.endCol * tileSize + tileSize / 2; y1 = ARENA_SIZE;
                    x2 = currentConfig.endCol * tileSize + tileSize / 2; y2 = ARENA_SIZE + 12;
                  }
                  return (
                    <>
                      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isEnergyDelivered ? "#FBBF24" : "rgba(251, 191, 36, 0.16)"} strokeWidth={8} strokeLinecap="round" />
                      <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isEnergyDelivered ? "#F97316" : "#475569"} strokeWidth={4} strokeLinecap="round" />
                    </>
                  );
                })()}

                {/* 3. Dynamic Rotatable Circuit Traces */}
                {tiles.map((tile) => {
                  const isPowered = connectivity.poweredIds.includes(tile.id);
                  const cx = tile.col * tileSize + tileSize / 2;
                  const cy = tile.row * tileSize + tileSize / 2;
                  const half = tileSize / 2;

                  return (
                    <G key={tile.id} transform={`rotate(${tile.rotation}, ${cx}, ${cy})`}>
                      {tile.type === "straight" && (
                        <>
                          <Line
                            x1={cx - half}
                            y1={cy}
                            x2={cx + half}
                            y2={cy}
                            stroke={isPowered ? "#FBBF24" : "rgba(251, 191, 36, 0.16)"}
                            strokeWidth={8}
                            strokeLinecap="round"
                            strokeDasharray={isPowered ? [10, 8] : undefined}
                            strokeDashoffset={isPowered ? -timeCounter * 1.5 : undefined}
                          />
                          <Line
                            x1={cx - half}
                            y1={cy}
                            x2={cx + half}
                            y2={cy}
                            stroke={isPowered ? "#F97316" : "#475569"}
                            strokeWidth={4}
                            strokeLinecap="round"
                          />
                        </>
                      )}

                      {tile.type === "elbow" && (
                        <>
                          <Path
                            d={`M ${cx} ${cy + half} Q ${cx} ${cy} ${cx + half} ${cy}`}
                            fill="none"
                            stroke={isPowered ? "#FBBF24" : "rgba(251, 191, 36, 0.16)"}
                            strokeWidth={8}
                            strokeLinecap="round"
                            strokeDasharray={isPowered ? [10, 8] : undefined}
                            strokeDashoffset={isPowered ? -timeCounter * 1.5 : undefined}
                          />
                          <Path
                            d={`M ${cx} ${cy + half} Q ${cx} ${cy} ${cx + half} ${cy}`}
                            fill="none"
                            stroke={isPowered ? "#F97316" : "#475569"}
                            strokeWidth={4}
                            strokeLinecap="round"
                          />
                        </>
                      )}

                      {tile.type === "t_junction" && (
                        <>
                          <Line
                            x1={cx - half}
                            y1={cy}
                            x2={cx + half}
                            y2={cy}
                            stroke={isPowered ? "#FBBF24" : "rgba(251, 191, 36, 0.16)"}
                            strokeWidth={8}
                            strokeLinecap="round"
                            strokeDasharray={isPowered ? [10, 8] : undefined}
                            strokeDashoffset={isPowered ? -timeCounter * 1.5 : undefined}
                          />
                          <Line
                            x1={cx}
                            y1={cy}
                            x2={cx}
                            y2={cy + half}
                            stroke={isPowered ? "#FBBF24" : "rgba(251, 191, 36, 0.16)"}
                            strokeWidth={8}
                            strokeLinecap="round"
                            strokeDasharray={isPowered ? [10, 8] : undefined}
                            strokeDashoffset={isPowered ? -timeCounter * 1.5 : undefined}
                          />
                          <Line
                            x1={cx - half}
                            y1={cy}
                            x2={cx + half}
                            y2={cy}
                            stroke={isPowered ? "#F97316" : "#475569"}
                            strokeWidth={4}
                            strokeLinecap="round"
                          />
                          <Line
                            x1={cx}
                            y1={cy}
                            x2={cx}
                            y2={cy + half}
                            stroke={isPowered ? "#F97316" : "#475569"}
                            strokeWidth={4}
                            strokeLinecap="round"
                          />
                        </>
                      )}
                    </G>
                  );
                })}
              </Svg>
            </View>

          </View>
        </View>
      </View>

      {/* INDUSTRIAL HAZARD BOTTOM TAPES */}
      <View style={styles.hazardTapeBottom} />

      {/* BOTTOM INFO CARD */}
      <View style={styles.missionCardContainer}>
        <View style={styles.missionCard}>
          <View style={styles.missionCardHeader}>
            <View style={styles.skillBadge}>
              <Text style={styles.skillBadgeText}>🧩 PLANNING & SPATIAL</Text>
            </View>
            <Text style={styles.xpReward}>+{currentConfig.rewardXP} XP</Text>
          </View>
          <Text style={styles.missionTitle}>Misi: Robo-Link</Text>
          <Text style={styles.missionDescription}>{currentConfig.instructions}</Text>
        </View>
      </View>

      {/* Confetti Ribbon Celebration Overlay */}
      {(gameState === "victory" || gameState === "completed") && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: 30 }).map((_, i) => {
            const randomX = (i * 12.34) % 100;
            const randomDelay = (i * 150) % 2000;
            const randomDuration = 2500 + ((i * 370) % 1500);
            const randomColor = ["#FF2E93", "#FF8A00", "#FF007A", "#FFD600", "#00F0FF", "#7000FF", "#00FF66"][i % 7];
            const size = 6 + (i % 6);
            const isRibbon = i % 2 === 0;

            return (
              <ConfettiPiece
                key={i}
                xPercent={randomX}
                color={randomColor}
                size={size}
                isRibbon={isRibbon}
                delay={randomDelay}
                duration={randomDuration}
              />
            );
          })}
        </View>
      )}

      {/* VICTORY MODAL OVERLAY - 2 COLUMN COGNITIVE RADAR CHART */}
      <Modal visible={gameState === "victory"} transparent animationType="fade">
        <ScrollView style={{ flex: 1, backgroundColor: "rgba(3, 7, 18, 0.88)" }} contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 12, paddingHorizontal: 10 }}>
          <View style={styles.resultModalCard}>
            {/* HEADER */}
            <View style={styles.resultHeader}>
              <Text style={styles.resultBadgeText}>MISSION COMPLETED</Text>
              <Text style={styles.resultTitleText}>LEVEL {String(level).padStart(2, "0")} CLEARED!</Text>
              <Text style={styles.resultSubtitleText}>
                Sirkuit Data Berhasil Disambungkan!
              </Text>
            </View>

            {/* DUAL COLUMN CONTAINER */}
            <View style={styles.resultGrid}>
              {/* LEFT COLUMN: PENCAPAIAN MISI */}
              <View style={styles.resultColumnLeft}>
                <Text style={styles.columnTitle}>PENCAPAIAN MISI</Text>
                
                {/* STARS */}
                <View style={styles.starRow}>
                  <Text style={styles.starText}>⭐ ⭐ ⭐</Text>
                </View>

                {/* CHECKLIST */}
                <View style={styles.checklistContainer}>
                  <Text style={styles.checkItem}>⭐ Kabel 100% <Text style={styles.checkVal}>(Sukses)</Text></Text>
                  <Text style={styles.checkItem}>⭐ Waktu sirkuit <Text style={styles.checkVal}>(Bonus Cepat)</Text></Text>
                  <Text style={styles.checkItem}>⭐ Kebocoran daya <Text style={styles.checkVal}>(0 Leak)</Text></Text>
                </View>

                {/* LOOT BREAKDOWN */}
                <View style={styles.lootBreakdown}>
                  <View style={styles.lootRow}>
                    <Text style={styles.lootLabel}>Loot Base / Bonus:</Text>
                    <Text style={styles.lootVal}>+{currentConfig.rewardCoins} / +25</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>TOTAL KOIN:</Text>
                    <Text style={styles.totalVal}>{currentConfig.rewardCoins + 25} KOIN</Text>
                  </View>
                </View>
              </View>

              {/* RIGHT COLUMN: ANALISIS PERKEMBANGAN OTAK */}
              <View style={styles.resultColumnRight}>
                <Text style={styles.brainTitle}>🧠 Perkembangan Otak</Text>
                <Text style={styles.brainSubtitle}>(Cognitive Radar)</Text>

                {/* RADAR CHART */}
                <View style={styles.radarWrapper}>
                  <RadarChart
                    size={140}
                    data={[
                      { axis: "Spasial", score: 85 },
                      { axis: "Keputusan", score: 90 },
                      { axis: "Kontrol Diri", score: 78 },
                      { axis: "Memori Kerja", score: 95 },
                      { axis: "Fokus", score: 88 },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* ACTION BUTTONS */}
            <View style={styles.resultActions}>
              <Pressable style={styles.btnGhost} onPress={() => router.back()}>
                <Text style={styles.btnGhostText}>Kembali Ke Menu</Text>
              </Pressable>
              <Pressable style={styles.btnPrimaryNext} onPress={handleNextLevel}>
                <Text style={styles.btnPrimaryNextText}>Lanjut Level ➔</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </Modal>

      {/* COMPLETED ALL LEVELS MODAL OVERLAY */}
      <Modal visible={gameState === "completed"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.victoryIconCircle, { backgroundColor: "#FFF7ED" }]}>
              <Ionicons name="medal" size={50} color="#D97706" />
            </View>
            <Text style={styles.modalTitle}>PETUALANGAN SELESAI!</Text>
            <Text style={styles.modalSubtitle}>Luar biasa! Kamu berhasil menghubungkan seluruh jaringan sirkuit komputer Robo-Link!</Text>

            <View style={styles.rewardSummary}>
              <Text style={styles.rewardLabel}>HADIAH TOTAL</Text>
              <View style={styles.rewardBadge}>
                <MaterialCommunityIcons name={"currency-usd" as any} size={20} color="#F59E0B" />
                <Text style={styles.rewardBadgeText}>+{currentConfig.rewardCoins} Koin</Text>
              </View>
            </View>

            <Button
              title="Klaim Hadiah & Selesai"
              onPress={handleClaimAndExit}
              variant="primary"
              style={{ width: "100%" }}
            />
          </View>
        </View>
      </Modal>

      {/* FAILED MODAL OVERLAY - 2 COLUMN COGNITIVE RADAR CHART */}
      <Modal visible={gameState === "failed"} transparent animationType="fade">
        <ScrollView style={{ flex: 1, backgroundColor: "rgba(3, 7, 18, 0.88)" }} contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 12, paddingHorizontal: 10 }}>
          <View style={[styles.resultModalCard, { borderColor: "rgba(239, 68, 68, 0.4)" }]}>
            {/* HEADER */}
            <View style={styles.resultHeader}>
              <Text style={[styles.resultBadgeText, { color: "#EF4444" }]}>MISSION FAILED</Text>
              <Text style={[styles.resultTitleText, { color: "#F87171" }]}>WAKTU HABIS!</Text>
              <Text style={styles.resultSubtitleText}>
                Sirkuit Data Gagal Tersambung Dalam Batas Waktu.
              </Text>
            </View>

            {/* DUAL COLUMN CONTAINER */}
            <View style={styles.resultGrid}>
              {/* LEFT COLUMN: EVALUASI MISI */}
              <View style={[styles.resultColumnLeft, { borderColor: "rgba(239, 68, 68, 0.25)" }]}>
                <Text style={styles.columnTitle}>EVALUASI MISI</Text>
                
                {/* STARS */}
                <View style={styles.starRow}>
                  <Text style={styles.starText}>☆ ☆ ☆</Text>
                </View>

                {/* CHECKLIST */}
                <View style={styles.checklistContainer}>
                  <Text style={styles.checkItem}>❌ Kabel sirkuit <Text style={[styles.checkVal, { color: "#F87171" }]}> (Terputus)</Text></Text>
                  <Text style={styles.checkItem}>⚠️ Batas waktu <Text style={styles.checkVal}>(Waktu Habis)</Text></Text>
                  <Text style={styles.checkItem}>💡 Alur kabel <Text style={styles.checkVal}>(Coba Lagi)</Text></Text>
                </View>

                {/* LOOT BREAKDOWN */}
                <View style={styles.lootBreakdown}>
                  <View style={styles.lootRow}>
                    <Text style={styles.lootLabel}>Loot Koin Diraih:</Text>
                    <Text style={styles.lootVal}>+10 Koin</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: "#F87171" }]}>TOTAL KOIN:</Text>
                    <Text style={[styles.totalVal, { color: "#F87171" }]}>10 KOIN</Text>
                  </View>
                </View>
              </View>

              {/* RIGHT COLUMN: ANALISIS PERKEMBANGAN OTAK */}
              <View style={styles.resultColumnRight}>
                <Text style={styles.brainTitle}>🧠 Evaluasi Otak</Text>
                <Text style={styles.brainSubtitle}>(Focus & Spasial)</Text>

                {/* RADAR CHART */}
                <View style={styles.radarWrapper}>
                  <RadarChart
                    size={140}
                    data={[
                      { axis: "Spasial", score: 55 },
                      { axis: "Keputusan", score: 60 },
                      { axis: "Kontrol Diri", score: 68 },
                      { axis: "Memori Kerja", score: 50 },
                      { axis: "Fokus", score: 62 },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* ACTION BUTTONS */}
            <View style={styles.resultActions}>
              <Pressable style={styles.btnGhost} onPress={() => router.back()}>
                <Text style={styles.btnGhostText}>Kembali Ke Menu</Text>
              </Pressable>
              <Pressable style={[styles.btnPrimaryNext, { backgroundColor: "#DC2626" }]} onPress={handleRestartLevel}>
                <Text style={styles.btnPrimaryNextText}>Coba Lagi 🔄</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </Modal>

      {/* OUT OF LIVES MODAL OVERLAY */}
      <Modal visible={gameState === "outOfLives"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.victoryIconCircle, { backgroundColor: "#FEF2F2" }]}>
              <Ionicons name="heart-half" size={50} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>NYAWA HABIS!</Text>
            <Text style={styles.modalSubtitle}>
              Tunggu energi pulih untuk melanjutkan main. 1 Nyawa pulih dalam 15 menit.
            </Text>

            <View style={styles.rewardSummary}>
              <Text style={styles.rewardLabel}>WAKTU TUNGGU</Text>
              <Text style={{ fontSize: 24, fontWeight: "bold", color: "#EF4444" }}>
                {Math.floor(cooldownLeft / 60)}:{(cooldownLeft % 60).toString().padStart(2, "0")}
              </Text>
            </View>

            <Button
              title="Kembali"
              onPress={() => router.back()}
              variant="primary"
              style={{ width: "100%", backgroundColor: "#64748B" }}
            />
          </View>
        </View>
      </Modal>

      <HowToPlayModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title="Cara Main Robo Link"
        goal="Sambungkan jalur sirkuit dari Robot sumber ke PC tujuan sebelum waktu habis!"
        accentColor="#0D9488"
        subtitleColor="#0F766E"
        steps={[
          { emoji: "1️⃣", text: "Ketuk ubin sirkuit untuk memutarnya sebesar 90°." },
          { emoji: "2️⃣", text: "Putar hingga terbentuk jalur tersambung dari Robot (sumber) ke PC (tujuan)." },
          { emoji: "3️⃣", text: "Waktu terbatas (30–45 detik). Jika waktu habis, nyawa berkurang — hati-hati ubin jebakan!" },
          { emoji: "4️⃣", text: "Level terbuka berurutan. Nyawa pulih 1 setiap 15 menit (maksimal 5)." },
        ]}
        tips={[
          "Mulai putar tile dari dekat sumber, lalu telusuri terus sampai ke PC.",
          "Rencanakan jalur sebelum waktu habis — cek bentuk tile di sekitarnya.",
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E0F2FE", // PCB bright mint-cyan theme
    ...Platform.select({
      web: {
        userSelect: "none",
        WebkitUserSelect: "none",
      } as any,
      default: {},
    }),
  },
  header: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: "#99F6E4", // Light mint-teal header
    borderBottomWidth: 2.5,
    borderBottomColor: "#5DD8C4",
    zIndex: 99,
  },
  backBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    borderWidth: 1,
    borderColor: "#5DD8C4",
  },
  resetBtn: {
    backgroundColor: "#0D9488",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  heartsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  levelBadge: {
    backgroundColor: "#0D9488",
    borderRadius: SHAPES.radiusRound,
    paddingVertical: 5,
    paddingHorizontal: SPACING.lg,
  },
  levelBadgeText: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: "#FFFFFF",
  },
  coinsHeaderBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderWidth: 1.5,
    borderColor: "#FDBA74",
    borderRadius: SHAPES.radiusRound,
    paddingVertical: 4,
    paddingHorizontal: SPACING.md,
    gap: 4,
  },
  coinsHeaderVal: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: "#C2410C",
  },
  hazardTapeTop: {
    height: 6,
    backgroundColor: "#FBBF24",
    borderBottomWidth: 1,
    borderBottomColor: "#D97706",
    backgroundImage: "repeating-linear-gradient(45deg, #FBBF24, #FBBF24 8px, #1E293B 8px, #1E293B 16px)",
  } as any,
  hazardTapeBottom: {
    height: 6,
    backgroundColor: "#FBBF24",
    borderTopWidth: 1,
    borderTopColor: "#D97706",
    backgroundImage: "repeating-linear-gradient(45deg, #FBBF24, #FBBF24 8px, #1E293B 8px, #1E293B 16px)",
  } as any,
  gameplayArea: {
    flex: 1,
    position: "relative",
    backgroundColor: "#CCFBF1", // Mint PCB plate color
  },
  icChipContainer: {
    position: "absolute",
    width: 38,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    opacity: 0.15,
  },
  icBody: {
    width: 24,
    height: 38,
    backgroundColor: "#1E293B",
    borderRadius: 4,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 4,
  },
  icDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#475569",
  },
  icPin: {
    width: 4,
    height: 2,
    backgroundColor: "#64748B",
    marginVertical: 4,
  },
  resistorContainer: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.18,
  },
  resistorWire: {
    width: 14,
    height: 2,
    backgroundColor: "#64748B",
  },
  resistorBody: {
    width: 32,
    height: 12,
    backgroundColor: "#E2E8F0",
    borderWidth: 1,
    borderColor: "#94A3B8",
    borderRadius: 3,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  resistorBand: {
    width: 3,
    height: "100%",
  },
  ledNode: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    opacity: 0.5,
  },
  topCardBanner: {
    width: "90%",
    maxWidth: 380,
    marginTop: 8,
    marginBottom: 8,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    zIndex: 40,
    ...SHADOWS.medium,
  },
  topCardBannerText: {
    ...FONTS.bodyBold,
    fontSize: 9.5,
    color: "#0F766E",
    letterSpacing: 0.5,
    textAlign: "center",
    flex: 1,
  },
  arenaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    marginVertical: 4,
  },
  arenaWrapper: {
    position: "relative",
    width: ARENA_SIZE,
    height: ARENA_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  gameArena: {
    width: ARENA_SIZE,
    height: ARENA_SIZE,
    position: "relative",
    backgroundColor: "#115E59", // Solder mask dark teal
    borderColor: "#0F766E",
    borderWidth: 5,
    borderRadius: 12,
    overflow: "visible",
    ...SHADOWS.medium,
  },
  sourceRobotNode: {
    position: "absolute",
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  robotConnectorHead: {
    width: 36,
    height: 26,
    backgroundColor: "#E2E8F0",
    borderWidth: 2.5,
    borderColor: "#64748B",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  robotConnectorHeadFace: {
    width: 22,
    height: 10,
    backgroundColor: "#0F172A",
    borderRadius: 3,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  connectorEye: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#F97316", // Orange eye glow
  },
  robotConnectorBody: {
    width: 28,
    height: 10,
    backgroundColor: "#64748B",
    borderRadius: 2,
    marginTop: -2,
    zIndex: 1,
  },
  silverPinRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: 20,
    position: "absolute",
    right: -10,
    zIndex: 1,
  },
  silverPin: {
    width: 8,
    height: 4,
    backgroundColor: "#CBD5E1",
    borderWidth: 1,
    borderColor: "#94A3B8",
    borderRadius: 1,
  },
  targetNodeContainer: {
    position: "absolute",
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  pcMonitor: {
    width: 38,
    height: 28,
    borderRadius: 4,
    borderWidth: 2.5,
    justifyContent: "center",
    alignItems: "center",
  },
  pcFaceText: {
    fontSize: 7,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  pcStand: {
    width: 6,
    height: 6,
    backgroundColor: "#64748B",
    marginTop: -1,
  },
  pcBase: {
    width: 20,
    height: 3,
    backgroundColor: "#475569",
    borderRadius: 1.5,
  },
  nodeLabel: {
    position: "absolute",
    bottom: -18,
    backgroundColor: "#1E293B",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  nodeLabelText: {
    fontSize: 7,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  tileCard: {
    position: "absolute",
    backgroundColor: "#0D9488", // Green solder mask tile
    borderWidth: 2.5,
    borderColor: "#0F766E",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  solderPad: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#E2E8F0",
    borderWidth: 1,
    borderColor: "#94A3B8",
  },
  missionCardContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    backgroundColor: "#CCFBF1", // Seamless floor match
  },
  missionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: SHAPES.radiusLg,
    padding: SPACING.md + 2,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    ...SHADOWS.light,
  },
  missionCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  skillBadge: {
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  skillBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#475569",
    letterSpacing: 0.8,
  },
  xpReward: {
    fontSize: 12,
    fontWeight: "900",
    color: "#10B981",
  },
  missionTitle: {
    ...FONTS.bodyBold,
    fontSize: 15,
    color: COLORS.brandDarkBlue,
    marginBottom: 4,
  },
  missionDescription: {
    ...FONTS.bodyRegular,
    fontSize: 11,
    color: COLORS.textMedium,
    lineHeight: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(3, 7, 18, 0.88)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: 'rgba(11, 19, 41, 0.96)',
    borderRadius: 24,
    padding: 24,
    maxWidth: 600,
    width: '90%',
    alignItems: 'center',
  },
  resultModalCard: {
    width: "96%",
    maxWidth: 540,
    backgroundColor: "rgba(11, 19, 41, 0.98)",
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.4)",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  resultHeader: {
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    paddingBottom: 6,
    marginBottom: 8,
  },
  resultBadgeText: {
    fontSize: 10.5,
    fontWeight: "900",
    color: "#F59E0B",
    letterSpacing: 2,
    marginBottom: 1,
  },
  resultTitleText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#34D399",
    marginBottom: 1,
  },
  resultSubtitleText: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "center",
  },
  resultGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  resultColumnLeft: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
  },
  columnTitle: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: "center",
  },
  starRow: {
    alignItems: "center",
    marginBottom: 6,
  },
  starText: {
    fontSize: 18,
    color: "#F59E0B",
  },
  checklistContainer: {
    gap: 3,
    marginBottom: 8,
  },
  checkItem: {
    fontSize: 10.5,
    color: "#E2E8F0",
    lineHeight: 14,
  },
  checkVal: {
    fontWeight: "800",
    color: "#34D399",
  },
  lootBreakdown: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.12)",
    paddingTop: 6,
    gap: 2,
  },
  lootRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  lootLabel: {
    fontSize: 10.5,
    color: "#CBD5E1",
  },
  lootVal: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#F59E0B",
  },
  lootValCyan: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#38BDF8",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: 4,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#34D399",
  },
  totalVal: {
    fontSize: 11.5,
    fontWeight: "900",
    color: "#34D399",
  },
  resultColumnRight: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  brainTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#C084FC",
    marginBottom: 1,
    textAlign: "center",
  },
  brainSubtitle: {
    fontSize: 9,
    color: "#94A3B8",
    marginBottom: 4,
    textAlign: "center",
  },
  radarWrapper: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  resultActions: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  btnGhost: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  btnGhostText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#94A3B8",
  },
  btnPrimaryNext: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#0284C7",
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  btnPrimaryNextText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  victoryIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFBEB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...FONTS.heading,
    fontSize: 20,
    color: COLORS.brandDarkBlue,
    textAlign: "center",
    marginBottom: 6,
  },
  modalSubtitle: {
    ...FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.textMedium,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  rewardSummary: {
    backgroundColor: "#F9FAFB",
    borderRadius: SHAPES.radiusLg,
    padding: SPACING.md,
    alignItems: "center",
    width: "100%",
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  rewardLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.textLight,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  rewardBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FFEDD5",
    borderRadius: SHAPES.radiusRound,
    paddingVertical: 4,
    paddingHorizontal: SPACING.lg,
    gap: 6,
  },
  rewardBadgeText: {
    ...FONTS.bodyBold,
    fontSize: 16,
    color: "#D97706",
  },
  timerProgressContainer: {
    height: 4,
    backgroundColor: "#E2E8F0",
    width: "100%",
  },
  timerProgressBar: {
    height: "100%",
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderWidth: 1.5,
    borderColor: "#FFEDD5",
    borderRadius: SHAPES.radiusRound,
    paddingVertical: 4,
    paddingHorizontal: SPACING.md,
    gap: 4,
  },
  timerBadgeUrgent: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
  },
  timerText: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: "#C2410C",
  },
  timerTextUrgent: {
    color: "#EF4444",
  },
  energyPulse: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FBBF24",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
    zIndex: 50,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
});
