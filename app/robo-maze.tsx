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
import { HowToPlayModal } from "../components/HowToPlayModal";
import { saveGameSession } from "../lib/gameProgressService";

export default function RoboMazeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const iframeRef = useRef<any>(null);
  const containerRef = useRef<any>(null);

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
          gameId: "robo-maze",
          level: e.data.level || 1,
          score: e.data.score || 100,
          xpEarned: e.data.xp || 120,
          coinsEarned: e.data.coins || 50,
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
          <Text style={styles.headerTitle}>Robo Maze</Text>
          <View style={{ width: 40 }} />
        </View>
        <WebView
                    androidHardwareAccelerationDisabled={false}
          renderToHardwareTextureAndroid={true}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
source={{ uri: "file:///android_asset/robo-maze/index.html" }}
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
                  gameId: "robo-maze",
                  level: data.level || 1,
                  score: data.score || 100,
                  xpEarned: data.xp || 120,
                  coinsEarned: data.coins || 50,
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
    <View style={styles.webContainer}>
      <StatusBar hidden />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>Memuat Robo Maze...</Text>
        </View>
      )}

      <iframe
        ref={iframeRef}
        src="/web-games/robo-maze/index.html"
        style={styles.iframe}
        onLoad={() => {
          setLoading(false);
          iframeRef.current?.focus();
        }}
        allowFullScreen
      />

      <Pressable onPress={() => router.back()} style={styles.floatingExit}>
        <Ionicons name="exit-outline" size={20} color="#fff" />
        <Text style={styles.floatingExitText}>EXIT</Text>
      </Pressable>

      <Pressable onPress={toggleFullscreen} style={styles.floatingFs}>
        <Ionicons name={isFullscreen ? "contract" : "expand"} size={20} color="#fff" />
        <Text style={styles.floatingFsText}>{isFullscreen ? "WINDOW" : "FULL"}</Text>
      </Pressable>

      <Pressable onPress={() => setShowHelp(true)} style={styles.floatingHelp}>
        <Ionicons name="help-circle" size={22} color="#fff" />
      </Pressable>

      <HowToPlayModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title="Cara Main Robo Maze"
        goal="Ingat posisi dinding labirin, lalu arahkan Robocube ke portal finish tanpa menabrak!"
        accentColor="#0D9488"
        subtitleColor="#0F766E"
        steps={[
          { emoji: "1️⃣", text: "Pada fase awal (8 detik) dinding terlihat — hafalkan jalurnya." },
          { emoji: "2️⃣", text: "Setelah itu dinding jadi tak terlihat. Arahkan robot memakai D-pad / tombol panah." },
          { emoji: "3️⃣", text: "Gunakan tombol \"Intip\" untuk melihat dinding 1,5 detik (jumlah terbatas per level)." },
          { emoji: "4️⃣", text: "Jangan menabrak dinding tak terlihat — setiap tabrakan mengurangi Core (3 nyawa)." },
        ]}
        tips={[
          "Gunakan kesempatan Intip saat ragu, jangan boros di awal.",
          "Semakin tinggi level, semakin sedikit kesempatan Intip — hafalkan jalur dengan baik!",
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  webContainer: {
    flex: 1,
    backgroundColor: "#111827",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(56, 189, 248, 0.2)",
  },
  headerTitle: {
    fontWeight: "800",
    fontSize: 18,
    color: "#38bdf8",
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
    borderWidth: 0,
    backgroundColor: "#111827",
  },
  loadingOverlay: {
    position: "absolute",
    inset: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.9)",
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
    fontWeight: "900",
    fontSize: 28,
    color: "#38bdf8",
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
  floatingFs: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    zIndex: 9999,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.4)",
  },
  floatingFsText: {
    color: "#38bdf8",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  floatingHelp: {
    position: "absolute",
    top: 16,
    left: 108,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    zIndex: 9999,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.4)",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
});
