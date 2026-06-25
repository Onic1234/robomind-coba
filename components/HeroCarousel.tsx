import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Pressable,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, SHAPES, FONTS, SHADOWS } from "../constants/Theme";
import Button from "./ui/Button";

interface SlideItem {
  id: string;
  badgeText: string;
  title: string;
  description: string;
  primaryBtnText: string;
  secondaryBtnText: string;
  backgroundImage: any;
  accentColor: string;
}

const { width: windowWidth } = Dimensions.get("window");
const cardWidth = windowWidth - (SPACING.lg * 2);

export default function HeroCarousel() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const slides: SlideItem[] = [
    {
      id: "robomind",
      badgeText: "✈ PLATFORM EDUKASI MASA DEPAN",
      title: "ASAH POTENSI KOGNITIF & LOGIKA ANAK",
      description:
        "Hubungkan game anak Anda, pantau metrik perkembangannya secara real-time, dan dapatkan rekomendasi spesifik dari psikolog anak.",
      primaryBtnText: "Coba Skrining Awal",
      secondaryBtnText: "Tonton Demo",
      backgroundImage: require("../assets/images/robomind_hero.png"),
      accentColor: COLORS.brandGreen,
    },
    {
      id: "spanishvip",
      badgeText: "✨ KELAS BAHASA SPANYOL ANAK",
      title: "Best Online Spanish Learning Classes for Kids",
      description:
        "Try 7 Days Free! Join Alex, Mia, Sofia, and Leo and +1200 other young learners. High-fidelity native language tutors.",
      primaryBtnText: "Try 7 Days Free",
      secondaryBtnText: "Tonton Demo",
      backgroundImage: require("../assets/images/hero_classroom.png"),
      accentColor: COLORS.brandOrange,
    },
  ];

  // Auto-play timer effect
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      scrollToIndex(nextIndex);
    }, 4500);

    return () => clearInterval(interval);
  }, [currentIndex, isPlaying, slides.length]);

  const scrollToIndex = (index: number) => {
    setCurrentIndex(index);
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  };

  const handlePrev = () => {
    const prevIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
    scrollToIndex(prevIndex);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % slides.length;
    scrollToIndex(nextIndex);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / cardWidth);
    if (index !== currentIndex && index >= 0 && index < slides.length) {
      setCurrentIndex(index);
    }
  };

  const renderSlide = ({ item }: { item: SlideItem }) => {
    return (
      <View style={styles.slideContainer}>
        <ImageBackground
          source={item.backgroundImage}
          style={styles.backgroundImage}
          imageStyle={styles.imageRadius}
        >
          {/* Translucent overlay for text readability */}
          <View style={styles.overlay}>
            
            {/* Top Badge */}
            <View style={[styles.badge, { borderColor: item.accentColor }]}>
              <Text style={[styles.badgeText, { color: item.accentColor }]}>
                {item.badgeText}
              </Text>
            </View>

            {/* Headline */}
            <Text style={styles.headline}>{item.title}</Text>

            {/* Subhead */}
            <Text style={styles.description}>{item.description}</Text>

            {/* CTA Buttons Row */}
            <View style={styles.buttonsRow}>
              <Button
                title={item.primaryBtnText}
                onPress={() => {
                  if (item.id === "robomind") {
                    router.push("/explore");
                  } else {
                    router.push("/register");
                  }
                }}
                variant="primary"
                size="medium"
                style={styles.actionBtn}
              />
              <Button
                title={item.secondaryBtnText}
                onPress={() => alert(`Play Demo ${item.id === "robomind" ? "Robo Mind" : "Spanish VIP"}`)}
                variant="secondary"
                size="medium"
                style={StyleSheet.flatten([styles.actionBtn, styles.demoBtn])}
              />
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  };

  return (
    <View style={styles.outerContainer}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={handleScroll}
        snapToInterval={cardWidth}
        decelerationRate="fast"
        style={styles.flatList}
        getItemLayout={(_, index) => ({
          length: cardWidth,
          offset: cardWidth * index,
          index,
        })}
      />

      {/* Recreated HUD Controls Overlay */}
      <View style={styles.hudOverlay}>
        {/* Play/Pause Button */}
        <Pressable onPress={togglePlayPause} style={styles.hudIconButton}>
          <Ionicons
            name={isPlaying ? "pause-outline" : "play-outline"}
            size={14}
            color="#FFFFFF"
          />
        </Pressable>

        <View style={styles.hudDivider} />

        {/* Slide Indicator Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => {
            const isActive = currentIndex === index;
            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  isActive ? styles.dotActive : styles.dotInactive,
                ]}
              />
            );
          })}
        </View>

        <View style={styles.hudDivider} />

        {/* Navigation Arrows */}
        <View style={styles.arrowsContainer}>
          <Pressable onPress={handlePrev} style={styles.arrowButton}>
            <Ionicons name="chevron-back" size={14} color="#FFFFFF" />
          </Pressable>
          <Pressable onPress={handleNext} style={styles.arrowButton}>
            <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    width: cardWidth,
    height: 380,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    position: "relative",
    alignSelf: "center",
    ...SHADOWS.medium,
  },
  flatList: {
    width: "100%",
    height: "100%",
  },
  slideContainer: {
    width: cardWidth,
    height: "100%",
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "flex-end",
  },
  imageRadius: {
    borderRadius: SHAPES.radiusXl + 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)", // Deep slate dark overlay for outstanding contrast
    borderRadius: SHAPES.radiusXl + 4,
    padding: SPACING.lg + 4,
    justifyContent: "center",
  },
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: SHAPES.radiusSm,
    paddingVertical: 3,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  headline: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 28,
    marginBottom: SPACING.sm,
  },
  description: {
    ...FONTS.bodyRegular,
    fontSize: 12,
    color: "#E2E8F0",
    lineHeight: 18,
    marginBottom: SPACING.lg,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    flexWrap: "wrap",
    marginBottom: SPACING.sm,
  },
  actionBtn: {
    flex: 1,
    minWidth: 120,
  },
  demoBtn: {
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  
  // HUD Overlays Styles
  hudOverlay: {
    position: "absolute",
    bottom: SPACING.md,
    right: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.85)",
    borderRadius: SHAPES.radiusRound,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    gap: SPACING.sm,
    ...SHADOWS.light,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  hudIconButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 20,
    height: 20,
  },
  hudDivider: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 14,
    backgroundColor: COLORS.brandBlue,
  },
  dotInactive: {
    width: 6,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  arrowsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  arrowButton: {
    width: 20,
    height: 20,
    borderRadius: SHAPES.radiusRound,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
});
