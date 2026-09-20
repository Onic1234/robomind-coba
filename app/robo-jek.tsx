import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { WebView } from "react-native-webview";
import { COLORS, FONTS } from "../constants/Theme";
import { HowToPlayModal } from "../components/HowToPlayModal";
import { saveGameSession } from "../lib/gameProgressService";

export default function RoboJekScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<any>(null);
  const iframeSrc = useRef(`/web-games/robo-jek/index.html?v=${Date.now()}`).current;

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    if (typeof document !== "undefined") {
      document.addEventListener('fullscreenchange', handler);
      return () => document.removeEventListener('fullscreenchange', handler);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timeout);
  }, []);

  
  useEffect(() => {
    const messageHandler = (e: MessageEvent) => {
      if (e.data && (e.data.type === "GAME_OVER" || e.data.type === "GAME_COMPLETE" || e.data.type === "LEVEL_COMPLETE" || e.data.type === "GAME_RESULT")) {
        saveGameSession({
          gameId: "robo-jek",
          level: e.data.level || 1,
          score: e.data.score || 100,
          xpEarned: e.data.xp || 100,
          coinsEarned: e.data.coins || 40,
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

  if (Platform.OS !== "web") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Robo-Jek</Text>
          <View style={{ width: 40 }} />
        </View>
        <WebView
                    androidHardwareAccelerationDisabled={false}
          renderToHardwareTextureAndroid={true}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
source={{ uri: "file:///android_asset/robo-jek/index.html" }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={["*"]}
          allowFileAccessFromFileURLs={true}
          allowUniversalAccessFromFileURLs={true}
          onMessage={(e) => {
            try {
              const data = typeof e.nativeEvent.data === "string" ? JSON.parse(e.nativeEvent.data) : e.nativeEvent.data;
              if (data && (data.type === "GAME_OVER" || data.type === "GAME_COMPLETE" || data.type === "LEVEL_COMPLETE" || data.type === "GAME_RESULT")) {
                saveGameSession({
                  gameId: "robo-jek",
                  level: data.level || 1,
                  score: data.score || 100,
                  xpEarned: data.xp || 100,
                  coinsEarned: data.coins || 40,
                  completed: data.completed !== false,
                  durationSeconds: data.duration || 60,
                });
              }
            } catch (err) {}
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <View ref={containerRef} style={styles.webContainer}>
      <StatusBar hidden />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>Memuat Robo-Jek...</Text>
        </View>
      )}

      <iframe
        ref={iframeRef}
        src={iframeSrc}
        style={styles.iframe}
        onLoad={() => {
          setLoading(false);
          iframeRef.current?.focus();
        }}
        allowFullScreen
      />

      {/* Top Left Navigation & Help Pod */}
      <View style={styles.topLeftControls}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.floatingExit, pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] }]}
        >
          <Ionicons name="arrow-back" size={15} color="#fff" />
          <Text style={styles.floatingExitText}>EXIT</Text>
        </Pressable>

        <Pressable
          onPress={() => setShowHelp(true)}
          style={({ pressed }) => [styles.floatingHelp, pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] }]}
        >
          <Ionicons name="help-circle" size={16} color="#38bdf8" />
          <Text style={styles.floatingHelpText}>TIPS</Text>
        </Pressable>
      </View>

      {/* Top Right Fullscreen Pod */}
      <Pressable
        onPress={toggleFullscreen}
        style={({ pressed }) => [styles.floatingFs, pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] }]}
      >
        <Ionicons name={isFullscreen ? "contract" : "expand"} size={15} color="#38bdf8" />
        <Text style={styles.floatingFsText}>{isFullscreen ? "WINDOW" : "FULL"}</Text>
      </Pressable>

      <HowToPlayModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title="Cara Main Robo-Jek"
        goal="Antar paket ke semua checkpoint dan tujuan sebelum waktu habis tanpa menabrak!"
        accentColor="#0284C7"
        subtitleColor="#0369A1"
        steps={[
          { emoji: "1️⃣", text: "Pilih kendaraan (motor/mobil) dan mode kecepatan (LOW / MIDDLE / FASTER)." },
          { emoji: "2️⃣", text: "Di HP: geser analog kiri bebas 360° untuk memutar arah kendaraan, tahan GAS (kanan) untuk maju, dan REM untuk berhenti lalu mundur. Di keyboard: A/D setir, W gas, S rem/mundur." },
          { emoji: "3️⃣", text: "Lewati semua checkpoint lalu sampai ke tujuan dalam batas waktu (gold time)." },
          { emoji: "4️⃣", text: "Hindari tabrakan dengan rintangan kota untuk nilai dan bintang terbaik!" },
        ]}
        tips={[
          "Rute melewati kota-kota Indonesia dari Banda Aceh sampai Jayapura.",
          "Kecepatan tinggi memang cepat, tapi lebih sulit dikendalikan.",
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030712",
  },
  webContainer: {
    flex: 1,
    backgroundColor: "#030712",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(3, 7, 18, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(56, 189, 248, 0.2)",
  },
  headerTitle: {
    ...FONTS.h3,
    fontSize: 18,
    color: "#38bdf8",
    fontWeight: "800",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
  },
  topLeftControls: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "column",
    gap: 8,
    zIndex: 9999,
    elevation: 10,
    ...Platform.select({
      web: {
        top: "max(12px, env(safe-area-inset-top, 12px))",
        left: "max(12px, env(safe-area-inset-left, 12px))",
      } as any,
      default: {},
    }),
  },
  floatingExit: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "rgba(239, 68, 68, 0.92)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(254, 202, 202, 0.35)",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  floatingExitText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  floatingHelp: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.4)",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  floatingHelpText: {
    color: "#38bdf8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  floatingFs: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    zIndex: 9999,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.4)",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    ...Platform.select({
      web: {
        top: "max(12px, env(safe-area-inset-top, 12px))",
        right: "max(12px, env(safe-area-inset-right, 12px))",
      } as any,
      default: {},
    }),
  },
  floatingFsText: {
    color: "#38bdf8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  iframe: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderWidth: 0,
    backgroundColor: "#030712",
  },
  loadingOverlay: {
    position: "absolute",
    inset: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(3, 7, 18, 0.9)",
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
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
});
