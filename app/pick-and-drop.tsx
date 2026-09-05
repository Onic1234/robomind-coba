import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet,
  View,
  Text,
  Pressable,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HowToPlayModal } from "../components/HowToPlayModal";
import { COLORS } from "../constants/Theme";

const STORAGE_KEY_LEVEL = "pick_and_drop_current_level";
const STORAGE_KEY_COINS = "user_coins_balance";

export default function PickAndDropScreen() {
  const router = useRouter();

  const [currentLevel, setCurrentLevel] = useState(1);
  const [userCoins, setUserCoins] = useState(1250);
  const [showHelp, setShowHelp] = useState(true);

  // Load Saved Progress
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedLevel = await AsyncStorage.getItem(STORAGE_KEY_LEVEL);
        if (storedLevel) setCurrentLevel(parseInt(storedLevel));
        const storedCoins = await AsyncStorage.getItem(STORAGE_KEY_COINS);
        if (storedCoins) setUserCoins(parseInt(storedCoins));
      } catch (e) {
        console.log("Error loading storage:", e);
      }
    };
    loadStoredData();
  }, []);

  // Sync message events from WebView when level completes or user exits
  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "LEVEL_COMPLETE") {
        const rewardCoins = data.coins || 150;
        const newCoins = userCoins + rewardCoins;
        setUserCoins(newCoins);
        await AsyncStorage.setItem(STORAGE_KEY_COINS, newCoins.toString());
        await AsyncStorage.setItem(STORAGE_KEY_LEVEL, (currentLevel + 1).toString());
      } else if (data.type === "GO_BACK") {
        router.back();
      }
    } catch (e) {
      // Ignore non-json messages
    }
  };

  // Kid-Friendly Cyber MediaPipe Engine HTML Code
  const mediaPipeHtmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Kid-Friendly MediaPipe Pick & Drop Engine</title>
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossorigin="anonymous"></script>
        <style>
            * { box-sizing: border-box; }
            body {
                margin: 0; padding: 0;
                background: #0B0F19; color: #F8FAFC;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                height: 100vh; overflow: hidden; user-select: none;
                display: flex; flex-direction: column;
            }

            .bg-grid {
                position: absolute; inset: 0; pointer-events: none;
                background-image: 
                    radial-gradient(rgba(56, 189, 248, 0.12) 1px, transparent 1px),
                    linear-gradient(to right, rgba(56, 189, 248, 0.03) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(56, 189, 248, 0.03) 1px, transparent 1px);
                background-size: 24px 24px, 48px 48px, 48px 48px;
            }

            .top-hud {
                background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(12px);
                padding: 10px 18px; display: flex; justify-content: space-between; align-items: center;
                border-bottom: 1px solid rgba(56, 189, 248, 0.25); z-index: 50;
            }
            .brand-title { font-size: 1rem; font-weight: 800; color: #F8FAFC; display: flex; align-items: center; gap: 8px; }
            .hud-metrics { display: flex; gap: 10px; }
            .hud-chip {
                background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(56, 189, 248, 0.3);
                padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; color: #E2E8F0;
                display: flex; align-items: center; gap: 6px; box-shadow: 0 0 10px rgba(0,0,0,0.3);
            }
            .chip-highlight { color: #38BDF8; }
            .chip-accent { color: #F59E0B; }

            .main-arena { flex: 1; display: flex; position: relative; overflow: hidden; padding: 12px; gap: 12px; z-index: 10; }
            .sidebar { width: 190px; display: flex; flex-direction: column; gap: 10px; }
            .cam-card {
                width: 100%; background: rgba(15, 23, 42, 0.85); border-radius: 12px;
                overflow: hidden; position: relative; border: 1px solid rgba(56, 189, 248, 0.4);
                padding: 10px 12px; display: flex; align-items: center; gap: 8px;
            }
            #input_video { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
            #output_canvas {
                position: absolute; inset: 0; width: 100%; height: 100%;
                transform: scaleX(-1); object-fit: cover;
            }
            
            .cam-hud-overlay { position: absolute; inset: 0; pointer-events: none; background: transparent; }
            .cam-badge {
                display: flex; align-items: center; gap: 6px;
                background: rgba(15, 23, 42, 0.6); border: 1px solid #0284C7;
                border-radius: 8px; padding: 4px 10px; font-size: 0.7rem; font-weight: 700;
                color: #38BDF8;
            }
            .cam-dot { width: 7px; height: 7px; border-radius: 4px; background: #10B981; box-shadow: 0 0 8px #10B981; }
            .cam-tint {
                position: absolute; inset: 0; pointer-events: none;
                background: rgba(8, 15, 30, 0.45);
            }

            /* Mode Switcher Buttons for Kids */
            .mode-switch-box {
                background: rgba(30, 41, 59, 0.85); border-radius: 14px; padding: 8px;
                border: 1px solid rgba(56, 189, 248, 0.3); display: flex; flex-direction: column; gap: 6px;
            }
            .mode-label { font-size: 0.72rem; font-weight: 800; color: #38BDF8; text-transform: uppercase; }
            .mode-btn {
                background: #0F172A; border: 1px solid #334155; color: #94A3B8;
                padding: 6px 10px; border-radius: 10px; font-size: 0.75rem; font-weight: 700;
                cursor: pointer; transition: all 0.2s; text-align: left; display: flex; align-items: center; gap: 6px;
            }
            .mode-btn.active {
                background: linear-gradient(135deg, #0284C7, #0B84FF); color: #FFFFFF;
                border-color: #38BDF8; box-shadow: 0 0 10px rgba(11, 132, 255, 0.4);
            }

            .guide-panel {
                background: rgba(30, 41, 59, 0.7); border-radius: 14px;
                border: 1px solid rgba(56, 189, 248, 0.2); padding: 10px;
                font-size: 0.73rem; color: #CBD5E1; flex: 1; overflow-y: auto; line-height: 1.35;
            }

            .game-viewport {
                flex: 1; background: #0B1120; border-radius: 20px;
                border: 1px solid rgba(56, 189, 248, 0.3); position: relative; overflow: hidden;
            }
            #output_canvas { z-index: 1; }
            .cam-tint { z-index: 2; }
            #game_canvas { position: relative; z-index: 3; width: 100%; height: 100%; cursor: none; touch-action: none; }

            #toast {
                position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
                padding: 10px 24px; border-radius: 30px; color: white; font-weight: 800;
                font-size: 0.9rem; opacity: 0; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                pointer-events: none; z-index: 100; box-shadow: 0 8px 24px rgba(0,0,0,0.5); text-align: center;
            }
            .toast-ok { background: linear-gradient(135deg, #10B981, #059669); opacity: 1 !important; top: 24px !important; }
            .toast-err { background: linear-gradient(135deg, #EF4444, #DC2626); opacity: 1 !important; top: 24px !important; }

            .overlay {
                position: absolute; inset: 0; background: rgba(11, 15, 25, 0.94);
                display: flex; flex-direction: column; justify-content: center; align-items: center;
                padding: 24px; text-align: center; z-index: 200; backdrop-filter: blur(10px);
            }
            .btn {
                background: linear-gradient(135deg, #0284C7, #0B84FF); color: white;
                border: none; padding: 14px 40px; font-size: 1rem; font-weight: 800;
                border-radius: 30px; cursor: pointer; box-shadow: 0 4px 20px rgba(11, 132, 255, 0.5);
                margin-top: 18px; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.5px;
            }
            .btn:hover { transform: scale(1.04); }
            .hidden { display: none !important; }

            .result-card {
                background: rgba(15, 23, 42, 0.95);
                border: 1px solid rgba(56, 189, 248, 0.4);
                border-radius: 20px;
                padding: 16px 20px;
                width: 100%;
                max-width: 560px;
                box-shadow: 0 0 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.2);
                backdrop-filter: blur(16px);
            }
            .result-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-top: 8px;
            }
            .result-col {
                background: rgba(30, 41, 59, 0.7);
                border: 1px solid rgba(56, 189, 248, 0.25);
                border-radius: 14px;
                padding: 12px;
                text-align: left;
            }
            .btn-ghost {
                background: rgba(30, 41, 59, 0.8);
                border: 1px solid rgba(148, 163, 184, 0.4);
                color: #CBD5E1;
                padding: 10px 18px;
                border-radius: 24px;
                font-size: 0.82rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s;
            }
            .btn-ghost:hover {
                background: rgba(51, 65, 85, 0.9);
                color: #FFFFFF;
            }
            .btn-action {
                background: linear-gradient(135deg, #0284C7, #0B84FF);
                border: none;
                color: white;
                padding: 10px 22px;
                border-radius: 24px;
                font-size: 0.85rem;
                font-weight: 800;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(11, 132, 255, 0.4);
                transition: all 0.2s;
            }
            .btn-action:hover {
                transform: scale(1.03);
            }

            /* Mobile Responsive Styling */
            @media (max-width: 768px) {
                .top-hud {
                    padding: 6px 10px;
                    flex-wrap: nowrap;
                    gap: 6px;
                }
                .brand-title {
                    font-size: 0.78rem;
                    white-space: nowrap;
                }
                .brand-title-full { display: none; }
                .brand-title-short { display: inline; }

                .hud-metrics {
                    gap: 4px;
                }
                .hud-chip {
                    padding: 4px 8px;
                    font-size: 0.72rem;
                    border-radius: 12px;
                    gap: 3px;
                }

                .main-arena {
                    flex-direction: column;
                    padding: 6px;
                    gap: 6px;
                }
                .sidebar {
                    width: 100%;
                    flex-direction: row;
                    align-items: center;
                    gap: 6px;
                }
                .cam-card {
                    width: auto;
                    padding: 6px 8px;
                    border-radius: 10px;
                }
                .cam-badge {
                    font-size: 0.6rem;
                    padding: 3px 6px;
                    border-radius: 6px;
                }

                .mode-switch-box {
                    flex: 1;
                    flex-direction: row;
                    align-items: center;
                    gap: 4px;
                    padding: 4px;
                    overflow-x: auto;
                    border-radius: 10px;
                }
                .mode-label { display: none; }
                .mode-btn {
                    padding: 5px 8px;
                    font-size: 0.7rem;
                    white-space: nowrap;
                    border-radius: 8px;
                    flex: 1;
                    justify-content: center;
                }
                .mode-btn span { font-size: 0.85rem; }

                .guide-panel { display: none; }

                .overlay {
                    padding: 16px;
                }
                .overlay h2 {
                    font-size: 1.15rem !important;
                }
                .overlay p {
                    font-size: 0.78rem !important;
                    max-width: 280px !important;
                }
                .btn {
                    padding: 10px 24px;
                    font-size: 0.85rem;
                    margin-top: 12px;
                }
                .result-card {
                    padding: 12px;
                    max-width: 360px;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                .result-grid {
                    grid-template-columns: 1fr;
                    gap: 8px;
                }
                .result-col {
                    padding: 10px;
                }
                .btn-ghost, .btn-action {
                    width: 100%;
                    text-align: center;
                    padding: 8px 14px;
                    font-size: 0.78rem;
                }
            }
            @media (min-width: 769px) {
                .brand-title-full { display: inline; }
                .brand-title-short { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="bg-grid"></div>

        <div class="top-hud">
            <div class="brand-title">
                <span>🤖</span>
                <span class="brand-title-full">ROBO PICK & DROP • CYBER LAB</span>
                <span class="brand-title-short">CYBER LAB</span>
            </div>
            <div class="hud-metrics">
                <div class="hud-chip">📦 <span class="chip-highlight" id="sorted_count">0</span>/<span id="total_count">0</span></div>
                <div class="hud-chip">⏱️ <span class="chip-accent" id="timer">45</span>s</div>
                <div class="hud-chip">🏆 <span class="chip-highlight" id="score">0</span> PTS</div>
            </div>
        </div>

        <div class="main-arena">
            <div class="sidebar">
                <div class="cam-card">
                    <video id="input_video" playsinline></video>
                    <div class="cam-badge">
                        <div class="cam-dot"></div>
                        <span id="cam_status">Menyiapkan Kamera...</span>
                    </div>
                </div>

                <!-- Kid Mode Switcher -->
                <div class="mode-switch-box">
                    <div class="mode-label">🕹️ MODE KONTROL SD</div>
                    <button class="mode-btn active" id="btn_mode_hover" onclick="setControlMode('hover')">
                        <span>🧲</span> Mode Magnet (SD)
                    </button>
                    <button class="mode-btn" id="btn_mode_pinch" onclick="setControlMode('pinch')">
                        <span>🤏</span> Jepit Santai
                    </button>
                    <button class="mode-btn" id="btn_mode_tap" onclick="setControlMode('tap')">
                        <span>👆</span> Mode Tap Layar
                    </button>
                </div>

                <div class="guide-panel">
                    <b style="color:#38BDF8;" id="guide_title">🧲 Mode Magnet (SD)</b><br>
                    <span id="guide_desc">Arahkan jarimu mendekati item untuk menempel otomatis! Geser ke Pod untuk melepas!</span>
                </div>
            </div>

            <div class="game-viewport" id="arena_bounds">
                <canvas id="output_canvas"></canvas>
                <div class="cam-tint"></div>
                <div id="toast">Feedback</div>
                <canvas id="game_canvas"></canvas>

                <!-- Start Overlay -->
                <div id="start_screen" class="overlay">
                    <div style="font-size: 50px; margin-bottom: 8px;">🤖</div>
                    <h2 style="color:#F8FAFC; margin: 0 0 6px 0; font-size: 1.5rem;">Misi Pemilahan Cyber Robot</h2>
                    <p style="color:#94A3B8; font-size:0.9rem; max-width:400px; margin:0 0 10px 0; line-height: 1.4;">
                        Super mudah untuk Anak SD! Gunakan <b>Mode Magnet Kuis Jari</b> atau Jepit Santai untuk menyortir bekal darurat!
                    </p>
                    <button class="btn" onclick="startGame()">Mulai Misi Pemilahan</button>
                </div>

                <!-- Win / Psychological Report Result Modal Overlay -->
                <div id="win_screen" class="overlay hidden">
                    <div class="result-card">
                        <div style="text-align: center; margin-bottom: 10px;">
                            <div style="font-size: 0.78rem; font-weight: 800; color: #F59E0B; letter-spacing: 2px; text-transform: uppercase;">MISSION COMPLETED</div>
                            <h2 style="color: #10B981; margin: 2px 0; font-size: 1.5rem; font-weight: 900;" id="res_title">LEVEL 1 CLEARED!</h2>
                            <div style="font-size: 0.78rem; color: #94A3B8;">Misi Pemilahan Cyber Robot → Selesai!</div>
                        </div>

                        <div class="result-grid">
                            <!-- LEFT COLUMN: PENCAPAIAN MISI -->
                            <div class="result-col">
                                <div style="font-size: 0.82rem; font-weight: 800; color: #38BDF8; margin-bottom: 6px; text-transform: uppercase; text-align: center;">PENCAPAIAN MISI</div>
                                
                                <div style="font-size: 1.4rem; text-align: center; margin-bottom: 6px;" id="res_stars">⭐⭐⭐</div>

                                <div style="font-size: 0.75rem; color: #CBD5E1; display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px;">
                                    <div>⭐ Item Disortir Tepat: <strong style="color:#10B981;" id="res_item_count">8/8 Item</strong></div>
                                    <div>⭐ Akurasi Pemilahan: <strong style="color:#38BDF8;" id="res_accuracy">100%</strong></div>
                                    <div>⭐ Bonus Waktu Sisa: <strong style="color:#F59E0B;" id="res_time_bonus">+15s</strong></div>
                                </div>

                                <div style="border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 6px; font-size: 0.78rem; color: #CBD5E1;">
                                    <div style="display:flex; justify-content:space-between; margin-bottom: 3px;">
                                        <span>Loot Koin Terkumpul:</span>
                                        <strong style="color:#F59E0B;" id="res_coin_base">+150 Koin</strong>
                                    </div>
                                    <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
                                        <span>Bonus Akurasi Combo:</span>
                                        <strong style="color:#38BDF8;" id="res_coin_bonus">+50 Koin</strong>
                                    </div>
                                    <div style="display:flex; justify-content:space-between; font-size: 0.88rem; font-weight:800; color:#10B981; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 5px;">
                                        <span>TOTAL SOULONS / KOIN:</span>
                                        <span id="res_coin_total" style="color: #F59E0B;">200 KOIN</span>
                                    </div>
                                </div>
                            </div>

                            <!-- RIGHT COLUMN: ANALISIS PERKEMBANGAN OTAK -->
                            <div class="result-col">
                                <div style="font-size: 0.82rem; font-weight: 800; color: #C084FC; margin-bottom: 2px; text-align: center;">🧠 Analisis Perkembangan Otak</div>
                                <div style="font-size: 0.7rem; color: #94A3B8; margin-bottom: 6px; text-align: center;">(Prefrontal Cortex & Kontrol Emosi)</div>

                                <div style="display: flex; justify-content: center; align-items: center;">
                                    <canvas id="radarChartCanvas" width="220" height="180"></canvas>
                                </div>
                            </div>
                        </div>

                        <!-- ACTION BUTTONS -->
                        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 12px; flex-wrap: wrap;">
                            <button class="btn-ghost" onclick="exitGame()">Kembali Ke Peta Utama</button>
                            <button class="btn-action" onclick="startGame()">Lanjut Level ➔</button>
                        </div>
                    </div>
                </div>

                <!-- Lose Overlay -->
                <div id="lose_screen" class="overlay hidden">
                    <div style="font-size: 42px;">⚠️</div>
                    <h2 style="color:#EF4444; margin: 4px 0;">MISI GAGAL</h2>
                    <p id="lose_reason" style="color:#CBD5E1; font-size:0.9rem; margin-top:0;"></p>
                    <button class="btn" onclick="startGame()">Coba Lagi</button>
                </div>
            </div>
        </div>

        <script>
            // Master Items Catalog
            const POOL = [
                { name: 'Air Minum', emoji: '💧', category: 'essential', col1: '#0284C7', col2: '#38BDF8' },
                { name: 'Kotak P3K', emoji: '🩹', category: 'essential', col1: '#0284C7', col2: '#38BDF8' },
                { name: 'Senter LED', emoji: '🔦', category: 'essential', col1: '#0284C7', col2: '#38BDF8' },
                { name: 'Jas Hujan', emoji: '🧥', category: 'essential', col1: '#0284C7', col2: '#38BDF8' },
                { name: 'Inti Plasma', emoji: '⚡', category: 'energy', col1: '#059669', col2: '#34D399' },
                { name: 'Kabel Micro', emoji: '🔌', category: 'energy', col1: '#059669', col2: '#34D399' },
                { name: 'Solar Cell', emoji: '☀️', category: 'energy', col1: '#059669', col2: '#34D399' },
                { name: 'Chip CPU', emoji: '💻', category: 'energy', col1: '#059669', col2: '#34D399' },
                { name: 'Limbah Beracun', emoji: '☣️', category: 'hazard', col1: '#E11D48', col2: '#FB7185' },
                { name: 'Batu Runtuhan', emoji: '🪨', category: 'hazard', col1: '#E11D48', col2: '#FB7185' },
                { name: 'Mainan Rusak', emoji: '🧸', category: 'hazard', col1: '#E11D48', col2: '#FB7185' }
            ];

            const PODS = [
                { id: 'essential', title: 'POD BEKAL', sub: 'Suplai Darurat', emoji: '🎒', color: '#38BDF8', bg1: 'rgba(14, 165, 233, 0.2)', bg2: 'rgba(3, 105, 161, 0.4)' },
                { id: 'energy', title: 'POD ENERGI', sub: 'Modul Robot', emoji: '⚡', color: '#34D399', bg1: 'rgba(16, 185, 129, 0.2)', bg2: 'rgba(4, 120, 87, 0.4)' },
                { id: 'hazard', title: 'PERISAI LIMBAH', sub: 'Sampah Beracun', emoji: '🛑', color: '#F87171', bg1: 'rgba(239, 68, 68, 0.2)', bg2: 'rgba(185, 28, 28, 0.4)' }
            ];

            let gameActive = false, timeLeft = 45, timer = null;
            let items = [], sorted = 0, score = 0, combo = 0;
            let correct = 0, wrong = 0;
            let animFrameId = null;

            // Kid-Friendly Control Mode State ('hover' | 'pinch' | 'tap')
            let currentControlMode = 'hover';

            const cursor = { x: 0, y: 0, pinching: false, item: null, hoverTimer: 0 };
            // FORGIVING KID PINCH THRESHOLD (0.095 instead of 0.055)
            const FORGIVING_PINCH_THRESH = 0.095;

            const canvas = document.getElementById('game_canvas');
            const ctx = canvas.getContext('2d');
            const outCanvas = document.getElementById('output_canvas');
            const outCtx = outCanvas.getContext('2d');
            const video = document.getElementById('input_video');

            function resize() {
                const b = document.getElementById('arena_bounds');
                if (b) {
                    canvas.width = b.clientWidth; canvas.height = b.clientHeight;
                    outCanvas.width = b.clientWidth; outCanvas.height = b.clientHeight;
                }
            }
            window.onresize = resize; setTimeout(resize, 100); resize();

            // Mode Switcher Handler
            function setControlMode(mode) {
                currentControlMode = mode;
                document.getElementById('btn_mode_hover').className = 'mode-btn' + (mode === 'hover' ? ' active' : '');
                document.getElementById('btn_mode_pinch').className = 'mode-btn' + (mode === 'pinch' ? ' active' : '');
                document.getElementById('btn_mode_tap').className = 'mode-btn' + (mode === 'tap' ? ' active' : '');

                if (mode === 'hover') {
                    document.getElementById('guide_title').innerText = '🧲 Mode Magnet (SD)';
                    document.getElementById('guide_desc').innerText = 'Arahkan jarimu dekat ke item untuk menempel otomatis! Geser ke Pod untuk melepas!';
                } else if (mode === 'pinch') {
                    document.getElementById('guide_title').innerText = '🤏 Mode Jepit Santai';
                    document.getElementById('guide_desc').innerText = 'Dekatkan ibu jari dan telunjuk untuk menjepit item dengan lebih mudah & santai!';
                } else {
                    document.getElementById('guide_title').innerText = '👆 Mode Tap Layar';
                    document.getElementById('guide_desc').innerText = 'Sentuh item yang diinginkan, lalu sentuh Pod tujuan untuk memasukkannya!';
                }
            }

            // MediaPipe Hands Pipeline Init
            let hands = null;
            try {
                if (typeof Hands !== 'undefined') {
                    hands = new Hands({ locateFile: f => 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/' + f });
                    hands.setOptions({ maxNumHands: 1, modelComplexity: 0, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
                    hands.onResults(onResults);
                }
            } catch (e) {
                console.warn("Hands init warning:", e);
            }

            // Custom Camera Feed Init with Graceful Fallback
            async function startCameraFeed() {
                const statusEl = document.getElementById('cam_status');
                try {
                    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                        throw new Error("Camera API not supported");
                    }
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            width: { ideal: 640 },
                            height: { ideal: 480 },
                            facingMode: 'user'
                        }
                    });
                    video.srcObject = stream;
                    await video.play();
                    if (statusEl) statusEl.innerText = "MediaPipe Active";

                    async function streamLoop() {
                        if (hands && video.readyState >= 2 && !video.paused && !video.ended) {
                            try {
                                await hands.send({ image: video });
                            } catch (e) {
                                console.warn("Hands send error:", e);
                            }
                        }
                        requestAnimationFrame(streamLoop);
                    }
                    requestAnimationFrame(streamLoop);
                } catch (err) {
                    console.warn("Camera access fallback:", err);
                    if (statusEl) statusEl.innerText = "Touch Mode";
                    toast("📷 Kamera sedang digunakan / offline. Menggunakan Mode Touch!", false);
                    setControlMode('tap');
                }
            }

            startCameraFeed();

            function onResults(res) {
                const cw = outCanvas.width || 320;
                const ch = outCanvas.height || 240;
                const imgW = (res.image && (res.image.videoWidth || res.image.width)) || cw;
                const imgH = (res.image && (res.image.videoHeight || res.image.height)) || ch;

                // Cover-crop the camera so it fills the whole game viewport without distortion
                const scale = Math.max(cw / imgW, ch / imgH);
                const dw = imgW * scale;
                const dh = imgH * scale;
                const dx = (cw - dw) / 2;
                const dy = (ch - dh) / 2;

                outCtx.save();
                outCtx.clearRect(0, 0, cw, ch);
                outCtx.drawImage(res.image, dx, dy, dw, dh);

                // Map normalized hand coords:
                // cursorX for game_canvas (no CSS flip): cw - dx - x * dw
                // canvasX for outCtx drawing (has CSS scaleX(-1) flip): dx + x * dw
                const cursorX = (x) => cw - dx - x * dw;
                const canvasX = (x) => dx + x * dw;
                const my = (y) => dy + y * dh;

                if (res.multiHandLandmarks && res.multiHandLandmarks.length > 0) {
                    const lm = res.multiHandLandmarks[0];
                    const idx = lm[8], thm = lm[4];
                    cursor.x = cursorX(idx.x);
                    cursor.y = my(idx.y);
                    const dist = Math.hypot(idx.x - thm.x, idx.y - thm.y);

                    // Uses Forgiving Pinch Threshold
                    const isPinch = dist < FORGIVING_PINCH_THRESH;

                    const wasPinch = cursor.pinching;
                    cursor.pinching = isPinch;

                    if (gameActive) {
                        if (currentControlMode === 'hover') {
                            // HOVER MAGNET MODE FOR SD KIDS
                            if (!cursor.item) {
                                // Auto grab if close to item (within 55px radius)
                                for (let i = items.length - 1; i >= 0; i--) {
                                    const it = items[i];
                                    if (Math.hypot(cursor.x - it.x, cursor.y - it.y) < 55) {
                                        cursor.item = it; items.splice(i, 1);
                                        toast('🧲 Magnet Terhubung!', true);
                                        break;
                                    }
                                }
                            } else {
                                // Auto drop if over Pod zone
                                const podY = canvas.height - 120;
                                if (cursor.y >= podY) {
                                    cursor.hoverTimer += 1;
                                    if (cursor.hoverTimer > 8) { // 200ms hold
                                        tryDrop();
                                        cursor.hoverTimer = 0;
                                    }
                                } else {
                                    cursor.hoverTimer = 0;
                                }
                            }
                        } else if (currentControlMode === 'pinch') {
                            // FORGIVING PINCH MODE
                            if (isPinch && !wasPinch) tryGrab();
                            else if (!isPinch && wasPinch) tryDrop();
                        }
                    }

                    // Draw hand skeleton aligned with CSS scaleX(-1) flipped canvas
                    HAND_CONNECTIONS.forEach(function (pair) {
                        const a = lm[pair[0]];
                        const b = lm[pair[1]];
                        outCtx.beginPath();
                        outCtx.moveTo(canvasX(a.x), my(a.y));
                        outCtx.lineTo(canvasX(b.x), my(b.y));
                        outCtx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
                        outCtx.lineWidth = 2.5;
                        outCtx.stroke();
                    });
                    lm.forEach(function (pt) {
                        outCtx.beginPath();
                        outCtx.arc(canvasX(pt.x), my(pt.y), 4, 0, Math.PI * 2);
                        outCtx.fillStyle = '#10B981';
                        outCtx.fill();
                    });
                }
                outCtx.restore();
            }

            // Touch / Mouse Tap Listener
            let touching = false;
            canvas.onpointerdown = e => {
                const r = canvas.getBoundingClientRect();
                cursor.x = e.clientX - r.left; cursor.y = e.clientY - r.top;
                cursor.pinching = true; touching = true;

                if (gameActive) {
                    if (currentControlMode === 'tap') {
                        // TAP MODE (Tap Item -> Tap Pod)
                        if (!cursor.item) {
                            tryGrab();
                        } else {
                            const podY = canvas.height - 120;
                            if (cursor.y >= podY) tryDrop();
                            else {
                                // Deselect
                                items.push({ ...cursor.item, x: cursor.x, y: cursor.y });
                                cursor.item = null;
                            }
                        }
                    } else {
                        tryGrab();
                    }
                }
            };

            canvas.onpointermove = e => {
                if (touching) {
                    const r = canvas.getBoundingClientRect();
                    cursor.x = e.clientX - r.left; cursor.y = e.clientY - r.top;
                }
            };

            window.onpointerup = () => {
                if (touching) {
                    cursor.pinching = false; touching = false;
                    if (gameActive && currentControlMode !== 'tap') tryDrop();
                }
            };

            function startGame() {
                document.getElementById('start_screen').classList.add('hidden');
                document.getElementById('win_screen').classList.add('hidden');
                document.getElementById('lose_screen').classList.add('hidden');

                gameActive = true; sorted = 0; score = 0; combo = 0; correct = 0; wrong = 0; timeLeft = 45; items = [];
                cursor.item = null; cursor.hoverTimer = 0;

                for (let i = 0; i < 8; i++) {
                    const t = POOL[Math.floor(Math.random() * POOL.length)];
                    items.push({
                        ...t, id: i,
                        x: 60 + Math.random() * (canvas.width - 120),
                        y: 50 + Math.random() * (canvas.height - 200),
                        r: 36, floatSeed: Math.random() * 10
                    });
                }

                document.getElementById('total_count').innerText = 8;
                document.getElementById('sorted_count').innerText = 0;
                document.getElementById('score').innerText = 0;
                document.getElementById('timer').innerText = timeLeft;

                if (timer) clearInterval(timer);
                timer = setInterval(() => {
                    timeLeft--;
                    document.getElementById('timer').innerText = timeLeft;
                    if (timeLeft <= 0) endGame(true, "Waktu Misi Habis!");
                }, 1000);

                if (animFrameId) cancelAnimationFrame(animFrameId);
                animFrameId = requestAnimationFrame(loop);
            }

            function tryGrab() {
                if (cursor.item) return;
                for (let i = items.length - 1; i >= 0; i--) {
                    const it = items[i];
                    if (Math.hypot(cursor.x - it.x, cursor.y - it.y) < it.r + 20) {
                        cursor.item = it; items.splice(i, 1); break;
                    }
                }
            }

            function tryDrop() {
                if (!cursor.item) return;
                const it = cursor.item;
                const podW = canvas.width / 3;
                const podY = canvas.height - 120;

                if (cursor.y >= podY) {
                    const idx = Math.min(2, Math.max(0, Math.floor(cursor.x / podW)));
                    const pod = PODS[idx];
                    sorted++;
                    document.getElementById('sorted_count').innerText = sorted;

                    if (it.category === pod.id) {
                        correct++; combo++;
                        const pts = 100 + combo * 25; score += pts;
                        document.getElementById('score').innerText = score;
                        toast('+' + pts + ' PTS! Tepat ' + it.name, true);
                    } else {
                        wrong++; combo = 0;
                        toast('❌ Salah Pod! ' + it.name, false);
                    }

                    cursor.item = null;
                    if (sorted >= 8 || items.length === 0) {
                        endGame(true, "Misi Pemilahan Selesai!");
                    }
                } else {
                    items.push({ ...it, x: cursor.x, y: cursor.y });
                    cursor.item = null;
                }
            }

            function endGame(win = true, reason = "") {
                gameActive = false; clearInterval(timer);
                
                const totalProcessed = Math.max(1, correct + wrong);
                const totalAccuracy = Math.round((correct / totalProcessed) * 100);
                const timeBonus = Math.max(0, timeLeft);
                const baseCoin = 100 + (correct * 10);
                const bonusCoin = Math.round((totalAccuracy / 100) * 50);
                const totalCoins = baseCoin + bonusCoin;

                // Dynamic Header Title & Stars based on accuracy
                let titleText = "LEVEL 1 CLEARED!";
                let starsText = "⭐⭐⭐";
                if (totalAccuracy >= 85 && correct >= 6) {
                    titleText = "EXCELLENT! LEVEL 1 CLEARED!";
                    starsText = "⭐⭐⭐";
                } else if (totalAccuracy >= 50) {
                    titleText = "BAGUS! LEVEL 1 CLEARED!";
                    starsText = "⭐⭐☆";
                } else {
                    titleText = "MISI SELESAI! TETAP SEMANGAT!";
                    starsText = "⭐☆☆";
                }

                // Scores for 5 axis (30 - 100)
                const logikaSpasial = Math.min(100, Math.max(40, totalAccuracy));
                const keputusanCepat = Math.min(100, Math.max(40, Math.round(60 + (timeBonus / 45) * 40)));
                const kontrolDiri = Math.max(30, 100 - (wrong * 20));
                const memoriKerja = Math.min(100, Math.max(40, Math.round(60 + (combo * 8))));
                const fokusAtensi = Math.round((logikaSpasial * 0.4 + kontrolDiri * 0.3 + keputusanCepat * 0.3));

                document.getElementById('res_title').innerText = titleText;
                document.getElementById('res_stars').innerText = starsText;
                document.getElementById('res_item_count').innerText = correct + '/' + totalProcessed + ' Item Tepat';
                document.getElementById('res_accuracy').innerText = totalAccuracy + '%';
                document.getElementById('res_time_bonus').innerText = '+' + timeBonus + 's';
                document.getElementById('res_coin_base').innerText = '+' + baseCoin + ' Koin';
                document.getElementById('res_coin_bonus').innerText = '+' + bonusCoin + ' Koin';
                document.getElementById('res_coin_total').innerText = totalCoins + ' KOIN';

                document.getElementById('win_screen').classList.remove('hidden');

                setTimeout(() => {
                    drawRadarChart([logikaSpasial, keputusanCepat, kontrolDiri, memoriKerja, fokusAtensi]);
                }, 50);

                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LEVEL_COMPLETE', coins: totalCoins }));
                }
            }

            function exitGame() {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'GO_BACK' }));
                } else {
                    window.history.back();
                }
            }

            function drawRadarChart(scores) {
                const canvas = document.getElementById('radarChartCanvas');
                if (!canvas) return;
                const rctx = canvas.getContext('2d');
                const w = canvas.width;
                const h = canvas.height;
                rctx.clearRect(0, 0, w, h);

                const centerX = w / 2;
                const centerY = h / 2 - 2;
                const radius = 55;
                const labels = ['Spasial', 'Keputusan', 'Kontrol Diri', 'Memori Kerja', 'Fokus'];
                const numPoints = labels.length;

                // Background Polygon Webs
                for (let level = 1; level <= 4; level++) {
                    const r = (radius / 4) * level;
                    rctx.beginPath();
                    for (let i = 0; i < numPoints; i++) {
                        const angle = (i * 2 * Math.PI / numPoints) - (Math.PI / 2);
                        const x = centerX + r * Math.cos(angle);
                        const y = centerY + r * Math.sin(angle);
                        if (i === 0) rctx.moveTo(x, y);
                        else rctx.lineTo(x, y);
                    }
                    rctx.closePath();
                    rctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
                    rctx.lineWidth = 1;
                    rctx.stroke();
                }

                // Axis Lines & Labels
                for (let i = 0; i < numPoints; i++) {
                    const angle = (i * 2 * Math.PI / numPoints) - (Math.PI / 2);
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);
                    rctx.beginPath();
                    rctx.moveTo(centerX, centerY);
                    rctx.lineTo(x, y);
                    rctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                    rctx.stroke();

                    const labelRadius = radius + 16;
                    const lx = centerX + labelRadius * Math.cos(angle);
                    const ly = centerY + labelRadius * Math.sin(angle);
                    rctx.fillStyle = '#CBD5E1';
                    rctx.font = 'bold 9px sans-serif';
                    rctx.textAlign = Math.abs(lx - centerX) < 5 ? 'center' : (lx > centerX ? 'left' : 'right');
                    rctx.textBaseline = Math.abs(ly - centerY) < 5 ? 'middle' : (ly > centerY ? 'top' : 'bottom');
                    rctx.fillText(labels[i], lx, ly);
                }

                // Filled Data Polygon
                rctx.beginPath();
                for (let i = 0; i < numPoints; i++) {
                    const score = scores[i] / 100;
                    const angle = (i * 2 * Math.PI / numPoints) - (Math.PI / 2);
                    const x = centerX + (radius * score) * Math.cos(angle);
                    const y = centerY + (radius * score) * Math.sin(angle);
                    if (i === 0) rctx.moveTo(x, y);
                    else rctx.lineTo(x, y);
                }
                rctx.closePath();

                rctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
                rctx.fill();
                rctx.strokeStyle = '#C084FC';
                rctx.lineWidth = 2;
                rctx.stroke();

                // Data Dots
                for (let i = 0; i < numPoints; i++) {
                    const score = scores[i] / 100;
                    const angle = (i * 2 * Math.PI / numPoints) - (Math.PI / 2);
                    const x = centerX + (radius * score) * Math.cos(angle);
                    const y = centerY + (radius * score) * Math.sin(angle);
                    rctx.beginPath();
                    rctx.arc(x, y, 3.5, 0, Math.PI * 2);
                    rctx.fillStyle = '#F0ABFC';
                    rctx.fill();
                }
            }

            function toast(msg, ok) {
                const t = document.getElementById('toast');
                t.innerText = msg; t.className = ok ? 'toast-ok' : 'toast-err';
                setTimeout(() => t.className = '', 2000);
            }

            // Rich Animated Rendering Engine Loop
            let timeStep = 0;
            function loop() {
                if (!gameActive) return;
                timeStep += 0.04;
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Scanner Beam
                const scanY = (Math.sin(timeStep * 0.5) + 1) * (canvas.height / 2);
                const scanGrad = ctx.createLinearGradient(0, scanY - 15, 0, scanY + 15);
                scanGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
                scanGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
                scanGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
                ctx.fillStyle = scanGrad;
                ctx.fillRect(0, scanY - 15, canvas.width, 30);

                // Draw Pods
                const podW = canvas.width / 3;
                const podY = canvas.height - 120;
                const podH = 110;

                PODS.forEach((p, i) => {
                    const px = i * podW;
                    const isHover = (cursor.y >= podY && Math.floor(cursor.x / podW) === i);

                    const podGrad = ctx.createLinearGradient(px, podY, px, podY + podH);
                    podGrad.addColorStop(0, isHover ? p.bg1.replace('0.2', '0.45') : p.bg1);
                    podGrad.addColorStop(1, p.bg2);

                    ctx.save();
                    ctx.beginPath();
                    ctx.roundRect(px + 6, podY + 4, podW - 12, podH - 8, [16, 16, 0, 0]);
                    ctx.fillStyle = podGrad;
                    ctx.fill();

                    ctx.strokeStyle = isHover ? '#FFFFFF' : p.color;
                    ctx.lineWidth = isHover ? 3 : 2;
                    ctx.stroke();

                    ctx.fillStyle = p.color; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
                    ctx.fillText(p.emoji + ' ' + p.title, px + podW/2, podY + 32);

                    ctx.fillStyle = '#94A3B8'; ctx.font = '10px sans-serif';
                    ctx.fillText(p.sub, px + podW/2, podY + 50);

                    ctx.strokeStyle = isHover ? p.color : 'rgba(148, 163, 184, 0.3)';
                    ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
                    ctx.strokeRect(px + 20, podY + 62, podW - 40, 32);
                    ctx.setLineDash([]);

                    ctx.fillStyle = isHover ? p.color : '#64748B';
                    ctx.font = 'bold 9px sans-serif';
                    ctx.fillText(isHover ? '🎯 DROP DI SINI!' : 'Target Zone', px + podW/2, podY + 82);

                    ctx.restore();
                });

                // Magnet Attraction Beam Visualizer in Hover Mode
                if (currentControlMode === 'hover' && !cursor.item) {
                    items.forEach(it => {
                        const dist = Math.hypot(cursor.x - it.x, cursor.y - it.y);
                        if (dist < 90) {
                            ctx.save();
                            ctx.beginPath();
                            ctx.moveTo(cursor.x, cursor.y); ctx.lineTo(it.x, it.y);
                            ctx.strokeStyle = 'rgba(56, 189, 248, ' + (1 - dist/90) + ')';
                            ctx.lineWidth = 2; ctx.setLineDash([3, 3]);
                            ctx.stroke();
                            ctx.restore();
                        }
                    });
                }

                // Draw Orbs
                items.forEach(it => {
                    it.y += Math.sin(timeStep + it.floatSeed) * 0.4;
                    drawItemOrb(it);
                });

                // Grabbed Item
                if (cursor.item) {
                    cursor.item.x = cursor.x; cursor.item.y = cursor.y;
                    drawItemOrb(cursor.item, true);
                }

                // Draw Cursor Reticle
                drawCyberCursor();

                animFrameId = requestAnimationFrame(loop);
            }

            function drawItemOrb(it, held = false) {
                ctx.save();
                if (held) {
                    ctx.shadowBlur = 24; ctx.shadowColor = '#38BDF8';
                }

                const radGrad = ctx.createRadialGradient(it.x - 8, it.y - 8, 4, it.x, it.y, it.r);
                radGrad.addColorStop(0, '#FFFFFF');
                radGrad.addColorStop(0.3, it.col2);
                radGrad.addColorStop(1, it.col1);

                ctx.beginPath(); ctx.arc(it.x, it.y, it.r, 0, Math.PI*2);
                ctx.fillStyle = radGrad; ctx.fill();

                ctx.strokeStyle = held ? '#FFFFFF' : '#38BDF8';
                ctx.lineWidth = held ? 3 : 2; ctx.stroke();

                ctx.beginPath();
                ctx.arc(it.x, it.y, it.r - 4, Math.PI * 1.1, Math.PI * 1.5);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'; ctx.lineWidth = 2.5;
                ctx.stroke();

                ctx.font = '24px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(it.emoji, it.x, it.y - 2);

                ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
                ctx.beginPath(); ctx.roundRect(it.x - 32, it.y + 20, 64, 16, 8); ctx.fill();
                ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)'; ctx.lineWidth = 1; ctx.stroke();

                ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 9px sans-serif';
                ctx.fillText(it.name, it.x, it.y + 28);

                ctx.restore();
            }

            function drawCyberCursor() {
                ctx.save();
                const r = cursor.pinching ? 14 : 26;

                ctx.save();
                ctx.translate(cursor.x, cursor.y);
                ctx.rotate(timeStep * 1.5);
                ctx.beginPath(); ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
                ctx.setLineDash([6, 6]);
                ctx.strokeStyle = cursor.pinching ? '#10B981' : '#38BDF8';
                ctx.lineWidth = 2; ctx.stroke();
                ctx.restore();

                ctx.beginPath(); ctx.arc(cursor.x, cursor.y, r, 0, Math.PI * 2);
                ctx.fillStyle = cursor.pinching ? 'rgba(16, 185, 129, 0.3)' : 'rgba(56, 189, 248, 0.2)';
                ctx.fill();

                ctx.strokeStyle = cursor.pinching ? '#10B981' : '#38BDF8';
                ctx.lineWidth = 2; ctx.beginPath();
                ctx.moveTo(cursor.x - r - 6, cursor.y); ctx.lineTo(cursor.x + r + 6, cursor.y);
                ctx.moveTo(cursor.x, cursor.y - r - 6); ctx.lineTo(cursor.x, cursor.y + r + 6);
                ctx.stroke();

                ctx.beginPath(); ctx.arc(cursor.x, cursor.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = cursor.pinching ? '#10B981' : '#38BDF8'; ctx.fill();

                let statusTxt = '🧲 MAGNET HOVER';
                if (currentControlMode === 'pinch') statusTxt = cursor.pinching ? '✊ JEPIT ACTIVE' : '🤏 JEPIT PICK';
                else if (currentControlMode === 'tap') statusTxt = cursor.item ? '📦 ITEM TERPILIH' : '👆 TAP ITEM';

                ctx.fillStyle = cursor.pinching ? '#10B981' : '#38BDF8';
                ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
                ctx.fillText(statusTxt, cursor.x, cursor.y - r - 12);

                ctx.restore();
            }
        </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Top App Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        </Pressable>
        <Pressable style={styles.helpButton} onPress={() => setShowHelp(true)}>
          <Ionicons name="help-circle" size={22} color="#006874" />
        </Pressable>

        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Robo Pick & Drop</Text>
          <Text style={styles.headerSubtitle}>Mode Kontrol Anak SD • Level {currentLevel}</Text>
        </View>

        <View style={styles.coinsBadge}>
          <Ionicons name="cash" size={16} color="#F59E0B" />
          <Text style={styles.coinsText}>{userCoins}</Text>
        </View>
      </View>

      {/* MediaPipe Embedded Camera Engine Container */}
      <View style={styles.webViewContainer}>
        <iframe
          srcDoc={mediaPipeHtmlContent}
          style={{ width: "100%", height: "100%", borderWidth: 0 }}
        />
      </View>

      <HowToPlayModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title="Cara Main Robo Pick & Drop"
        goal="Sortir semua barang yang jatuh ke Pod dengan warna yang sesuai sebelum waktu habis!"
        accentColor="#0891B2"
        subtitleColor="#0E7490"
        steps={[
          { emoji: "1️⃣", text: "Pilih mode kontrol: Hover (otomatis menangkap), Cubit (pinch), atau Tap (sentuh)." },
          { emoji: "2️⃣", text: "Arahkan tangan (webcam) atau jari untuk mengambil barang yang jatuh." },
          { emoji: "3️⃣", text: "Bawa barang ke Pod dengan warna yang sesuai: Bekal, Energi, atau Limbah." },
          { emoji: "4️⃣", text: "Sortir semua 8 barang sebelum waktu 45 detik habis untuk menang!" },
        ]}
        tips={[
          "Mode Hover paling mudah untuk anak-anak — jari dekat barang langsung menangkap.",
          "Barang berbahaya/limbah harus masuk Pod yang benar, jangan asal taruh.",
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  titleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
  },
  coinsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  coinsText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#D97706",
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: "#0B0F19",
  },
});
