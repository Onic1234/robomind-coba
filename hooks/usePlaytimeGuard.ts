import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEY_PLAYTIME_SEC = "robomind_playtime_seconds_today";
export const STORAGE_KEY_PLAYTIME_DATE = "robomind_playtime_last_date";
export const STORAGE_KEY_COOLDOWN_UNTIL = "robomind_cooldown_until";

export const DEFAULT_MAX_PLAYTIME_SEC = 3600; // 1 Jam = 3600 detik
export const WARNING_THRESHOLD_SEC = 3000;    // 50 Menit = 3000 detik (Peringatan 10 menit sebelum 1 jam)
export const DEFAULT_COOLDOWN_SEC = 900;       // 15 Menit Cooldown Istirahat = 900 detik

export interface PlaytimeStatus {
  playtimeSeconds: number;
  maxPlaytimeSeconds: number;
  cooldownRemainingSeconds: number;
  isWarning: boolean;
  isLimitReached: boolean;
  isCooldownActive: boolean;
}

export function usePlaytimeGuard() {
  const [playtimeSeconds, setPlaytimeSeconds] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [cooldownRemainingSeconds, setCooldownRemainingSeconds] = useState(0);
  const [isWarningShown, setIsWarningShown] = useState(false);

  const getTodayDateString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  };

  // Synchronize and check status from AsyncStorage
  const refreshPlaytimeStatus = useCallback(async () => {
    try {
      const todayStr = getTodayDateString();
      const storedDate = await AsyncStorage.getItem(STORAGE_KEY_PLAYTIME_DATE);

      // New day reset
      if (storedDate !== todayStr) {
        await AsyncStorage.setItem(STORAGE_KEY_PLAYTIME_DATE, todayStr);
        await AsyncStorage.setItem(STORAGE_KEY_PLAYTIME_SEC, "0");
        setPlaytimeSeconds(0);
      } else {
        const storedTime = await AsyncStorage.getItem(STORAGE_KEY_PLAYTIME_SEC);
        if (storedTime) {
          setPlaytimeSeconds(parseInt(storedTime, 10));
        }
      }

      const storedCooldown = await AsyncStorage.getItem(STORAGE_KEY_COOLDOWN_UNTIL);
      if (storedCooldown) {
        const until = parseInt(storedCooldown, 10);
        const now = Date.now();
        if (until > now) {
          setCooldownUntil(until);
          setCooldownRemainingSeconds(Math.ceil((until - now) / 1000));
        } else {
          setCooldownUntil(null);
          setCooldownRemainingSeconds(0);
        }
      } else {
        setCooldownUntil(null);
        setCooldownRemainingSeconds(0);
      }
    } catch (err) {
      console.error("Failed to load playtime status:", err);
    }
  }, []);

  // Check state periodically
  useEffect(() => {
    refreshPlaytimeStatus();
    const interval = setInterval(() => {
      refreshPlaytimeStatus();
    }, 1000);

    return () => clearInterval(interval);
  }, [refreshPlaytimeStatus]);

  // Tick active playtime (call this inside games while active)
  const tickPlaytime = async (incrementSec = 1) => {
    try {
      const todayStr = getTodayDateString();
      const storedDate = await AsyncStorage.getItem(STORAGE_KEY_PLAYTIME_DATE);
      let currentSec = 0;

      if (storedDate === todayStr) {
        const storedTime = await AsyncStorage.getItem(STORAGE_KEY_PLAYTIME_SEC);
        if (storedTime) currentSec = parseInt(storedTime, 10);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY_PLAYTIME_DATE, todayStr);
      }

      const newSec = currentSec + incrementSec;
      setPlaytimeSeconds(newSec);
      await AsyncStorage.setItem(STORAGE_KEY_PLAYTIME_SEC, newSec.toString());

      // If playtime reaches max limit (1 hour), trigger rest cooldown!
      if (newSec >= DEFAULT_MAX_PLAYTIME_SEC) {
        await triggerRestCooldown();
      }
    } catch (err) {
      console.error("Failed to tick playtime:", err);
    }
  };

  // Trigger rest cooldown lock
  const triggerRestCooldown = async (cooldownDurationSec = DEFAULT_COOLDOWN_SEC) => {
    const until = Date.now() + cooldownDurationSec * 1000;
    setCooldownUntil(until);
    setCooldownRemainingSeconds(cooldownDurationSec);
    await AsyncStorage.setItem(STORAGE_KEY_COOLDOWN_UNTIL, until.toString());
  };

  // Parent override reset
  const resetPlaytimeGuard = async () => {
    try {
      const todayStr = getTodayDateString();
      await AsyncStorage.setItem(STORAGE_KEY_PLAYTIME_DATE, todayStr);
      await AsyncStorage.setItem(STORAGE_KEY_PLAYTIME_SEC, "0");
      await AsyncStorage.removeItem(STORAGE_KEY_COOLDOWN_UNTIL);
      setPlaytimeSeconds(0);
      setCooldownUntil(null);
      setCooldownRemainingSeconds(0);
      setIsWarningShown(false);
    } catch (err) {
      console.error("Failed to reset playtime guard:", err);
    }
  };

  const isWarning = playtimeSeconds >= WARNING_THRESHOLD_SEC && playtimeSeconds < DEFAULT_MAX_PLAYTIME_SEC;
  const isLimitReached = playtimeSeconds >= DEFAULT_MAX_PLAYTIME_SEC;
  const isCooldownActive = cooldownRemainingSeconds > 0;

  return {
    playtimeSeconds,
    maxPlaytimeSeconds: DEFAULT_MAX_PLAYTIME_SEC,
    cooldownRemainingSeconds,
    isWarning,
    isWarningShown,
    setIsWarningShown,
    isLimitReached,
    isCooldownActive,
    tickPlaytime,
    triggerRestCooldown,
    resetPlaytimeGuard,
    refreshPlaytimeStatus,
  };
}

export const formatDurationHMS = (totalSec: number) => {
  const h = Math.floor(Math.max(0, totalSec) / 3600);
  const m = Math.floor((Math.max(0, totalSec) % 3600) / 60);
  const s = Math.max(0, totalSec) % 60;

  if (h > 0) {
    return `${h}j ${m}m ${s}s`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};
