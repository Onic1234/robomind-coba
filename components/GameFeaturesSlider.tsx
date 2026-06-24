import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { COLORS, SPACING, SHAPES, FONTS, SHADOWS } from "../constants/Theme";

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  image: any;
}

export default function GameFeaturesSlider() {
  const features: FeatureItem[] = [
    {
      id: "math",
      title: "MISI MATEMATIKA KREATIF",
      description: "Penyelesaian kasus numerik.",
      image: require("../assets/images/game_math.png"),
    },
    {
      id: "problemsolving",
      title: "TANTANGAN PROBLEM SOLVING",
      description: "Mengasah ketangkasan otak kiri.",
      image: require("../assets/images/robomind_hero.png"),
    },
    {
      id: "coding",
      title: "MODUL LOGIKA ROBOT",
      description: "Petualangan coding dasar.",
      image: require("../assets/images/game_coding.png"),
    },
  ];

  const renderCard = ({ item }: { item: FeatureItem }) => {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={() => alert(`Membuka game: ${item.title}`)}
      >
        {/* Card Image */}
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={styles.cardImage}
            contentFit="cover"
            transition={300}
          />
        </View>

        {/* Card Text Info */}
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionHeading}>Eksplorasi Fitur Game</Text>
        <Pressable hitSlop={10} onPress={() => alert("Lihat semua fitur game")}>
          <Text style={styles.linkText}>Lihat Semua</Text>
        </Pressable>
      </View>

      {/* Horizontal Swipeable Cards List */}
      <FlatList
        data={features}
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
    marginVertical: SPACING.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm + 2,
  },
  sectionHeading: {
    ...FONTS.subheading,
    fontSize: 16,
    color: COLORS.textDark,
    letterSpacing: -0.5,
  },
  linkText: {
    ...FONTS.bodyBold,
    fontSize: 12,
    color: "#14B8A6", // Brand green/teal link highlight
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingRight: SPACING.lg + 20, // Add trailing padding for horizontal balance
    gap: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  card: {
    width: 220,
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
  imageContainer: {
    width: "100%",
    height: 130,
    backgroundColor: "#F1F5F9",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    padding: SPACING.md,
  },
  cardTitle: {
    ...FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.textDark,
    marginBottom: 4,
    lineHeight: 16,
  },
  cardDesc: {
    ...FONTS.bodyRegular,
    fontSize: 11,
    color: COLORS.textMedium,
    lineHeight: 14,
  },
});
