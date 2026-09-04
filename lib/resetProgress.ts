import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * All AsyncStorage keys used by games for level progress, coins, etc.
 * When we need a full reset (e.g. new user, fresh install), we clear all of these.
 */
const ALL_GAME_PROGRESS_KEYS = [
  // Global
  "user_coins_balance",
  "user_gems_balance",
  
  // Screw Spin
  "screw_spin_current_level",
  "screw_spin_coins",
  
  // Energy Core
  "energy_core_current_level",
  "energy_core_coins",
  "energy_core_evolution",
  
  // Robot Circuit Puzzle
  "robot_circuit_current_level",
  "robot_circuit_coins",
  
  // Robot Escape
  "robot_escape_current_level",
  "robot_escape_coins",
  
  // Robo Charge
  "robo_charge_current_level",
  "robo_charge_coins",
  
  // Pick and Drop
  "pick_and_drop_current_level",
  "pick_and_drop_coins",
  
  // Pose Master
  "pose_master_current_level",
  "pose_master_coins",
  
  // Robo Circle
  "robo_circle_current_level",
  "robo_circle_coins",
  
  // Rogue Soul
  "rogue_soul_level_progress",
  "rogue_soul_coins",
  "rogue_soul_gems",
  "rogue_soul_powerups",
  
  // Robo Link
  "robo_link_current_level",
  "robo_link_lives",
  "robo_link_last_loss",
  "robo_link_coins",
  
  // Robo Jek (iframe)
  "robo_jek_progress",
  
  // Robo Maze (iframe)
  "robo_maze_progress",
  
  // Robo Bros (iframe)
  "robo_bros_progress",
  
  // Robo Pose (iframe)
  "robo_pose_progress",
];

/**
 * Wipe all game progress from AsyncStorage.
 * Call this when user logs out or wants a fresh start.
 */
export async function resetAllGameProgress(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(ALL_GAME_PROGRESS_KEYS);
    console.log("[resetProgress] All game progress cleared.");
  } catch (e) {
    console.warn("[resetProgress] Failed to clear game progress:", e);
  }
}

/**
 * Auto-reset on first launch after a code update that requires clean slate.
 * Uses a version flag to detect if reset was already applied.
 */
const RESET_VERSION_KEY = "robomind_progress_reset_v3";

export async function autoResetIfNeeded(): Promise<void> {
  try {
    const alreadyReset = await AsyncStorage.getItem(RESET_VERSION_KEY);
    if (alreadyReset !== "true") {
      await resetAllGameProgress();
      await AsyncStorage.setItem(RESET_VERSION_KEY, "true");
      console.log("[resetProgress] Auto-reset applied for fresh start.");
    }
  } catch (e) {
    console.warn("[resetProgress] autoResetIfNeeded error:", e);
  }
}
