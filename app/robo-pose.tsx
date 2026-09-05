import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { useRouter } from "expo-router";
import { saveGameSession } from "../lib/gameProgressService";

export default function RoboPoseScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const messageHandler = (e: MessageEvent) => {
      if (e.data) {
        if (e.data.type === "GAME_EXIT") {
          router.back();
          return;
        }
        if (
          e.data.type === "GAME_OVER" ||
          e.data.type === "GAME_COMPLETE" ||
          e.data.type === "LEVEL_COMPLETE" ||
          e.data.type === "GAME_RESULT"
        ) {
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
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("message", messageHandler);
      return () => window.removeEventListener("message", messageHandler);
    }
  }, [router]);

  if (Platform.OS !== "web") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />
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
              const data =
                typeof e.nativeEvent.data === "string"
                  ? JSON.parse(e.nativeEvent.data)
                  : e.nativeEvent.data;
              if (data && data.type === "GAME_EXIT") {
                router.back();
                return;
              }
              if (
                data &&
                (data.type === "GAME_OVER" ||
                  data.type === "GAME_COMPLETE" ||
                  data.type === "LEVEL_COMPLETE" ||
                  data.type === "GAME_RESULT")
              ) {
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
        src="/web-games/robo-pose/index.html"
        style={styles.iframe}
        onLoad={() => {
          setLoading(false);
          iframeRef.current?.focus();
        }}
        allowFullScreen
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1e1b4b" },
  webContainer: { flex: 1, backgroundColor: "#1e1b4b" },
  iframe: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderWidth: 0,
    backgroundColor: "#1e1b4b",
  },
  loadingOverlay: {
    position: "absolute",
    inset: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(30, 27, 75, 0.9)",
    zIndex: 5,
  },
  loadingText: { marginTop: 12, color: "#94a3b8", fontSize: 14, fontWeight: "600" },
  webview: { flex: 1, backgroundColor: "#000" },
});
