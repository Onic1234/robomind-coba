import React from "react";
import { StyleSheet, View, Text, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { COLORS, SPACING, SHAPES, FONTS, SHADOWS } from "../../constants/Theme";
import Button from "../../components/ui/Button";

interface ModuleItem {
  id: string;
  title: string;
  description: string;
  image: any;
  badgeText: string;
  buttonText: string;
  buttonVariant: "accent" | "primary" | "secondary";
  isLocked?: boolean;
}

export default function ExploreScreen() {
  const freeModules: ModuleItem[] = [
    {
      id: "robotika",
      title: "Pengenalan Robotika",
      description: "Modul dasar untuk memahami apa itu robot dan bagaimana mereka bekerja di dunia nyata.",
      image: require("../../assets/images/modul_robot.png"),
      badgeText: "Gratis",
      buttonText: "Mulai Belajar",
      buttonVariant: "accent", // Green button
    },
    {
      id: "pemrograman_dasar",
      title: "Logika Pemrograman Dasar",
      description: "Pelajari cara berpikir layaknya seorang programmer dengan latihan logika sederhana.",
      image: require("../../assets/images/modul_coding.png"),
      badgeText: "Gratis",
      buttonText: "Mulai Belajar",
      buttonVariant: "accent",
    },
    {
      id: "algoritma",
      title: "Eksplorasi Algoritma",
      description: "Pahami konsep algoritma dengan menyusun langkah-langkah sistematis melalui game.",
      image: require("../../assets/images/game_math.png"),
      badgeText: "Gratis",
      buttonText: "Mulai Belajar",
      buttonVariant: "accent",
    },
  ];

  const premiumModules: ModuleItem[] = [
    {
      id: "block_programming",
      title: "Dasar Pemrograman Block",
      description: "Pelajari konsep dasar algoritma dengan menggunakan block programming yang interaktif.",
      image: require("../../assets/images/game_coding.png"),
      badgeText: "Rp 50.000",
      buttonText: "Beli Modul",
      buttonVariant: "primary", // Blue button
    },
    {
      id: "animasi",
      title: "Animasi Sederhana",
      description: "Buat animasi pertamamu dan pahami bagaimana frame by frame bekerja dalam game.",
      image: require("../../assets/images/modul_retro.png"),
      badgeText: "Rp 75.000",
      buttonText: "Beli Modul",
      buttonVariant: "primary",
    },
    {
      id: "ai_dasar",
      title: "Logika Lanjutan & AI Dasar",
      description: "Modul premium yang mengajarkan konsep AI dasar dan logika kompleks untuk game 3D.",
      image: require("../../assets/images/robomind_hero.png"),
      badgeText: "",
      buttonText: "Berlangganan untuk Membuka",
      buttonVariant: "secondary", // Custom black styling
      isLocked: true,
    },
  ];

  const renderModuleCard = (item: ModuleItem) => {
    const isCustomBlackButton = item.id === "ai_dasar";
    
    return (
      <View key={item.id} style={styles.card}>
        <View style={styles.imageWrapper}>
          <Image
            source={item.image}
            style={styles.cardImage}
            contentFit="cover"
            transition={300}
          />
          
          {/* Price or Gratis Badge */}
          {item.badgeText ? (
            <View
              style={[
                styles.badge,
                item.badgeText === "Gratis" ? styles.badgeGreen : styles.badgeDark,
              ]}
            >
              <Text style={styles.badgeText}>{item.badgeText}</Text>
            </View>
          ) : null}

          {/* Locked Overlay HUD */}
          {item.isLocked && (
            <View style={styles.lockedOverlay}>
              <View style={styles.lockCircle}>
                <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.lockedOverlayText}>MODUL PREMIUM</Text>
            </View>
          )}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>
          
          <Button
            title={item.buttonText}
            onPress={() => alert(`Aksi untuk modul: ${item.title}`)}
            variant={item.buttonVariant}
            style={isCustomBlackButton ? styles.blackCtaButton : undefined}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Block */}
        <View style={styles.headerContainer}>
          <Text style={styles.pageTitle}>MODUL PEMBELAJARAN</Text>
          <Text style={styles.pageSubtitle}>
            Tingkatkan kemampuan logika dan kreativitas anak melalui modul-modul interaktif yang dirancang khusus untuk pembelajaran menyenangkan.
          </Text>
        </View>

        {/* Free Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="gift-outline" size={18} color={COLORS.brandGreen} />
            <Text style={styles.sectionTitle}>Modul Pembelajaran Gratis</Text>
          </View>
          <View style={styles.cardsGrid}>
            {freeModules.map(renderModuleCard)}
          </View>
        </View>

        {/* Premium Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="ribbon-outline" size={18} color={COLORS.brandBlue} />
            <Text style={styles.sectionTitle}>Modul Spesialisasi & Premium</Text>
          </View>
          <View style={styles.cardsGrid}>
            {premiumModules.map(renderModuleCard)}
          </View>
        </View>

        {/* Bottom Lihat Semua Button */}
        <View style={styles.bottomCtaWrapper}>
          <Button
            title="LIHAT SEMUA MODUL"
            onPress={() => alert("Membuka katalog lengkap semua modul")}
            variant="secondary"
            style={styles.outlineCtaButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.sm,
  },
  pageTitle: {
    ...FONTS.heading,
    fontSize: 22,
    color: COLORS.textDark,
    textAlign: "center",
    marginBottom: SPACING.sm,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    ...FONTS.bodyRegular,
    fontSize: 13,
    color: COLORS.textMedium,
    textAlign: "center",
    lineHeight: 18,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...FONTS.subheading,
    fontSize: 16,
    color: COLORS.textDark,
  },
  cardsGrid: {
    gap: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: SHAPES.radiusLg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.light,
  },
  imageWrapper: {
    width: "100%",
    height: 160,
    backgroundColor: "#F1F5F9",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    paddingVertical: 4,
    paddingHorizontal: SPACING.md,
    borderRadius: SHAPES.radiusSm,
    ...SHADOWS.light,
  },
  badgeGreen: {
    backgroundColor: COLORS.brandGreen,
  },
  badgeDark: {
    backgroundColor: COLORS.textDark,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.65)", // Blur style dark semi-transparent screen
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.sm,
  },
  lockCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  lockedOverlayText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },
  textContainer: {
    padding: SPACING.lg,
  },
  cardTitle: {
    ...FONTS.bodyBold,
    fontSize: 15,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  cardDescription: {
    ...FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.textMedium,
    lineHeight: 16,
    marginBottom: SPACING.lg,
  },
  blackCtaButton: {
    backgroundColor: COLORS.textDark,
    borderColor: COLORS.textDark,
  },
  bottomCtaWrapper: {
    alignItems: "center",
    marginTop: SPACING.xs,
    marginBottom: Platform.OS === "ios" ? SPACING.xxl : SPACING.lg,
  },
  outlineCtaButton: {
    borderColor: COLORS.borderLight,
    borderWidth: 1.5,
    backgroundColor: COLORS.cardWhite,
    width: "70%",
    borderRadius: SHAPES.radiusRound,
  },
});
