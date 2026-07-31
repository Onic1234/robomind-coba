import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  StatusBar,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const STORAGE_KEY_COINS = "robomind_user_coins";
const STORAGE_KEY_LEVEL = "pose_master_current_level";

export default function PoseMasterScreen() {
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [userCoins, setUserCoins] = useState<number>(0);

  useEffect(() => {
    loadUserData();

    if (Platform.OS === "web") {
      const handleWebMessage = (e: MessageEvent) => {
        try {
          const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
          if (data && data.type === "LEVEL_COMPLETE") {
            handleLevelComplete(data.coins, data.level);
          } else if (data && data.type === "GO_BACK") {
            router.back();
          }
        } catch (err) {
          // Ignore
        }
      };
      window.addEventListener("message", handleWebMessage);
      return () => window.removeEventListener("message", handleWebMessage);
    }
  }, []);

  const loadUserData = async () => {
    try {
      const savedCoins = await AsyncStorage.getItem(STORAGE_KEY_COINS);
      const savedLevel = await AsyncStorage.getItem(STORAGE_KEY_LEVEL);
      if (savedCoins !== null) setUserCoins(parseInt(savedCoins, 10));
      if (savedLevel !== null) setCurrentLevel(parseInt(savedLevel, 10));
    } catch (e) {
      console.warn("Failed to load user data:", e);
    }
  };

  const handleLevelComplete = async (coinsGained: number, levelNum: number) => {
    const newCoins = userCoins + (coinsGained || 100);
    setUserCoins(newCoins);
    await AsyncStorage.setItem(STORAGE_KEY_COINS, newCoins.toString());
    if (levelNum >= currentLevel) {
      const nextLvl = levelNum + 1;
      setCurrentLevel(nextLvl);
      await AsyncStorage.setItem(STORAGE_KEY_LEVEL, nextLvl.toString());
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "LEVEL_COMPLETE") {
        handleLevelComplete(data.coins, data.level);
      } else if (data.type === "GO_BACK") {
        router.back();
      }
    } catch (e) {
      // Ignore
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#F8FAFC" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Master Pose Tangan</Text>
          <Text style={styles.headerSubtitle}>
            Game Refleks & Motorik Anak • Level {currentLevel}
          </Text>
        </View>
        <View style={styles.coinBadge}>
          <Ionicons name="sparkles" size={14} color="#F59E0B" />
          <Text style={styles.coinText}>{userCoins}</Text>
        </View>
      </View>

      <View style={styles.webviewContainer}>
        {Platform.OS === "web" ? (
          <iframe
            srcDoc={poseEngineHtml}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        ) : (
          <WebView
            originWhitelist={["*"]}
            source={{ html: poseEngineHtml }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowFileAccess={true}
            allowUniversalAccessFromFileURLs={true}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            onMessage={handleWebViewMessage}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  topHeader: {
    height: 52,
    backgroundColor: "#0F172A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(56, 189, 248, 0.2)",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#F8FAFC",
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#94A3B8",
  },
  coinBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  coinText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#F59E0B",
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  webview: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
});

const poseEngineHtml = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Master Pose Tangan SD - Game Fokus Anak</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Fonts: Fredoka & FontAwesome -->
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- MediaPipe Hands & Camera Utils CDN -->
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>

    <style>
        body {
            font-family: 'Fredoka', cursive, sans-serif;
            user-select: none;
            background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
            margin: 0; padding: 0; overflow: hidden; height: 100vh;
        }

        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 15px rgba(234, 179, 8, 0.6); }
            50% { box-shadow: 0 0 30px rgba(234, 179, 8, 0.9); }
        }

        .glow-target {
            animation: pulse-glow 1.5s infinite;
        }

        .lane-hit-flash {
            animation: flash-bg 0.25s ease-out;
        }

        @keyframes flash-bg {
            0% { background-color: rgba(34, 197, 94, 0.4); }
            100% { background-color: transparent; }
        }

        .lane-miss-flash {
            animation: flash-miss 0.3s ease-out;
        }

        @keyframes flash-miss {
            0% { background-color: rgba(239, 68, 68, 0.5); }
            100% { background-color: transparent; }
        }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 4px; }

        @keyframes loading-bar-flow {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(50%); }
            100% { transform: translateX(100%); }
        }
        .loading-bar-anim {
            animation: loading-bar-flow 1.5s infinite ease-in-out;
        }
    </style>
