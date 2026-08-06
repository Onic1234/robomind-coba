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
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, FONTS } from "../constants/Theme";
import { HowToPlayModal } from "../components/HowToPlayModal";

export default function RoboBrosScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(true);
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

      <Pressable onPress={() => setShowHelp(true)} style={styles.floatingHelp}>
        <Ionicons name="help-circle" size={22} color="#fff" />
      </Pressable>

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
