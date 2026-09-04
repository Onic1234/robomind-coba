import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ScrollView, StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HowToPlayModal } from "../components/HowToPlayModal";
import * as Haptics from "expo-haptics";
import Svg, { Rect, Circle, Path, Line, Ellipse, Text as SvgText } from "react-native-svg";

const COINS_STORAGE_KEY = "user_coins_balance";
const LEVEL_STORAGE_KEY = "robo_charge_current_level";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAME_HEIGHT = 380; // Fixed gameplay viewport height
const GROUND_Y = 310;    // Y coordinate of the road floor
const PLAYER_SCREEN_X = SCREEN_WIDTH * 0.55;

interface Obstacle {
  x: number;
  width: number;
  height: number;
  type: "fence" | "laser" | "box" | "car" | "truck" | "bridge";
  hasBeenHit?: boolean;
  isDestroyed?: boolean;
}

interface CityConfig {
  id: number;
  name: string;
  country: string;
  distance: number;
  bullSpeed: number;
  playerSpeed: number;
  star3Time: number;
  star2Time: number;
  rewardCoins: number;
  bgColor: string;
  groundColor: string;
  accentColor: string;
  landmark: string;
  bgType: "pamplona" | "munich" | "amsterdam" | "london" | "geneva" | "paris" | "moscow" | "stockholm";
}

const CITIES: CityConfig[] = [
  { id: 1, name: "Pamplona", country: "Spanyol", distance: 3000, bullSpeed: 2.2, playerSpeed: 3.2, star3Time: 50, star2Time: 70, rewardCoins: 100, bgColor: "#FCA5A5", groundColor: "#D1D5DB", accentColor: "#DC2626", landmark: "Arena Anjing Robot", bgType: "pamplona" },
  { id: 2, name: "Munich", country: "Jerman", distance: 3500, bullSpeed: 2.5, playerSpeed: 3.5, star3Time: 60, star2Time: 80, rewardCoins: 120, bgColor: "#86EFAC", groundColor: "#9CA3AF", accentColor: "#16A34A", landmark: "Katedral Frauenkirche", bgType: "munich" },
  { id: 3, name: "Amsterdam", country: "Belanda", distance: 4000, bullSpeed: 2.8, playerSpeed: 3.8, star3Time: 70, star2Time: 90, rewardCoins: 140, bgColor: "#93C5FD", groundColor: "#E5E7EB", accentColor: "#2563EB", landmark: "Kincir Angin & Kanal", bgType: "amsterdam" },
  { id: 4, name: "London", country: "Inggris", distance: 4500, bullSpeed: 3.0, playerSpeed: 4.0, star3Time: 80, star2Time: 105, rewardCoins: 160, bgColor: "#A5B4FC", groundColor: "#F3F4F6", accentColor: "#4F46E5", landmark: "Menara Jam Big Ben", bgType: "london" },
  { id: 5, name: "Geneva", country: "Swiss", distance: 5000, bullSpeed: 3.2, playerSpeed: 4.2, star3Time: 90, star2Time: 115, rewardCoins: 180, bgColor: "#FDE047", groundColor: "#D1D5DB", accentColor: "#D97706", landmark: "Pegunungan Alpen Salju", bgType: "geneva" },
  { id: 6, name: "Paris", country: "Prancis", distance: 5500, bullSpeed: 3.4, playerSpeed: 4.4, star3Time: 100, star2Time: 125, rewardCoins: 200, bgColor: "#F9A8D4", groundColor: "#E5E7EB", accentColor: "#DB2777", landmark: "Menara Eiffel", bgType: "paris" },
  { id: 7, name: "Moscow", country: "Rusia", distance: 6000, bullSpeed: 3.6, playerSpeed: 4.6, star3Time: 110, star2Time: 135, rewardCoins: 220, bgColor: "#C084FC", groundColor: "#F3F4F6", accentColor: "#7C3AED", landmark: "Katedral Santo Basil", bgType: "moscow" },
  { id: 8, name: "Stockholm", country: "Swedia", distance: 6500, bullSpeed: 3.8, playerSpeed: 4.8, star3Time: 120, star2Time: 145, rewardCoins: 250, bgColor: "#5EEAD4", groundColor: "#D1D5DB", accentColor: "#0D9488", landmark: "Kota Tua Gamla Stan", bgType: "stockholm" },
];

// Upgraded SVG components for high-quality visuals
function RobotRunnerGraphic({ isStunned }: { isStunned: boolean }) {
  const colorHead = "#475569";
  const colorBody = "#64748B";
  const colorGlow = isStunned ? "#EF4444" : "#38BDF8";

  return (
    <Svg width="40" height="60" viewBox="0 0 40 60">
      {/* Jet Pack flame if jumping */}
      <Path d="M 5 36 Q 0 46 5 50 Q 8 46 8 36" fill="#F97316" />
      <Path d="M 6 38 Q 3 44 6 47 Q 8 44 8 38" fill="#FBBF24" />
      
      {/* Jet Pack */}
      <Rect x="4" y="26" width="6" height="14" rx="2" fill="#94A3B8" />

      {/* Wheel Leg */}
      <Circle cx="20" cy="50" r="8" fill="#334155" stroke="#1E293B" strokeWidth="2.5" />
      <Circle cx="20" cy="50" r="4" fill={colorGlow} />

      {/* Body */}
      <Rect x="10" y="22" width="20" height="22" rx="4" fill={colorBody} stroke="#1E293B" strokeWidth="2.5" />
      
      {/* Glowing Energy Core */}
      <Circle cx="20" cy="32" r="5" fill={colorGlow} />
      
      {/* Head Joint */}
      <Rect x="17" y="18" width="6" height="4" fill="#94A3B8" />

      {/* Head */}
      <Rect x="11" y="7" width="18" height="12" rx="3" fill={colorHead} stroke="#1E293B" strokeWidth="2" />
      
      {/* Glowing Eyes */}
      <Circle cx="16" cy="13" r="2.5" fill={colorGlow} />
      <Circle cx="24" cy="13" r="2.5" fill={colorGlow} />

      {/* Antenna */}
      <Line x1="20" y1="7" x2="20" y2="2" stroke={colorGlow} strokeWidth="2" />
      <Circle cx="20" cy="2" r="1.5" fill={colorGlow} />
    </Svg>
  );
}

