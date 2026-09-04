/**
 * gameProgressService.ts
 * 
 * Centralized service to sync ALL game progress (levels, scores, XP, coins,
 * session data) to Supabase in real-time. Also updates child_skills scores
 * based on which game category was played.
 * 
 * Used by all 14 mini-games in the RoboMind Game App.
 */

import { supabase } from "./supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

// =========================================================================
// Game Catalog & Category Mapping
// =========================================================================
export type GameCategory = "kognitif" | "fokus" | "moral" | "literasi";
export type SkillPillar = "logic" | "creativity" | "literacy" | "focus" | "moral";

interface GameMeta {
  id: string;
  title: string;
  category: GameCategory;
  skillPillars: SkillPillar[]; // which pillars this game improves
  levelKey?: string; // AsyncStorage key for current level
}

export const GAME_CATALOG: Record<string, GameMeta> = {
  "screw-spin": {
    id: "screw-spin",
    title: "Screw Spin",
    category: "fokus",
    skillPillars: ["focus", "logic"],
    levelKey: "screw_spin_current_level",
  },
  "robo-bros": {
    id: "robo-bros",
    title: "Robo Bros",
    category: "kognitif",
    skillPillars: ["focus", "creativity"],
  },
  "rogue-soul": {
    id: "rogue-soul",
    title: "Rogue Soul 2",
    category: "fokus",
    skillPillars: ["focus", "creativity"],
  },
  "robo-jek": {
    id: "robo-jek",
    title: "Robo-Jek",
    category: "moral",
    skillPillars: ["moral", "logic"],
  },
  "robo-link": {
    id: "robo-link",
    title: "Robo Link",
    category: "literasi",
    skillPillars: ["literacy", "logic"],
  },
  "robo-maze": {
    id: "robo-maze",
    title: "Robo Maze",
    category: "kognitif",
    skillPillars: ["logic", "creativity"],
  },
  "robot-circuit-puzzle": {
    id: "robot-circuit-puzzle",
    title: "Robot Circuit",
    category: "kognitif",
    skillPillars: ["logic"],
    levelKey: "robot_circuit_current_level",
  },
  "energy-core": {
    id: "energy-core",
    title: "Energy Core",
    category: "kognitif",
    skillPillars: ["logic", "creativity"],
    levelKey: "energy_core_current_level",
  },
  "robot-escape": {
    id: "robot-escape",
    title: "Robot Escape",
    category: "kognitif",
    skillPillars: ["logic", "focus"],
    levelKey: "robot_escape_current_level",
  },
  "robo-circle": {
    id: "robo-circle",
    title: "Robo Circle",
    category: "fokus",
    skillPillars: ["focus"],
  },
  "robo-charge": {
    id: "robo-charge",
    title: "Robo Charge",
    category: "kognitif",
    skillPillars: ["logic", "focus"],
    levelKey: "robo_charge_current_level",
  },
  "pick-and-drop": {
    id: "pick-and-drop",
    title: "Robo Pick & Drop",
    category: "moral",
    skillPillars: ["moral", "logic"],
    levelKey: "pick_and_drop_current_level",
  },
  "pose-master": {
    id: "pose-master",
    title: "Master Pose",
    category: "fokus",
    skillPillars: ["focus"],
    levelKey: "pose_master_current_level",
  },
  "robo-pose": {
    id: "robo-pose",
    title: "Robo Pose",
    category: "fokus",
    skillPillars: ["focus", "creativity"],
  },
};

// =========================================================================
// Session Progress Interface
// =========================================================================
export interface GameSessionData {
  gameId: string;
  level?: number;
  score?: number;
  xpEarned?: number;
  coinsEarned?: number;
  durationSeconds?: number;
  completed?: boolean; // true if level was completed successfully
  metadata?: Record<string, any>; // extra data (e.g. stars, accuracy%)
}

// =========================================================================
// Core Functions
// =========================================================================

/**
 * Get the current authenticated user ID, or null if guest/not logged in.
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch {
    return null;
  }
}

/**
 * Save a game session to Supabase (game_sessions table).
 * Also updates child_skills scores and total XP/coins.
 * 
 * Call this every time a player completes a level, finishes a round,
 * or ends a game session.
 */
