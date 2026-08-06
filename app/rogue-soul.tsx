import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
  Platform,
  Modal,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HowToPlayModal } from "../components/HowToPlayModal";
import { COLORS, FONTS, SHAPES, SHADOWS } from "../constants/Theme";

import {
  COSTUME_SKINS,
  WEAPONS,
  INITIAL_UPGRADES,
  CAMPAIGN_LEVELS,
  INITIAL_ACHIEVEMENTS,
  CostumeSkin,
  WeaponItem,
  UpgradeItem,
  LevelData,
  AchievementItem,
} from "../lib/rogue-soul/RogueSoulData";
import { RogueSoulGameEngine } from "../lib/rogue-soul/RogueSoulEngine";
import { RogueAudio } from "../lib/rogue-soul/RogueSoulAudio";

const COINS_KEY = "user_coins_balance";
const GEMS_KEY = "user_gems_balance";
const LEVEL_PROGRESS_KEY = "rogue_soul_level_progress";
const SKINS_UNLOCKED_KEY = "rogue_soul_skins_unlocked";
const WEAPONS_UNLOCKED_KEY = "rogue_soul_weapons_unlocked";
const EQUIPPED_SKIN_KEY = "rogue_soul_equipped_skin";
const EQUIPPED_WEAPON_KEY = "rogue_soul_equipped_weapon";