function RobotDogGraphic() {
  return (
    <Svg width="80" height="65" viewBox="0 0 80 65">
      {/* Thruster Fire from Jetpack (Back of the Robodog) */}
      <Path d="M 8 22 Q -8 26 6 30 Q 2 26 8 22" fill="#06B6D4" />
      
      {/* Robotic Tail (Cyberdog) */}
      <Path d="M 15 28 C 8 22, 6 12, 10 5" fill="none" stroke="#475569" strokeWidth="2.5" />
      <Circle cx="10" cy="5" r="2.5" fill="#EF4444" />

      {/* Cyber Jetpack on Back */}
      <Rect x="20" y="10" width="22" height="10" rx="2" fill="#06B6D4" stroke="#0F172A" strokeWidth="1.5" />

      {/* Main Robodog Body (Chassis) */}
      <Path
        d="M 15 32 C 15 22, 25 18, 48 18 C 55 18, 60 22, 60 32 C 60 38, 55 42, 45 42 C 25 42, 15 38, 15 32 Z"
        fill="#334155"
        stroke="#0F172A"
        strokeWidth="2.5"
      />
      {/* Steel Armor Plates */}
      <Path d="M 22 23 C 32 20, 42 20, 48 23 L 42 34 L 26 34 Z" fill="#E2E8F0" />
      <Path d="M 26 34 L 42 34 L 38 40 L 28 40 Z" fill="#94A3B8" />

      {/* Cybernetic Running Legs (Canine joint angles) */}
      {/* Back leg */}
      <Path d="M 20 38 L 16 48 L 22 54 L 18 56" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
      {/* Front leg */}
      <Path d="M 50 38 L 54 48 L 48 54 L 52 56" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />

      {/* Cyberdog Neck & Head */}
      <Path d="M 52 22 L 68 12 L 76 16 L 76 28 L 58 32 Z" fill="#475569" stroke="#0F172A" strokeWidth="2" />
      {/* Pointy Cyber Dog Ears */}
      <Path d="M 64 12 L 58 2 L 68 10 Z" fill="#334155" stroke="#0F172A" strokeWidth="1.5" />
      
      {/* Glowing Cybernetic Visor Eye */}
      <Path d="M 72 16 L 79 18 L 77 21 L 70 19 Z" fill="#EF4444" />
      
      {/* Mecha Dog Jaw */}
      <Path d="M 64 26 L 73 24 L 70 28 L 62 28 Z" fill="#334155" stroke="#0F172A" strokeWidth="1" />
    </Svg>
  );
}

function RobotDogCage({ isOpen }: { isOpen: boolean }) {
  return (
    <Svg width="120" height="90" viewBox="0 0 120 90">
      {/* Heavy Outer Steel Frame of the Kennel */}
      <Rect x="10" y="5" width="100" height="80" rx="4" fill="#334155" stroke="#1E293B" strokeWidth="3" />
      {/* Back wall inside kennel */}
      <Rect x="15" y="10" width="90" height="70" fill="#0F172A" />
      
      {/* Yellow hazard stripes on frame */}
      <Path d="M 10 5 L 20 15 M 30 5 L 40 15 M 80 5 L 90 15 M 100 5 L 110 15" stroke="#FBBF24" strokeWidth="2.5" />

      {/* Warning beacon lamp top */}
      <Circle cx="60" cy="5" r="4.5" fill={isOpen ? "#EF4444" : "#F59E0B"} />

      {/* Kennel doors / bars */}
      {!isOpen ? (
        <React.Fragment>
          <Line x1="30" y1="10" x2="30" y2="80" stroke="#64748B" strokeWidth="4" />
          <Line x1="45" y1="10" x2="45" y2="80" stroke="#64748B" strokeWidth="4" />
          <Line x1="60" y1="10" x2="60" y2="80" stroke="#64748B" strokeWidth="4" />
          <Line x1="75" y1="10" x2="75" y2="80" stroke="#64748B" strokeWidth="4" />
          <Line x1="90" y1="10" x2="90" y2="80" stroke="#64748B" strokeWidth="4" />
          {/* Red electronic padlock overlay */}
          <Rect x="50" y="40" width="20" height="15" rx="2" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1.5" />
          <Rect x="55" y="32" width="10" height="8" fill="none" stroke="#EF4444" strokeWidth="1.5" />
        </React.Fragment>
      ) : (
        <React.Fragment>
          {/* Retracted bars at top and bottom */}
          <Rect x="15" y="10" width="90" height="8" fill="#1E293B" />
          <Rect x="15" y="72" width="90" height="8" fill="#1E293B" />
          {/* Spark particle details */}
          <Path d="M 25 25 L 30 20 M 95 30 L 90 35 M 40 60 L 45 65" stroke="#F59E0B" strokeWidth="1.5" />
        </React.Fragment>
      )}
    </Svg>
  );
}

