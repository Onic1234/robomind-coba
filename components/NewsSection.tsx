import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, SHAPES, FONTS, SHADOWS } from "../constants/Theme";

interface NewsItem {
  id: string;
  tag: string;
  date: string;
  title: string;
  description: string;
  image: any;
}

export default function NewsSection() {
  const newsData: NewsItem[] = [
    {
      id: "news1",
      tag: "INSPIRASUBARNO",
      date: "24 Juni 2026",
      title: "Setelah Puluhan Tahun Mengajar, Saya Baru Sadar...",
      description: "Mengajar membutuhkan pengetahuan. Mendidik menuntut sesuatu yang lebih sulit: kemampuan...",
      image: require("../assets/images/news_classroom.png"),
    },
    {
      id: "news2",
      tag: "BALOZI BARAZA",
      date: "24 Juni 2026",
      title: "Over-Functioning",
      description: "By Balozi Baraza, UK – 24th June 2026 Continue reading on Medium »",
      image: require("../assets/images/hero_classroom.png"),
    },
    {
      id: "news3",
      tag: "ALIX WORLD",
      date: "24 Juni 2026",
      title: "Careers Are Collapsing. Jobs Are Dying. The Smartest...",
      description: "Continue reading on Medium »",
      image: require("../assets/images/robomind_hero.png"),
    },
    {
      id: "news4",
      tag: "CAROL LABUZZETTA, MS",
      date: "24 Juni 2026",
      title: "Planting Natives Is An Act of Love for Pollinators",
      description: "Creating more habitat for pollinators is thought to be a key to their survival Continue reading on Medium »",
      image: require("../assets/images/news_nature.png"),
    },
  ];

  const renderCard = ({ item }: { item: NewsItem }) => {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={() => alert(`Membaca Berita: ${item.title}`)}
      >
        {/* Card Image and Author Badge */}
        <View style={styles.imageWrapper}>
          <Image
            source={item.image}
            style={styles.cardImage}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.authorBadge}>
            <Text style={styles.authorBadgeText}>{item.tag}</Text>
          </View>
        </View>

        {/* Card Info Content */}
        <View style={styles.textContainer}>
          {/* Date Row */}
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={12} color={COLORS.textLight} />
            <Text style={styles.dateText}>{item.date}</Text>
          </View>

          {/* Title */}
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Description */}
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Link button */}
          <Text style={styles.linkButtonText}>Baca Selengkapnya</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Block */}
      <View style={styles.headerBlock}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Berita & Update</Text>
          <Pressable hitSlop={10} onPress={() => alert("Membuka halaman berita")}>
            <Text style={styles.headerLink}>Lihat Semua Berita</Text>
          </Pressable>
        </View>
        <Text style={styles.subtitle}>
          Informasi terkini seputar teknologi, kurikulum baru, dan inovasi dalam dunia pembelajaran global.
        </Text>
      </View>

      {/* Horizontal List */}
      <FlatList
        data={newsData}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToAlignment="start"
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.lg,
  },
  headerBlock: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    ...FONTS.subheading,
    fontSize: 18,
    color: COLORS.textDark,
    letterSpacing: -0.5,
  },
  headerLink: {
    ...FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.brandBlue,
  },
  subtitle: {
    ...FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.textMedium,
    lineHeight: 16,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingRight: SPACING.lg + 20, // Add trailing space
    gap: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  card: {
    width: 240,
    backgroundColor: COLORS.cardWhite,
    borderRadius: SHAPES.radiusLg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.light,
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  imageWrapper: {
    width: "100%",
    height: 120,
    backgroundColor: "#F1F5F9",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  authorBadge: {
    position: "absolute",
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.brandBlue,
    borderRadius: SHAPES.radiusSm,
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
  },
  authorBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  textContainer: {
    padding: SPACING.md,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: SPACING.xs,
  },
  dateText: {
    ...FONTS.caption,
    fontSize: 10,
    color: COLORS.textLight,
  },
  cardTitle: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 17,
    marginBottom: 4,
  },
  cardDescription: {
    ...FONTS.bodyRegular,
    fontSize: 11,
    color: COLORS.textMedium,
    lineHeight: 14,
    marginBottom: SPACING.sm,
  },
  linkButtonText: {
    ...FONTS.bodyBold,
    fontSize: 11,
    color: COLORS.brandBlue,
  },
});
