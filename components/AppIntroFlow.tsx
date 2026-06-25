import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, Pressable, StatusBar, Animated } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { SPACING, SHAPES, FONTS, SHADOWS } from "../constants/Theme";

interface AppIntroFlowProps {
  onFinish: () => void;
}

type IntroPhase = "splash" | "onboarding";

export default function AppIntroFlow({ onFinish }: AppIntroFlowProps) {
  const [phase, setPhase] = useState<IntroPhase>("splash");
  const [step, setStep] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;

  // Animate progress bar during splash screen
  useEffect(() => {
    if (phase === "splash") {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: false,
      }).start(() => {
        setPhase("onboarding");
      });
    }
  }, [phase, progressAnim]);

  // Width interpolation for progress bar
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const onboardingSteps = [
    {
      title: "Belajar sambil bermain\nitu seru!",
      image: require("../assets/images/robomind_character_2d.png"),
    },
    {
      title: "Petualangan kognitif\ninteraktif bersama Robo!",
      image: require("../assets/images/robomind_hero.png"),
    },
    {
      title: "Pantau tumbuh kembang\nanak secara real-time!",
      image: require("../assets/images/robomind_character_2d.png"),
    },
  ];

  const handleNext = () => {
    if (step < onboardingSteps.length - 1) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  };

  if (phase === "splash") {
    return (
      <SafeAreaView style={styles.splashContainer} edges={["top", "bottom"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#E0F2FE" />
        
        {/* Sky Fluffy Cloud Decoration */}
        <View style={styles.cloudContainer}>
          <Svg height="60" width="100" viewBox="0 0 100 60">
            <Path
              d="M20,40 A15,15 0 0,1 35,25 A20,20 0 0,1 70,25 A15,15 0 0,1 85,40 A15,15 0 0,1 70,55 L30,55 A15,15 0 0,1 20,40 Z"
              fill="#FFFFFF"
              opacity="0.9"
            />
          </Svg>
        </View>

        {/* Branding header */}
        <View style={styles.brandingWrapper}>
          <Text style={styles.logoText}>
            Robo<Text style={styles.logoMindText}>Mind</Text>
          </Text>
          <Text style={styles.taglineText}>Belajar • Bermain • Berkembang</Text>
        </View>

        {/* Standing Robot Character */}
        <View style={styles.robotContainer}>
          <Image
            source={require("../assets/images/robomind_hero.png")}
            style={styles.splashRobotImage}
            contentFit="contain"
          />
        </View>

        {/* Loading Bar Card */}
        <View style={styles.loadingWrapper}>
          <View style={styles.progressBarTrack}>
            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }
  const currentStep = onboardingSteps[step];

  return (
    <SafeAreaView style={styles.onboardingContainer} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#E0F2FE" />

      {/* Top Heading */}
      <View style={styles.onboardingHeader}>
        <Text style={styles.onboardingTitle}>{currentStep.title}</Text>
      </View>

      {/* Robot Character illustration */}
      <View style={styles.onboardingIllustrationContainer}>
        <Image
          source={currentStep.image}
          style={styles.onboardingImage}
          contentFit="contain"
        />
      </View>

      {/* Dots & CTA Button */}
      <View style={styles.onboardingFooter}>
        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {onboardingSteps.map((_, index) => {
            const isActive = step === index;
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

        {/* CTA Button */}
        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && styles.ctaButtonPressed,
          ]}
          onPress={handleNext}
        >
          <Text style={styles.ctaButtonText}>
            {step === onboardingSteps.length - 1 ? "Mulai Petualangan" : "Lanjut"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Splash Screen Styles
  splashContainer: {
    flex: 1,
    backgroundColor: "#E0F2FE", // Soft sky blue bg
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 50,
  },
  cloudContainer: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    opacity: 0.8,
  },
  brandingWrapper: {
    alignItems: "center",
    marginTop: 40,
  },
  logoText: {
    fontSize: 34,
    fontWeight: "900",
    color: "#1E3A8A", // Deep blue
    letterSpacing: -0.5,
  },
  logoMindText: {
    color: "#0D9488", // Teal/green
  },
  taglineText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569", // Slate gray
    marginTop: 6,
    letterSpacing: 0.5,
  },
  robotContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  splashRobotImage: {
    width: 250,
    height: 250,
  },
  loadingWrapper: {
    width: "75%",
    alignItems: "center",
    marginBottom: 20,
  },
  progressBarTrack: {
    width: "100%",
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginBottom: 10,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#0B84FF",
    borderRadius: 4,
  },
  loadingText: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: "#475569",
  },

  // Onboarding Styles
  onboardingContainer: {
    flex: 1,
    backgroundColor: "#E0F2FE", // Consistent soft sky blue bg
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 40,
  },
  onboardingHeader: {
    paddingHorizontal: 30,
    marginTop: 30,
  },
  onboardingTitle: {
    ...FONTS.heading,
    fontSize: 22,
    color: "#0F172A",
    textAlign: "center",
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  onboardingIllustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  onboardingImage: {
    width: 220,
    height: 220,
  },
  onboardingFooter: {
    width: "100%",
    paddingHorizontal: 40,
    alignItems: "center",
    marginBottom: 20,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 30,
  },
  dot: {
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    width: 20,
    backgroundColor: "#0D9488", // Teal active dot
  },
  dotInactive: {
    width: 10,
    backgroundColor: "#94A3B8", // Slate gray inactive dot
  },
  ctaButton: {
    backgroundColor: "#0D9488",
    width: "100%",
    paddingVertical: SPACING.md + 2,
    borderRadius: SHAPES.radiusRound,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.medium,
  },
  ctaButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  ctaButtonText: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: "#FFFFFF",
  },
});