function ObstacleGraphic({ type, width, height, isDestroyed }: { type: "fence" | "laser" | "box" | "car" | "truck" | "bridge"; width: number; height: number; isDestroyed?: boolean }) {
  if (isDestroyed) {
    if (type === "fence") {
      // Broken wooden planks lying flat on the ground
      return (
        <Svg width={width} height={height} viewBox="0 0 30 35">
          <Rect x="0" y="28" width="14" height="6" rx="1" fill="#8B5A2B" stroke="#4A2F13" strokeWidth="1" transform="rotate(-15, 7, 31)" />
          <Rect x="12" y="30" width="16" height="5" rx="1" fill="#A0522D" stroke="#4A2F13" strokeWidth="1" transform="rotate(10, 20, 32)" />
          <Rect x="5" y="26" width="12" height="7" rx="1" fill="#A0522D" stroke="#4A2F13" strokeWidth="1" transform="rotate(45, 11, 29)" />
        </Svg>
      );
    }
    if (type === "box") {
      // Shattered metal crate pieces
      return (
        <Svg width={width} height={height} viewBox="0 0 30 30">
          <Rect x="2" y="22" width="12" height="7" fill="#D97706" stroke="#78350F" strokeWidth="1.5" transform="rotate(30, 8, 25)" />
          <Rect x="15" y="24" width="10" height="6" fill="#D97706" stroke="#78350F" strokeWidth="1.5" transform="rotate(-40, 20, 27)" />
          <Circle cx="8" cy="27" r="1.5" fill="#475569" />
          <Circle cx="21" cy="28" r="1.5" fill="#475569" />
        </Svg>
      );
    }
    if (type === "car") {
      // Smashed cyberpunk car parts
      return (
        <Svg width={width} height={height} viewBox="0 0 90 40">
          <Path d="M 8 36 L 40 33 L 32 38 Z" fill="#0D9488" stroke="#0F172A" strokeWidth="1.5" transform="rotate(-12, 24, 36)" />
          <Path d="M 45 36 L 82 34 L 70 38 Z" fill="#0D9488" stroke="#0F172A" strokeWidth="1.5" transform="rotate(18, 63, 36)" />
          <Circle cx="18" cy="37" r="6.5" fill="#1E293B" />
          <Circle cx="72" cy="37" r="6.5" fill="#1E293B" />
        </Svg>
      );
    }
    if (type === "truck") {
      // Smashed cyberpunk truck parts
      return (
        <Svg width={width} height={height} viewBox="0 0 150 60">
          <Rect x="8" y="44" width="98" height="10" rx="1.5" fill="#475569" stroke="#1E293B" strokeWidth="1.5" />
          <Path d="M 106 50 L 118 34 L 136 42 L 132 50 Z" fill="#991B1B" stroke="#450A0A" strokeWidth="1.5" transform="rotate(30, 120, 47)" />
          <Circle cx="38" cy="50" r="7.5" fill="#1E293B" />
          <Circle cx="123" cy="50" r="7.5" fill="#1E293B" />
        </Svg>
      );
    }
    if (type === "bridge") {
      // Collapsed metal highway bridge
      return (
        <Svg width={width} height={height} viewBox="0 0 240 55">
          <Path d="M 0 12 L 110 35 L 105 45 L 0 22 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2" transform="rotate(5, 55, 23)" />
          <Path d="M 130 35 L 240 12 L 240 22 L 135 45 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2" transform="rotate(-5, 185, 23)" />
          <Line x1="30" y1="55" x2="60" y2="30" stroke="#475569" strokeWidth="2.5" />
          <Line x1="210" y1="55" x2="180" y2="30" stroke="#475569" strokeWidth="2.5" />
        </Svg>
      );
    }
    // Bent / Broken Laser Emitter generator
    return (
      <Svg width={width} height={height} viewBox="0 0 16 55">
        <Rect x="0" y="48" width="16" height="7" rx="1" fill="#334155" stroke="#1E293B" strokeWidth="1" />
        <Rect x="2" y="25" width="6" height="23" fill="#475569" stroke="#1E293B" strokeWidth="1" transform="rotate(45, 5, 36)" />
        <Circle cx="12" cy="46" r="3" fill="#3F3F46" stroke="#1E293B" strokeWidth="1" />
      </Svg>
    );
  }

  if (type === "fence") {
    // Highly-detailed wooden hurdle fence
    return (
      <Svg width={width} height={height} viewBox="0 0 30 35">
        {/* Left post */}
        <Rect x="2" y="0" width="6" height="35" rx="1" fill="#8B5A2B" stroke="#4A2F13" strokeWidth="1.5" />
        {/* Right post */}
        <Rect x="22" y="0" width="6" height="35" rx="1" fill="#8B5A2B" stroke="#4A2F13" strokeWidth="1.5" />
        {/* Top Horizontal Plank */}
        <Rect x="0" y="6" width="30" height="8" rx="1" fill="#A0522D" stroke="#4A2F13" strokeWidth="1.5" />
        {/* Bottom Horizontal Plank */}
        <Rect x="0" y="20" width="30" height="8" rx="1" fill="#A0522D" stroke="#4A2F13" strokeWidth="1.5" />
        {/* Little metallic bolt details */}
        <Circle cx="5" cy="10" r="1.2" fill="#94A3B8" />
        <Circle cx="25" cy="10" r="1.2" fill="#94A3B8" />
        <Circle cx="5" cy="24" r="1.2" fill="#94A3B8" />
        <Circle cx="25" cy="24" r="1.2" fill="#94A3B8" />
      </Svg>
    );
  }

  if (type === "box") {
    // Metal Crate with Hazard lines
    return (
      <Svg width={width} height={height} viewBox="0 0 30 30">
        <Rect x="1" y="1" width="28" height="28" rx="2" fill="#D97706" stroke="#78350F" strokeWidth="2.5" />
        <Line x1="1" y1="1" x2="29" y2="29" stroke="#78350F" strokeWidth="2" />
        <Line x1="29" y1="1" x2="1" y2="29" stroke="#78350F" strokeWidth="2" />
        <Rect x="4" y="4" width="22" height="22" fill="none" stroke="#78350F" strokeWidth="1" />
        {/* Metal corners */}
        <Rect x="1" y="1" width="6" height="6" fill="#475569" />
        <Rect x="23" y="1" width="6" height="6" fill="#475569" />
        <Rect x="1" y="23" width="6" height="6" fill="#475569" />
        <Rect x="23" y="23" width="6" height="6" fill="#475569" />
      </Svg>
    );
  }

  if (type === "car") {
    // Sleek Cyberpunk Sports Car
    return (
      <Svg width={width} height={height} viewBox="0 0 90 40">
        {/* Wheels */}
        <Circle cx="22" cy="32" r="7.5" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
        <Circle cx="68" cy="32" r="7.5" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
        {/* Car Body */}
        <Path d="M 8 26 L 15 15 L 30 10 L 60 10 L 75 15 L 82 26 Z" fill="#0D9488" stroke="#0F172A" strokeWidth="2.5" />
        {/* Windows */}
        <Path d="M 32 13 L 58 13 L 68 19 L 22 19 Z" fill="#E0F2FE" opacity="0.7" />
        {/* Headlights */}
        <Circle cx="78" cy="22" r="3.5" fill="#FBBF24" />
      </Svg>
    );
  }

  if (type === "truck") {
    // Futuristic heavy cargo delivery truck
    return (
      <Svg width={width} height={height} viewBox="0 0 150 60">
        {/* Wheels */}
        <Circle cx="30" cy="50" r="9" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
        <Circle cx="60" cy="50" r="9" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
        <Circle cx="120" cy="50" r="9" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
        {/* Truck Bed / Cargo container */}
        <Rect x="8" y="8" width="98" height="38" rx="3" fill="#475569" stroke="#1E293B" strokeWidth="2.5" />
        {/* Cargo patterns */}
        <Line x1="23" y1="8" x2="23" y2="46" stroke="#334155" strokeWidth="2" />
        <Line x1="53" y1="8" x2="53" y2="46" stroke="#334155" strokeWidth="2" />
        <Line x1="83" y1="8" x2="83" y2="46" stroke="#334155" strokeWidth="2" />
        {/* Truck Cabin (Front) */}
        <Path d="M 106 46 L 106 18 L 128 18 L 143 32 L 143 46 Z" fill="#991B1B" stroke="#450A0A" strokeWidth="2.5" />
        <Rect x="112" y="24" width="15" height="11" fill="#E0F2FE" opacity="0.8" />
        {/* Headlight */}
        <Circle cx="140" cy="39" r="3.5" fill="#FBBF24" />
      </Svg>
    );
  }

  if (type === "bridge") {
    // Cyber Highway Bridge Platform
    return (
      <Svg width={width} height={height} viewBox="0 0 240 55">
        {/* Metal truss structures support */}
        <Path d="M 20 55 L 40 0 L 60 55 M 100 55 L 120 0 L 140 55 M 180 55 L 200 0 L 220 55" fill="none" stroke="#475569" strokeWidth="3" />
        {/* Underline support girder */}
        <Line x1="0" y1="52" x2="240" y2="52" stroke="#1E293B" strokeWidth="4" />
        {/* Elevated Road deck platform */}
        <Rect x="0" y="0" width="240" height="12" rx="2" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
        {/* Yellow-black warning stripes on the platform edge */}
        <Path d="M 0 6 L 10 12 M 20 6 L 30 12 M 40 6 L 50 12 M 60 6 L 70 12 M 80 6 L 90 12 M 100 6 L 110 12 M 120 6 L 130 12 M 140 6 L 150 12 M 160 6 L 170 12 M 180 6 L 190 12 M 200 6 L 210 12 M 220 6 L 230 12" stroke="#FBBF24" strokeWidth="2" />
      </Svg>
    );
  }

  // Laser Gate generator (default fallback / laser)
  return (
    <Svg width={width} height={height} viewBox="0 0 16 55">
      {/* Heavy Industrial Base with Yellow/Black warning stripes */}
      <Rect x="0" y="45" width="16" height="10" rx="1" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
      <Path d="M 2 45 L 6 55 M 6 45 L 10 55 M 10 45 L 14 55" stroke="#FBBF24" strokeWidth="1.5" />
      
      {/* Tall Cylinder Glass Tube */}
      <Rect x="3" y="10" width="10" height="35" rx="1" fill="rgba(56, 189, 248, 0.15)" stroke="#38BDF8" strokeWidth="1" />
      
      {/* Neon Red Energy Core Beam */}
      <Rect x="6" y="10" width="4" height="35" fill="#EF4444" />
      <Line x1="8" y1="10" x2="8" y2="45" stroke="#FFF" strokeWidth="1.5" />
      
      {/* Top Emitter Dome */}
      <Rect x="2" y="4" width="12" height="6" rx="1" fill="#475569" stroke="#1E293B" strokeWidth="1.5" />
      <Circle cx="8" cy="3" r="3" fill="#EF4444" />
    </Svg>
  );
}



