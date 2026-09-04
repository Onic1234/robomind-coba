import React, { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ChatbotButton from "../components/ChatbotButton";
import AppIntroFlow from "../components/AppIntroFlow";
import { autoResetIfNeeded } from "../lib/resetProgress";

export default function RootLayout() {
  const [showIntro, setShowIntro] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Auto-reset old cached progress on first launch after update
    autoResetIfNeeded().then(() => {
      return AsyncStorage.getItem("robomind_intro_completed");
    }).then((val) => {
      if (!val) {
        setShowIntro(true);
      }
      setIsReady(true);
    }).catch(() => {
      setIsReady(true);
    });
  }, []);

  const handleFinishIntro = async () => {
    await AsyncStorage.setItem("robomind_intro_completed", "true");
    setShowIntro(false);
  };

  if (!isReady) {
    return null;
  }

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
        <Stack.Screen name="pose-master" options={{ headerShown: false }} />
        <Stack.Screen name="screw-spin" options={{ headerShown: false }} />
        <Stack.Screen name="robo-delivery" options={{ headerShown: false }} />
        <Stack.Screen name="web-portal" options={{ headerShown: false }} />
      </Stack>
      <ChatbotButton />
    </GestureHandlerRootView>
  );
}
