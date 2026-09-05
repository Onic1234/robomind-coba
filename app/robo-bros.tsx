import React, { useState, useEffect, useRef } from "react";
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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import { COLORS, FONTS } from "../constants/Theme";
import { HowToPlayModal } from "../components/HowToPlayModal";
import { saveGameSession } from "../lib/gameProgressService";

export default function RoboBrosScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(true);
  const [rotatePrompt, setRotatePrompt] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const fullscreenRef = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timeout);
  }, []);
  useEffect(() => {
    const messageHandler = (e: MessageEvent) => {
      if (e.data && (e.data.type === "GAME_OVER" || e.data.type === "GAME_COMPLETE" || e.data.type === "LEVEL_COMPLETE" || e.data.type === "GAME_RESULT")) {
        saveGameSession({
          gameId: "robo-bros",
          level: e.data.level || 1,
          score: e.data.score || 100,
          xpEarned: e.data.xp || 100,
          coinsEarned: e.data.coins || 30,
          completed: e.data.completed !== false,
          durationSeconds: e.data.duration || 60,
        });
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("message", messageHandler);
      return () => window.removeEventListener("message", messageHandler);
    }
  }, []);

  // Auto-switch to landscape when the game is opened on a phone
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    const isMobile = () => /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
    const isPortrait = () => window.innerHeight > window.innerWidth;

    const lockLandscape = async () => {
      try {
        if (!fullscreenRef.current && document.fullscreenElement === null) {
          await document.documentElement.requestFullscreen?.();
          fullscreenRef.current = true;
        }
      } catch (e) {
        // Fullscreen needs a user gesture; the prompt button will retry
      }
      try {
        const so = (screen as any).orientation;
        if (so && so.lock) {
          await so.lock("landscape");
        }
      } catch (e) {
        // Orientation lock not supported (e.g. iOS Safari) — rotate prompt covers it
      }
    };

    const updatePrompt = () => {
      setRotatePrompt(isMobile() && isPortrait());
    };

    updatePrompt();
    const t = setTimeout(() => {
      if (isMobile()) lockLandscape();
    }, 400);
    window.addEventListener("resize", updatePrompt);
    window.addEventListener("orientationchange", updatePrompt);

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", updatePrompt);
      window.removeEventListener("orientationchange", updatePrompt);
      try {
        const so = (screen as any).orientation;
        if (so && so.unlock) so.unlock();
      } catch (e) {}
      if (fullscreenRef.current && document.fullscreenElement) {
        document.exitFullscreen?.();
      }
    };
  }, []);

  return (
    <View style={styles.webContainer} {...({ onClick: () => iframeRef.current?.focus() } as any)}>
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
        <WebView
                    androidHardwareAccelerationDisabled={false}
          renderToHardwareTextureAndroid={true}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
source={{ uri: "file:///android_asset/robo-bros/index.html" }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={["*"]}
          allowFileAccessFromFileURLs={true}
          allowUniversalAccessFromFileURLs={true}
          onLoadEnd={() => setLoading(false)}
        />
      )}

      <Pressable onPress={() => router.back()} style={styles.floatingExit}>
        <Ionicons name="exit-outline" size={20} color="#fff" />
        <Text style={styles.floatingExitText}>EXIT</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          if (typeof window !== "undefined" && iframeRef.current) {
            try {
              const win = iframeRef.current.contentWindow as any;
              if (win && win.showBrosResultModal) {
                win.showBrosResultModal();
              }
            } catch (err) {
              console.log("Error opening stats modal:", err);
            }
          }
        }}
        style={styles.floatingStats}
      >
        <Ionicons name="analytics" size={18} color="#fff" />
        <Text style={styles.floatingStatsText}>STATISTIK</Text>
      </Pressable>

      <Pressable onPress={() => setShowHelp(true)} style={styles.floatingHelp}>
        <Ionicons name="help-circle" size={22} color="#fff" />
      </Pressable>

      {rotatePrompt && (
        <View style={styles.rotateOverlay}>
          <MaterialCommunityIcons name="rotate-orbit" size={56} color="#38bdf8" />
          <Text style={styles.rotateTitle}>Putar HP ke LANDSCAPE</Text>
          <Text style={styles.rotateDesc}>
            Robo Bros adalah game 2D platformer. Miringkan HP-mu ke posisi mendatar untuk pengalaman terbaik.
          </Text>
          <Pressable
            style={styles.rotateBtn}
            onPress={() => {
              (async () => {
                try {
                  if (document.fullscreenElement === null) {
                    await document.documentElement.requestFullscreen?.();
                    fullscreenRef.current = true;
                  }
                  const so = (screen as any).orientation;
                  if (so && so.lock) {
                    await so.lock("landscape");
                  }
                } catch (e) {}
                setRotatePrompt(false);
              })();
            }}
          >
            <Ionicons name="expand" size={20} color="#fff" />
            <Text style={styles.rotateBtnText}>MASUK LANDSCAPE</Text>
          </Pressable>
        </View>
      )}

      <HowToPlayModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title="Cara Main Robo Bros"
        goal="Gerakkan robot mencapai bendera finish di setiap level sambil mengumpulkan buah!"
        accentColor="#0284C7"
        subtitleColor="#0369A1"
        steps={[
          { emoji: "1️⃣", text: "Gunakan tombol ← / → (atau A / D) untuk bergerak, ↑ atau Spasi untuk melompat." },
          { emoji: "2️⃣", text: "Kumpulkan buah (strawberry/kiwi) yang ada di sepanjang jalan untuk menambah skor." },
          { emoji: "3️⃣", text: "Hindari musuh — kena musuh berarti luka." },
          { emoji: "4️⃣", text: "Sentuh bendera finish untuk menyelesaikan level. Di HP gunakan tombol ◀ ▶ ▲ di layar." },
        ]}
        tips={[
          "Kumpulkan semua buah di level untuk pencapaian 100%.",
          "Tekan P untuk pause, dan Esc untuk keluar dari fullscreen.",
        ]}
      />
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
  floatingStats: {
    position: "absolute",
    top: 16,
    right: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#8b5cf6",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    zIndex: 9999,
    elevation: 10,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  floatingStatsText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  floatingHelp: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0284c7",
    zIndex: 9999,
    elevation: 10,
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  rotateOverlay: {
    position: "absolute",
    inset: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "rgba(8, 15, 30, 0.92)",
    zIndex: 9998,
  },
  rotateTitle: {
    color: "#38bdf8",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 14,
    textAlign: "center",
    letterSpacing: 1,
  },
  rotateDesc: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 10,
    maxWidth: 340,
  },
  rotateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0284c7",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 50,
    marginTop: 24,
    elevation: 6,
  },
  rotateBtnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  iframe: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderWidth: 0,
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
    ...FONTS.heading,
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
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
});
