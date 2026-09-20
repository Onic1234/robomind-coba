import React, { useState, useEffect } from "react";
import { Platform } from "react-native";
import { Stack, usePathname } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as ScreenOrientation from "expo-screen-orientation";
import AppIntroFlow from "../components/AppIntroFlow";
import { autoResetIfNeeded } from "../lib/resetProgress";

const isWeb = typeof window !== "undefined" && typeof document !== "undefined";

const webStorage = {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string) => { localStorage.setItem(key, value); return Promise.resolve(); },
};

async function getStorageItem(key: string): Promise<string | null> {
  if (isWeb) return webStorage.getItem(key);
  const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
  return AsyncStorage.getItem(key);
}

async function setStorageItem(key: string, value: string): Promise<void> {
  if (isWeb) { webStorage.setItem(key, value); return; }
  const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
  await AsyncStorage.setItem(key, value);
}

export default function RootLayout() {
  const [showIntro, setShowIntro] = useState(false);
  const pathname = usePathname();

  // Per-screen orientation: landscape games vs portrait elsewhere (native only)
  useEffect(() => {
    if (Platform.OS === "web") return;
    const landscapeRoutes = [
      "/robo-charge",
      "/robo-bros",
      "/robo-maze",
      "/robo-jek",
      "/robo-pose",
      "/rogue-soul",
      "/robo-circle",
      "/robo-link",
      "/robo-delivery",
      "/robot-escape",
    ];
    const isLandscape = landscapeRoutes.some(
      (r) => pathname === r || (pathname && pathname.startsWith(r + "/"))
    );
    (async () => {
      try {
        await ScreenOrientation.lockAsync(
          isLandscape
            ? ScreenOrientation.OrientationLock.LANDSCAPE
            : ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
      } catch (e) {
        // ignore if not supported
      }
    })();
  }, [pathname]);

  useEffect(() => {
    autoResetIfNeeded()
      .then(() => getStorageItem("robomind_intro_completed"))
      .then((val) => {
        if (!val) {
          setShowIntro(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleFinishIntro = async () => {
    await setStorageItem("robomind_intro_completed", "true");
    setShowIntro(false);
  };

  if (showIntro) {
    return <AppIntroFlow onFinish={handleFinishIntro} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="parent-mode" options={{ headerShown: false }} />
        <Stack.Screen name="robo-jek" options={{ headerShown: false }} />
        <Stack.Screen name="robo-bros" options={{ headerShown: false }} />
        <Stack.Screen name="robo-maze" options={{ headerShown: false }} />
        <Stack.Screen name="robo-pose" options={{ headerShown: false }} />
        <Stack.Screen name="robo-charge" options={{ headerShown: false }} />
        <Stack.Screen name="robo-circle" options={{ headerShown: false }} />
        <Stack.Screen name="robo-link" options={{ headerShown: false }} />
        <Stack.Screen name="robot-escape" options={{ headerShown: false }} />
        <Stack.Screen name="robot-circuit-puzzle" options={{ headerShown: false }} />
        <Stack.Screen name="energy-core" options={{ headerShown: false }} />
        <Stack.Screen name="rogue-soul" options={{ headerShown: false }} />
        <Stack.Screen name="pick-and-drop" options={{ headerShown: false }} />
        <Stack.Screen name="screw-spin" options={{ headerShown: false }} />
        <Stack.Screen name="robo-delivery" options={{ headerShown: false }} />
        <Stack.Screen name="game-dashboard" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
