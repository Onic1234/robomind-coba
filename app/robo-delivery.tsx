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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HowToPlayModal } from "../components/HowToPlayModal";
import { COLORS, FONTS } from "../constants/Theme";

const STORAGE_KEY_LEVEL = "robo_delivery_current_level";
const STORAGE_KEY_COINS = "user_coins_balance";

export default function RoboDeliveryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timeout);
  }, []);

  // Listen to postMessage from game engine for level completions & rewards
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data && data.type === "LEVEL_COMPLETE") {
          const coinsReward = data.coins || 350;
          const currentCoinsStr = await AsyncStorage.getItem(STORAGE_KEY_COINS);
          const currentCoins = currentCoinsStr ? parseInt(currentCoinsStr, 10) : 1250;
          const newCoins = currentCoins + coinsReward;

          await AsyncStorage.setItem(STORAGE_KEY_COINS, newCoins.toString());

          if (data.level) {
            await AsyncStorage.setItem(STORAGE_KEY_LEVEL, (data.level + 1).toString());
          }
        }
      } catch (e) {
        // Ignore non-json messages
      }
    };

    if (Platform.OS === "web") {
      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
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
          <Text style={styles.headerTitle}>Robo Delivery</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.mobileNotice}>
          <Ionicons name="cube-outline" size={64} color="#0284c7" />
          <Text style={styles.mobileTitle}>Robo Delivery</Text>
          <Text style={styles.mobileDesc}>
            Game Robo Delivery adalah game petualangan map isometrik 3D.
            Mainkan di versi web browser untuk pengalaman terbaik!
          </Text>
          <Pressable style={styles.playBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.playBtnText}>KEMBALI</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View ref={containerRef} style={styles.webContainer} onClick={() => iframeRef.current?.focus()}>
      <StatusBar hidden />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={styles.loadingText}>Memuat Map Robo Delivery...</Text>
        </View>
      )}

      <iframe
        ref={iframeRef}
        src="/robo-delivery/index.html"
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
        title="Cara Main Robo Delivery"
        goal="Bantu Robot mengambil makanan dan mengantarkannya ke pelanggan sebelum waktu habis!"
        accentColor="#0284C7"
        subtitleColor="#0369A1"
        steps={[
          { emoji: "1️⃣", text: "Sentuh lingkaran node di map untuk mengarahkan jalur jalan Robot." },
          { emoji: "2️⃣", text: "Jalan ke Food Station untuk mengambil makanan (Pizza 🍕, Burger 🍔, dll)." },
          { emoji: "3️⃣", text: "Antarkan makanan ke Pelanggan (Orang) yang memiliki bubble pesanan makanan." },
          { emoji: "4️⃣", text: "Hati-hati menabrak Orang Berjalan — jika menabrak, robot akan memantul kembali ke node asal!" },
          { emoji: "5️⃣", text: "Selesaikan semua pengantaran sebelum Countdown Timer ⏱️ habis!" },
        ]}
        tips={[
          "Perhatikan rute orang berjalan agar tidak tertabrak saat melintas.",
          "Ambil makanan yang paling dekat terlebih dahulu untuk menghemat waktu."
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#071e27",
  },
  webContainer: {
    flex: 1,
    backgroundColor: "#7dd3fc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#071e27",
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
  iframe: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    border: "none",
    backgroundColor: "#7dd3fc",
  },
  loadingOverlay: {
    position: "absolute",
    inset: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(125, 211, 252, 0.95)",
    zIndex: 5,
  },
  loadingText: {
    marginTop: 12,
    color: "#0369a1",
    fontSize: 14,
    fontWeight: "700",
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
