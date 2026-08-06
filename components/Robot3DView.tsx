import React, { useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  cancelAnimation,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg, { Path, Circle as SvgCircle, Defs, RadialGradient, LinearGradient, Stop, Rect } from "react-native-svg";

export default function Robot3DView() {
  // --- REANIMATED SHARED VALUES ---
  const robotY = useSharedValue(0);
  const robotScaleX = useSharedValue(1);
  const robotScaleY = useSharedValue(1);
  const headRotation = useSharedValue(0);
  const leftArmRotation = useSharedValue(10);
  const rightArmRotation = useSharedValue(-10);
  const eyeBlink = useSharedValue(1);
  const corePulse = useSharedValue(1);

  // Background geometric ring pulse
  const ringPulse = useSharedValue(1);

  // Drag-to-spin free rotation (Z-axis, full 360°)
  const spinAngle = useSharedValue(0);
  const savedSpinAngle = useSharedValue(0);

  // Hover Jet Booster Flame Pulse & Thruster vibration
  const boosterPulse = useSharedValue(1);
  const boosterOpacity = useSharedValue(0.85);
  const hoverVibration = useSharedValue(0);

  // --- ANIMATED STYLE BINDINGS ---
  const robotTranslateStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: robotY.value + hoverVibration.value },
      { scaleX: robotScaleX.value },
      { scaleY: robotScaleY.value },
      { rotate: `${spinAngle.value}deg` },
    ],
  }));

  const headStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${headRotation.value}deg` }],
  }));

  const leftArmStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${leftArmRotation.value}deg` }],
  }));

  const rightArmStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rightArmRotation.value}deg` }],
  }));

  const eyeBlinkStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: eyeBlink.value }],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: corePulse.value }],
    opacity: 0.5 + (corePulse.value - 0.85) * 1.6,
  }));

  const shadowStyle = useAnimatedStyle(() => {
    const scaleVal = 1 + robotY.value / 40;
    const opacityVal = 0.18 + robotY.value / 120;
    return {
      transform: [{ scaleX: scaleVal }],
      opacity: opacityVal,
    };
  });

  // Subtle pulsing ring behind robot
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringPulse.value }],
    opacity: 0.15 + (ringPulse.value - 0.95) * 0.8,
  }));

  // Glowing Thruster Flame Style
  const boosterStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleY: boosterPulse.value },
      { scaleX: 0.88 + boosterPulse.value * 0.12 },
    ],
    opacity: boosterOpacity.value,
  }));

  // --- IDLE LOOPS EFFECTS ---
  useEffect(() => {
    // 1. Floating Y (Melayang naik-turun halus)
    robotY.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 1800 }),
        withTiming(12, { duration: 1800 })
      ),
      -1,
      true
    );

    // 2. Breathing Scale X & Y (Kembang kempis tubuh)
    robotScaleX.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 2000 }),
        withTiming(0.98, { duration: 2000 })
      ),
      -1,
      true
    );
    robotScaleY.value = withRepeat(
      withSequence(
        withTiming(0.98, { duration: 2000 }),
        withTiming(1.02, { duration: 2000 })
      ),
      -1,
      true
    );

    // 3. Head Sway (Kemiringan kepala)
    headRotation.value = withRepeat(
      withSequence(
        withTiming(3, { duration: 2200 }),
        withTiming(-3, { duration: 2200 })
      ),
      -1,
      true
    );

    // 4. Arms Sway (Ayun lengan lambat)
    leftArmRotation.value = withRepeat(
      withSequence(
        withTiming(12, { duration: 2400 }),
        withTiming(-12, { duration: 2400 })
      ),
      -1,
      true
    );
    rightArmRotation.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 2400 }),
        withTiming(12, { duration: 2400 })
      ),
      -1,
      true
    );

    // 5. Core Reactor Pulse (Pendaran reaktor sirkuit dada)
    corePulse.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1000 }),
        withTiming(0.85, { duration: 1000 })
      ),
      -1,
      true
    );

    // 6. Background ring gentle pulse
    ringPulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // 7. Jet Booster Plasma Flame Flickering & vibration loops
    boosterPulse.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 90, easing: Easing.linear }),
        withTiming(0.8, { duration: 90, easing: Easing.linear })
      ),
      -1,
      true
    );
    boosterOpacity.value = withRepeat(
      withSequence(
        withTiming(0.98, { duration: 80, easing: Easing.linear }),
        withTiming(0.68, { duration: 80, easing: Easing.linear })
      ),
      -1,
      true
    );
    hoverVibration.value = withRepeat(
      withSequence(
        withTiming(-0.8, { duration: 45, easing: Easing.linear }),
        withTiming(0.8, { duration: 45, easing: Easing.linear })
      ),
      -1,
      true
    );

    // 8. Periodic Blink (Kedipan mata otomatis tiap 4 detik)
    const blinkInterval = setInterval(() => {
      eyeBlink.value = withSequence(
        withTiming(0.05, { duration: 100 }),
        withTiming(1, { duration: 100 }),
        withTiming(0.05, { duration: 80 }),
        withTiming(1, { duration: 100 })
      );
    }, 4000);

    return () => {
      clearInterval(blinkInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- INTERACTION TAP TRIGGER ---
  const handleInteraction = () => {
    // Haptics
    try {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch {
      // Ignored
    }

    // Cancel idle bounce temporary for jump
    cancelAnimation(robotY);
    cancelAnimation(robotScaleX);
    cancelAnimation(robotScaleY);
    cancelAnimation(rightArmRotation);

    // Jump & Squash/Stretch Sequence (Lompatan Gembira)
    robotY.value = withSequence(
      withTiming(15, { duration: 100 }), // Menekuk lutut ke bawah
      withTiming(-45, { duration: 250 }), // Melompat tinggi ke atas
      withTiming(0, { duration: 200 }),   // Mendarat kembali
      withSpring(0, { damping: 10 })
    );

    robotScaleX.value = withSequence(
      withTiming(1.18, { duration: 100 }),
      withTiming(0.82, { duration: 250 }),
      withTiming(1.12, { duration: 200 }),
      withSpring(1, { damping: 10 })
    );
    robotScaleY.value = withSequence(
      withTiming(0.82, { duration: 100 }),
      withTiming(1.18, { duration: 250 }),
      withTiming(0.88, { duration: 200 }),
      withSpring(1, { damping: 10 })
    );

    // Excited Arm Wave Sequence (Lambaian tangan gembira)
    rightArmRotation.value = withSequence(
      withTiming(-90, { duration: 100 }),
      withTiming(-30, { duration: 100 }),
      withTiming(-90, { duration: 100 }),
      withTiming(-30, { duration: 100 }),
      withTiming(-90, { duration: 100 }),
      withSpring(0, { damping: 10 })
    );

    // Resume idle loops after 3.5 seconds
    const resetTimeout = setTimeout(() => {
      robotY.value = withRepeat(
        withSequence(
          withTiming(-12, { duration: 1800 }),
          withTiming(12, { duration: 1800 })
        ),
        -1,
        true
      );
      robotScaleX.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 2000 }),
          withTiming(0.98, { duration: 2000 })
        ),
        -1,
        true
      );
      robotScaleY.value = withRepeat(
        withSequence(
          withTiming(0.98, { duration: 2000 }),
          withTiming(1.02, { duration: 2000 })
        ),
        -1,
        true
      );
      rightArmRotation.value = withRepeat(
        withSequence(
          withTiming(-12, { duration: 2400 }),
          withTiming(12, { duration: 2400 })
        ),
        -1,
        true
      );
    }, 3500);

    return () => clearTimeout(resetTimeout);
  };

  // --- GESTURE HANDLERS ---
  // Pan gesture: click-hold and drag to spin robot freely (full 360°)
  const panGesture = Gesture.Pan()
    .minDistance(8)
    .onStart(() => {
      'worklet';
      cancelAnimation(spinAngle);
      savedSpinAngle.value = spinAngle.value;
    })
    .onUpdate((event) => {
      'worklet';
      // Horizontal drag controls rotation — no clamp, full 360°+
      spinAngle.value = savedSpinAngle.value + event.translationX * 0.8;
    })
    .onEnd((event) => {
      'worklet';
      // Add momentum spin from velocity, then spring back to upright (0°)
      const momentum = event.velocityX * 0.08;
      const targetWithMomentum = spinAngle.value + momentum;
      spinAngle.value = withSequence(
        withTiming(targetWithMomentum, { duration: 200, easing: Easing.out(Easing.ease) }),
        withSpring(0, { damping: 10, stiffness: 80, mass: 1 })
      );
    });

  // Tap gesture: quick tap triggers jump interaction
  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      'worklet';
      runOnJS(handleInteraction)();
    });

  // Race: pan wins if drag detected, otherwise tap wins
  const composedGesture = Gesture.Race(panGesture, tapGesture);

  return (
    <View style={styles.outerContainer}>
      {/* RICH GRADIENT BACKGROUND with layered glows */}
      <View style={styles.bgGradientLayer}>
        <Svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <Defs>
            {/* Base gradient: deep navy to indigo */}
            <LinearGradient id="bgBase" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#0F172A" />
              <Stop offset="50%" stopColor="#1E1B4B" />
              <Stop offset="100%" stopColor="#0C1222" />
            </LinearGradient>
            {/* Cyan center glow */}
            <RadialGradient id="glowCyan" cx="50%" cy="40%" r="50%">
              <Stop offset="0%" stopColor="#22D3EE" stopOpacity="0.25" />
              <Stop offset="60%" stopColor="#0891B2" stopOpacity="0.08" />
              <Stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
            </RadialGradient>
            {/* Purple accent glow top-right */}
            <RadialGradient id="glowPurple" cx="80%" cy="20%" r="45%">
              <Stop offset="0%" stopColor="#A78BFA" stopOpacity="0.2" />
              <Stop offset="70%" stopColor="#7C3AED" stopOpacity="0.05" />
              <Stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
            </RadialGradient>
            {/* Warm amber glow bottom-left */}
            <RadialGradient id="glowAmber" cx="15%" cy="85%" r="40%">
              <Stop offset="0%" stopColor="#F59E0B" stopOpacity="0.12" />
              <Stop offset="70%" stopColor="#D97706" stopOpacity="0.04" />
              <Stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#bgBase)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#glowCyan)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#glowPurple)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#glowAmber)" />
        </Svg>
      </View>

      {/* Animated concentric rings with glow */}
      <Animated.View style={[styles.geoRingsContainer, ringStyle]}>
        <View style={styles.ringOuter} />
        <View style={styles.ringMiddle} />
        <View style={styles.ringInner} />
      </Animated.View>

      {/* Floating glowing orbs */}
      <View style={[styles.orb, { top: '8%', left: '15%', width: 8, height: 8, backgroundColor: '#22D3EE', opacity: 0.5 }]} />
      <View style={[styles.orb, { top: '18%', right: '12%', width: 5, height: 5, backgroundColor: '#A78BFA', opacity: 0.45 }]} />
      <View style={[styles.orb, { bottom: '25%', left: '10%', width: 6, height: 6, backgroundColor: '#F59E0B', opacity: 0.35 }]} />
      <View style={[styles.orb, { top: '42%', right: '8%', width: 4, height: 4, backgroundColor: '#34D399', opacity: 0.4 }]} />
      <View style={[styles.orb, { bottom: '12%', right: '20%', width: 7, height: 7, backgroundColor: '#22D3EE', opacity: 0.3 }]} />
      <View style={[styles.orb, { top: '60%', left: '20%', width: 4, height: 4, backgroundColor: '#A78BFA', opacity: 0.35 }]} />
      <View style={[styles.orb, { top: '15%', left: '50%', width: 3, height: 3, backgroundColor: '#FDE68A', opacity: 0.5 }]} />
      <View style={[styles.orb, { bottom: '35%', right: '30%', width: 3, height: 3, backgroundColor: '#34D399', opacity: 0.3 }]} />

      {/* Subtle grid lines for depth */}
      <View style={styles.gridLineH1} />
      <View style={styles.gridLineH2} />
      <View style={styles.gridLineV1} />
      <View style={styles.gridLineV2} />

      <View style={styles.robotContainer}>
        {/* Interactive Robot Assembly: Tap to jump, Drag to rotate */}
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={styles.robotTouchArea}>
          <Animated.View style={[styles.robotAssembly, robotTranslateStyle]}>
            {/* HEAD ASSEMBLY */}
            <Animated.View style={[styles.headContainer, headStyle]}>
              {/* Antenna */}
              <View style={styles.antennaStick} />
              <View style={styles.antennaBulb} />
              
              {/* Head Shell */}
              <View style={styles.headShell}>
                {/* Side Bolt Ears */}
                <View style={styles.leftEar} />
                <View style={styles.rightEar} />

                {/* Face Visor Screen */}
                <View style={styles.visorScreen}>
                  {/* Blinking LED Eyes */}
                  <Animated.View style={[styles.eyesRow, eyeBlinkStyle]}>
                    <View style={styles.eyeCircle}>
                      <View style={styles.pupil} />
                    </View>
                    <View style={styles.eyeCircle}>
                      <View style={styles.pupil} />
                    </View>
                  </Animated.View>
                </View>
              </View>
            </Animated.View>

            {/* NECK JOINT */}
            <View style={styles.neckJoint} />

            {/* TORSO BODY */}
            <View style={styles.bodyContainer}>
              {/* Left Arm (Shoulder Pivot) */}
              <Animated.View style={[styles.leftShoulder, leftArmStyle]}>
                <View style={styles.leftArm} />
              </Animated.View>

              {/* Body Shell */}
              <View style={styles.bodyShell}>
                {/* Chest Monitor Display */}
                <View style={styles.chestScreen}>
                  {/* Pulsing Core Reactor */}
                  <Animated.View style={[styles.coreReactor, coreStyle]} />
                  {/* Decorative circuit lines */}
                  <View style={styles.circuitLineHorizontal} />
                </View>
              </View>

              {/* Right Arm (Shoulder Pivot) */}
              <Animated.View style={[styles.rightShoulder, rightArmStyle]}>
                <View style={styles.rightArm} />
              </Animated.View>
            </View>

            {/* TRACKS WHEELS BASE */}
            <View style={styles.wheelsBase}>
              <View style={styles.treadDot} />
              <View style={styles.treadDot} />
              <View style={styles.treadDot} />
            </View>

            {/* Glowing Hover Thruster Plasma Flame */}
            <Animated.View style={[styles.boosterFlame, boosterStyle]}>
              <Svg width="22" height="28" viewBox="0 0 20 25">
                <Path
                  d="M10 25C15 25 18 18 18 12C18 4 10 0 10 0C10 0 2 4 2 12C2 18 5 25 10 25Z"
                  fill="#06B6D4"
                />
                <Path
                  d="M10 20C13 20 15 15 15 11C15 5 10 2 10 2C10 2 5 5 5 11C5 15 7 20 10 20Z"
                  fill="#22D3EE"
                />
              </Svg>
            </Animated.View>
          </Animated.View>
          </Animated.View>
        </GestureDetector>

        {/* Minimal floor shadow */}
        <Animated.View style={[styles.floorShadow, shadowStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 35,
    backgroundColor: "#0F172A",
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "rgba(34, 211, 238, 0.2)",
    overflow: "hidden",
    position: "relative",
    // Cyan-tinted glow shadow
    shadowColor: "#06B6D4",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },

  // SVG gradient background layer
  bgGradientLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },

  // Concentric rings with visible glow
  geoRingsContainer: {
    position: "absolute",
    width: 280,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    top: "6%",
    zIndex: 0,
  },
  ringOuter: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: "rgba(34, 211, 238, 0.1)",
  },
  ringMiddle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: "rgba(34, 211, 238, 0.18)",
  },
  ringInner: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: "rgba(167, 139, 250, 0.22)",
  },

  // Floating glowing orbs
  orb: {
    position: "absolute",
    borderRadius: 999,
    zIndex: 0,
    // Glow effect via shadow
    shadowColor: "#22D3EE",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },

  // Subtle grid lines for depth
  gridLineH1: {
    position: "absolute",
    width: "85%",
    height: 1,
    backgroundColor: "rgba(34, 211, 238, 0.04)",
    top: "35%",
    alignSelf: "center",
    zIndex: 0,
  },
  gridLineH2: {
    position: "absolute",
    width: "60%",
    height: 1,
    backgroundColor: "rgba(167, 139, 250, 0.04)",
    top: "65%",
    alignSelf: "center",
    zIndex: 0,
  },
  gridLineV1: {
    position: "absolute",
    width: 1,
    height: "70%",
    backgroundColor: "rgba(34, 211, 238, 0.04)",
    left: "30%",
    top: "15%",
    zIndex: 0,
  },
  gridLineV2: {
    position: "absolute",
    width: 1,
    height: "70%",
    backgroundColor: "rgba(167, 139, 250, 0.04)",
    left: "70%",
    top: "15%",
    zIndex: 0,
  },

  robotContainer: {
    width: 160,
    height: 290,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
    zIndex: 1,
  },
  robotTouchArea: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
    width: "100%",
    zIndex: 2,
  },
  robotAssembly: {
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 10,
    position: "relative",
  },

  // HEAD
  headContainer: {
    alignItems: "center",
    position: "relative",
    zIndex: 5,
  },
  antennaStick: {
    width: 5,
    height: 12,
    backgroundColor: "#0284C7",
  },
  antennaBulb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#F59E0B",
    position: "absolute",
    top: -10,
  },
  headShell: {
    width: 82,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#E0F2FE", // Soft metallic blue
    borderWidth: 2.5,
    borderColor: "#0284C7",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  leftEar: {
    position: "absolute",
    left: -7,
    top: 24,
    width: 5,
    height: 14,
    borderRadius: 2.5,
    backgroundColor: "#0284C7",
  },
  rightEar: {
    position: "absolute",
    right: -7,
    top: 24,
    width: 5,
    height: 14,
    borderRadius: 2.5,
    backgroundColor: "#0284C7",
  },
  visorScreen: {
    width: 64,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#0F172A", // Dark visor screen
    justifyContent: "center",
    alignItems: "center",
  },
  eyesRow: {
    flexDirection: "row",
    gap: 12,
  },
  eyeCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#22D3EE", // Glowing cyan LED eyes
    justifyContent: "center",
    alignItems: "center",
  },
  pupil: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },

  // JOINTS
  neckJoint: {
    width: 20,
    height: 8,
    backgroundColor: "#0284C7",
    zIndex: 4,
    marginTop: -2,
  },

  // BODY & ARMS
  bodyContainer: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 3,
    marginTop: -2,
  },
  bodyShell: {
    width: 108,
    height: 90,
    borderRadius: 24,
    backgroundColor: "#E0F2FE",
    borderWidth: 2.5,
    borderColor: "#0284C7",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  chestScreen: {
    width: 76,
    height: 62,
    borderRadius: 10,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  coreReactor: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#38BDF8", // Glowing cyan reactor
    shadowColor: "#00C3A0",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  circuitLineHorizontal: {
    width: "80%",
    height: 1.5,
    backgroundColor: "rgba(56, 189, 248, 0.2)",
    position: "absolute",
  },
  
  // SHOULDER & ARMS
  leftShoulder: {
    width: 12,
    height: 12,
    justifyContent: "flex-start",
    alignItems: "center",
    marginRight: -3,
    zIndex: 2,
  },
  leftArm: {
    position: "absolute",
    top: 0,
    width: 12,
    height: 44,
    borderRadius: 6,
    backgroundColor: "#E0F2FE",
    borderWidth: 2,
    borderColor: "#0284C7",
  },
  rightShoulder: {
    width: 12,
    height: 12,
    justifyContent: "flex-start",
    alignItems: "center",
    marginLeft: -3,
    zIndex: 2,
  },
  rightArm: {
    position: "absolute",
    top: 0,
    width: 12,
    height: 44,
    borderRadius: 6,
    backgroundColor: "#E0F2FE",
    borderWidth: 2,
    borderColor: "#0284C7",
  },

  // BASE
  wheelsBase: {
    width: 90,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#334155", // Heavy track base
    borderWidth: 2,
    borderColor: "#0284C7",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 8,
    marginTop: -2,
    zIndex: 5,
  },
  treadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#94A3B8",
  },

  // Hover booster plasma flame
  boosterFlame: {
    position: "absolute",
    bottom: -22,
    alignSelf: "center",
    zIndex: 1,
  },

  // Floor shadow with cyan tint
  floorShadow: {
    position: "absolute",
    bottom: 6,
    width: 110,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(34, 211, 238, 0.15)",
    zIndex: 1,
    shadowColor: "#22D3EE",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