export default function RogueSoulGameScreen() {
  const router = useRouter();

  // Screen & View State
  const [viewState, setViewState] = useState<"menu" | "levels" | "shop" | "achievements" | "playing">("menu");
  const [userCoins, setUserCoins] = useState(1250);
  const [userGems, setUserGems] = useState(15);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [showHelp, setShowHelp] = useState(true);

  // Shop & Inventory State
  const [unlockedSkinIds, setUnlockedSkinIds] = useState<string[]>(["rogue_default"]);
  const [unlockedWeaponIds, setUnlockedWeaponIds] = useState<string[]>(["novice_dagger"]);
  const [equippedSkinId, setEquippedSkinId] = useState<string>("rogue_default");
  const [equippedWeaponId, setEquippedWeaponId] = useState<string>("novice_dagger");
  const [upgrades, setUpgrades] = useState<UpgradeItem[]>(INITIAL_UPGRADES);
  const [shopTab, setShopTab] = useState<"skins" | "weapons" | "upgrades">("skins");

  // Game Progress State
  const [unlockedLevelMax, setUnlockedLevelMax] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<LevelData>(CAMPAIGN_LEVELS[0]);
  const [isEndlessMode, setIsEndlessMode] = useState(false);
  const [achievements, setAchievements] = useState<AchievementItem[]>(INITIAL_ACHIEVEMENTS);

  // Gameplay Overlay & Results
  const [isPaused, setIsPaused] = useState(false);
  const [gameResult, setGameResult] = useState<"victory" | "defeat" | null>(null);
  const [resultStats, setResultStats] = useState({ stars: 0, coins: 0, gems: 0, score: 0 });

  // References for HTML5 Canvas engine
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<RogueSoulGameEngine | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Virtual Key Inputs state
  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });

  // Load User Persistent Data
  useEffect(() => {
    const loadSaveData = async () => {
      try {
        const storedCoins = await AsyncStorage.getItem(COINS_KEY);
        if (storedCoins !== null) setUserCoins(parseInt(storedCoins));

        const storedGems = await AsyncStorage.getItem(GEMS_KEY);
        if (storedGems !== null) setUserGems(parseInt(storedGems));

        const storedProgress = await AsyncStorage.getItem(LEVEL_PROGRESS_KEY);
        if (storedProgress !== null) setUnlockedLevelMax(parseInt(storedProgress));

        const storedSkins = await AsyncStorage.getItem(SKINS_UNLOCKED_KEY);
        if (storedSkins !== null) setUnlockedSkinIds(JSON.parse(storedSkins));

        const storedWeapons = await AsyncStorage.getItem(WEAPONS_UNLOCKED_KEY);
        if (storedWeapons !== null) setUnlockedWeaponIds(JSON.parse(storedWeapons));

        const storedEqSkin = await AsyncStorage.getItem(EQUIPPED_SKIN_KEY);
        if (storedEqSkin !== null) setEquippedSkinId(storedEqSkin);

        const storedEqWeapon = await AsyncStorage.getItem(EQUIPPED_WEAPON_KEY);
        if (storedEqWeapon !== null) setEquippedWeaponId(storedEqWeapon);
      } catch (err) {
        console.error("Error loading save data:", err);
      }
    };
    loadSaveData();
  }, []);

  // Save Helper
  const saveCoinsGems = async (newCoins: number, newGems: number) => {
    setUserCoins(newCoins);
    setUserGems(newGems);
    await AsyncStorage.setItem(COINS_KEY, newCoins.toString());
    await AsyncStorage.setItem(GEMS_KEY, newGems.toString());
  };

  // Keyboard Event Listeners for Desktop Play
  useEffect(() => {
    if (viewState !== "playing") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") keysRef.current.left = true;
      if (e.code === "ArrowRight" || e.code === "KeyD") keysRef.current.right = true;
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") engineRef.current?.handleJump();
      if (e.code === "ArrowDown" || e.code === "KeyS") engineRef.current?.handleSlide();
      if (e.code === "KeyJ" || e.code === "KeyZ") engineRef.current?.handleSlash();
      if (e.code === "KeyK" || e.code === "KeyX") engineRef.current?.handleThrowDagger();
      if (e.code === "KeyP" || e.code === "Escape") setIsPaused((prev) => !prev);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") keysRef.current.left = false;
      if (e.code === "ArrowRight" || e.code === "KeyD") keysRef.current.right = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [viewState]);

  // Start Gameplay Session
  const startLevelSession = (level: LevelData, endless: boolean = false) => {
    setSelectedLevel(level);
    setIsEndlessMode(endless);
    setGameResult(null);
    setIsPaused(false);

    const activeSkin = COSTUME_SKINS.find((s) => s.id === equippedSkinId) || COSTUME_SKINS[0];
    const activeWeapon = WEAPONS.find((w) => w.id === equippedWeaponId) || WEAPONS[0];

    const maxHpUpgrade = upgrades.find((u) => u.id === "max_hp")?.currentLevel || 1;
    const maxDaggerUpgrade = upgrades.find((u) => u.id === "dagger_capacity")?.currentLevel || 1;
    const magnetUpgrade = upgrades.find((u) => u.id === "coin_magnet")?.currentLevel || 0;

    const engine = new RogueSoulGameEngine(
      activeSkin,
      activeWeapon,
      maxHpUpgrade + 2,
      maxDaggerUpgrade * 3,
      magnetUpgrade * 35
    );
    engine.initLevel(endless ? null : level, endless);
    engineRef.current = engine;

    setViewState("playing");
  };

  // Main 60 FPS Render Loop
  useEffect(() => {
    if (viewState !== "playing") return;

    let canvas = canvasRef.current;
    if (!canvas && typeof document !== "undefined") {
      canvas = document.getElementById("rogue-soul-canvas") as HTMLCanvasElement;
    }
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const engine = engineRef.current;
      if (engine && !isPaused && !gameResult) {
        // Engine Physics Step
        engine.update(keysRef.current.left, keysRef.current.right);

        // Check Victory / Defeat
        if (engine.isVictory) {
          handleLevelComplete(engine);
        } else if (engine.isGameOver) {
          handleLevelDefeat(engine);
        }

        // Draw Canvas World
        drawCanvasGame(ctx, engine, canvas.width, canvas.height);
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [viewState, isPaused, gameResult]);

  const handleLevelComplete = (engine: RogueSoulGameEngine) => {
    const coinsEarned = engine.player.coins + (selectedLevel.rewardCoins || 100);
    const gemsEarned = engine.player.gems + (selectedLevel.rewardGems || 2);
    const stars = engine.player.hp >= engine.player.maxHp ? 3 : engine.player.coins >= selectedLevel.targetCoins ? 2 : 1;

    setGameResult("victory");
    setResultStats({ stars, coins: coinsEarned, gems: gemsEarned, score: engine.player.score });

    const newCoins = userCoins + coinsEarned;
    const newGems = userGems + gemsEarned;
    saveCoinsGems(newCoins, newGems);

    if (selectedLevel.id >= unlockedLevelMax) {
      const nextMax = Math.min(CAMPAIGN_LEVELS.length, selectedLevel.id + 1);
      setUnlockedLevelMax(nextMax);
      AsyncStorage.setItem(LEVEL_PROGRESS_KEY, nextMax.toString());
    }
  };

  const handleLevelDefeat = (engine: RogueSoulGameEngine) => {
    setGameResult("defeat");
    setResultStats({ stars: 0, coins: engine.player.coins, gems: engine.player.gems, score: engine.player.score });
    saveCoinsGems(userCoins + engine.player.coins, userGems + engine.player.gems);
  };

  // Canvas Drawing Function - Polished 60 FPS Visuals
  const drawCanvasGame = (ctx: CanvasRenderingContext2D, engine: RogueSoulGameEngine, width: number, height: number) => {
    const camX = engine.cameraX + (Math.random() - 0.5) * engine.screenShake;
    const env = engine.currentLevelData?.environment || "forest";

    // 1. Sky Gradient Background
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    if (env === "dungeon") {
      skyGradient.addColorStop(0, "#0F172A");
      skyGradient.addColorStop(0.6, "#1E1B4B");
      skyGradient.addColorStop(1, "#312E81");
    } else if (env === "ramparts") {
      skyGradient.addColorStop(0, "#0F172A");
      skyGradient.addColorStop(0.5, "#1E293B");
      skyGradient.addColorStop(1, "#0F766E");
    } else if (env === "keep") {
      skyGradient.addColorStop(0, "#270707");
      skyGradient.addColorStop(0.6, "#450A0A");
      skyGradient.addColorStop(1, "#7F1D1D");
    } else {
      skyGradient.addColorStop(0, "#0369A1");
      skyGradient.addColorStop(0.5, "#0284C7");
      skyGradient.addColorStop(1, "#38BDF8");
    }
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Parallax Background Layers (Mountains & Castle Turrets)
    ctx.fillStyle = env === "keep" ? "rgba(69, 10, 10, 0.45)" : "rgba(15, 23, 42, 0.35)";
    for (let i = 0; i < 12; i++) {
      const hillX = i * 240 - (camX * 0.25) % 240;
      ctx.beginPath();
      ctx.arc(hillX, height + 40, 160, Math.PI, 0, false);
      ctx.fill();
      // Castle Turret details on hills
      if (i % 2 === 0) {
        ctx.fillRect(hillX - 25, height - 160, 50, 100);
        // Turret roof cone
        ctx.beginPath();
        ctx.moveTo(hillX - 32, height - 160);
        ctx.lineTo(hillX, height - 200);
        ctx.lineTo(hillX + 32, height - 160);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.save();
    ctx.translate(-camX, 0);

    // 3. Platforms Rendering
    engine.platforms.forEach((plat) => {
      if (plat.type === "wall") {
        // Wooden / Stone Column for Wall Jumps
        const wallGrad = ctx.createLinearGradient(plat.x, plat.y, plat.x + plat.w, plat.y);
        wallGrad.addColorStop(0, "#475569");
        wallGrad.addColorStop(0.5, "#64748B");
        wallGrad.addColorStop(1, "#334155");
        ctx.fillStyle = wallGrad;
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

        ctx.strokeStyle = "#1E293B";
        ctx.lineWidth = 2;
        ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);

        // Wall Texture Lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        for (let y = plat.y + 20; y < plat.y + plat.h; y += 25) {
          ctx.beginPath();
          ctx.moveTo(plat.x + 4, y);
          ctx.lineTo(plat.x + plat.w - 4, y);
          ctx.stroke();
        }
      } else if (plat.type === "springboard") {
        // Springboard / Trampoline
        ctx.fillStyle = "#1E293B";
        ctx.fillRect(plat.x + 8, plat.y + 12, plat.w - 16, plat.h - 12);
        // Red Padded Top
        ctx.fillStyle = "#E11D48";
        if (ctx.roundRect) {
          ctx.roundRect(plat.x, plat.y, plat.w, 12, 4);
        } else {
          ctx.fillRect(plat.x, plat.y, plat.w, 12);
        }
        ctx.fillStyle = "#FEF08A";
        ctx.fillRect(plat.x + plat.w / 2 - 4, plat.y + 3, 8, 6);
      } else {
        // Standard Ground Platform
        const topColor = plat.type === "dungeon" ? "#475569" : plat.type === "ramparts" ? "#64748B" : "#16A34A";
        const baseColor = plat.type === "dungeon" ? "#1E293B" : plat.type === "ramparts" ? "#334155" : "#78350F";

        // Top Grass / Stone Layer
        ctx.fillStyle = topColor;
        ctx.fillRect(plat.x, plat.y, plat.w, 18);

        // Grass Tufts Detail on Top
        if (plat.type === "grass" || !plat.type) {
          ctx.fillStyle = "#22C55E";
          for (let g = plat.x + 10; g < plat.x + plat.w - 10; g += 18) {
            ctx.beginPath();
            ctx.moveTo(g, plat.y);
            ctx.lineTo(g + 4, plat.y - 6);
            ctx.lineTo(g + 8, plat.y);
            ctx.fill();
          }
        }

        // Platform Base Dirt / Brick Pattern
        ctx.fillStyle = baseColor;
        ctx.fillRect(plat.x, plat.y + 18, plat.w, plat.h - 18);

        // Subtile Under Rim
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.fillRect(plat.x, plat.y + 18, plat.w, 6);
      }
    });

    // 4. Collectibles (Animated Spinning Coins, Gems & Potions)
    const time = Date.now() * 0.005;
    engine.collectibles.forEach((item) => {
      if (item.collected) return;
      ctx.save();
      const floatY = item.y + Math.sin(time + item.floatOffset) * 5;
      ctx.translate(item.x + 12, floatY + 12);

      if (item.type === "coin") {
        // 3D Spinning Coin Effect
        const spinWidth = Math.max(0.2, Math.abs(Math.cos(time * 2)));
        ctx.scale(spinWidth, 1);
        ctx.fillStyle = "#F59E0B";
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#FEF08A";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#78350F";
        ctx.font = "900 11px sans-serif";
        ctx.fillText("$", -3, 4);
      } else if (item.type === "gem") {
        // Pulsing Gem Facets
        ctx.fillStyle = "#EC4899";
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(10, -2);
        ctx.lineTo(0, 12);
        ctx.lineTo(-10, -2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#F472B6";
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(5, -2);
        ctx.lineTo(0, 12);
        ctx.closePath();
        ctx.fill();
      } else if (item.type === "potion") {
        // Health Potion Bottle
        ctx.fillStyle = "#10B981";
        ctx.beginPath();
        ctx.arc(0, 3, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#78350F";
        ctx.fillRect(-3, -10, 6, 4); // Cork
      } else if (item.type === "speed_boost") {
        // Glowing Orange Speed Boost Arrow Pad
        ctx.fillStyle = "#F97316";
        ctx.beginPath();
        ctx.moveTo(-10, -6);
        ctx.lineTo(2, -6);
        ctx.lineTo(2, -12);
        ctx.lineTo(12, 0);
        ctx.lineTo(2, 12);
        ctx.lineTo(2, 6);
        ctx.lineTo(-10, 6);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#FEF08A";
        ctx.fillRect(-6, -2, 6, 4);
      }
      ctx.restore();
    });

    // 5. Traps / Hazards
    engine.hazards.forEach((hazard) => {
      ctx.fillStyle = "#64748B";
      ctx.strokeStyle = "#1E293B";
      ctx.lineWidth = 1.5;
      for (let s = 0; s < hazard.w; s += 16) {
        ctx.beginPath();
        ctx.moveTo(hazard.x + s, hazard.y + hazard.h);
        ctx.lineTo(hazard.x + s + 8, hazard.y + 2);
        ctx.lineTo(hazard.x + s + 16, hazard.y + hazard.h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Metallic Tip Highlight
        ctx.fillStyle = "#CBD5E1";
        ctx.fillRect(hazard.x + s + 7, hazard.y + 2, 2, 4);
        ctx.fillStyle = "#64748B";
      }
    });

    // 6. Enemies (Shield Guards, Archers, Bandits, Boss)
    engine.enemies.forEach((enemy) => {
      if (enemy.hp <= 0) return;
      ctx.save();
      ctx.translate(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
      if (!enemy.facingRight) ctx.scale(-1, 1);

      if (enemy.type === "guard") {
        // Shield Guard Body
        ctx.fillStyle = "#334155";
        ctx.fillRect(-18, -24, 36, 48);
        // Iron Helmet
        ctx.fillStyle = "#64748B";
        ctx.fillRect(-14, -28, 28, 16);
        ctx.fillStyle = "#DC2626";
        ctx.fillRect(-4, -34, 8, 8); // Plume
        // Visor slit
        ctx.fillStyle = "#0F172A";
        ctx.fillRect(2, -24, 10, 3);
        // Shield
        ctx.fillStyle = "#1E3A8A";
        ctx.fillRect(10, -20, 14, 40);
        ctx.strokeStyle = "#F59E0B";
        ctx.lineWidth = 2;
        ctx.strokeRect(10, -20, 14, 40);
      } else if (enemy.type === "archer") {
        // Archer Leather Outfit
        ctx.fillStyle = "#B45309";
        ctx.fillRect(-16, -22, 32, 44);
        ctx.fillStyle = "#78350F";
        ctx.fillRect(-12, -26, 24, 14); // Hood
        // Wooden Bow
        ctx.strokeStyle = "#D97706";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(12, 0, 18, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      } else if (enemy.type === "boss") {
        // Boss Dark Warlord
        ctx.fillStyle = "#450A0A";
        ctx.fillRect(-40, -50, 80, 100);
        // Horned Helm
        ctx.fillStyle = "#991B1B";
        ctx.beginPath();
        ctx.moveTo(-35, -50);
        ctx.lineTo(-50, -75);
        ctx.lineTo(-30, -55);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(35, -50);
        ctx.lineTo(50, -75);
        ctx.lineTo(30, -55);
        ctx.closePath();
        ctx.fill();
        // Glowing Red Eyes
        ctx.fillStyle = "#FEF08A";
        ctx.fillRect(8, -40, 14, 6);
      } else {
        // Red Bandit Slasher / Marauder Character Sprite
        // Body Armor
        ctx.fillStyle = "#991B1B"; // Dark Crimson Outfit
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-15, -20, 30, 36, 6);
        } else {
          ctx.fillRect(-15, -20, 30, 36);
        }
        ctx.fill();

        // Belt & Armor Straps
        ctx.fillStyle = "#450A0A";
        ctx.fillRect(-15, 2, 30, 4);

        // Legs & Boots
        ctx.fillStyle = "#1E293B";
        ctx.fillRect(-10, 16, 8, 12);
        ctx.fillRect(2, 16, 8, 12);
        ctx.fillStyle = "#0F172A";
        ctx.fillRect(-12, 24, 10, 5);
        ctx.fillRect(0, 24, 10, 5);

        // Red Hood & Face Mask
        ctx.fillStyle = "#DC2626";
        ctx.beginPath();
        ctx.arc(0, -22, 14, 0, Math.PI * 2);
        ctx.fill();

        // Dark Face Mask Slit & Glowing Evil Eyes
        ctx.fillStyle = "#0F172A";
        ctx.fillRect(-2, -26, 12, 8);
        ctx.fillStyle = "#F59E0B"; // Glowing yellow eyes
        ctx.fillRect(2, -24, 4, 3);

        // Dagger Blade in Hand
        ctx.fillStyle = "#CBD5E1";
        ctx.beginPath();
        ctx.moveTo(10, -4);
        ctx.lineTo(24, 0);
        ctx.lineTo(10, 4);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    });

    // 7. Projectiles (Flying Daggers & Arrows)
    engine.projectiles.forEach((proj) => {
      if (!proj.active) return;
      ctx.save();
      ctx.translate(proj.x, proj.y);
      ctx.rotate(proj.rotation);

      if (proj.fromPlayer) {
        // High-Tech Spinning Dagger with Motion Glow Trail
        ctx.shadowColor = "#00E5FF";
        ctx.shadowBlur = 8;

        // Dagger Blade
        ctx.fillStyle = "#E2E8F0";
        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.lineTo(-6, -6);
        ctx.lineTo(-2, 0);
        ctx.lineTo(-6, 6);
        ctx.closePath();
        ctx.fill();

        // Dagger Gold Hilt & Crossguard
        ctx.fillStyle = "#F59E0B";
        ctx.fillRect(-6, -7, 4, 14);
        ctx.fillStyle = "#78350F";
        ctx.fillRect(-10, -3, 5, 6);

        // Motion Light Trail Stream
        ctx.fillStyle = "rgba(0, 229, 255, 0.4)";
        ctx.fillRect(-28, -3, 20, 6);
        ctx.shadowBlur = 0;
      } else {
        // Enemy Arrow with Feather Fletching
        ctx.fillStyle = "#CBD5E1";
        ctx.fillRect(-12, -2, 24, 4);
        ctx.fillStyle = "#DC2626";
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(4, -5);
        ctx.lineTo(4, 5);
        ctx.closePath();
        ctx.fill();
        // Feather fletching
        ctx.fillStyle = "#F59E0B";
        ctx.beginPath();
        ctx.moveTo(-12, -6);
        ctx.lineTo(-6, -2);
        ctx.lineTo(-12, 2);
        ctx.lineTo(-18, -2);
        ctx.fill();
      }
      ctx.restore();
    });

    // 8. HIGH-QUALITY 2D CYBER-NINJA HERO CHARACTER
    const p = engine.player;
    ctx.save();
    ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
    if (!p.facingRight) ctx.scale(-1, 1);

    // Ground Soft Ellipse Shadow
    ctx.save();
    ctx.scale(1, 0.35);
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.arc(0, 75, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Elemental Aura Glow Ring
    ctx.shadowColor = p.skin.colorScheme.glow;
    ctx.shadowBlur = 14;

    const frame = p.actionFrame || 0;
    const runCycle = Math.sin(frame * 0.45);

    // LAYER 1: Flowing Scarf & Dynamic Dual-Layered Cape
    const capeSway1 = Math.sin(frame * 0.3) * 14;
    const capeSway2 = Math.cos(frame * 0.3) * 10;

    // Outer Scarf Ribbon Streamers
    ctx.fillStyle = p.skin.colorScheme.cape;
    ctx.beginPath();
    ctx.moveTo(-6, -26);
    ctx.quadraticCurveTo(-25 + capeSway1, -30, -40 + capeSway1, -22 + capeSway2);
    ctx.quadraticCurveTo(-22 + capeSway1, -16, -4, -20);
    ctx.closePath();
    ctx.fill();

    // Inner Dark Cape Layer
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.beginPath();
    ctx.moveTo(-10, -18);
    ctx.quadraticCurveTo(-28 + capeSway1, 0, -36 + capeSway1, 24);
    ctx.lineTo(-2, 26);
    ctx.closePath();
    ctx.fill();

    // Main Cape with Gold Edge Trim
    const capeGrad = ctx.createLinearGradient(-10, -20, -35 + capeSway1, 25);
    capeGrad.addColorStop(0, p.skin.colorScheme.cape);
    capeGrad.addColorStop(1, p.skin.colorScheme.secondary);
    ctx.fillStyle = capeGrad;
    ctx.beginPath();
    ctx.moveTo(-12, -20);
    ctx.quadraticCurveTo(-26 + capeSway1, -2, -34 + capeSway1, 22);
    ctx.lineTo(-4, 24);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // LAYER 2: Animated Legs & Cyber Boots (Running / Sliding / Air Stance)
    if (p.action === "slide") {
      // Low Stealth Dash Stance
      ctx.fillStyle = p.skin.colorScheme.secondary;
      ctx.fillRect(-28, 6, 56, 14);
      ctx.fillStyle = "#F59E0B"; // Utility belt
      ctx.fillRect(-28, 4, 56, 4);

      // Boots Slide Spark Trail
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(18, 12, 12, 8);
      ctx.fillStyle = "#00E5FF";
      ctx.fillRect(-28, 16, 50, 4);
    } else if (p.action === "run" && p.grounded) {
      // Realistic 2-Joint Bending Leg Cycle
      const leg1Angle = runCycle * 0.6;
      const leg2Angle = -runCycle * 0.6;

      // Left Leg
      ctx.save();
      ctx.translate(-6, 12);
      ctx.rotate(leg1Angle);
      ctx.fillStyle = p.skin.colorScheme.secondary;
      ctx.fillRect(-4, 0, 8, 14); // Thigh
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(-4, 14, 8, 10); // Armored Shin
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(-5, 20, 11, 6); // Boot
      ctx.fillStyle = p.skin.colorScheme.glow;
      ctx.fillRect(-2, 24, 6, 2); // Sole Thruster Glow
      ctx.restore();

      // Right Leg
      ctx.save();
      ctx.translate(6, 12);
      ctx.rotate(leg2Angle);
      ctx.fillStyle = p.skin.colorScheme.secondary;
      ctx.fillRect(-4, 0, 8, 14); // Thigh
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(-4, 14, 8, 10); // Armored Shin
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(-5, 20, 11, 6); // Boot
      ctx.fillStyle = p.skin.colorScheme.glow;
      ctx.fillRect(-2, 24, 6, 2); // Sole Thruster Glow
      ctx.restore();
    } else {
      // Mid-Air Tucked Knees Stance
      ctx.fillStyle = p.skin.colorScheme.secondary;
      ctx.fillRect(-10, 12, 8, 14);
      ctx.fillRect(4, 10, 8, 14);
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(-12, 22, 10, 6);
      ctx.fillRect(2, 20, 10, 6);
    }

    // LAYER 3: Mecha Armor Torso & Utility Straps
    const armorGrad = ctx.createLinearGradient(-14, -18, 14, 18);
    armorGrad.addColorStop(0, p.skin.colorScheme.primary);
    armorGrad.addColorStop(0.6, p.skin.colorScheme.secondary);
    armorGrad.addColorStop(1, "#0F172A");

    ctx.fillStyle = armorGrad;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(-15, -20, 30, 34, 8);
    } else {
      ctx.fillRect(-15, -20, 30, 34);
    }
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Cross-Body Leather Harness & Belt
    ctx.fillStyle = "#78350F";
    ctx.fillRect(-15, 4, 30, 5); // Utility Belt
    ctx.fillStyle = "#F59E0B";
    ctx.fillRect(-3, 3, 6, 7); // Gold Buckle

    // Glowing Power Core Emblem on Chest
    ctx.shadowColor = p.skin.colorScheme.glow;
    ctx.shadowBlur = 12;
    ctx.fillStyle = p.skin.colorScheme.glow;
    ctx.beginPath();
    ctx.arc(0, -9, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(0, -9, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Shoulder Pauldrons
    ctx.fillStyle = p.skin.colorScheme.primary;
    ctx.beginPath();
    ctx.arc(-15, -16, 6, 0, Math.PI * 2);
    ctx.arc(15, -16, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 1;
    ctx.stroke();

    // LAYER 4: Rogue Assassin Hood & Cyber Visor
    ctx.fillStyle = p.skin.colorScheme.secondary;
    ctx.beginPath();
    ctx.arc(0, -24, 15, 0, Math.PI * 2);
    ctx.fill();

    // Angular Cowl Overlay
    ctx.fillStyle = p.skin.colorScheme.primary;
    ctx.beginPath();
    ctx.moveTo(-15, -24);
    ctx.lineTo(0, -38);
    ctx.lineTo(15, -24);
    ctx.lineTo(12, -14);
    ctx.lineTo(-12, -14);
    ctx.closePath();
    ctx.fill();

    // Hood Gold Trim Line
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Futuristic Glowing Cyber Eyes & Visor
    ctx.shadowColor = p.skin.colorScheme.glow;
    ctx.shadowBlur = 14;
    ctx.fillStyle = p.skin.colorScheme.glow;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(2, -26, 11, 5, 2);
    } else {
      ctx.fillRect(2, -26, 11, 5);
    }
    ctx.fill();

    // White Lens Refraction Reflection
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(4, -25, 4, 3);
    ctx.shadowBlur = 0;

    // LAYER 5: Weapon & Epic Attack Slash Arc
    ctx.save();
    // Arm Holding Weapon
    ctx.fillStyle = p.skin.colorScheme.secondary;
    ctx.beginPath();
    ctx.arc(12, -8, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Weapon Hilt & Guard
    ctx.fillStyle = "#F59E0B"; // Gold Guard
    ctx.fillRect(12, -12, 4, 14);
    ctx.fillStyle = "#78350F";
    ctx.fillRect(8, -7, 6, 4);

    // Glowing Steel/Energy Blade
    ctx.shadowColor = p.weapon.trailColor;
    ctx.shadowBlur = 10;
    const bladeGrad = ctx.createLinearGradient(16, 0, 16 + p.weapon.range * 0.45, 0);
    bladeGrad.addColorStop(0, "#FFFFFF");
    bladeGrad.addColorStop(0.4, p.weapon.bladeColor);
    bladeGrad.addColorStop(1, "#FFFFFF");

    ctx.fillStyle = bladeGrad;
    ctx.beginPath();
    ctx.moveTo(16, -8);
    ctx.lineTo(16 + p.weapon.range * 0.45, -4);
    ctx.lineTo(16 + p.weapon.range * 0.5, 0);
    ctx.lineTo(16 + p.weapon.range * 0.45, 4);
    ctx.lineTo(16, 8);
    ctx.closePath();
    ctx.fill();

    // Blade Spine Center Line
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(16 + p.weapon.range * 0.48, 0);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // LAYER 6: MASSIVE NEON SWORD SLASH ARC (270 Degrees)
    if (p.action === "slash") {
      ctx.save();
      ctx.shadowColor = p.weapon.trailColor;
      ctx.shadowBlur = 24;

      // Outer Glow Slash Wave
      ctx.strokeStyle = p.weapon.bladeColor;
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(0, -4, p.weapon.range * 0.9, -Math.PI * 0.65, Math.PI * 0.55, false);
      ctx.stroke();

      // Middle Vibrant Energy Wave
      ctx.strokeStyle = p.skin.colorScheme.glow;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, -4, p.weapon.range * 0.9, -Math.PI * 0.6, Math.PI * 0.5, false);
      ctx.stroke();

      // Inner Core White Slash Line
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -4, p.weapon.range * 0.9, -Math.PI * 0.55, Math.PI * 0.45, false);
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.restore();
    }

    ctx.restore(); // Restore hero orientation/translation

    // 9. Particles (Dust, Sparks & Text Popups)
    engine.particles.forEach((pt) => {
      ctx.save();
      if (pt.shape === "text") {
        ctx.fillStyle = pt.color;
        ctx.font = "900 18px sans-serif";
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 4;
        ctx.fillText(pt.text || "", pt.x, pt.y);
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    ctx.restore(); // Restore camera translation

    // 10. IN-CANVAS HUD OVERLAY (Health, Daggers, Combo Streak & Distance Progress)
    // Health Hearts Top-Left
    for (let h = 0; h < engine.player.maxHp; h++) {
      const heartX = 20 + h * 28;
      const heartY = 20;
      ctx.fillStyle = h < engine.player.hp ? "#EF4444" : "#475569";
      ctx.beginPath();
      ctx.arc(heartX - 5, heartY, 6, Math.PI, 0, false);
      ctx.arc(heartX + 5, heartY, 6, Math.PI, 0, false);
      ctx.lineTo(heartX, heartY + 12);
      ctx.closePath();
      ctx.fill();
    }

    // Dagger Count Badges
    ctx.fillStyle = "#0284C7";
    ctx.fillRect(20, 42, 60, 20);
    ctx.fillStyle = "#FFF";
    ctx.font = "900 11px sans-serif";
    ctx.fillText(`DAGGER: ${engine.player.daggers}/${engine.player.maxDaggers}`, 24, 56);

    // Combo streak popup
    if (engine.player.combo >= 2) {
      ctx.fillStyle = "#F59E0B";
      ctx.font = "900 22px sans-serif";
      ctx.fillText(`${engine.player.combo}x COMBO!`, width - 180, 45);
    }

    // Distance Level Progress Bar Top-Center
    if (engine.currentLevelData && !engine.isEndless) {
      const progressRatio = Math.min(1, engine.player.x / engine.currentLevelData.targetDistance);
      const barW = 260;
      const barX = width / 2 - barW / 2;
      const barY = 20;

      ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
      ctx.fillRect(barX, barY, barW, 12);
      ctx.fillStyle = "#10B981";
      ctx.fillRect(barX, barY, barW * progressRatio, 12);
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(barX, barY, barW, 12);

      // Moving Player Head Icon on Progress Bar
      ctx.fillStyle = "#F59E0B";
      ctx.beginPath();
      ctx.arc(barX + barW * progressRatio, barY + 6, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // --- MENU COMPONENT RENDERING (Matches User Screenshot) ---
  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* TOP HEADER CONTROLS */}
      <View style={styles.topHeader}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backBtnText}>Keluar</Text>
        </Pressable>

        <View style={styles.currenciesHud}>
          <View style={styles.currencyBadge}>
            <MaterialCommunityIcons name={"coins" as any} size={16} color="#F59E0B" />
            <Text style={styles.currencyText}>{userCoins.toLocaleString()}</Text>
          </View>
          <View style={[styles.currencyBadge, { backgroundColor: "#831843", borderColor: "#F472B6" }]}>
            <Ionicons name="diamond" size={14} color="#EC4899" />
            <Text style={[styles.currencyText, { color: "#F472B6" }]}>{userGems}</Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <Pressable
            onPress={() => setShowHelp(true)}
            style={styles.iconBtn}
          >
            <Ionicons name="help-circle" size={18} color="#FEF08A" />
          </Pressable>
          <Pressable
            onPress={() => {
              RogueAudio.setSoundEnabled(!soundEnabled);
              setSoundEnabled(!soundEnabled);
            }}
            style={styles.iconBtn}
          >
            <Ionicons name={soundEnabled ? "volume-high" : "volume-mute"} size={18} color="#FEF08A" />
          </Pressable>
          <Pressable
            onPress={() => {
              RogueAudio.setMusicEnabled(!musicEnabled);
              setMusicEnabled(!musicEnabled);
            }}
            style={styles.iconBtn}
          >
            <Ionicons name={musicEnabled ? "musical-notes" : "musical-note-sharp"} size={18} color="#FEF08A" />
          </Pressable>
        </View>
      </View>

      {/* 1. TITLE MAIN MENU SCREEN (Identical to Screenshot) */}
      {viewState === "menu" && (
        <View style={styles.menuContainer}>
          {/* Medieval Tavern Background Artwork */}
          <View style={styles.tavernBackground}>
            <View style={styles.torchGlowLeft} />
            <View style={styles.torchGlowRight} />
          </View>

          {/* Wooden Sign Board Header */}
          <View style={styles.titleSignBoard}>
            <View style={styles.titleRivetLeft} />
            <View style={styles.titleRivetRight} />
            <Text style={styles.titleTextMain}>ROGUE SOUL</Text>
            <View style={styles.titleBadgeTwo}>
              <Text style={styles.titleBadgeTwoText}>II</Text>
            </View>
          </View>

          {/* Studio Branding */}
          <View style={styles.brandCorner}>
            <MaterialCommunityIcons name="fire" size={28} color="#F97316" />
            <Text style={styles.brandTitle}>SOULGAME</Text>
            <Text style={styles.brandSub}>STUDIO</Text>
          </View>

          {/* Wooden Menu Buttons Stack */}
          <View style={styles.menuButtonsStack}>
            <Pressable style={styles.woodenButton} onPress={() => setViewState("levels")}>
              <View style={styles.btnRivetLeft} />
              <Text style={styles.woodenButtonText}>PLAY CAMPAIGN</Text>
              <View style={styles.btnRivetRight} />
            </Pressable>

            <Pressable style={styles.woodenButton} onPress={() => setViewState("shop")}>
              <View style={styles.btnRivetLeft} />
              <Text style={styles.woodenButtonText}>ARMORY & SHOP</Text>
              <View style={styles.btnRivetRight} />
            </Pressable>

            <Pressable style={styles.woodenButton} onPress={() => setViewState("achievements")}>
              <View style={styles.btnRivetLeft} />
              <Text style={styles.woodenButtonText}>ACHIEVEMENTS</Text>
              <View style={styles.btnRivetRight} />
            </Pressable>
          </View>

          {/* Barrel CTA (Center Barrel from Screenshot) */}
          <View style={styles.barrelCenterCard}>
            <View style={styles.barrelTopStrap} />
            <View style={styles.barrelSwordTop}>
              <Ionicons name="shield-half" size={24} color="#CBD5E1" />
            </View>
            <Pressable
              style={styles.barrelPlayBtn}
              onPress={() => startLevelSession(CAMPAIGN_LEVELS[0], true)}
            >
              <Text style={styles.barrelPlayText}>PLAY</Text>
              <Text style={styles.barrelSubText}>ENDLESS MODE</Text>
            </Pressable>
            <View style={styles.barrelBottomStrap} />
          </View>
        </View>
      )}

      {/* 2. CAMPAIGN LEVEL SELECT MODAL / VIEW */}
      {viewState === "levels" && (
        <View style={styles.modalViewContainer}>
          <Text style={styles.modalHeadingText}>PILIH MISI PETUALANGAN</Text>
          <Text style={styles.modalSubheadingText}>Selesaikan tiap level untuk membuka lokasi berikutnya!</Text>

          <ScrollView contentContainerStyle={styles.levelsGrid}>
            {CAMPAIGN_LEVELS.map((lvl) => {
              const isLocked = lvl.id > unlockedLevelMax;
              return (
                <Pressable
                  key={lvl.id}
                  style={[styles.levelCard, isLocked && styles.levelCardLocked]}
                  onPress={() => !isLocked && startLevelSession(lvl)}
                >
                  <View style={[styles.levelCardBanner, { backgroundColor: lvl.themeColor }]}>
                    <Text style={styles.levelNumberText}>LEVEL {lvl.id}</Text>
                    {isLocked ? (
                      <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
                    ) : (
                      <View style={{ flexDirection: "row", gap: 2 }}>
                        <Ionicons name="star" size={14} color="#FEF08A" />
                        <Ionicons name="star" size={14} color="#FEF08A" />
                        <Ionicons name="star-outline" size={14} color="#FEF08A" />
                      </View>
                    )}
                  </View>

                  <View style={styles.levelCardContent}>
                    <Text style={styles.levelTitleText}>{lvl.name}</Text>
                    <Text style={styles.levelSubtitleText}>{lvl.subtitle}</Text>
                    <View style={styles.rewardsRow}>
                      <View style={styles.rewardTag}>
                        <MaterialCommunityIcons name={"coins" as any} size={14} color="#F59E0B" />
                        <Text style={styles.rewardTagText}>+{lvl.rewardCoins}</Text>
                      </View>
                      <View style={styles.rewardTag}>
                        <Ionicons name="diamond" size={12} color="#EC4899" />
                        <Text style={[styles.rewardTagText, { color: "#EC4899" }]}>+{lvl.rewardGems}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable style={styles.closeModalBtn} onPress={() => setViewState("menu")}>
            <Text style={styles.closeModalBtnText}>KEMBALI KE MENU</Text>
          </Pressable>
        </View>
      )}

      {/* 3. SHOP & ARMORY MODAL / VIEW */}
      {viewState === "shop" && (
        <View style={styles.modalViewContainer}>
          <Text style={styles.modalHeadingText}>ARMORY & PERLENGKAPAN</Text>

          {/* Shop Tabs */}
          <View style={styles.shopTabsRow}>
            <Pressable style={[styles.shopTabBtn, shopTab === "skins" && styles.shopTabActive]} onPress={() => setShopTab("skins")}>
              <Text style={styles.shopTabText}>KOSTUM (SKINS)</Text>
            </Pressable>
            <Pressable style={[styles.shopTabBtn, shopTab === "weapons" && styles.shopTabActive]} onPress={() => setShopTab("weapons")}>
              <Text style={styles.shopTabText}>SENJATA</Text>
            </Pressable>
            <Pressable style={[styles.shopTabBtn, shopTab === "upgrades" && styles.shopTabActive]} onPress={() => setShopTab("upgrades")}>
              <Text style={styles.shopTabText}>UPGRADES</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.shopContentList}>
            {/* SKINS TAB */}
            {shopTab === "skins" &&
              COSTUME_SKINS.map((skin) => {
                const isUnlocked = unlockedSkinIds.includes(skin.id);
                const isEquipped = equippedSkinId === skin.id;

                return (
                  <View key={skin.id} style={styles.shopItemCard}>
                    <View style={[styles.skinColorPreview, { backgroundColor: skin.colorScheme.primary }]}>
                      <View style={[styles.skinCapePreview, { backgroundColor: skin.colorScheme.cape }]} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{skin.name}</Text>
                      <Text style={styles.itemDesc}>{skin.description}</Text>
                      <Text style={styles.itemStatText}>Speed: +{Math.round((skin.speedMultiplier - 1) * 100)}% | Def: +{skin.defenseBonus} HP</Text>
                    </View>

                    {isEquipped ? (
                      <View style={styles.equippedBadge}><Text style={styles.equippedBadgeText}>DIPAKAI</Text></View>
                    ) : isUnlocked ? (
                      <Pressable
                        style={styles.equipBtn}
                        onPress={() => {
                          setEquippedSkinId(skin.id);
                          AsyncStorage.setItem(EQUIPPED_SKIN_KEY, skin.id);
                        }}
                      >
                        <Text style={styles.equipBtnText}>PAKAI</Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        style={styles.buyBtn}
                        onPress={() => {
                          if (userCoins >= skin.priceCoins && userGems >= skin.priceGems) {
                            const newCoins = userCoins - skin.priceCoins;
                            const newGems = userGems - skin.priceGems;
                            const newSkins = [...unlockedSkinIds, skin.id];
                            saveCoinsGems(newCoins, newGems);
                            setUnlockedSkinIds(newSkins);
                            AsyncStorage.setItem(SKINS_UNLOCKED_KEY, JSON.stringify(newSkins));
                          } else {
                            alert("Koin atau Permata tidak cukup!");
                          }
                        }}
                      >
                        <Text style={styles.buyBtnText}>{skin.priceCoins > 0 ? `${skin.priceCoins} Coins` : `${skin.priceGems} Gems`}</Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}

            {/* WEAPONS TAB */}
            {shopTab === "weapons" &&
              WEAPONS.map((wpn) => {
                const isUnlocked = unlockedWeaponIds.includes(wpn.id);
                const isEquipped = equippedWeaponId === wpn.id;

                return (
                  <View key={wpn.id} style={styles.shopItemCard}>
                    <View style={[styles.skinColorPreview, { backgroundColor: wpn.bladeColor }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{wpn.name}</Text>
                      <Text style={styles.itemDesc}>{wpn.description}</Text>
                      <Text style={styles.itemStatText}>Damage: {wpn.damage} | Range: {wpn.range}px</Text>
                    </View>

                    {isEquipped ? (
                      <View style={styles.equippedBadge}><Text style={styles.equippedBadgeText}>DIPAKAI</Text></View>
                    ) : isUnlocked ? (
                      <Pressable
                        style={styles.equipBtn}
                        onPress={() => {
                          setEquippedWeaponId(wpn.id);
                          AsyncStorage.setItem(EQUIPPED_WEAPON_KEY, wpn.id);
                        }}
                      >
                        <Text style={styles.equipBtnText}>PAKAI</Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        style={styles.buyBtn}
                        onPress={() => {
                          if (userCoins >= wpn.priceCoins) {
                            const newCoins = userCoins - wpn.priceCoins;
                            const newWpns = [...unlockedWeaponIds, wpn.id];
                            saveCoinsGems(newCoins, userGems);
                            setUnlockedWeaponIds(newWpns);
                            AsyncStorage.setItem(WEAPONS_UNLOCKED_KEY, JSON.stringify(newWpns));
                          } else {
                            alert("Koin tidak cukup!");
                          }
                        }}
                      >
                        <Text style={styles.buyBtnText}>{wpn.priceCoins} Coins</Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}

            {/* UPGRADES TAB */}
            {shopTab === "upgrades" &&
              upgrades.map((upg) => {
                const isMax = upg.currentLevel >= upg.maxLevel;
                const cost = upg.costPerLevel[upg.currentLevel] || 0;

                return (
                  <View key={upg.id} style={styles.shopItemCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{upg.name} (Lvl {upg.currentLevel}/{upg.maxLevel})</Text>
                      <Text style={styles.itemDesc}>{upg.description}</Text>
                      <Text style={styles.itemStatText}>Efek: {upg.effectLabel(upg.currentLevel)}</Text>
                    </View>

                    {isMax ? (
                      <View style={styles.equippedBadge}><Text style={styles.equippedBadgeText}>MAX</Text></View>
                    ) : (
                      <Pressable
                        style={styles.buyBtn}
                        onPress={() => {
                          if (userCoins >= cost) {
                            saveCoinsGems(userCoins - cost, userGems);
                            setUpgrades((prev) =>
                              prev.map((u) => (u.id === upg.id ? { ...u, currentLevel: u.currentLevel + 1 } : u))
                            );
                          } else {
                            alert("Koin tidak cukup!");
                          }
                        }}
                      >
                        <Text style={styles.buyBtnText}>UP {cost} C</Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
          </ScrollView>

          <Pressable style={styles.closeModalBtn} onPress={() => setViewState("menu")}>
            <Text style={styles.closeModalBtnText}>KEMBALI KE MENU</Text>
          </Pressable>
        </View>
      )}

      {/* 4. ACHIEVEMENTS VIEW */}
      {viewState === "achievements" && (
        <View style={styles.modalViewContainer}>
          <Text style={styles.modalHeadingText}>PENCAPAIAN (ACHIEVEMENTS)</Text>
          <ScrollView contentContainerStyle={styles.shopContentList}>
            {achievements.map((ach) => (
              <View key={ach.id} style={styles.shopItemCard}>
                <Ionicons name="trophy" size={28} color="#F59E0B" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{ach.title}</Text>
                  <Text style={styles.itemDesc}>{ach.description}</Text>
                  <Text style={styles.itemStatText}>Progress: {ach.currentProgress}/{ach.targetProgress}</Text>
                </View>
                <View style={styles.rewardTag}>
                  <Text style={styles.rewardTagText}>+{ach.rewardCoins} Coins</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <Pressable style={styles.closeModalBtn} onPress={() => setViewState("menu")}>
            <Text style={styles.closeModalBtnText}>KEMBALI KE MENU</Text>
          </Pressable>
        </View>
      )}

      {/* 5. ACTIVE GAMEPLAY CANVAS VIEW */}
      {viewState === "playing" && (
        <View style={styles.gameplayWrapper}>
          {/* HTML5 Canvas Component */}
          {Platform.OS === "web" ? (
            <canvas id="rogue-soul-canvas" width={900} height={500} style={styles.webCanvas} />
          ) : (
            <View style={styles.fallbackCanvasArea}>
              <Text style={{ color: "#FFF" }}>Mainkan di Web Browser / Desktop untuk performa Canvas 60 FPS maksimal!</Text>
            </View>
          )}

          {/* DESKTOP KEYBOARD CONTROLS GUIDE HINT */}
          <View style={styles.keyboardGuideBar}>
            <Text style={styles.keyboardGuideText}>
              ⌨️ <Text style={{ color: "#FEF08A" }}>KEYBOARD:</Text> [A/D] Lari • [W/Space] Lompat/Wall Jump • [S] Meluncur • [J] Tebas • [K] Lempar Pisau
            </Text>
          </View>

          {/* ON-SCREEN VIRTUAL CONTROLS FOR MOBILE / TOUCH */}
          <View style={styles.virtualTouchOverlay}>
            {/* D-PAD LEFT / RIGHT */}
            <View style={styles.dpadGroup}>
              <Pressable
                style={styles.touchBtn}
                onPressIn={() => (keysRef.current.left = true)}
                onPressOut={() => (keysRef.current.left = false)}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </Pressable>

              <Pressable
                style={styles.touchBtn}
                onPressIn={() => (keysRef.current.right = true)}
                onPressOut={() => (keysRef.current.right = false)}
              >
                <Ionicons name="arrow-forward" size={24} color="#FFF" />
              </Pressable>
            </View>

            {/* ACTION BUTTONS */}
            <View style={styles.actionGroup}>
              <Pressable style={[styles.touchBtn, { backgroundColor: "#0284C7" }]} onPress={() => engineRef.current?.handleJump()}>
                <Ionicons name="arrow-up" size={18} color="#FFF" />
                <Text style={styles.touchBtnLabel}>JUMP (W)</Text>
              </Pressable>

              <Pressable style={[styles.touchBtn, { backgroundColor: "#B45309" }]} onPress={() => engineRef.current?.handleSlide()}>
                <Ionicons name="arrow-down" size={18} color="#FFF" />
                <Text style={styles.touchBtnLabel}>SLIDE (S)</Text>
              </Pressable>

              <Pressable style={[styles.touchBtn, { backgroundColor: "#DC2626" }]} onPress={() => engineRef.current?.handleSlash()}>
                <MaterialCommunityIcons name="sword" size={18} color="#FFF" />
                <Text style={styles.touchBtnLabel}>SLASH (J)</Text>
              </Pressable>

              <Pressable style={[styles.touchBtn, { backgroundColor: "#7C3AED" }]} onPress={() => engineRef.current?.handleThrowDagger()}>
                <Ionicons name="send" size={16} color="#FFF" />
                <Text style={styles.touchBtnLabel}>DAGGER (K)</Text>
              </Pressable>
            </View>
          </View>

          {/* VICTORY MODAL */}
          {gameResult === "victory" && (
            <View style={styles.resultsOverlay}>
              <View style={styles.resultBox}>
                <Ionicons name="trophy" size={56} color="#F59E0B" />
                <Text style={styles.resultTitleText}>MISI SELESAI!</Text>

                <View style={styles.starsRow}>
                  {[1, 2, 3].map((s) => (
                    <Ionicons
                      key={s}
                      name={s <= resultStats.stars ? "star" : "star-outline"}
                      size={32}
                      color="#F59E0B"
                    />
                  ))}
                </View>

                <Text style={styles.resultStatLine}>Koin Diperoleh: +{resultStats.coins}</Text>
                <Text style={styles.resultStatLine}>Permata: +{resultStats.gems}</Text>
                <Text style={styles.resultStatLine}>Total Skor: {resultStats.score}</Text>

                <View style={styles.resultButtonsRow}>
                  <Pressable style={styles.resultBtn} onPress={() => startLevelSession(selectedLevel)}>
                    <Text style={styles.resultBtnText}>ULANGI</Text>
                  </Pressable>
                  <Pressable style={[styles.resultBtn, { backgroundColor: "#10B981" }]} onPress={() => setViewState("menu")}>
                    <Text style={styles.resultBtnText}>MENU</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* DEFEAT MODAL */}
          {gameResult === "defeat" && (
            <View style={styles.resultsOverlay}>
              <View style={[styles.resultBox, { borderColor: "#EF4444" }]}>
                <Ionicons name="skull" size={56} color="#EF4444" />
                <Text style={[styles.resultTitleText, { color: "#EF4444" }]}>KAMU GUGUR!</Text>

                <Text style={styles.resultStatLine}>Koin Dikumpulkan: +{resultStats.coins}</Text>
                <Text style={styles.resultStatLine}>Skor: {resultStats.score}</Text>

                <View style={styles.resultButtonsRow}>
                  <Pressable style={[styles.resultBtn, { backgroundColor: "#EF4444" }]} onPress={() => startLevelSession(selectedLevel)}>
                    <Text style={styles.resultBtnText}>COBA LAGI</Text>
                  </Pressable>
                  <Pressable style={styles.resultBtn} onPress={() => setViewState("menu")}>
                    <Text style={styles.resultBtnText}>MENU</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      <HowToPlayModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title="Cara Main Rogue Soul"
        goal="Lari, lompat, dan bertarung sepanjang level sambil mengumpulkan koin dan permata!"
        accentColor="#7C3AED"
        subtitleColor="#6D28D9"
        steps={[
          { emoji: "1️⃣", text: "Di komputer: A/D atau panah untuk gerak, W/Spasi untuk lompat, S untuk meluncur." },
          { emoji: "2️⃣", text: "Serang musuh dengan J (tebas pedang) dan lempar pisau dengan K." },
          { emoji: "3️⃣", text: "Kumpulkan koin & permata, hindari panah musuh, dan capai garis finish tiap level." },
          { emoji: "4️⃣", text: "Di HP/tablet gunakan tombol sentuh di layar. Buka toko Armory untuk membeli skin & senjata." },
        ]}
        tips={[
          "Jaga HP — kalah berarti run berakhir (koin tetap tersimpan).",
          "Lompat untuk menghindar, dan wall jump untuk mencapai tempat tinggi.",
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
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#1E293B",
    borderBottomWidth: 2,
    borderBottomColor: "#334155",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  currenciesHud: {
    flexDirection: "row",
    gap: 10,
  },
  currencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#451A03",
    borderWidth: 1.5,
    borderColor: "#F59E0B",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  currencyText: {
    color: "#F59E0B",
    fontWeight: "900",
    fontSize: 13,
  },
  headerRightActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  tavernBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1E1B4B",
    opacity: 0.85,
  },
  torchGlowLeft: {
    position: "absolute",
    top: 40,
    left: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(249, 115, 22, 0.25)",
  },
  torchGlowRight: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(249, 115, 22, 0.25)",
  },
  titleSignBoard: {
    width: 320,
    backgroundColor: "#78350F",
    borderWidth: 4,
    borderColor: "#451A03",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    position: "relative",
    marginBottom: 30,
    ...SHADOWS.premium,
  },
  titleRivetLeft: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#94A3B8",
  },
  titleRivetRight: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#94A3B8",
  },
  titleTextMain: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FEF08A",
    letterSpacing: 2,
    textShadowColor: "#000000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  titleBadgeTwo: {
    position: "absolute",
    top: -12,
    right: -12,
    backgroundColor: "#DC2626",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  titleBadgeTwoText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },
  brandCorner: {
    position: "absolute",
    top: 20,
    right: 20,
    alignItems: "center",
  },
  brandTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: "#F97316",
  },
  brandSub: {
    fontSize: 8,
    fontWeight: "800",
    color: "#CBD5E1",
  },
  menuButtonsStack: {
    width: "100%",
    maxWidth: 280,
    gap: 14,
    marginBottom: 30,
  },
  woodenButton: {
    backgroundColor: "#92400E",
    borderWidth: 3,
    borderColor: "#451A03",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    ...SHADOWS.medium,
  },
  btnRivetLeft: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CBD5E1",
  },
  btnRivetRight: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CBD5E1",
  },
  woodenButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  barrelCenterCard: {
    width: 200,
    backgroundColor: "#78350F",
    borderWidth: 3,
    borderColor: "#451A03",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
  },
  barrelTopStrap: {
    width: "100%",
    height: 4,
    backgroundColor: "#451A03",
    marginBottom: 8,
  },
  barrelBottomStrap: {
    width: "100%",
    height: 4,
    backgroundColor: "#451A03",
    marginTop: 8,
  },
  barrelSwordTop: {
    marginBottom: 6,
  },
  barrelPlayBtn: {
    backgroundColor: "#16A34A",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  barrelPlayText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 14,
  },
  barrelSubText: {
    color: "#FEF08A",
    fontWeight: "800",
    fontSize: 9,
  },
  modalViewContainer: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 20,
  },
  modalHeadingText: {
    color: "#FEF08A",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 4,
  },
  modalSubheadingText: {
    color: "#94A3B8",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
  },
  levelsGrid: {
    gap: 14,
    paddingBottom: 20,
  },
  levelCard: {
    backgroundColor: "#1E293B",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#334155",
    overflow: "hidden",
  },
  levelCardLocked: {
    opacity: 0.6,
  },
  levelCardBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  levelNumberText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
  },
  levelCardContent: {
    padding: 14,
  },
  levelTitleText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
  levelSubtitleText: {
    color: "#94A3B8",
    fontSize: 11,
    marginBottom: 10,
  },
  rewardsRow: {
    flexDirection: "row",
    gap: 10,
  },
  rewardTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#334155",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rewardTagText: {
    color: "#F59E0B",
    fontSize: 11,
    fontWeight: "800",
  },
  closeModalBtn: {
    backgroundColor: "#334155",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  closeModalBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  shopTabsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  shopTabBtn: {
    flex: 1,
    backgroundColor: "#1E293B",
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  shopTabActive: {
    backgroundColor: "#D97706",
    borderColor: "#FEF08A",
  },
  shopTabText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 11,
  },
  shopContentList: {
    gap: 12,
    paddingBottom: 20,
  },
  shopItemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#334155",
    padding: 12,
    gap: 12,
  },
  skinColorPreview: {
    width: 44,
    height: 44,
    borderRadius: 8,
    position: "relative",
  },
  skinCapePreview: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  itemTitle: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  itemDesc: {
    color: "#94A3B8",
    fontSize: 11,
  },
  itemStatText: {
    color: "#FEF08A",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
  equippedBadge: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  equippedBadgeText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 10,
  },
  equipBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  equipBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 11,
  },
  buyBtn: {
    backgroundColor: "#D97706",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buyBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 11,
  },
  gameplayWrapper: {
    flex: 1,
    position: "relative",
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  webCanvas: {
    width: "100%",
    height: "100%",
    maxWidth: 900,
    maxHeight: 500,
    backgroundColor: "#0F172A",
  },
  fallbackCanvasArea: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  virtualTouchOverlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  dpadGroup: {
    flexDirection: "row",
    gap: 12,
  },
  actionGroup: {
    flexDirection: "row",
    gap: 8,
  },
  touchBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(30, 41, 59, 0.85)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  touchBtnLabel: {
    fontSize: 7,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  resultsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  resultBox: {
    width: 300,
    backgroundColor: "#1E293B",
    borderWidth: 3,
    borderColor: "#F59E0B",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  resultTitleText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FEF08A",
    marginTop: 8,
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },
  resultStatLine: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  resultButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    width: "100%",
  },
  resultBtn: {
    flex: 1,
    backgroundColor: "#334155",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  resultBtnText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  keyboardGuideBar: {
    position: "absolute",
    top: 14,
    left: "50%",
    transform: [{ translateX: -200 }],
    width: 400,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.4)",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  keyboardGuideText: {
    color: "#CBD5E1",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },
});