export async function saveGameSession(sessionData: GameSessionData): Promise<void> {
  const userId = await getCurrentUserId();
  const meta = GAME_CATALOG[sessionData.gameId];
  if (!meta) {
    console.warn(`Unknown game ID: ${sessionData.gameId}`);
    return;
  }

  const xp = sessionData.xpEarned ?? (sessionData.completed ? 100 : 25);
  const coins = sessionData.coinsEarned ?? (sessionData.completed ? 50 : 10);

  // 1. Always save to local AsyncStorage as backup
  try {
    const localKey = `robomind_sessions_${meta.id}`;
    const existing = await AsyncStorage.getItem(localKey);
    const sessions: any[] = existing ? JSON.parse(existing) : [];
    sessions.push({
      ...sessionData,
      xpEarned: xp,
      coinsEarned: coins,
      timestamp: new Date().toISOString(),
    });
    // Keep last 100 sessions per game
    if (sessions.length > 100) sessions.splice(0, sessions.length - 100);
    await AsyncStorage.setItem(localKey, JSON.stringify(sessions));

    // Update local cumulative stats
    const totalXpKey = "robomind_total_xp";
    const totalCoinsKey = "user_coins_balance";
    const currentXp = parseInt((await AsyncStorage.getItem(totalXpKey)) || "0");
    const currentCoins = parseInt((await AsyncStorage.getItem(totalCoinsKey)) || "100");
    await AsyncStorage.setItem(totalXpKey, String(currentXp + xp));
    await AsyncStorage.setItem(totalCoinsKey, String(currentCoins + coins));
  } catch (e) {
    console.warn("Local save error:", e);
  }

  // 2. Push to Supabase if authenticated
  if (!userId) return;

  try {
    // Insert game session record
    await supabase.from("game_sessions").insert({
      user_id: userId,
      game_id: meta.id,
      game_title: meta.title,
      category: meta.category,
      score: sessionData.score ?? 0,
      xp_earned: xp,
      coins_earned: coins,
      level_reached: sessionData.level ?? 1,
      duration_seconds: sessionData.durationSeconds ?? 0,
      completed: sessionData.completed ?? false,
      metadata: sessionData.metadata ?? {},
      completed_at: new Date().toISOString(),
    });

    // Update skill pillars
    await updateSkillPillars(userId, meta.skillPillars, sessionData.completed ?? false);

    // Update cumulative child stats (total_xp, coins, level, and screentime)
    const durationMin = Math.max(1, Math.round((sessionData.durationSeconds || 120) / 60));
    await updateChildCumulativeStats(userId, xp, coins, sessionData.level, durationMin);
  } catch (e) {
    console.warn("Supabase session sync error:", e);
  }
}

/**
 * Update the child_skills radar chart scores based on which skill pillars
 * the game touches. Completed levels give +2 to relevant pillars,
 * failed attempts give +0.5 (showing effort).
 */
async function updateSkillPillars(
  userId: string,
  pillars: SkillPillar[],
  completed: boolean
): Promise<void> {
  const increment = completed ? 2 : 0.5;
  const columnMap: Record<SkillPillar, string> = {
    logic: "logic_score",
    creativity: "creativity_score",
    literacy: "literacy_score",
    focus: "focus_score",
    moral: "moral_score",
  };

  try {
    // Get current skills
    const { data: existing } = await supabase
      .from("child_skills")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (existing) {
      const updates: Record<string, number> = { updated_at: new Date().toISOString() as any };
      for (const pillar of pillars) {
        const col = columnMap[pillar];
        const current = (existing as any)[col] ?? 50;
        updates[col] = Math.min(100, current + increment);
      }
      await supabase.from("child_skills").update(updates).eq("user_id", userId);
    } else {
      // Create initial skills record
      const initial: Record<string, any> = {
        user_id: userId,
        logic_score: 50,
        creativity_score: 50,
        literacy_score: 50,
        focus_score: 50,
        moral_score: 50,
        updated_at: new Date().toISOString(),
      };
      for (const pillar of pillars) {
        initial[columnMap[pillar]] = 50 + increment;
      }
      await supabase.from("child_skills").insert(initial);
    }
  } catch (e) {
    console.warn("Skill pillar update error:", e);
  }
}

/**
 * Update cumulative child statistics (total XP, coins, highest level, and screentime).
 */
