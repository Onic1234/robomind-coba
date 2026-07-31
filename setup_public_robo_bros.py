import os
import re

repo_dir = r"d:\project-26\RoboMind"
public_robo_bros = os.path.join(repo_dir, "public", "robo-bros")
js_dir = os.path.join(public_robo_bros, "js")
os.makedirs(js_dir, exist_ok=True)

# 1. Write fixed gameLib.js into public/robo-bros/js/gameLib.js
gamelib_path = r"C:\Users\Acer\.gemini\antigravity-ide\brain\48066e75-3b57-4ef5-a8f0-5a82039c7fe5\.system_generated\steps\737\content.md"
with open(gamelib_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

gamelib_code = "".join(lines[7:])

fixed_siapkan_gambar = """
	function siapkanGambar(sources, callback) 
	{
		var images = {};
		var loadedImages = 0;
		var keys = Object.keys(sources);
		var numImages = keys.length;
		konten.webkitImageSmoothingEnabled = smoothing;
		konten.mozImageSmoothingEnabled = smoothing;
		konten.imageSmoothingEnabled = smoothing;
		
		if (numImages === 0) { callback(images); return; }

		hapusLayar();
		teks("loading graphic...", canvas.width/2, canvas.height/2-20);
		kotakr(canvas.width/2-150, canvas.height/2-10, 300, 15, 4, 2, "white", "none");
		
		keys.forEach(function(key) {
			var img = new Image();
			img.onload = function() {
				loadedImages++;
				hapusLayar();
				teks("loading graphic (" + loadedImages + "/" + numImages + ")", canvas.width/2, canvas.height/2-20);
				var persen = (loadedImages / numImages) * 300;
				kotakr(canvas.width/2-150, canvas.height/2-10, persen, 15, 4, 2, "white", "white");
				kotakr(canvas.width/2-150, canvas.height/2-10, 300, 15, 4, 2, "white", "none");
				if (loadedImages >= numImages) {
					console.log("ALL IMAGES LOADED!");
					callback(images);
				}
			};
			img.onerror = function(err) {
				console.error("Failed image load:", key, err);
				loadedImages++;
				if (loadedImages >= numImages) {
					callback(images);
				}
			};
			img.src = game.folder + "/" + sources[key];
			images[key] = img;
		});
	}
"""

gamelib_code = re.sub(r'function siapkanGambar\(sources, callback\)\s*\{[\s\S]*?\n\t\}', fixed_siapkan_gambar, gamelib_code, count=1)

with open(os.path.join(js_dir, "gameLib.js"), "w", encoding="utf-8") as f:
    f.write(gamelib_code)

print("Wrote public/robo-bros/js/gameLib.js")

# 2. Write updated public/robo-bros/index.html
html_content = """<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Robo Bros - 2D Platformer</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }
        html, body {
            width: 100vw; height: 100vh; overflow: hidden;
            background: #0f172a; color: #FFF;
            font-family: system-ui, -apple-system, sans-serif;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
        }
        #game {
            width: 100vw; height: 100vh;
            display: flex; justify-content: center; align-items: center;
            position: relative;
        }
        #gameArea {
            width: 100%; height: 100%;
            position: relative;
            display: flex; justify-content: center; align-items: center;
        }
        canvas {
            display: block; margin: auto;
            width: 100%; height: 100%;
            object-fit: contain;
            background: #67d2d6;
        }
        /* Touch Controls */
        .touch-controls {
            position: absolute; bottom: 20px; left: 0; right: 0;
            display: flex; justify-content: space-between; align-items: center;
            padding: 0 24px; z-index: 99; pointer-events: none;
        }
        .dpad-group { display: flex; gap: 12px; pointer-events: auto; }
        .action-group { pointer-events: auto; }
        .ctrl-btn {
            width: 64px; height: 64px; border-radius: 50%;
            background: rgba(15, 23, 42, 0.8); border: 2.5px solid rgba(245, 158, 11, 0.8);
            color: #F8FAFC; font-size: 24px; font-weight: bold;
            display: flex; justify-content: center; align-items: center;
            touch-action: manipulation; box-shadow: 0 4px 14px rgba(0,0,0,0.5);
            cursor: pointer;
        }
        .ctrl-btn:active { background: rgba(245, 158, 11, 0.95); color: #0F172A; transform: scale(0.92); }
        .btn-jump { width: 72px; height: 72px; background: rgba(16, 185, 129, 0.9); border-color: #34D399; font-size: 28px; }
        .btn-jump:active { background: #059669; }
    </style>
</head>
<body>
    <div id="game">
        <div id="gameArea">
            <canvas id="canvas"></canvas>
        </div>
    </div>

    <!-- On-screen Virtual Controls -->
    <div class="touch-controls">
        <div class="dpad-group">
            <div class="ctrl-btn" onmousedown="pressBtn('kiri')" onmouseup="releaseBtn('kiri')" ontouchstart="pressBtn('kiri')" ontouchend="releaseBtn('kiri')">◀</div>
            <div class="ctrl-btn" onmousedown="pressBtn('kanan')" onmouseup="releaseBtn('kanan')" ontouchstart="pressBtn('kanan')" ontouchend="releaseBtn('kanan')">▶</div>
        </div>
        <div class="action-group">
            <div class="ctrl-btn btn-jump" onmousedown="pressBtn('jump')" onmouseup="releaseBtn('jump')" ontouchstart="pressBtn('jump')" ontouchend="releaseBtn('jump')">▲</div>
        </div>
    </div>

    <script type="text/javascript" src="js/gameLib.js"></script>
    <script type="text/javascript" src="js/map_1.js"></script>
    <script type="text/javascript" src="js/map_2.js"></script>
    <script type="text/javascript" src="js/game.js"></script>
    <script>
        function pressBtn(action) {
            if (!window.game) return;
            if (action === 'kiri') { window.game.kiri = true; if (typeof window.kiri !== 'undefined') window.kiri = true; }
            if (action === 'kanan') { window.game.kanan = true; if (typeof window.kanan !== 'undefined') window.kanan = true; }
            if (action === 'jump') { window.game.atas = true; window.game.spasi = true; if (typeof window.atas !== 'undefined') window.atas = true; }
        }
        function releaseBtn(action) {
            if (!window.game) return;
            if (action === 'kiri') { window.game.kiri = false; if (typeof window.kiri !== 'undefined') window.kiri = false; }
            if (action === 'kanan') { window.game.kanan = false; if (typeof window.kanan !== 'undefined') window.kanan = false; }
            if (action === 'jump') { window.game.atas = false; window.game.spasi = false; if (typeof window.atas !== 'undefined') window.atas = false; }
        }
    </script>
</body>
</html>
"""

with open(os.path.join(public_robo_bros, "index.html"), "w", encoding="utf-8") as f:
    f.write(html_content)

print("Wrote public/robo-bros/index.html")

# 3. Write app/robo-bros.tsx to route cleanly to /robo-bros/index.html
app_robo_bros = """import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, FONTS } from "../constants/Theme";

export default function RoboBrosScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.webContainer} onClick={() => iframeRef.current?.focus()}>
      <StatusBar hidden />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>Memuat Robo Bros...</Text>
        </View>
      )}

      {Platform.OS === "web" ? (
        <iframe
          ref={iframeRef}
          src="/robo-bros/index.html"
          style={styles.iframe}
          onLoad={() => {
            setLoading(false);
            iframeRef.current?.focus();
          }}
          allowFullScreen
        />
      ) : (
        <View style={styles.mobileNotice}>
          <Ionicons name="game-controller" size={64} color="#38bdf8" />
          <Text style={styles.mobileTitle}>Robo Bros</Text>
          <Text style={styles.mobileDesc}>
            Game Robo Bros adalah game 2D Platformer (HTML5 Canvas).
            Mainkan di versi web browser untuk pengalaman terbaik.
          </Text>
          <Pressable style={styles.playBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.playBtnText}>KEMBALI</Text>
          </Pressable>
        </View>
      )}

      <Pressable onPress={() => router.back()} style={styles.floatingExit}>
        <Ionicons name="exit-outline" size={20} color="#fff" />
        <Text style={styles.floatingExitText}>EXIT</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  webContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  floatingExit: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ef4444",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    zIndex: 9999,
    elevation: 10,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  floatingExitText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
  iframe: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    border: "none",
    backgroundColor: "#0f172a",
  },
  loadingOverlay: {
    position: "absolute",
    inset: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    zIndex: 5,
  },
  loadingText: {
    marginTop: 12,
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },
  mobileNotice: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 16,
  },
  mobileTitle: {
    ...FONTS.h2,
    fontSize: 28,
    color: "#38bdf8",
    fontWeight: "900",
  },
  mobileDesc: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320,
  },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0284c7",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 50,
    marginTop: 8,
  },
  playBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
});
"""

out_tsx = os.path.join(repo_dir, "app", "robo-bros.tsx")
with open(out_tsx, "w", encoding="utf-8") as f:
    f.write(app_robo_bros)

print(f"Successfully configured {out_tsx}")
