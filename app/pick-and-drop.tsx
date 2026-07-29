import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../constants/Theme";

const STORAGE_KEY_LEVEL = "pick_and_drop_current_level";
const STORAGE_KEY_COINS = "user_coins_balance";

export default function PickAndDropScreen() {
  const router = useRouter();

  const [currentLevel, setCurrentLevel] = useState(1);
  const [userCoins, setUserCoins] = useState(1250);

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

  // Sync message events from WebView when level completes
  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "LEVEL_COMPLETE") {
        const rewardCoins = data.coins || 150;
        const newCoins = userCoins + rewardCoins;
        setUserCoins(newCoins);
        await AsyncStorage.setItem(STORAGE_KEY_COINS, newCoins.toString());
        await AsyncStorage.setItem(STORAGE_KEY_LEVEL, (currentLevel + 1).toString());
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
                width: 100%; aspect-ratio: 4/3; background: #000; border-radius: 16px;
                overflow: hidden; position: relative; border: 2px solid #38BDF8;
                box-shadow: 0 0 20px rgba(56, 189, 248, 0.35);
            }
            #input_video { display: none; }
            #output_canvas { width: 100%; height: 100%; transform: scaleX(-1); object-fit: cover; }
            
            .cam-hud-overlay {
                position: absolute; inset: 0; pointer-events: none;
                border: 1px solid rgba(56, 189, 248, 0.4);
                background: radial-gradient(circle, transparent 60%, rgba(0, 0, 0, 0.5) 100%);
            }
            .cam-badge {
                position: absolute; bottom: 6px; left: 6px; right: 6px;
                background: rgba(15, 23, 42, 0.9); border: 1px solid #0284C7;
                border-radius: 8px; padding: 3px 6px; font-size: 0.65rem; font-weight: 700;
                color: #38BDF8; display: flex; align-items: center; gap: 4px;
            }
            .cam-dot { width: 6px; height: 6px; border-radius: 3px; background: #10B981; box-shadow: 0 0 8px #10B981; }

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
                flex: 1; background: rgba(15, 23, 42, 0.85); border-radius: 20px;
                border: 1px solid rgba(56, 189, 248, 0.3); position: relative; overflow: hidden;
                box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.5);
            }
            #game_canvas { width: 100%; height: 100%; cursor: none; touch-action: none; }

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

            .report-card {
                background: rgba(30, 41, 59, 0.9); border-radius: 20px; padding: 18px;
                width: 100%; max-width: 440px; margin-top: 14px;
                border: 1px solid rgba(56, 189, 248, 0.3); text-align: left;
                box-shadow: 0 10px 30px rgba(0,0,0,0.4);
            }
            .metric-row { margin-bottom: 10px; }
            .metric-lbl { display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700; color: #E2E8F0; margin-bottom: 4px; }
            .bar-track { height: 10px; background: #0F172A; border-radius: 5px; overflow: hidden; border: 1px solid #334155; }
            .bar-fill { height: 100%; border-radius: 5px; transition: width 0.6s ease; }
        </style>
    </head>
    <body>
        <div class="bg-grid"></div>

        <div class="top-hud">
            <div class="brand-title">🤖 ROBO PICK & DROP • CYBER LAB</div>
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
                    <canvas id="output_canvas"></canvas>
                    <div class="cam-hud-overlay"></div>
                    <div class="cam-badge">
                        <div class="cam-dot"></div>
                        <span id="cam_status">MediaPipe Active</span>
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

                <!-- Win / Psychological Report Overlay -->
                <div id="win_screen" class="overlay hidden">
                    <div style="font-size: 42px;">🎉</div>
                    <h2 style="color:#10B981; margin:0;">MISI BERHASIL!</h2>
                    <p style="color:#94A3B8; font-size:0.85rem; margin-top:2px;">Evaluasi Persentase Psikologi Anak (%):</p>
                    <div class="report-card">
                        <div style="text-align:center; margin-bottom:12px;">
                            <div style="font-size:0.75rem; color:#94A3B8;">Indeks Perkembangan Keseluruhan</div>
                            <div id="psych_overall" style="font-size:2.5rem; font-weight:900; color:#38BDF8;">92%</div>
                        </div>
                        <div class="metric-row">
                            <div class="metric-lbl"><span>🧠 Logika Spasial & Kategorisasi</span><span id="p_logika">95%</span></div>
                            <div class="bar-track"><div id="b_logika" class="bar-fill" style="width:95%; background: linear-gradient(90deg, #3B82F6, #60A5FA);"></div></div>
                        </div>
                        <div class="metric-row">
                            <div class="metric-lbl"><span>🎯 Fokus & Atensi Visual</span><span id="p_focus">88%</span></div>
                            <div class="bar-track"><div id="b_focus" class="bar-fill" style="width:88%; background: linear-gradient(90deg, #10B981, #34D399);"></div></div>
                        </div>
                        <div class="metric-row">
                            <div class="metric-lbl"><span>⚡ Speed & Motorik Halus Jari</span><span id="p_motorik">90%</span></div>
                            <div class="bar-track"><div id="b_motorik" class="bar-fill" style="width:90%; background: linear-gradient(90deg, #F59E0B, #FBBF24);"></div></div>
                        </div>
                        <div class="metric-row">
                            <div class="metric-lbl"><span>🧩 Pemecahan Masalah Eksekutif</span><span id="p_problem">91%</span></div>
                            <div class="bar-track"><div id="b_problem" class="bar-fill" style="width:91%; background: linear-gradient(90deg, #8B5CF6, #A78BFA);"></div></div>
                        </div>
                    </div>
                    <button class="btn" onclick="startGame()">Mainkan Lagi</button>
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
                canvas.width = b.clientWidth; canvas.height = b.clientHeight;
                outCanvas.width = 190; outCanvas.height = 142;
            }
            window.onresize = resize; resize();

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
            const hands = new Hands({ locateFile: f => 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/' + f });
            hands.setOptions({ maxNumHands: 1, modelComplexity: 0, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
            hands.onResults(onResults);

            const cam = new Camera(video, {
                onFrame: async () => { await hands.send({ image: video }); },
                width: 320, height: 240
            });
            cam.start().catch(err => {
                document.getElementById('cam_status').innerText = "Touch Mode";
            });

            function onResults(res) {
                outCtx.save();
                outCtx.clearRect(0,0,190,142);
                outCtx.drawImage(res.image, 0,0,190,142);
                if (res.multiHandLandmarks && res.multiHandLandmarks.length > 0) {
                    const lm = res.multiHandLandmarks[0];
                    const idx = lm[8], thm = lm[4];
                    const cx = (1 - idx.x) * canvas.width;
                    const cy = idx.y * canvas.height;
                    const dist = Math.hypot(idx.x - thm.x, idx.y - thm.y);
                    
                    // Uses Forgiving Pinch Threshold
                    const isPinch = dist < FORGIVING_PINCH_THRESH;

                    const wasPinch = cursor.pinching;
                    cursor.x = cx; cursor.y = cy; cursor.pinching = isPinch;

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
                    drawConnectors(outCtx, lm, HAND_CONNECTIONS, { color: '#38BDF8', lineWidth: 1.5 });
                    drawLandmarks(outCtx, lm, { color: '#10B981', lineWidth: 1, radius: 2 });
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
                    if (timeLeft <= 0) endGame(false, "Waktu Misi Habis!");
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
                    if (it.category === pod.id) {
                        correct++; sorted++; combo++;
                        const pts = 100 + combo * 25; score += pts;
                        document.getElementById('sorted_count').innerText = sorted;
                        document.getElementById('score').innerText = score;
                        toast('+' + pts + ' PTS! Tepat ' + it.name, true);
                        if (sorted >= 8) endGame(true);
                    } else {
                        wrong++; combo = 0;
                        toast('Salah Pod!', false);
                    }
                } else {
                    items.push({ ...it, x: cursor.x, y: cursor.y });
                }
                cursor.item = null;
            }

            function endGame(win, reason = "") {
                gameActive = false; clearInterval(timer);
                if (win) {
                    const acc = (correct / (correct + wrong)) || 1;
                    const log = Math.min(100, Math.round(acc * 96));
                    const foc = Math.min(100, Math.round(acc * 88 + (timeLeft/45)*12));
                    const mot = Math.min(100, Math.round(acc * 90 + (combo > 3 ? 10 : 5)));
                    const prb = Math.min(100, Math.round((log*0.4 + foc*0.3 + mot*0.3)));
                    const ovr = Math.round((log + foc + mot + prb) / 4);

                    document.getElementById('psych_overall').innerText = ovr + '%';
                    document.getElementById('p_logika').innerText = log + '%';
                    document.getElementById('b_logika').style.width = log + '%';
                    document.getElementById('p_focus').innerText = foc + '%';
                    document.getElementById('b_focus').style.width = foc + '%';
                    document.getElementById('p_motorik').innerText = mot + '%';
                    document.getElementById('b_motorik').style.width = mot + '%';
                    document.getElementById('p_problem').innerText = prb + '%';
                    document.getElementById('b_problem').style.width = prb + '%';
                    document.getElementById('win_screen').classList.remove('hidden');

                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LEVEL_COMPLETE', coins: 150 }));
                    }
                } else {
                    document.getElementById('lose_reason').innerText = reason;
                    document.getElementById('lose_screen').classList.remove('hidden');
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
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </View>
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