async function updateChildCumulativeStats(
  userId: string,
  xpEarned: number,
  coinsEarned: number,
  level?: number,
  durationMinutes: number = 2
): Promise<void> {
  try {
    const { data: child } = await supabase
      .from("children")
      .select("*")
      .eq("parent_id", userId)
      .single();

    if (child) {
      const todayStr = new Date().toISOString().split("T")[0];
      const lastResetDate = child.updated_at ? new Date(child.updated_at).toISOString().split("T")[0] : todayStr;
      
      let currentScreentime = child.daily_screentime_minutes || 0;
      if (lastResetDate !== todayStr) {
        currentScreentime = 0; // Automatic reset on a new day
      }

      const limit = child.screentime_limit_minutes || 60;
      const newScreentime = Math.min(limit, currentScreentime + durationMinutes);

      const newXp = (child.total_xp || 0) + xpEarned;
      const newCoins = (child.coins || 0) + coinsEarned;
      const newLevel = Math.max(child.level || 1, Math.floor(newXp / 500) + 1);

      await supabase
        .from("children")
        .update({
          total_xp: newXp,
          coins: newCoins,
          level: newLevel,
          daily_screentime_minutes: newScreentime,
          updated_at: new Date().toISOString(),
        })
        .eq("id", child.id);
    }
  } catch (e) {
    console.warn("Child stats update error:", e);
  }
}

/**
 * Record screentime: increment daily_screentime_minutes by given minutes.
 */
export async function recordScreentime(minutes: number): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  try {
    const { data: child } = await supabase
      .from("children")
      .select("id, daily_screentime_minutes")
      .eq("parent_id", userId)
      .single();

    if (child) {
      await supabase
        .from("children")
        .update({
          daily_screentime_minutes: (child.daily_screentime_minutes || 0) + minutes,
        })
        .eq("id", child.id);
    }
  } catch (e) {
    console.warn("Screentime update error:", e);
  }
}

/**
 * Sync all local AsyncStorage progress to Supabase.
 * Call this on app launch after login to upload any offline progress.
 */
export async function syncLocalProgressToCloud(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  try {
    for (const gameId of Object.keys(GAME_CATALOG)) {
      const localKey = `robomind_sessions_${gameId}`;
      const raw = await AsyncStorage.getItem(localKey);
      if (!raw) continue;

      const sessions: any[] = JSON.parse(raw);
      const syncedKey = `robomind_synced_count_${gameId}`;
      const syncedCount = parseInt((await AsyncStorage.getItem(syncedKey)) || "0");

      // Only sync new sessions that haven't been pushed yet
      const unsynced = sessions.slice(syncedCount);
      if (unsynced.length === 0) continue;

      const meta = GAME_CATALOG[gameId];
      const rows = unsynced.map((s) => ({
        user_id: userId,
        game_id: meta.id,
        game_title: meta.title,
        category: meta.category,
        score: s.score ?? 0,
        xp_earned: s.xpEarned ?? 50,
        coins_earned: s.coinsEarned ?? 10,
        level_reached: s.level ?? 1,
        duration_seconds: s.durationSeconds ?? 0,
        completed: s.completed ?? false,
        metadata: s.metadata ?? {},
        completed_at: s.timestamp || new Date().toISOString(),
      }));

      await supabase.from("game_sessions").insert(rows);
      await AsyncStorage.setItem(syncedKey, String(sessions.length));
    }
    console.log("✅ Local progress synced to Supabase cloud!");
  } catch (e) {
    console.warn("Cloud sync error:", e);
  }
}

/**
 * Get player stats summary for a specific game from local storage.
 */
export async function getLocalGameStats(gameId: string): Promise<{
  totalSessions: number;
  highestLevel: number;
  totalXp: number;
  totalCoins: number;
}> {
  try {
    const localKey = `robomind_sessions_${gameId}`;
    const raw = await AsyncStorage.getItem(localKey);
    if (!raw) return { totalSessions: 0, highestLevel: 1, totalXp: 0, totalCoins: 0 };

    const sessions: any[] = JSON.parse(raw);
    return {
      totalSessions: sessions.length,
      highestLevel: Math.max(1, ...sessions.map((s) => s.level ?? 1)),
      totalXp: sessions.reduce((sum, s) => sum + (s.xpEarned ?? 0), 0),
      totalCoins: sessions.reduce((sum, s) => sum + (s.coinsEarned ?? 0), 0),
    };
  } catch {
    return { totalSessions: 0, highestLevel: 1, totalXp: 0, totalCoins: 0 };
  }
}