function CityBackground({ bgType, cameraX }: { bgType: string; cameraX: number }) {
  const scrollOffset = cameraX * 0.25;

  if (bgType === "pamplona") {
    // Spain Arena details
    return (
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: 4 }).map((_, i) => {
          const x = (i * 260 - scrollOffset) % 1040;
          return (
            <React.Fragment key={i}>
              <Rect x={x} y="150" width="120" height="160" fill="rgba(220, 38, 38, 0.12)" />
              <Rect x={x + 10} y="90" width="100" height="60" fill="none" stroke="rgba(220, 38, 38, 0.15)" strokeWidth="2.5" />
              <Circle cx={x + 60} cy="120" r="15" fill="rgba(220,38,38,0.15)" />
            </React.Fragment>
          );
        })}
      </Svg>
    );
  }

  if (bgType === "paris") {
    // Paris Eiffel Tower
    const towerX = (300 - scrollOffset) % (SCREEN_WIDTH + 300);
    return (
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
        <Path
          d={`M ${towerX} 310 L ${towerX + 25} 60 L ${towerX + 35} 60 L ${towerX + 60} 310 L ${towerX + 48} 310 L ${towerX + 43} 180 L ${towerX + 17} 180 L ${towerX + 12} 310 Z`}
          fill="rgba(0,0,0,0.15)"
        />
        <Line x1={towerX + 17} y1="180" x2={towerX + 43} y2="180" stroke="rgba(0,0,0,0.2)" strokeWidth="3" />
        <Line x1={towerX + 22} y1="130" x2={towerX + 38} y2="130" stroke="rgba(0,0,0,0.2)" strokeWidth="2" />
      </Svg>
    );
  }

  if (bgType === "london") {
    // London Big Ben Clock Tower
    const towerX = (250 - scrollOffset) % (SCREEN_WIDTH + 200);
    return (
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
        <Rect x={towerX} y="60" width="36" height="250" fill="rgba(0,0,0,0.15)" />
        <Path d={`M ${towerX - 2} 60 L ${towerX + 18} 20 L ${towerX + 38} 60 Z`} fill="rgba(0,0,0,0.18)" />
        <Circle cx={towerX + 18} cy="95" r="9" fill="rgba(255,255,255,0.4)" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" />
      </Svg>
    );
  }

  if (bgType === "amsterdam") {
    // Holland Windmill
    const millX = (200 - scrollOffset) % (SCREEN_WIDTH + 250);
    return (
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
        <Path d={`M ${millX} 310 L ${millX + 15} 150 L ${millX + 45} 150 L ${millX + 60} 310 Z`} fill="rgba(0,0,0,0.15)" />
        <Circle cx={millX + 30} cy="170" r="5" fill="rgba(0,0,0,0.2)" />
        {/* Windmill blades */}
        <Line x1={millX + 30} y1="170" x2={millX + 5} y2="135" stroke="rgba(0,0,0,0.18)" strokeWidth="4" />
        <Line x1={millX + 30} y1="170" x2={millX + 55} y2="205" stroke="rgba(0,0,0,0.18)" strokeWidth="4" />
        <Line x1={millX + 30} y1="170" x2={millX + 55} y2="135" stroke="rgba(0,0,0,0.18)" strokeWidth="4" />
        <Line x1={millX + 30} y1="170" x2={millX + 5} y2="205" stroke="rgba(0,0,0,0.18)" strokeWidth="4" />
      </Svg>
    );
  }

  if (bgType === "moscow") {
    // Kremlin onion dome silhouettes
    const domeX = (320 - scrollOffset) % (SCREEN_WIDTH + 300);
    return (
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
        <Rect x={domeX} y="160" width="50" height="150" fill="rgba(0,0,0,0.15)" />
        {/* Onion Dome */}
        <Path d={`M ${domeX} 160 C ${domeX - 10} 120 ${domeX + 25} 85 ${domeX + 25} 65 C ${domeX + 25} 85 ${domeX + 60} 120 ${domeX + 50} 160 Z`} fill="rgba(0,0,0,0.2)" />
        <Rect x={domeX + 70} y="110" width="30" height="200" fill="rgba(0,0,0,0.12)" />
        <Path d={`M ${domeX + 70} 110 C ${domeX + 65} 80 ${domeX + 85} 60 ${domeX + 85} 45 C ${domeX + 85} 60 ${domeX + 105} 80 ${domeX + 100} 110 Z`} fill="rgba(0,0,0,0.16)" />
      </Svg>
    );
  }

  // Default Landmark generic skyline
  return (
    <Svg height="100%" width="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
      <Path
        d={`M ${80 - scrollOffset % 400} 310 L ${110 - scrollOffset % 400} 180 L ${140 - scrollOffset % 400} 310 Z`}
        fill="rgba(0,0,0,0.12)"
      />
      <Path
        d={`M ${280 - scrollOffset % 400} 310 L ${280 - scrollOffset % 400} 150 L ${330 - scrollOffset % 400} 150 L ${330 - scrollOffset % 400} 310 Z`}
        fill="rgba(0,0,0,0.12)"
      />
    </Svg>
  );
}