</head>
<body class="text-white min-h-screen flex flex-col justify-between overflow-x-hidden">

    <!-- Fullscreen Loading Overlay (AI & Camera System Initialization) -->
    <div id="systemLoadingModal" class="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 hidden flex flex-col items-center justify-center text-center p-6 transition-all duration-300">
        <div class="relative flex items-center justify-center mb-6">
            <div class="absolute w-24 h-24 bg-amber-500/20 rounded-full animate-ping"></div>
            <div class="absolute w-16 h-16 bg-indigo-500/30 rounded-full animate-pulse"></div>
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 text-3xl shadow-2xl z-10">
                🤖
            </div>
        </div>
        <h3 class="text-2xl font-black text-yellow-300 mb-1">Menginisialisasi Sistem AI</h3>
        <p class="text-xs text-indigo-200 max-w-xs mb-5">Sedang mengaktifkan deteksi tangan AI dan kamera Anda...</p>
        
        <div class="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-indigo-500/20 relative">
            <div class="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full loading-bar-anim"></div>
        </div>
        
        <p class="text-[10px] text-indigo-400 mt-4">Silakan tekan "Izinkan Kamera" jika muncul pop-up peramban</p>
    </div>

    <header class="w-full bg-slate-900/80 backdrop-blur-md border-b border-indigo-500/30 px-4 py-3 flex items-center justify-between z-30">
        <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-900 font-bold text-xl shadow-lg">
                🖐️
            </div>
            <div>
                <h1 class="font-bold text-lg md:text-xl tracking-wide bg-gradient-to-r from-yellow-300 via-amber-200 to-orange-400 bg-clip-text text-transparent">
                    Master Pose Tangan SD
                </h1>
                <p class="text-xs text-indigo-200">Game Melatih Fokus & Motorik Anak</p>
            </div>
        </div>

        <div class="flex items-center gap-3">
            <button id="btnSoundToggle" onclick="toggleSound()" class="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-indigo-400/30 text-yellow-300 transition-all flex items-center gap-2 text-sm font-semibold">
                <i id="soundIcon" class="fas fa-volume-up"></i>
                <span class="hidden sm:inline">Suara: ON</span>
            </button>
            <button onclick="showHelpModal()" class="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2">
                <i class="fas fa-circle-question"></i>
                <span class="hidden sm:inline">Cara Main</span>
            </button>
        </div>
    </header>

    <main class="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 flex flex-col justify-center items-center relative">
        
        <!-- View 1: Main Menu Screen -->
        <div id="startScreen" class="w-full max-w-2xl bg-slate-900/90 border-2 border-indigo-500/40 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-lg flex flex-col items-center text-center my-auto transition-all">
            <div class="text-6xl mb-4 animate-bounce">🖐️✨</div>
            <h2 class="text-3xl md:text-4xl font-extrabold text-yellow-300 mb-2">Asah Fokus & Gerakan Tangan!</h2>
            <p class="text-indigo-200 text-sm md:text-base max-w-lg mb-6">
                Ikuti simbol ekspresi tangan yang jatuh meluncur tepat pada garis batas dengan membentuk gerakan tanganmu di depan kamera!
            </p>

            <!-- Pose Legend -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mb-8">
                <div class="bg-indigo-950/60 p-3 rounded-2xl border border-indigo-500/30 flex flex-col items-center">
                    <span class="text-3xl mb-1">👍</span>
                    <span class="text-xs font-bold text-yellow-300">Jempol</span>
                    <span class="text-[10px] text-indigo-300">Thumbs Up</span>
                </div>
                <div class="bg-indigo-950/60 p-3 rounded-2xl border border-indigo-500/30 flex flex-col items-center">
                    <span class="text-3xl mb-1">✌️</span>
                    <span class="text-xs font-bold text-yellow-300">Peace</span>
                    <span class="text-[10px] text-indigo-300">2 Jari</span>
                </div>
                <div class="bg-indigo-950/60 p-3 rounded-2xl border border-indigo-500/30 flex flex-col items-center">
                    <span class="text-3xl mb-1">👋</span>
                    <span class="text-xs font-bold text-yellow-300">Dadah</span>
                    <span class="text-[10px] text-indigo-300">Lambaian</span>
                </div>
                <div class="bg-indigo-950/60 p-3 rounded-2xl border border-indigo-500/30 flex flex-col items-center">
                    <span class="text-3xl mb-1">🤘</span>
                    <span class="text-xs font-bold text-yellow-300">Metal</span>
                    <span class="text-[10px] text-indigo-300">3 Jari</span>
                </div>
            </div>

            <!-- Level Selector -->
            <div class="w-full mb-8">
                <div class="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-3">Pilih Tingkat Level:</div>
                <div class="grid grid-cols-3 gap-3">
                    <button onclick="selectLevel(1)" class="level-btn active p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-900/40 transition-all text-left flex flex-col justify-between">
                        <div>
                            <div class="text-xs text-emerald-400 font-bold">LEVEL 1</div>
                            <div class="text-lg font-black text-white">Santai</div>
                        </div>
                        <span class="text-[10px] text-emerald-300 mt-2">10 Simbol • Lambat</span>
                    </button>
                    <button onclick="selectLevel(2)" class="level-btn p-4 rounded-2xl border-2 border-slate-700 bg-slate-800/40 hover:border-slate-500 transition-all text-left flex flex-col justify-between">
                        <div>
                            <div class="text-xs text-amber-400 font-bold">LEVEL 2</div>
                            <div class="text-lg font-black text-white">Sedang</div>
                        </div>
                        <span class="text-[10px] text-amber-300 mt-2">15 Simbol • Sedang</span>
                    </button>
                    <button onclick="selectLevel(3)" class="level-btn p-4 rounded-2xl border-2 border-slate-700 bg-slate-800/40 hover:border-slate-500 transition-all text-left flex flex-col justify-between">
                        <div>
                            <div class="text-xs text-rose-400 font-bold">LEVEL 3</div>
                            <div class="text-lg font-black text-white">Cepat</div>
                        </div>
                        <span class="text-[10px] text-rose-300 mt-2">20 Simbol • Cepat</span>
                    </button>
                </div>
            </div>

            <!-- Start Button -->
            <button onclick="initCameraAndStart()" class="w-full py-4 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-extrabold text-xl rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3">
                <i class="fas fa-play"></i> MULAI PERMAINAN
            </button>
        </div>

        <div id="gameScreen" class="hidden absolute inset-0 w-full h-full overflow-hidden flex flex-col items-center justify-between z-20">
            
            <!-- LAYER 1: Fullscreen Camera Feed Background -->
            <div class="absolute inset-0 w-full h-full bg-slate-950 z-0">
                <video id="webcam" class="absolute inset-0 w-full h-full object-cover transform -scale-x-100" playsinline autoplay muted></video>
                <canvas id="outputCanvas" class="absolute inset-0 w-full h-full object-cover transform -scale-x-100"></canvas>
                
                <!-- Camera Loading Overlay -->
                <div id="camLoading" class="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-center p-4 z-10">
                    <i class="fas fa-camera text-4xl text-amber-400 animate-bounce mb-3"></i>
                    <p class="text-base font-bold text-yellow-300">Mengaktifkan Deteksi Tangan AI...</p>
                    <p class="text-xs text-indigo-300 mt-1">Izinkan akses kamera browser Anda agar dapat mendeteksi pose tangan</p>
                </div>
            </div>

            <!-- LAYER 2: Floating HUD Bar Top -->
            <div class="relative z-30 w-full max-w-4xl px-3 pt-3 flex items-center justify-between gap-2">
                <!-- Level & Target Badge -->
                <div class="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-indigo-500/40 shadow-lg">
                    <span id="gameLevelBadge" class="px-2.5 py-1 bg-indigo-600 text-white font-black rounded-xl text-xs sm:text-sm">
                        Level 1
                    </span>
                    <span id="targetCounter" class="text-xs text-yellow-300 font-bold hidden sm:inline">
                        Sisa Target: 10
                    </span>
                </div>

                <!-- Floating Score Center -->
                <div class="bg-slate-900/85 backdrop-blur-md px-5 py-1.5 rounded-2xl border-2 border-amber-400/60 shadow-xl text-center">
                    <div class="text-[9px] text-indigo-300 uppercase tracking-widest font-black">SKOR</div>
                    <div id="scoreText" class="text-2xl sm:text-3xl font-black text-yellow-300 leading-tight">0</div>
                </div>

                <!-- Lives & Pause/Exit -->
                <div class="flex items-center gap-2">
                    <div class="bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-indigo-500/40 shadow-lg flex items-center gap-1.5">
                        <span class="text-xs text-indigo-200 font-bold hidden sm:inline">Nyawa:</span>
                        <div id="livesContainer" class="flex gap-1 text-red-500 text-sm sm:text-base">
                            <i class="fas fa-heart"></i>
                            <i class="fas fa-heart"></i>
                            <i class="fas fa-heart"></i>
                        </div>
                    </div>

                    <button onclick="pauseGame()" class="p-2.5 bg-indigo-900/80 hover:bg-indigo-800 text-white rounded-2xl border border-indigo-400/40 backdrop-blur-md transition-all shadow-md">
                        <i class="fas fa-pause text-xs"></i>
                    </button>
                    <button onclick="confirmExitGame()" class="p-2.5 bg-rose-900/80 hover:bg-rose-800 text-rose-200 rounded-2xl border border-rose-400/40 backdrop-blur-md transition-all shadow-md">
                        <i class="fas fa-xmark text-xs"></i>
                    </button>
                </div>
            </div>

            <div id="waterfallContainer" class="relative z-20 w-full max-w-lg h-[calc(100vh-140px)] my-auto bg-slate-950/40 backdrop-blur-[2px] border-x-2 border-indigo-400/30 flex overflow-hidden shadow-2xl">
                
                <!-- 4 Piano Lanes -->
                <div class="lane flex-1 border-r border-indigo-500/20 relative flex flex-col justify-between items-center bg-indigo-950/20" data-lane="0">
                    <div class="w-full py-2 bg-slate-900/70 backdrop-blur-md text-center border-b border-indigo-500/30 shadow-md">
                        <span class="text-xl sm:text-2xl">👍</span>
                        <div class="text-[10px] text-yellow-300 font-extrabold tracking-wider">JEMPOL</div>
                    </div>
                </div>
                <div class="lane flex-1 border-r border-indigo-500/20 relative flex flex-col justify-between items-center bg-indigo-950/20" data-lane="1">
                    <div class="w-full py-2 bg-slate-900/70 backdrop-blur-md text-center border-b border-indigo-500/30 shadow-md">
                        <span class="text-xl sm:text-2xl">✌️</span>
                        <div class="text-[10px] text-yellow-300 font-extrabold tracking-wider">PEACE</div>
                    </div>
                </div>
                <div class="lane flex-1 border-r border-indigo-500/20 relative flex flex-col justify-between items-center bg-indigo-950/20" data-lane="2">
                    <div class="w-full py-2 bg-slate-900/70 backdrop-blur-md text-center border-b border-indigo-500/30 shadow-md">
                        <span class="text-xl sm:text-2xl">👋</span>
                        <div class="text-[10px] text-yellow-300 font-extrabold tracking-wider">DADAH</div>
                    </div>
                </div>
                <div class="lane flex-1 relative flex flex-col justify-between items-center bg-indigo-950/20" data-lane="3">
                    <div class="w-full py-2 bg-slate-900/70 backdrop-blur-md text-center border-b border-indigo-500/30 shadow-md">
                        <span class="text-xl sm:text-2xl">🤘</span>
                        <div class="text-[10px] text-yellow-300 font-extrabold tracking-wider">METAL</div>
                    </div>
                </div>

                <!-- Target / Boundary Line Zone (Piano Tiles Hit Zone) -->
                <div id="targetLine" class="absolute left-0 right-0 bottom-10 h-16 border-y-4 border-dashed border-amber-400 bg-amber-400/20 backdrop-blur-sm pointer-events-none flex items-center justify-between px-2 z-10 glow-target">
                    <span class="text-[9px] font-black text-slate-950 bg-amber-400 px-1.5 py-0.5 rounded shadow">ZONA POSE</span>
                    <span class="text-[9px] font-black text-slate-950 bg-amber-400 px-1.5 py-0.5 rounded shadow">ZONA POSE</span>
                </div>

            </div>

            <div class="relative z-30 w-full max-w-lg px-3 pb-3 flex flex-col gap-2 items-center">
                <!-- Current Detected Pose Badge -->
                <div class="w-full bg-slate-900/85 backdrop-blur-md py-2 px-4 rounded-2xl border border-indigo-500/40 flex items-center justify-between shadow-xl">
                    <div class="text-[10px] text-indigo-200 uppercase font-bold flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        Pose Terdeteksi:
                    </div>
                    <div id="detectedGestureBox" class="flex items-center gap-2">
                        <span id="detectedEmoji" class="text-2xl">❓</span>
                        <span id="detectedName" class="text-xs font-black text-amber-300">Mencari Tangan...</span>
                    </div>
                </div>

                <!-- Manual Touch/Keyboard Fallback Buttons -->
                <div class="w-full bg-slate-950/70 backdrop-blur-md p-1.5 rounded-xl border border-indigo-900/50 flex items-center justify-between gap-2">
                    <span class="text-[10px] text-indigo-300 font-semibold px-1 hidden sm:inline">Manual:</span>
                    <div class="grid grid-cols-4 gap-1.5 w-full">
                        <button onclick="triggerManualHit(0)" class="py-1 bg-indigo-900/70 hover:bg-indigo-700 text-[11px] text-white font-extrabold rounded-lg border border-indigo-500/40">1 / 👍</button>
                        <button onclick="triggerManualHit(1)" class="py-1 bg-indigo-900/70 hover:bg-indigo-700 text-[11px] text-white font-extrabold rounded-lg border border-indigo-500/40">2 / ✌️</button>
                        <button onclick="triggerManualHit(2)" class="py-1 bg-indigo-900/70 hover:bg-indigo-700 text-[11px] text-white font-extrabold rounded-lg border border-indigo-500/40">3 / 👋</button>
                        <button onclick="triggerManualHit(3)" class="py-1 bg-indigo-900/70 hover:bg-indigo-700 text-[11px] text-white font-extrabold rounded-lg border border-indigo-500/40">4 / 🤘</button>
                    </div>
                </div>
            </div>

        </div>

    </main>

    <div id="helpModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
        <div class="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button onclick="closeHelpModal()" class="absolute top-4 right-4 text-indigo-400 hover:text-white text-xl">
                <i class="fas fa-times"></i>
            </button>
            <h3 class="text-2xl font-bold text-yellow-300 mb-3 flex items-center gap-2">
                <i class="fas fa-gamepad"></i> Cara Bermain
            </h3>
            <div class="space-y-3 text-sm text-indigo-100">
                <div class="flex items-start gap-3 bg-indigo-950/60 p-3 rounded-xl">
                    <span class="text-2xl">1️⃣</span>
                    <p>Pilih tingkat level permainan (Level 1, 2, atau 3).</p>
                </div>
                <div class="flex items-start gap-3 bg-indigo-950/60 p-3 rounded-xl">
                    <span class="text-2xl">2️⃣</span>
                    <p>Simbol ekspresi tangan akan turun ke bawah seperti Piano Tiles.</p>
                </div>
                <div class="flex items-start gap-3 bg-indigo-950/60 p-3 rounded-xl">
                    <span class="text-2xl">3️⃣</span>
                    <p>Saat simbol berada di dalam <b>ZONA POSE</b> (Garis Kuning Putus-putus), tirukan bentuk pose tangan tersebut ke depan kamera!</p>
                </div>
                <div class="flex items-start gap-3 bg-indigo-950/60 p-3 rounded-xl">
                    <span class="text-2xl">4️⃣</span>
                    <p>Jika terlewati tanpa pose yang benar, nyawa akan berkurang. Habiskan semua simbol tanpa kehabisan nyawa untuk menang!</p>
                </div>
            </div>
            <button onclick="closeHelpModal()" class="w-full mt-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all">
                Saya Mengerti!
            </button>
        </div>
    </div>

    <!-- Game Over / Mission Complete Modal with 5-Axis Radar Chart -->
    <div id="resultModal" class="fixed inset-0 bg-slate-950/92 backdrop-blur-md z-50 hidden flex items-center justify-center p-4">
        <div class="bg-slate-900 border-2 border-indigo-500/60 rounded-3xl p-5 sm:p-7 max-w-2xl w-full text-center shadow-2xl relative">
            
            <div class="text-[11px] font-black text-amber-400 uppercase tracking-widest mb-1">MISSION COMPLETED</div>
            <h3 id="resultTitle" class="text-2xl sm:text-3xl font-black text-emerald-400 mb-0.5">LEVEL 1 CLEARED!</h3>
            <p id="resultSubtitle" class="text-slate-400 text-xs mb-4">Master Pose Tangan SD → Selesai!</p>

            <!-- 2-Column Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 text-left">
                
                <!-- Left Column: PENCAPAIAN MISI -->
                <div class="bg-slate-950/70 p-4 rounded-2xl border border-indigo-900/50 flex flex-col justify-between">
                    <div>
                        <div class="text-xs font-black text-sky-400 uppercase tracking-wider mb-2 text-center">PENCAPAIAN MISI</div>
                        <div id="resStars" class="text-2xl text-center mb-3">⭐⭐⭐</div>
                        
                        <div class="space-y-1.5 text-xs text-slate-200 mb-4">
                            <div class="flex items-center justify-between">
                                <span>⭐ Target Tepat:</span>
                                <strong id="resTargetHit" class="text-emerald-400 font-bold">10/10</strong>
                            </div>
                            <div class="flex items-center justify-between">
                                <span>⭐ Akurasi Pose:</span>
                                <strong id="resAccuracy" class="text-sky-400 font-bold">100%</strong>
                            </div>
                            <div class="flex items-center justify-between">
                                <span>⭐ Nyawa Tersisa:</span>
                                <strong id="resLivesLeft" class="text-amber-400 font-bold">3 Nyawa</strong>
                            </div>
                        </div>
                    </div>

                    <div class="border-t border-dashed border-slate-700/60 pt-3">
                        <div class="flex justify-between text-xs text-slate-300 mb-1">
                            <span>Loot Koin Base:</span>
                            <span id="resCoinBase" class="text-amber-400 font-bold">+150 Koin</span>
                        </div>
                        <div class="flex justify-between text-sm font-black text-emerald-400 border-t border-slate-800 pt-2">
                            <span>TOTAL KOIN:</span>
                            <span id="resCoinTotal" class="text-amber-400 font-black">200 KOIN</span>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Analisis Perkembangan Otak (5-Axis Radar Chart) -->
                <div class="bg-slate-950/70 p-4 rounded-2xl border border-indigo-900/50 flex flex-col items-center justify-center">
                    <div class="text-xs font-black text-purple-300 uppercase tracking-wider mb-0.5 text-center">🧠 Analisis Perkembangan Otak</div>
                    <div class="text-[10px] text-slate-400 mb-2 text-center">(Prefrontal Cortex & Motorik)</div>
                    
                    <div class="w-full flex justify-center items-center">
                        <canvas id="radarChartCanvas" width="220" height="180"></canvas>
                    </div>
                </div>

            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
                <button onclick="returnToStartMenu()" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-extrabold rounded-2xl text-xs transition-all">
                    [ Kembali Ke Menu ]
                </button>
                <button id="nextLevelBtn" onclick="nextLevel()" class="flex-1 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold rounded-2xl text-xs shadow-lg transition-all flex items-center justify-center gap-2">
                    [ CONTINUE (Lanjut Level) ➔ ]
                </button>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="w-full py-2 text-center text-[11px] text-indigo-300/60 border-t border-indigo-900/20 bg-slate-950/40">
        Master Pose Tangan SD • MediaPipe Vision AI Powered
    </footer>

    <script>
        /* Game Configuration Settings for Levels */
        const LEVEL_CONFIGS = {
            1: {
                level: 1,
                title: "Level 1",
                totalTiles: 10,
                maxLives: 3,
                speedMultiplier: 1.0,  // Normal speed
                spawnInterval: 2200    // ms between spawns
            },
            2: {
                level: 2,
                title: "Level 2",
                totalTiles: 15,
                maxLives: 5,
                speedMultiplier: 1.4,  // Moderate speed
                spawnInterval: 1700
            },
            3: {
                level: 3,
                title: "Level 3",
                totalTiles: 20,
                maxLives: 6,
                speedMultiplier: 1.9,  // Fast speed
                spawnInterval: 1300
            }
        };

        /* Pose Definitions corresponding to 4 Waterfall Lanes */
        const POSES = [
            { id: 0, emoji: '👍', name: 'Jempol', code: 'THUMBS_UP' },
            { id: 1, emoji: '✌️', name: 'Peace', code: 'PEACE' },
            { id: 2, emoji: '👋', name: 'Dadah', code: 'WAVE' },
            { id: 3, emoji: '🤘', name: 'Metal', code: 'ROCK' }
        ];

        /* Game State Variables */
        let selectedLevel = 1;
        let score = 0;
        let lives = 3;
        let tilesSpawned = 0;
        let tilesHitCount = 0;
        let activeTiles = [];
        let gameLoopInterval = null;
        let spawnTimeout = null;
        let isGameRunning = false;
        let isPaused = false;
        let soundEnabled = true;

        /* MediaPipe & Webcam Variables */
        let webcamElement = document.getElementById('webcam');
        let outputCanvas = document.getElementById('outputCanvas');
        let canvasCtx = outputCanvas.getContext('2d');
        let handsDetector = null;
        let cameraUtils = null;
        let currentDetectedGesture = null;

        /* Web Audio API Sound Synthesizer */
        let audioCtx = null;

        function playSound(type) {
            if (!soundEnabled) return;
            try {
                if (!audioCtx) {
                    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }

                const now = audioCtx.currentTime;

                if (type === 'hit') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(523.25, now);
                    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                    osc.start(now);
                    osc.stop(now + 0.2);
                } else if (type === 'miss') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(160, now);
                    osc.frequency.linearRampToValueAtTime(100, now + 0.25);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                    osc.start(now);
                    osc.stop(now + 0.25);
                } else if (type === 'victory') {
                    const notes = [523.25, 659.25, 783.99, 1046.50];
                    notes.forEach((freq, idx) => {
                        const noteOsc = audioCtx.createOscillator();
                        const noteGain = audioCtx.createGain();
                        noteOsc.connect(noteGain);
                        noteGain.connect(audioCtx.destination);
                        noteOsc.frequency.setValueAtTime(freq, now + (idx * 0.12));
                        noteGain.gain.setValueAtTime(0.2, now + (idx * 0.12));
                        noteGain.gain.exponentialRampToValueAtTime(0.01, now + (idx * 0.12) + 0.25);
                        noteOsc.start(now + (idx * 0.12));
                        noteOsc.stop(now + (idx * 0.12) + 0.25);
                    });
                }
            } catch (e) {
                console.log("Audio error:", e);
            }
        }

        function toggleSound() {
            soundEnabled = !soundEnabled;
            const btn = document.getElementById('btnSoundToggle');
            const icon = document.getElementById('soundIcon');
            if (soundEnabled) {
                btn.classList.remove('opacity-50');
                icon.className = 'fas fa-volume-up';
                btn.querySelector('span').innerText = 'Suara: ON';
            } else {
                btn.classList.add('opacity-50');
                icon.className = 'fas fa-volume-mute';
                btn.querySelector('span').innerText = 'Suara: OFF';
            }
        }

        function initMediaPipe() {
            handsDetector = new Hands({
                locateFile: (file) => \`https://cdn.jsdelivr.net/npm/@mediapipe/hands/\${file}\`
            });

            handsDetector.setOptions({
                maxNumHands: 1, // 1 Hand = 2x Faster Inference!
                modelComplexity: 0, // 0 = Lite (Lite model for lowest latency)
                minDetectionConfidence: 0.6,
                minTrackingConfidence: 0.6
            });

            handsDetector.onResults(onHandResults);

            let isProcessingHand = false;
            let lastProcessingTime = 0;

            cameraUtils = new Camera(webcamElement, {
                onFrame: async () => {
                    if (webcamElement && handsDetector) {
                        const now = Date.now();
                        // Throttle inference to ~30 FPS max (33ms) to prevent thread choke
                        if (isProcessingHand || (now - lastProcessingTime < 33)) {
                            return;
                        }
                        isProcessingHand = true;
                        try {
                            await handsDetector.send({ image: webcamElement });
                            lastProcessingTime = Date.now();
                        } catch (err) {
                            console.error("Inference error:", err);
                        } finally {
                            isProcessingHand = false;
                        }
                    }
                },
                width: 320,
                height: 240
            });

            cameraUtils.start().then(() => {
                const loader = document.getElementById('camLoading');
                if (loader) loader.classList.add('hidden');

                // Sembunyikan pop-up memuat sistem
                const systemLoader = document.getElementById('systemLoadingModal');
                if (systemLoader) systemLoader.classList.add('hidden');

                // Pindah ke halaman game setelah kamera siap
                document.getElementById('startScreen').classList.add('hidden');
                document.getElementById('gameScreen').classList.remove('hidden');

                startGame();
            }).catch(err => {
                console.error("Camera access error:", err);
                const loader = document.getElementById('camLoading');
                if (loader) {
                    loader.innerHTML = \`
                        <i class="fas fa-exclamation-triangle text-3xl text-amber-400 mb-2"></i>
                        <p class="text-xs font-bold text-amber-200">Gagal Membuka Kamera</p>
                        <p class="text-[10px] text-slate-300 mt-1">Gunakan tombol alternatif manual di bagian bawah layar.</p>
                    \`;
                }

                // Sembunyikan pop-up memuat agar pengguna bisa melihat pesan error/fallback manual
                const systemLoader = document.getElementById('systemLoadingModal');
                if (systemLoader) systemLoader.classList.add('hidden');

                document.getElementById('startScreen').classList.add('hidden');
                document.getElementById('gameScreen').classList.remove('hidden');
            });
        }

        function onHandResults(results) {
            const targetWidth = webcamElement.videoWidth || window.innerWidth;
            const targetHeight = webcamElement.videoHeight || window.innerHeight;

            if (outputCanvas.width !== targetWidth || outputCanvas.height !== targetHeight) {
                outputCanvas.width = targetWidth;
                outputCanvas.height = targetHeight;
            }

            canvasCtx.save();
            canvasCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

            const emojiSpan = document.getElementById('detectedEmoji');
            const nameSpan = document.getElementById('detectedName');

            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                let detectedPoses = [];
                let hasValidGesture = false;

                for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                    const landmarks = results.multiHandLandmarks[i];
                    drawHandSkeleton(canvasCtx, landmarks);

                    const detectedPose = classifyHandGesture(landmarks);
                    if (detectedPose !== null) {
                        detectedPoses.push(detectedPose);
                        hasValidGesture = true;
                    }
                }

                // Deduplicate detected poses
                const uniquePoses = [...new Set(detectedPoses)];
                currentDetectedGesture = uniquePoses.length > 0 ? uniquePoses[0] : null;

                if (hasValidGesture) {
                    const emojis = uniquePoses.map(p => POSES[p].emoji).join(' + ');
                    const names = uniquePoses.map(p => POSES[p].name).join(' & ');

                    emojiSpan.innerText = emojis;
                    nameSpan.innerText = names;
                    nameSpan.className = "text-xs font-black text-amber-300 animate-pulse";

                    if (isGameRunning && !isPaused) {
                        uniquePoses.forEach(poseId => {
                            checkGestureHit(poseId);
                        });
                    }
                } else {
                    emojiSpan.innerText = "✊";
                    nameSpan.innerText = "Mengepal / Belum Cocok";
                    nameSpan.className = "text-xs font-semibold text-slate-400";
                }
            } else {
                currentDetectedGesture = null;
                emojiSpan.innerText = "❓";
                nameSpan.innerText = "Mencari Tangan...";
                nameSpan.className = "text-xs font-semibold text-slate-400";
            }
            canvasCtx.restore();
        }

        function drawHandSkeleton(ctx, landmarks) {
            const connections = [
                [0,1],[1,2],[2,3],[3,4], // Thumb
                [0,5],[5,6],[6,7],[7,8], // Index
                [5,9],[9,10],[10,11],[11,12], // Middle
                [9,13],[13,14],[14,15],[15,16], // Ring
                [13,17],[17,18],[18,19],[19,20],[0,17] // Pinky
            ];

            const w = ctx.canvas.width;
            const h = ctx.canvas.height;

            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 4;
            connections.forEach(([i, j]) => {
                ctx.beginPath();
                ctx.moveTo(landmarks[i].x * w, landmarks[i].y * h);
                ctx.lineTo(landmarks[j].x * w, landmarks[j].y * h);
                ctx.stroke();
            });

            landmarks.forEach((lm) => {
                ctx.beginPath();
                ctx.arc(lm.x * w, lm.y * h, 6, 0, 2 * Math.PI);
                ctx.fillStyle = "#f59e0b";
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#ffffff";
                ctx.stroke();
            });
        }

        function classifyHandGesture(lm) {
            const isIndexExtended = lm[8].y < lm[6].y;
            const isMiddleExtended = lm[12].y < lm[10].y;
            const isRingExtended = lm[16].y < lm[14].y;
            const isPinkyExtended = lm[20].y < lm[18].y;

            // 1. DADAH / WAVE (All 4 fingers extended)
            if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) {
                return 2; // Lane 2: 👋 Dadah
            }

            // 2. PEACE (Index and Middle extended, Ring and Pinky folded)
            if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended) {
                return 1; // Lane 1: ✌️ Peace
            }

            // 3. METAL / ROCK ON (Index and Pinky extended, Middle and Ring folded)
            if (isIndexExtended && !isMiddleExtended && !isRingExtended && isPinkyExtended) {
                return 3; // Lane 3: 🤘 Metal
            }

            // 4. JEMPOL / THUMBS UP (Thumb extended up, all 4 fingers folded)
            const isThumbUp = lm[4].y < lm[2].y && lm[4].y < lm[5].y;
            if (isThumbUp && !isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
                return 0; // Lane 0: 👍 Jempol
            }

            return null;
        }

        function selectLevel(lvl) {
            selectedLevel = lvl;
            document.querySelectorAll('.level-btn').forEach((btn, idx) => {
                if (idx + 1 === lvl) {
                    btn.className = "level-btn active p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-900/40 transition-all text-left flex flex-col justify-between";
                } else {
                    btn.className = "level-btn p-4 rounded-2xl border-2 border-slate-700 bg-slate-800/40 hover:border-slate-500 transition-all text-left flex flex-col justify-between";
                }
            });
        }

        function initCameraAndStart() {
            const systemLoader = document.getElementById('systemLoadingModal');

            if (!handsDetector) {
                // Tampilkan pop-up memuat sistem dan mulai inisialisasi MediaPipe/Kamera
                if (systemLoader) systemLoader.classList.remove('hidden');
                initMediaPipe();
            } else {
                // Jika sudah pernah dimuat, langsung masuk ke game screen
                document.getElementById('startScreen').classList.add('hidden');
                document.getElementById('gameScreen').classList.remove('hidden');
                
                const loader = document.getElementById('camLoading');
                if (loader) loader.classList.add('hidden');
                startGame();
            }
        }

        function startGame() {
            const config = LEVEL_CONFIGS[selectedLevel];

            score = 0;
            lives = config.maxLives;
            tilesSpawned = 0;
            tilesHitCount = 0;
            activeTiles = [];
            isGameRunning = true;
            isPaused = false;

            document.querySelectorAll('.tile-item').forEach(el => el.remove());

            document.getElementById('gameLevelBadge').innerText = config.title;
            document.getElementById('scoreText').innerText = '0';
            updateLivesUI();
            updateTargetCounterUI();

            scheduleNextTileSpawn();

            if (gameLoopInterval) cancelAnimationFrame(gameLoopInterval);
            gameLoop();
        }

        function updateLivesUI() {
            const container = document.getElementById('livesContainer');
            container.innerHTML = '';
            for (let i = 0; i < lives; i++) {
                container.innerHTML += '<i class="fas fa-heart animate-pulse"></i>';
            }
        }

        function updateTargetCounterUI() {
            const config = LEVEL_CONFIGS[selectedLevel];
            const remaining = config.totalTiles - tilesHitCount;
            document.getElementById('targetCounter').innerText = 'Sisa Target: ' + Math.max(0, remaining);
        }

        function scheduleNextTileSpawn() {
            if (!isGameRunning || isPaused) return;

            const config = LEVEL_CONFIGS[selectedLevel];

            if (tilesSpawned < config.totalTiles) {
                spawnTile();
                tilesSpawned++;

                spawnTimeout = setTimeout(scheduleNextTileSpawn, config.spawnInterval);
            }
        }

        let lastSpawnedLane = -1;

        function spawnTile() {
            const waterfall = document.getElementById('waterfallContainer');
            if (!waterfall) return;

            // Pick a lane (0..3) preventing exact duplicate of previous tile if possible
            let poseIndex = Math.floor(Math.random() * POSES.length);
            if (poseIndex === lastSpawnedLane) {
                poseIndex = (poseIndex + 1 + Math.floor(Math.random() * 3)) % POSES.length;
            }

            // Prevent Vertical Overlap: Check if any tile in the target lane is still near top (< 130px)
            const isLaneBlockedNearTop = activeTiles.some(t => !t.hit && !t.missed && t.poseId === poseIndex && t.y < 130);
            if (isLaneBlockedNearTop) {
                const openLanes = [0, 1, 2, 3].filter(l => !activeTiles.some(t => !t.hit && !t.missed && t.poseId === l && t.y < 130));
                if (openLanes.length > 0) {
                    poseIndex = openLanes[Math.floor(Math.random() * openLanes.length)];
                } else {
                    // All lanes occupied near top, skip this spawn cycle to prevent stacking
                    return;
                }
            }

            lastSpawnedLane = poseIndex;
            const pose = POSES[poseIndex];

            const laneWidth = waterfall.clientWidth / 4;
            const tileWidth = Math.min(105, laneWidth - 8);
            const tileHeight = 80;

            // Align tile perfectly in the center of its respective lane
            const laneStartX = poseIndex * laneWidth;
            const tileX = laneStartX + (laneWidth - tileWidth) / 2;

            const tileEl = document.createElement('div');
            tileEl.className = 'tile-item absolute flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400/90 shadow-2xl text-white font-extrabold transition-transform z-20';
            
            tileEl.style.width = tileWidth + 'px';
            tileEl.style.height = tileHeight + 'px';
            tileEl.style.left = tileX + 'px';
            tileEl.style.top = '-' + (tileHeight + 10) + 'px';

            tileEl.innerHTML = '<span class="text-3xl sm:text-4xl drop-shadow-md leading-none mb-1">' + pose.emoji + '</span>' +
                '<span class="text-[10px] font-black text-amber-300 tracking-wider uppercase">' + pose.name + '</span>';

            waterfall.appendChild(tileEl);

            const config = LEVEL_CONFIGS[selectedLevel];
            const baseSpeed = 1.2 * config.speedMultiplier;
            const speed = baseSpeed + (tilesHitCount * 0.08);

            activeTiles.push({
                id: Date.now() + Math.random(),
                poseId: poseIndex,
                x: tileX,
                y: -(tileHeight + 10),
                height: tileHeight,
                speed: speed,
                element: tileEl,
                hit: false,
                missed: false
            });
        }

        function gameLoop() {
            if (isGameRunning && !isPaused) {
                const waterfall = document.getElementById('waterfallContainer');
                if (waterfall) {
                    const waterfallHeight = waterfall.clientHeight;
                    const targetZoneBottom = waterfallHeight - 20;

                    for (let i = activeTiles.length - 1; i >= 0; i--) {
                        const tile = activeTiles[i];

                        tile.y += tile.speed;
                        tile.element.style.top = \`\${tile.y}px\`;

                        if (tile.y > targetZoneBottom && !tile.hit && !tile.missed) {
                            tile.missed = true;
                            handleMiss(tile);
                        }

                        if (tile.y > waterfallHeight + 90) {
                            tile.element.remove();
                            activeTiles.splice(i, 1);
                            checkLevelCompletion();
                        }
                    }
                }
            }

            if (isGameRunning) {
                gameLoopInterval = requestAnimationFrame(gameLoop);
            }
        }

        function checkGestureHit(detectedPoseId) {
            const waterfall = document.getElementById('waterfallContainer');
            if (!waterfall) return;

            const waterfallHeight = waterfall.clientHeight;
            const targetZoneTop = waterfallHeight - 130;
            const targetZoneBottom = waterfallHeight - 20;

            for (let i = 0; i < activeTiles.length; i++) {
                const tile = activeTiles[i];

                if (!tile.hit && !tile.missed && tile.poseId === detectedPoseId) {
                    if (tile.y >= targetZoneTop && tile.y <= targetZoneBottom) {
                        handleHit(tile);
                        break;
                    }
                }
            }
        }

        function triggerManualHit(laneIndex) {
            checkGestureHit(laneIndex);
        }

        window.addEventListener('keydown', (e) => {
            if (!isGameRunning || isPaused) return;
            if (e.key === '1') triggerManualHit(0);
            if (e.key === '2') triggerManualHit(1);
            if (e.key === '3') triggerManualHit(2);
            if (e.key === '4') triggerManualHit(3);
        });

        function handleHit(tile) {
            tile.hit = true;
            score += 100;
            tilesHitCount++;

            playSound('hit');

            const laneEl = document.querySelectorAll('.lane')[tile.poseId];
            if (laneEl) {
                laneEl.classList.add('lane-hit-flash');
                setTimeout(() => laneEl.classList.remove('lane-hit-flash'), 250);
            }

            tile.element.className += ' scale-125 bg-emerald-500 border-white text-white duration-200';
            tile.element.innerHTML = \`<span class="text-3xl">✨</span><span class="text-xs font-black">PAS!</span>\`;

            document.getElementById('scoreText').innerText = score;
            updateTargetCounterUI();

            setTimeout(() => {
                tile.element.style.opacity = '0';
            }, 100);
        }

        function handleMiss(tile) {
            lives--;
            playSound('miss');

            const laneEl = document.querySelectorAll('.lane')[tile.poseId];
            if (laneEl) {
                laneEl.classList.add('lane-miss-flash');
                setTimeout(() => laneEl.classList.remove('lane-miss-flash'), 300);
            }

            tile.element.className += ' bg-rose-600 border-red-300 opacity-60';

            updateLivesUI();

            if (lives <= 0) {
                gameOver(false);
            }
        }

        function checkLevelCompletion() {
            const config = LEVEL_CONFIGS[selectedLevel];
            if (tilesSpawned >= config.totalTiles && activeTiles.length === 0 && lives > 0) {
                gameOver(true);
            }
        }

        function drawRadarChart(accuracy, livesLeft, scoreVal) {
            const chartCanvas = document.getElementById('radarChartCanvas');
            if (!chartCanvas) return;
            const ctx = chartCanvas.getContext('2d');
            const w = chartCanvas.width;
            const h = chartCanvas.height;

            ctx.clearRect(0, 0, w, h);

            const centerX = w / 2;
            const centerY = h / 2 + 6;
            const radius = Math.min(w, h) / 2 - 32;
            const numAxes = 5;
            const labels = ["Fokus", "Keputus", "Kontrol Diri", "Memori Kerja", "Spasial"];

            // Metric Scores (0.4 to 1.0)
            const accScore = Math.min(1, Math.max(0.4, accuracy / 100));
            const livesScore = Math.min(1, Math.max(0.5, livesLeft / 3));
            const speedScore = Math.min(1, Math.max(0.6, scoreVal / 1000));
            const focusScore = Math.min(1, Math.max(0.5, (accScore + livesScore) / 2));
            const memoryScore = Math.min(1, Math.max(0.5, accScore));

            const values = [focusScore, speedScore, livesScore, memoryScore, accScore];

            // 1. Draw Web Rings (3 Concentric Polygons)
            for (let ring = 1; ring <= 3; ring++) {
                const r = radius * (ring / 3);
                ctx.beginPath();
                for (let i = 0; i < numAxes; i++) {
                    const angle = (i * 2 * Math.PI / numAxes) - Math.PI / 2;
                    const x = centerX + r * Math.cos(angle);
                    const y = centerY + r * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // 2. Draw Axis Rays & Axis Labels
            ctx.font = 'bold 9px Fredoka, sans-serif';
            ctx.fillStyle = '#CBD5E1';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            for (let i = 0; i < numAxes; i++) {
                const angle = (i * 2 * Math.PI / numAxes) - Math.PI / 2;
                const rx = centerX + radius * Math.cos(angle);
                const ry = centerY + radius * Math.sin(angle);

                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(rx, ry);
                ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
                ctx.stroke();

                // Position Labels
                const lx = centerX + (radius + 16) * Math.cos(angle);
                const ly = centerY + (radius + 16) * Math.sin(angle);
                ctx.fillText(labels[i], lx, ly);
            }

            // 3. Draw Player Skill Polygon (Filled Purple/Blue)
            ctx.beginPath();
            for (let i = 0; i < numAxes; i++) {
                const angle = (i * 2 * Math.PI / numAxes) - Math.PI / 2;
                const valRadius = radius * values[i];
                const vx = centerX + valRadius * Math.cos(angle);
                const vy = centerY + valRadius * Math.sin(angle);
                if (i === 0) ctx.moveTo(vx, vy);
                else ctx.lineTo(vx, vy);
            }
            ctx.closePath();

            ctx.fillStyle = 'rgba(147, 51, 234, 0.45)';
            ctx.fill();
            ctx.strokeStyle = '#38BDF8';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 4. Draw Data Points
            for (let i = 0; i < numAxes; i++) {
                const angle = (i * 2 * Math.PI / numAxes) - Math.PI / 2;
                const valRadius = radius * values[i];
                const vx = centerX + valRadius * Math.cos(angle);
                const vy = centerY + valRadius * Math.sin(angle);

                ctx.beginPath();
                ctx.arc(vx, vy, 3.5, 0, 2 * Math.PI);
                ctx.fillStyle = '#F59E0B';
                ctx.fill();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        }

        function gameOver(isVictory) {
            isGameRunning = false;
            if (spawnTimeout) clearTimeout(spawnTimeout);

            const resultModal = document.getElementById('resultModal');
            const title = document.getElementById('resultTitle');
            const subtitle = document.getElementById('resultSubtitle');
            const nextBtn = document.getElementById('nextLevelBtn');

            const config = LEVEL_CONFIGS[selectedLevel];
            const accuracy = Math.round((tilesHitCount / Math.max(1, config.totalTiles)) * 100) || 0;
            const baseCoins = score;
            const bonusCoins = isVictory ? 50 : 0;
            const totalCoins = baseCoins + bonusCoins;

            document.getElementById('resTargetHit').innerText = tilesHitCount + '/' + config.totalTiles;
            document.getElementById('resAccuracy').innerText = accuracy + '%';
            document.getElementById('resLivesLeft').innerText = Math.max(0, lives) + ' Nyawa';
            document.getElementById('resCoinBase').innerText = '+' + baseCoins + ' Koin';
            document.getElementById('resCoinTotal').innerText = totalCoins + ' KOIN';

            // Calculate Stars (1 to 3 stars)
            let starsStr = "⭐";
            if (accuracy >= 80 && lives >= 2) starsStr = "⭐⭐⭐";
            else if (accuracy >= 50 || lives >= 1) starsStr = "⭐⭐";
            document.getElementById('resStars').innerText = starsStr;

            if (isVictory) {
                playSound('victory');
                title.innerText = 'LEVEL ' + selectedLevel + ' CLEARED!';
                title.className = "text-2xl sm:text-3xl font-black text-emerald-400 mb-0.5";
                subtitle.innerText = "Master Pose Tangan SD → Selesai!";

                const msg = JSON.stringify({
                    type: 'LEVEL_COMPLETE',
                    coins: totalCoins,
                    level: selectedLevel
                });
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(msg);
                } else if (window.parent) {
                    window.parent.postMessage(msg, '*');
                }

                if (selectedLevel < 3) {
                    nextBtn.classList.remove('hidden');
                } else {
                    nextBtn.classList.add('hidden');
                    title.innerText = "🎉 BINTANG MASTER POSE!";
                    subtitle.innerText = "Selamat! Kamu berhasil menamatkan SEMUA LEVEL!";
                }
            } else {
                playSound('miss');
                title.innerText = 'LEVEL ' + selectedLevel + ' SELESAI!';
                title.className = "text-2xl sm:text-3xl font-black text-amber-400 mb-0.5";
                subtitle.innerText = "Nyawa habis. Tetap dapat koin dan hasil analisis!";
                nextBtn.classList.add('hidden');
            }

            // Always Draw 5-Axis Radar Chart
            drawRadarChart(accuracy, lives, score);

            resultModal.classList.remove('hidden');
        }

        function restartLevel() {
            document.getElementById('resultModal').classList.add('hidden');
            startGame();
        }

        function nextLevel() {
            if (selectedLevel < 3) {
                selectedLevel++;
                selectLevel(selectedLevel);
            }
            document.getElementById('resultModal').classList.add('hidden');
            startGame();
        }

        function returnToStartMenu() {
            isGameRunning = false;
            if (spawnTimeout) clearTimeout(spawnTimeout);

            document.getElementById('resultModal').classList.add('hidden');
            document.getElementById('gameScreen').classList.add('hidden');
            document.getElementById('startScreen').classList.remove('hidden');
        }

        function pauseGame() {
            if (!isGameRunning) return;
            isPaused = !isPaused;
            if (!isPaused) {
                scheduleNextTileSpawn();
            }
        }

        function confirmExitGame() {
            returnToStartMenu();
        }

        function showHelpModal() {
            document.getElementById('helpModal').classList.remove('hidden');
        }

        function closeHelpModal() {
            document.getElementById('helpModal').classList.add('hidden');
        }
    </script>
</body>
</html>`;
