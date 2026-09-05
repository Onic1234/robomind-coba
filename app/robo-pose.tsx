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
import { WebView } from "react-native-webview";
import { useRouter } from "expo-router";
import { HowToPlayModal } from "../components/HowToPlayModal";
import { saveGameSession } from "../lib/gameProgressService";

export default function RoboPoseScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
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
          gameId: "robo-pose",
          level: 1,
          score: 100,
          xpEarned: 80,
          coinsEarned: 30,
          completed: true,
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
          <Text style={styles.headerTitle}>Robo Pose</Text>
          <View style={{ width: 40 }} />
        </View>
        <WebView
          source={{ uri: "file:///android_asset/robo-pose/index.html" }}
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
                  gameId: "robo-pose",
                  level: 1,
                  score: 100,
                  xpEarned: 80,
                  coinsEarned: 30,
                  completed: true,
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
          <ActivityIndicator size="large" color="#a78bfa" />
          <Text style={styles.loadingText}>Memuat Robo Pose...</Text>
        </View>
      )}

      <iframe
        ref={iframeRef}
        src="/robo-pose/index.html"
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1e1b4b" },
  webContainer: { flex: 1, backgroundColor: "#1e1b4b" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: "rgba(30, 27, 75, 0.95)",
    borderBottomWidth: 1, borderBottomColor: "rgba(167, 139, 250, 0.2)",
  },
  headerTitle: { fontWeight: "800", fontSize: 18, color: "#a78bfa" },
  backBtn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20,
    borderWidth: 1, borderColor: "rgba(167, 139, 250, 0.3)",
  },
  floatingExit: {
    position: "absolute", top: 16, left: 16,
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#ef4444", paddingVertical: 10, paddingHorizontal: 18,
    borderRadius: 12, zIndex: 9999, elevation: 10,
    shadowColor: "#ef4444", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8,
  },
  floatingExitText: { color: "#fff", fontSize: 14, fontWeight: "900", letterSpacing: 1 },
  floatingFs: {
    position: "absolute", top: 16, right: 16,
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12,
    zIndex: 9999, elevation: 10,
    borderWidth: 1, borderColor: "rgba(167, 139, 250, 0.4)",
  },
  floatingFsText: { color: "#a78bfa", fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  iframe: {
    position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
    borderWidth: 0, backgroundColor: "#1e1b4b",
  },
  loadingOverlay: {
    position: "absolute", inset: 0,
    justifyContent: "center", alignItems: "center",
    backgroundColor: "rgba(30, 27, 75, 0.9)", zIndex: 5,
  },
  loadingText: { marginTop: 12, color: "#94a3b8", fontSize: 14, fontWeight: "600" },
  mobileNotice: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40, gap: 16 },
  mobileTitle: { fontWeight: "900", fontSize: 28, color: "#a78bfa" },
  mobileDesc: { color: "#94a3b8", fontSize: 14, textAlign: "center", lineHeight: 22, maxWidth: 320 },
  playBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#7c3aed", paddingVertical: 14, paddingHorizontal: 32,
    borderRadius: 50, marginTop: 8,
  },
  playBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  webview: { flex: 1, backgroundColor: "#000" },
});
