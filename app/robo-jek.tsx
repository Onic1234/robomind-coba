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
import { COLORS, FONTS } from "../constants/Theme";
import { HowToPlayModal } from "../components/HowToPlayModal";

export default function RoboJekScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeSrc = useRef(`/robo-jek/index.html?v=${Date.now()}`).current;

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
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timeout);
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
        <View style={styles.mobileNotice}>
          <Ionicons name="game-controller" size={64} color="#38bdf8" />
          <Text style={styles.mobileTitle}>Robo-Jek</Text>
          <Text style={styles.mobileDesc}>
            Game Robo-Jek adalah game berbasis web (HTML5 Canvas).
            Mainkan di versi web browser untuk pengalaman terbaik.
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
        title="Cara Main Robo-Jek"
        goal="Antar paket ke semua checkpoint dan tujuan sebelum waktu habis tanpa menabrak!"
        accentColor="#0284C7"
        subtitleColor="#0369A1"
        steps={[
          { emoji: "1️⃣", text: "Pilih kendaraan (motor/mobil) dan mode kecepatan (LOW / MIDDLE / FASTER)." },
          { emoji: "2️⃣", text: "Kemudi dengan WASD atau tombol panah. Di HP gunakan D-pad sentuh di layar." },
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
});