export default function RoboChargeScreen() {
  const router = useRouter();
  
  // Game States
  const [view, setView] = useState<"menu" | "playing" | "gameover" | "victory">("menu");
  const [activeCityIdx, setActiveCityIdx] = useState(0);
  const [highestLevel, setHighestLevel] = useState(1);
  const [userCoins, setUserCoins] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [starsMap, setStarsMap] = useState<{ [key: number]: number }>({});

  // Dynamic Game Values
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [distanceRemaining, setDistanceRemaining] = useState(0);
  const [bullDistance, setBullDistance] = useState(300); // Distance between bull and player in pixels

  // Gameplay Refs & Variables
  const activeCity = CITIES[activeCityIdx];
  const loopRef = useRef<number | null>(null);
  
  // Positions & Physics state (stored in refs for high-frequency updates without React re-render lag)
  const playerX = useRef(100);
  const playerY = useRef(0); // Height above ground
  const playerVy = useRef(0);
  const playerFloorY = useRef(0); // Clamped floor height (0 or platform top)
  const playerStunTime = useRef(0); // Stun duration when hit obstacle
  const playerXOffset = useRef(0); // Offset adjusted by user Left/Right keys [-60 to 100]

  const bullX = useRef(-20);
  const startTime = useRef(0);
  const obstacles = useRef<Obstacle[]>([]);
  const hasStartedMoving = useRef(false);
  const blockedObstacle = useRef<Obstacle | null>(null);

  // Key tracking
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Load level progression & coin balance
  useEffect(() => {
    const loadGameProgress = async () => {
      try {
        const storedCoins = await AsyncStorage.getItem(COINS_STORAGE_KEY);
        if (storedCoins) setUserCoins(parseInt(storedCoins));

        const storedLevel = await AsyncStorage.getItem(LEVEL_STORAGE_KEY);
        if (storedLevel) setHighestLevel(parseInt(storedLevel));

        const storedStars = await AsyncStorage.getItem("robo_charge_stars_map");
        if (storedStars) setStarsMap(JSON.parse(storedStars));
      } catch (e) {
        console.error(e);
      }
    };
    loadGameProgress();
  }, []);

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
      // Ignore
    }
  };

  // Keyboard Event Handlers
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current[k] = true;
      keysPressed.current[e.code] = true;

      // Handle jump immediately on space / up arrow / W
      if (view === "playing" && (k === " " || k === "arrowup" || k === "w")) {
        triggerJump();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current[k] = false;
      keysPressed.current[e.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [view]);

  // Generate obstacles for a level
  const generateLevelObstacles = (city: CityConfig) => {
    const list: Obstacle[] = [];
    let nextX = 400; // First obstacle position
    const gap = 520; // Avg distance between obstacles

    while (nextX < city.distance - 250) {
      const types: ("fence" | "laser" | "box" | "car" | "truck" | "bridge")[] = ["fence", "box"];
      if (city.id > 1) types.push("bridge"); // Bridges from Munich Spanyol onwards
      if (city.id > 2) types.push("car");
      if (city.id > 3) types.push("laser");
      if (city.id > 4) types.push("truck");

      const type = types[Math.floor(Math.random() * types.length)];
      let w = 30;
      let h = 35;

      if (type === "laser") {
        w = 16;
        h = 55;
      } else if (type === "box") {
        w = 30;
        h = 30;
      } else if (type === "car") {
        w = 90;
        h = 40;
      } else if (type === "truck") {
        w = 150;
        h = 60;
      } else if (type === "bridge") {
        w = 240;
        h = 55;
      }

      list.push({ x: nextX, width: w, height: h, type });
      nextX += gap + Math.random() * 150;
    }
    return list;
  };

  // Trigger Player Jump
  const triggerJump = useCallback(() => {
    if (playerY.current === playerFloorY.current) {
      playerVy.current = 9.8; // Initial vertical upward velocity
      triggerHaptic("light");
    }
  }, []);

  // Main Loop
  const startGameLoop = () => {
    startTime.current = Date.now();
    playerX.current = 100;
    playerY.current = 0;
    playerVy.current = 0;
    playerFloorY.current = 0;
    playerStunTime.current = 0;
    playerXOffset.current = 0;
    bullX.current = -20;
    hasStartedMoving.current = false;
    blockedObstacle.current = null;

    obstacles.current = generateLevelObstacles(activeCity);

    const updatePhysics = () => {
      const now = Date.now();
      const elapsed = hasStartedMoving.current ? (now - startTime.current) / 1000 : 0;
      setTimeElapsed(elapsed);

      // Decrement stun countdown
      if (playerStunTime.current > 0) {
        playerStunTime.current -= 0.016; // approx 60fps frame time
      }

      // If currently blocked, check if we have cleared the obstacle (by jumping or moving past it)
      if (blockedObstacle.current !== null) {
        const obs = blockedObstacle.current;
        if (playerY.current > 0 || playerX.current > obs.x + obs.width) {
          obs.hasBeenHit = true; // Deactivate this obstacle so player passes through it smoothly!
          blockedObstacle.current = null;
        }
      }

      const isStunned = playerStunTime.current > 0;
      let actualPlayerSpd = 0;

      if (!isStunned) {
        if (keysPressed.current["arrowright"] || keysPressed.current["d"]) {
          // If blocked by obstacle, cannot move forward!
          if (blockedObstacle.current === null) {
            actualPlayerSpd = activeCity.playerSpeed;
            hasStartedMoving.current = true;
          } else {
            actualPlayerSpd = 0; // Stopped by obstacle
          }
        } else if (keysPressed.current["arrowleft"] || keysPressed.current["a"]) {
          actualPlayerSpd = -activeCity.playerSpeed * 0.8;
        }
      }

      if (hasStartedMoving.current) {
        playerX.current = Math.max(0, playerX.current + actualPlayerSpd);

        // Move Bull forward
        const currentBullSpd = activeCity.bullSpeed;
        bullX.current += currentBullSpd;
      } else {
        // Keep shifting start time so timer starts at 0 when player first moves
        startTime.current = Date.now();
      }

      // Determine active floor height (Platform Mechanics)
      let targetFloorY = 0;
      obstacles.current.forEach((obs) => {
        if ((obs.type === "truck" || obs.type === "car" || obs.type === "bridge") && !obs.isDestroyed) {
          const withinX = playerX.current >= obs.x && playerX.current <= obs.x + obs.width;
          if (withinX && playerY.current >= obs.height - 8) {
            targetFloorY = obs.height;
          }
        }
      });
      playerFloorY.current = targetFloorY;

      // Gravity and Jump physics
      if (playerY.current > playerFloorY.current || playerVy.current !== 0) {
        playerVy.current -= 0.45; // Gravity pull
        playerY.current = Math.max(playerFloorY.current, playerY.current + playerVy.current);
        if (playerY.current === playerFloorY.current) {
          playerVy.current = 0;
        }
      } else {
        // Drop down if walked off a platform
        if (playerY.current > playerFloorY.current && playerVy.current === 0) {
          playerVy.current = -0.45;
        }
      }

      // Distance calculations
      const remaining = Math.max(0, activeCity.distance - playerX.current);
      setDistanceRemaining(remaining);

      const distanceBetween = playerX.current - bullX.current;
      setBullDistance(distanceBetween);

      // Check collision with obstacles
      obstacles.current.forEach((obs) => {
        // Bull smashes obstacles
        if (bullX.current >= obs.x && !obs.isDestroyed) {
          obs.isDestroyed = true;
          obs.hasBeenHit = true; // Also deactivate for player
          if (blockedObstacle.current === obs) {
            blockedObstacle.current = null; // Unblock player if bull breaks it
          }
          triggerHaptic("light");
        }

        if (obs.hasBeenHit || obs.isDestroyed) return;

        const isIntersectingX = playerX.current + 15 >= obs.x && playerX.current - 15 <= obs.x + obs.width;
        const isIntersectingY = playerY.current < obs.height - 5;

        if (isIntersectingX && isIntersectingY) {
          // Player hit obstacle! Block them and trigger alert
          if (blockedObstacle.current !== obs) {
            blockedObstacle.current = obs;
            playerStunTime.current = 0.5; // Short stun/blink on hit
            triggerHaptic("error");
          }
        }
      });

      // Check if Bull caught player
      if (distanceBetween <= 42) {
        // Game Over
        triggerHaptic("error");
        setView("gameover");
        return;
      }

      // Check Victory Condition
      if (remaining <= 0) {
        triggerHaptic("success");
        handleLevelComplete(elapsed);
        return;
      }

      loopRef.current = requestAnimationFrame(updatePhysics);
    };

    loopRef.current = requestAnimationFrame(updatePhysics);
  };

  // Terminate Game Loop
  useEffect(() => {
    if (view === "playing") {
      startGameLoop();
    } else {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    }
    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, [view]);

  // Handle Victory Progress Saving
  const handleLevelComplete = async (finalTime: number) => {
    setView("victory");

    // Star score mapping
    let earnedStars = 1;
    if (finalTime <= activeCity.star3Time) earnedStars = 3;
    else if (finalTime <= activeCity.star2Time) earnedStars = 2;

    const newStarsMap = { ...starsMap, [activeCity.id]: Math.max(starsMap[activeCity.id] || 0, earnedStars) };
    setStarsMap(newStarsMap);

    const nextLvl = Math.max(highestLevel, activeCity.id + 1);
    setHighestLevel(nextLvl);

    const newBalance = userCoins + activeCity.rewardCoins;
    setUserCoins(newBalance);

    try {
      await AsyncStorage.setItem(COINS_STORAGE_KEY, newBalance.toString());
      await AsyncStorage.setItem(LEVEL_STORAGE_KEY, nextLvl.toString());
      await AsyncStorage.setItem("robo_charge_stars_map", JSON.stringify(newStarsMap));
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartPlaying = (idx: number) => {
    triggerHaptic("light");
    setActiveCityIdx(idx);
    setView("playing");
  };

  // Render game HUD, City levels list, screens
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* HEADER SECTION */}
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            triggerHaptic("light");
            if (view !== "menu") setView("menu");
            else router.back();
          }}
          style={styles.backBtn}
        >
          <Ionicons name={view !== "menu" ? "home" : "arrow-back"} size={20} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.headerTitle}>Robo Charge: Bull Escape</Text>

        <View style={styles.coinsHeaderBadge}>
          <MaterialCommunityIcons name="currency-usd" size={16} color="#FBBF24" />
          <Text style={styles.coinsHeaderVal}>{userCoins}</Text>
        </View>
      </View>

      {/* VIEW: MENU / LEVEL SELECTION */}
      {view === "menu" && (
        <View style={styles.menuContainer}>
          <View style={styles.menuTitleBox}>
            <MaterialCommunityIcons name="run-fast" size={40} color="#FBBF24" />
            <Text style={styles.menuTitle}>TANTANGAN ARENA GLOBAL</Text>
            <Text style={styles.menuSubtitle}>Larikan diri dari anjing robot di berbagai kota dunia!</Text>
          </View>

          <View style={styles.citiesGrid}>
            {CITIES.map((city, idx) => {
              const isUnlocked = city.id <= highestLevel;
              const stars = starsMap[city.id] || 0;
              const isCurrent = city.id === highestLevel;

              return (
                <Pressable
                  key={city.id}
                  disabled={!isUnlocked}
                  onPress={() => handleStartPlaying(idx)}
                  style={[
                    styles.cityCard,
                    !isUnlocked && styles.cityCardLocked,
                    isCurrent && { borderColor: "#FBBF24", borderWidth: 2 },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={[styles.cityCardTitle, !isUnlocked && { color: "#64748B" }]}>
                        {city.id}. {city.name}
                      </Text>
                      {!isUnlocked && <Ionicons name="lock-closed" size={14} color="#64748B" />}
                    </View>
                    <Text style={styles.cityCardSub}>{city.landmark}</Text>
                    {isUnlocked && (
                      <View style={styles.starsRow}>
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Ionicons
                            key={i}
                            name={i < stars ? "star" : "star-outline"}
                            size={14}
                            color="#FBBF24"
                          />
                        ))}
                      </View>
                    )}
                  </View>
                  {isUnlocked && (
                    <View style={[styles.cityGoBtn, { backgroundColor: city.accentColor }]}>
                      <Ionicons name="play" size={14} color="#FFF" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.helpTrigger} onPress={() => setShowHelp(true)}>
            <Ionicons name="help-circle" size={18} color="#94A3B8" />
            <Text style={styles.helpTriggerText}>Cara Bermain</Text>
          </Pressable>
        </View>
      )}

      {/* VIEW: PLAYING */}
      {view === "playing" && (
        <View style={styles.gameViewContainer}>
          {/* TOP HUD BAR */}
          <View style={styles.gameHud}>
            <View style={{ gap: 4 }}>
              <Text style={styles.hudCityText}>
                {activeCity.name} <Text style={{ fontSize: 11, color: "#94A3B8" }}>({activeCity.country})</Text>
              </Text>
              <Text style={styles.hudTargetTimeText}>
                Target Emas: ≤{activeCity.star3Time}s
              </Text>
            </View>

            <View style={styles.hudTimerBox}>
              <Ionicons name="time-outline" size={16} color="#38BDF8" />
              <Text style={styles.hudTimerText}>{timeElapsed.toFixed(2)}s</Text>
            </View>

            <View style={styles.hudProgressBox}>
              <Text style={styles.hudProgressVal}>{(activeCity.distance - distanceRemaining).toFixed(0)}m / {activeCity.distance}m</Text>
            </View>
          </View>

          {/* MAIN 2D GAME VIEWPORT CONTAINER */}
          {
            (() => {
              const cameraX = Math.max(0, playerX.current - PLAYER_SCREEN_X);
              return (
                <View style={[styles.gameplayViewport, { backgroundColor: activeCity.bgColor }]}>
                  
                  {/* Parallax Background Landscaping */}
                  <CityBackground bgType={activeCity.bgType} cameraX={cameraX} />

                  {/* FLOATING WARNING MESSAGE */}
                  {bullDistance < 150 && (
                    <Text style={styles.floatingWarningText}>
                      ⚠️ BAHAYA! ANJING ROBOT MENDEKAT: {Math.floor(bullDistance / 10)}m
                    </Text>
                  )}

                  {/* Ground Track Floor */}
                  <Svg height="100%" width="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
                    <Rect
                      x="0"
                      y={GROUND_Y}
                      width={SCREEN_WIDTH}
                      height={GAME_HEIGHT - GROUND_Y}
                      fill={activeCity.groundColor}
                    />
                    <Rect
                      x="0"
                      y={GROUND_Y - 4}
                      width={SCREEN_WIDTH}
                      height="4"
                      fill="#374151"
                    />
                  </Svg>

                  {/* Robot Dog Release Cage */}
                  <View
                    style={{
                      position: "absolute",
                      left: -40 - cameraX,
                      bottom: GAME_HEIGHT - GROUND_Y,
                    }}
                  >
                    <RobotDogCage isOpen={hasStartedMoving.current} />
                  </View>

                  {/* Render Obstacles */}
                  {obstacles.current.map((obs, idx) => {
                    const screenX = obs.x - cameraX;
                    // Only render if within screen boundaries
                    if (screenX < -50 || screenX > SCREEN_WIDTH + 50) return null;

                    return (
                      <View
                        key={idx}
                        style={[
                          styles.obstacleContainer,
                          {
                            left: screenX,
                            width: obs.width,
                            height: obs.height,
                            bottom: GAME_HEIGHT - GROUND_Y,
                            opacity: obs.hasBeenHit ? 0.35 : 1,
                          },
                        ]}
                      >
                        <ObstacleGraphic type={obs.type} width={obs.width} height={obs.height} isDestroyed={obs.isDestroyed} />
                      </View>
                    );
                  })}

                  {/* DOG ROBOT CHASER */}
                  <View
                    style={[
                      styles.bullChaser,
                      {
                        left: bullX.current - cameraX,
                        bottom: GAME_HEIGHT - GROUND_Y,
                      },
                    ]}
                  >
                    <RobotDogGraphic />
                  </View>

                  {/* PLAYER ROBOT RUNNER */}
                  <View
                    style={[
                      styles.playerCharacter,
                      {
                        left: playerX.current - cameraX,
                        bottom: (GAME_HEIGHT - GROUND_Y) + playerY.current,
                      },
                    ]}
                  >
                    <RobotRunnerGraphic isStunned={playerStunTime.current > 0} />
                  </View>

                  {/* Finish Line Indicator */}
                  {activeCity.distance - playerX.current < SCREEN_WIDTH && (
                    <View
                      style={[
                        styles.finishLineGate,
                        {
                          left: activeCity.distance - cameraX,
                          bottom: GAME_HEIGHT - GROUND_Y,
                        },
                      ]}
                    >
                      <Svg width="80" height="120" viewBox="0 0 80 120">
                        {/* Left Metallic Arch Pillar */}
                        <Rect x="5" y="0" width="8" height="120" fill="#334155" stroke="#0F172A" strokeWidth="1.5" />
                        <Rect x="8" y="10" width="2" height="100" fill="#38BDF8" />

                        {/* Right Metallic Arch Pillar */}
                        <Rect x="67" y="0" width="8" height="120" fill="#334155" stroke="#0F172A" strokeWidth="1.5" />
                        <Rect x="70" y="10" width="2" height="100" fill="#38BDF8" />

                        {/* Top Digital Display Board */}
                        <Rect x="0" y="0" width="80" height="28" rx="3" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
                        
                        {/* Checkerboard patterns */}
                        <Rect x="3" y="4" width="8" height="20" fill="#FFF" />
                        <Rect x="3" y="4" width="4" height="4" fill="#000" />
                        <Rect x="7" y="8" width="4" height="4" fill="#000" />
                        <Rect x="3" y="12" width="4" height="4" fill="#000" />
                        <Rect x="7" y="16" width="4" height="4" fill="#000" />
                        <Rect x="3" y="20" width="4" height="4" fill="#000" />

                        <Rect x="69" y="4" width="8" height="20" fill="#FFF" />
                        <Rect x="69" y="4" width="4" height="4" fill="#000" />
                        <Rect x="73" y="8" width="4" height="4" fill="#000" />
                        <Rect x="69" y="12" width="4" height="4" fill="#000" />
                        <Rect x="73" y="16" width="4" height="4" fill="#000" />
                        <Rect x="69" y="20" width="4" height="4" fill="#000" />

                        {/* Glowing Neon Green 'FINISH' Text */}
                        <SvgText
                          x="40"
                          y="18"
                          fill="#10B981"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                          letterSpacing="1"
                        >
                          FINISH
                        </SvgText>

                        {/* Laser scanner grid beams */}
                        <Line x1="20" y1="28" x2="20" y2="120" stroke="#10B981" strokeWidth="1" strokeDasharray="3 5" opacity="0.4" />
                        <Line x1="30" y1="28" x2="30" y2="120" stroke="#10B981" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.6" />
                        <Line x1="40" y1="28" x2="40" y2="120" stroke="#10B981" strokeWidth="1" strokeDasharray="2 4" opacity="0.4" />
                        <Line x1="50" y1="28" x2="50" y2="120" stroke="#10B981" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.6" />
                        <Line x1="60" y1="28" x2="60" y2="120" stroke="#10B981" strokeWidth="1" strokeDasharray="3 5" opacity="0.4" />
                      </Svg>
                    </View>
                  )}
                </View>
              );
            })()
          }

          {/* D-PAD TOUCH MOBILE CONTROLS */}
          <View style={styles.controlsMobile}>
            <View style={{ flexDirection: "row", gap: 14 }}>
              <Pressable
                onPressIn={() => { keysPressed.current["a"] = true; }}
                onPressOut={() => { keysPressed.current["a"] = false; }}
                style={({ pressed }) => [styles.arrowCtrlBtn, pressed && styles.arrowCtrlPressed]}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </Pressable>

              <Pressable
                onPressIn={() => { keysPressed.current["d"] = true; }}
                onPressOut={() => { keysPressed.current["d"] = false; }}
                style={({ pressed }) => [styles.arrowCtrlBtn, pressed && styles.arrowCtrlPressed]}
              >
                <Ionicons name="arrow-forward" size={24} color="#FFF" />
              </Pressable>
            </View>

            <Pressable
              onPress={triggerJump}
              style={({ pressed }) => [styles.jumpCtrlBtn, pressed && styles.jumpCtrlPressed]}
            >
              <Ionicons name="arrow-up" size={26} color="#FFF" />
              <Text style={styles.jumpBtnText}>JUMP</Text>
            </Pressable>
          </View>

          {/* Web controls notice */}
          {Platform.OS === "web" && (
            <Text style={styles.webControlsTip}>
              Gunakan tombol keyboard: <Text style={{ fontWeight: "bold" }}>A / D / Panah</Text> untuk bergerak, <Text style={{ fontWeight: "bold" }}>W / Space</Text> untuk melompat!
            </Text>
          )}
        </View>
      )}

      {/* VIEW: GAME OVER */}
      {view === "gameover" && (
        <View style={styles.resultOverlay}>
          <Ionicons name="close-circle" size={80} color="#EF4444" />
          <Text style={styles.resultTitle}>TERTANGKAP ANJING ROBOT!</Text>
          <Text style={styles.resultDesc}>
            Anjing robot berhasil mengejar Anda. Latih refleks melompat dan perhatikan kecepatan lintasan.
          </Text>

          <View style={styles.resultActions}>
            <Pressable style={styles.primaryBtn} onPress={() => setView("playing")}>
              <Ionicons name="reload" size={18} color="#FFF" />
              <Text style={styles.primaryBtnText}>COBA LAGI</Text>
            </Pressable>

            <Pressable style={styles.secondaryBtn} onPress={() => setView("menu")}>
              <Text style={styles.secondaryBtnText}>KEMBALI KE MENU</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* VIEW: VICTORY */}
      {view === "victory" && (
        <View style={styles.resultOverlay}>
          <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          <Text style={styles.resultTitle}>Misi Selesai!</Text>
          <Text style={styles.resultDesc}>
            Hebat! Robot berhasil kabur dari kejaran anjing robot di kota {activeCity.name}.
          </Text>

          <View style={styles.victoryRewardCard}>
            <Text style={{ color: "#94A3B8", fontSize: 12, fontWeight: "600" }}>HADIAH KOIN</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
              <MaterialCommunityIcons name="currency-usd" size={20} color="#FBBF24" />
              <Text style={{ color: "#FFF", fontSize: 24, fontWeight: "800" }}>+{activeCity.rewardCoins}</Text>
            </View>
          </View>

          <View style={styles.resultActions}>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => {
                if (activeCityIdx < CITIES.length - 1) {
                  setActiveCityIdx(activeCityIdx + 1);
                  setView("playing");
                } else {
                  setView("menu");
                }
              }}
            >
              <Text style={styles.primaryBtnText}>
                {activeCityIdx < CITIES.length - 1 ? "LANJUT KOTA BERIKUTNYA" : "SELESAI"}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </Pressable>

            <Pressable style={styles.secondaryBtn} onPress={() => setView("menu")}>
              <Text style={styles.secondaryBtnText}>KEMBALI KE MENU</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* HOW TO PLAY MODAL */}
      <HowToPlayModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title="Cara Main Robo Charge"
        goal="Kabur dari anjing robot hingga garis finish secepat mungkin!"
        accentColor="#EF4444"
        subtitleColor="#B91C1C"
        steps={[
          { emoji: "🏃", text: "Kendalikan lari robot ke kanan (D) atau kiri (A)." },
          { emoji: "⬆️", text: "Lompat melewati pagar kayu atau laser pengaman (W/Space)." },
          { emoji: "💥", text: "Jika menabrak rintangan, robot akan berhenti total dan tidak bisa bergerak selama 0.8 detik!" },
          { emoji: "⏱️", text: "Semakin cepat mencapai garis finish, bintang yang diraih akan semakin banyak." },
        ]}
        tips={[
          "Jika menabrak rintangan, robot akan pusing sesaat dan anjing robot akan mendekat dengan cepat!",
          "Gunakan tombol A/D/Space pada Keyboard komputer jika bermain di web.",
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1E293B",
    borderBottomWidth: 1.5,
    borderColor: "#334155",
  },
  backBtn: {
    padding: 8,
    backgroundColor: "#334155",
    borderRadius: 8,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
  coinsHeaderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#334155",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  coinsHeaderVal: {
    color: "#FBBF24",
    fontSize: 14,
    fontWeight: "700",
  },
  menuContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  menuTitleBox: {
    alignItems: "center",
    marginBottom: 24,
    gap: 6,
  },
  menuTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  menuSubtitle: {
    color: "#94A3B8",
    fontSize: 12,
    textAlign: "center",
  },
  citiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    marginBottom: 30,
  },
  cityCard: {
    width: "47%",
    backgroundColor: "#1E293B",
    borderColor: "#334155",
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cityCardLocked: {
    opacity: 0.5,
    backgroundColor: "#0F172A",
  },
  cityCardTitle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
  },
  cityCardSub: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 2,
  },
  starsRow: {
    flexDirection: "row",
    marginTop: 6,
    gap: 2,
  },
  cityGoBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  helpTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    alignSelf: "center",
    marginTop: 10,
  },
  helpTriggerText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
  },
  gameViewContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  gameHud: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#1E293B",
  },
  hudCityText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
  },
  hudTargetTimeText: {
    color: "#FBBF24",
    fontSize: 11,
    fontWeight: "600",
  },
  hudTimerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0F172A",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  hudTimerText: {
    color: "#38BDF8",
    fontSize: 14,
    fontWeight: "800",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  hudProgressBox: {
    backgroundColor: "#0F172A",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  hudProgressVal: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  floatingWarningText: {
    position: "absolute",
    top: 15,
    alignSelf: "center",
    backgroundColor: "rgba(127, 29, 29, 0.9)",
    borderColor: "#EF4444",
    borderWidth: 1.5,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gameplayViewport: {
    height: GAME_HEIGHT,
    position: "relative",
    overflow: "hidden",
    borderBottomWidth: 4,
    borderColor: "#1E293B",
  },
  playerCharacter: {
    width: 40,
    height: 60,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  bullChaser: {
    width: 80,
    height: 65,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  obstacleContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  finishLineGate: {
    position: "absolute",
    width: 80,
    height: 120,
  },
  controlsMobile: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "#1E293B",
  },
  arrowCtrlBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#475569",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#64748B",
  },
  arrowCtrlPressed: {
    backgroundColor: "#334155",
  },
  jumpCtrlBtn: {
    width: 110,
    height: 58,
    borderRadius: 14,
    backgroundColor: "#0284C7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#38BDF8",
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  jumpCtrlPressed: {
    backgroundColor: "#0369A1",
  },
  jumpBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
  },
  webControlsTip: {
    color: "#94A3B8",
    fontSize: 11,
    textAlign: "center",
    paddingBottom: 12,
  },
  resultOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  resultTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  resultDesc: {
    color: "#94A3B8",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 300,
  },
  victoryRewardCard: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: "center",
    marginVertical: 10,
  },
  resultActions: {
    width: "100%",
    maxWidth: 280,
    gap: 12,
    marginTop: 10,
  },
  primaryBtn: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryBtn: {
    borderColor: "#475569",
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryBtnText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "700",
  },
  resetBtn: {
    padding: 6,
    backgroundColor: "#475569",
    borderRadius: 6,
  },
});
