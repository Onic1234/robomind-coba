import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, TextInput, Pressable, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { COLORS, SPACING, SHAPES, FONTS, SHADOWS } from "../../constants/Theme";

interface ArticleItem {
  id: string;
  title: string;
  category: string;
  readTime: string;
  image: any;
}

interface ModuleItem {
  id: string;
  title: string;
  image: any;
  color: string;
}

interface VideoItem {
  id: string;
  title: string;
  duration: string;
  views: string;
  image: any;
}

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const articles: ArticleItem[] = [
    {
      id: "art1",
      title: "Tips Mengurangi Brainrot pada Anak",
      category: "Parenting",
      readTime: "5 Min read",
      image: require("../../assets/images/news_classroom.png"),
    },
    {
      id: "art2",
      title: "Pentingnya Logika Sejak Dini",
      category: "Edukasi",
      readTime: "4 Min read",
      image: require("../../assets/images/news_nature.png"),
    },
  ];

  const popularModules: ModuleItem[] = [
    {
      id: "mod1",
      title: "Robotika Dasar",
      image: require("../../assets/images/modul_robot.png"),
      color: "#EFF6FF",
    },
    {
      id: "mod2",
      title: "Coding Dasar",
      image: require("../../assets/images/modul_coding.png"),
      color: "#F0FDF4",
    },
    {
      id: "mod3",
      title: "Algoritma Seru",
      image: require("../../assets/images/game_math.png"),
      color: "#FFF7ED",
    },
  ];

  const videos: VideoItem[] = [
    {
      id: "vid1",
      title: "Apa itu Algoritma?",
      duration: "05:12",
      views: "512 views",
      image: require("../../assets/images/game_coding.png"),
    },
    {
      id: "vid2",
      title: "Mengenal Cara Kerja Robot",
      duration: "08:45",
      views: "320 views",
      image: require("../../assets/images/robomind_hero.png"),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      {/* Header with Search and Notification Bell */}
      <View style={styles.header}>
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search" size={18} color={COLORS.textLight} style={styles.searchIcon} />
          <TextInput
            placeholder="Cari artikel, modul, video..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textLight}
            style={styles.searchInput}
          />
        </View>
        <Pressable style={styles.bellButton} onPress={() => alert("Membuka Notifikasi")}>
          <Ionicons name="notifications-outline" size={20} color={COLORS.textDark} />
          <View style={styles.notificationDot} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Artikel Terbaru Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Artikel Terbaru</Text>
          <Pressable onPress={() => alert("Membuka Semua Artikel")}>
            <Text style={styles.linkText}>{"Lihat Semua >"}</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {articles.map((item) => (
            <Pressable 
              key={item.id} 
              style={styles.articleCard}
              onPress={() => alert(`Membaca artikel: ${item.title}`)}
            >
              <Image source={item.image} style={styles.articleImage} contentFit="cover" />
              <View style={styles.articleContent}>
                <View style={styles.articleBadgeRow}>
                  <Text style={styles.articleCategory}>{item.category}</Text>
                  <Text style={styles.articleBullet}>•</Text>
                  <Text style={styles.articleReadTime}>{item.readTime}</Text>
                </View>
                <Text style={styles.articleCardTitle} numberOfLines={2}>{item.title}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Modul Populer Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Modul Populer</Text>
          <Pressable onPress={() => alert("Membuka Semua Modul")}>
            <Text style={styles.linkText}>{"Lihat Semua >"}</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {popularModules.map((mod) => (
            <Pressable 
              key={mod.id} 
              style={[styles.moduleCard, { backgroundColor: mod.color }]}
              onPress={() => alert(`Membuka modul: ${mod.title}`)}
            >
              <Image source={mod.image} style={styles.moduleImage} contentFit="cover" />
              <Text style={styles.moduleCardTitle}>{mod.title}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Video Edukasi Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Video Edukasi</Text>
          <Pressable onPress={() => alert("Membuka Semua Video")}>
            <Text style={styles.linkText}>{"Lihat Semua >"}</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {videos.map((vid) => (
            <Pressable 
              key={vid.id} 
              style={styles.videoCard}
              onPress={() => alert(`Memutar video: ${vid.title}`)}
            >
              <View style={styles.videoThumbnailWrapper}>
                <Image source={vid.image} style={styles.videoImage} contentFit="cover" />
                <View style={styles.videoPlayOverlay}>
                  <View style={styles.playIconCircle}>
                    <Ionicons name="play" size={16} color="#FFFFFF" style={{ marginLeft: 2 }} />
                  </View>
                </View>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{vid.duration}</Text>
                </View>
              </View>
              <View style={styles.videoCardContent}>
                <Text style={styles.videoCardTitle} numberOfLines={1}>{vid.title}</Text>
                <Text style={styles.videoViewsText}>{vid.views}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Berita & Update Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Berita & Update</Text>
          <Pressable onPress={() => alert("Membuka Halaman Berita")}>
            <Text style={styles.linkText}>{"Lihat Semua >"}</Text>
          </Pressable>
        </View>

        <Pressable 
          style={styles.newsFeatureCard}
          onPress={() => alert("Membuka artikel: AI dalam Pendidikan Anak")}
        >
          <Image 
            source={require("../../assets/images/robomind_hero.png")}
            style={styles.newsFeatureImage}
            contentFit="cover"
          />
          <View style={styles.newsFeatureContent}>
            <Text style={styles.newsFeatureTitle}>AI dalam Pendidikan Anak di Era Digital</Text>
            <Text style={styles.newsFeatureDesc}>Rekomendasi cerdas dan pemantauan analitik perkembangan belajar anak berbasis AI.</Text>
            <Text style={styles.newsFeatureTime}>2 jam lalu</Text>
          </View>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: SPACING.md,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardWhite,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: SHAPES.radiusRound,
    paddingHorizontal: SPACING.md,
    height: 40,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    ...FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.textDark,
    paddingVertical: 0,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  scrollContent: {
    paddingVertical: SPACING.lg,
    paddingBottom: Platform.OS === "ios" ? SPACING.xxl + 20 : SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    ...FONTS.subheading,
    fontSize: 15,
    color: COLORS.textDark,
  },
  linkText: {
    ...FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.brandGreen,
  },
  horizontalScroll: {
    paddingLeft: SPACING.lg,
    paddingRight: SPACING.lg + 10,
    gap: SPACING.md,
    paddingBottom: SPACING.md,
  },
  articleCard: {
    width: 240,
    backgroundColor: COLORS.cardWhite,
    borderRadius: SHAPES.radiusLg,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    overflow: "hidden",
    ...SHADOWS.light,
  },
  articleImage: {
    width: "100%",
    height: 120,
  },
  articleContent: {
    padding: SPACING.md,
  },
  articleBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  articleCategory: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.brandGreen,
    letterSpacing: 0.5,
  },
  articleBullet: {
    fontSize: 9,
    color: COLORS.textLight,
    marginHorizontal: 4,
  },
  articleReadTime: {
    fontSize: 9,
    fontWeight: "600",
    color: COLORS.textLight,
  },
  articleCardTitle: {
    ...FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.textDark,
    lineHeight: 16,
  },
  moduleCard: {
    width: 110,
    borderRadius: SHAPES.radiusLg,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
    alignItems: "center",
    ...SHADOWS.light,
  },
  moduleImage: {
    width: 50,
    height: 50,
    marginBottom: SPACING.sm,
  },
  moduleCardTitle: {
    ...FONTS.bodyBold,
    fontSize: 10,
    color: COLORS.textDark,
    textAlign: "center",
  },
  videoCard: {
    width: 180,
    backgroundColor: COLORS.cardWhite,
    borderRadius: SHAPES.radiusLg,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    overflow: "hidden",
    ...SHADOWS.light,
  },
  videoThumbnailWrapper: {
    width: "100%",
    height: 100,
    position: "relative",
  },
  videoImage: {
    width: "100%",
    height: "100%",
  },
  videoPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  playIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.brandGreen,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.light,
  },
  durationBadge: {
    position: "absolute",
    bottom: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: SHAPES.radiusSm,
  },
  durationText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  videoCardContent: {
    padding: SPACING.sm + 2,
  },
  videoCardTitle: {
    ...FONTS.bodyBold,
    fontSize: 11,
    color: COLORS.textDark,
    marginBottom: 2,
  },
  videoViewsText: {
    ...FONTS.caption,
    fontSize: 9,
    color: COLORS.textLight,
  },
  newsFeatureCard: {
    flexDirection: "row",
    backgroundColor: COLORS.cardWhite,
    borderRadius: SHAPES.radiusLg,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    ...SHADOWS.light,
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  newsFeatureImage: {
    width: 80,
    height: 80,
    borderRadius: SHAPES.radiusMd,
  },
  newsFeatureContent: {
    flex: 1,
  },
  newsFeatureTitle: {
    ...FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  newsFeatureDesc: {
    ...FONTS.bodyRegular,
    fontSize: 10,
    color: COLORS.textMedium,
    lineHeight: 14,
    marginBottom: 4,
  },
  newsFeatureTime: {
    ...FONTS.caption,
    fontSize: 8,
    color: COLORS.textLight,
  },
});
