import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, FONTS } from "../constants/Theme";

export default function RoboChargeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#050A16" />

      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backBtnText}>Kembali</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Robo Charge</Text>
        <View style={{ width: 70 }} />
      </View>

      {/* Main Coming Soon Presentation */}
      <View style={styles.content}>
        {/* Glowing Background Ring */}
        <View style={styles.glowRing} />

        <View style={styles.card}>
          {/* Lock Icon Container */}
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={44} color="#F59E0B" />
          </View>

          {/* Status Badge */}
          <View style={styles.badge}>
            <Ionicons name="sparkles" size={13} color="#F59E0B" />
            <Text style={styles.badgeText}>COMING SOON</Text>
          </View>

          {/* Game Title */}
          <Text style={styles.title}>Robo Charge</Text>
          <Text style={styles.category}>Voltase Daya & Pelarian Robot</Text>

          {/* Description */}
          <Text style={styles.desc}>
            Petualangan voltase daya dan pengisian baterai robot sedang dalam tahap pengembangan serta penyempurnaan agar mekanika kontrol dan animasi berjalan mulus serta responsif di perangkat ponsel!
          </Text>

          {/* Features in development */}
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="battery-charging-high" size={18} color="#38BDF8" />
              <Text style={styles.featureText}>Mekanisme isi ulang baterai & manajemen daya voltase</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="flash-alert" size={18} color="#38BDF8" />
              <Text style={styles.featureText}>Tantangan rintangan kota & pelarian banteng mekanik</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="map-marker-path" size={18} color="#38BDF8" />
              <Text style={styles.featureText}>Eksplorasi arena kota global & ranking skor</Text>
            </View>
          </View>

          {/* Return button */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Ionicons name="game-controller" size={20} color="#050A16" />
            <Text style={styles.primaryBtnText}>Mainkan Game Lainnya</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050A16",
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
    gap: 4,
  },
  backBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    position: "relative",
  },
  glowRing: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(245, 158, 11, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
  },
  card: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "rgba(13, 27, 51, 0.92)",
    borderWidth: 1.5,
    borderColor: "rgba(245, 158, 11, 0.35)",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderWidth: 2,
    borderColor: "rgba(245, 158, 11, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.5)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 99,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FBBF24",
    letterSpacing: 1.2,
  },
  title: {
    ...FONTS.h2,
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 4,
    textAlign: "center",
  },
  category: {
    fontSize: 12,
    fontWeight: "700",
    color: "#38BDF8",
    marginBottom: 14,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  desc: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
  },
  featuresList: {
    width: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 14,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.15)",
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#E2E8F0",
    flex: 1,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F59E0B",
    width: "100%",
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#050A16",
    letterSpacing: 0.5,
  },
});
