import { Storage } from "./storage";

async function getStore() {
  return Storage;
}

const ALL_GAME_PROGRESS_KEYS = [
  "user_coins_balance",
  "user_gems_balance",
  "screw_spin_current_level",
  "screw_spin_coins",
  "energy_core_current_level",
  "energy_core_coins",
  "energy_core_evolution",
  "robot_circuit_current_level",
  "robot_circuit_coins",
  "robot_escape_current_level",
  "robot_escape_coins",
  "robo_charge_current_level",
  "robo_charge_coins",
  "pick_and_drop_current_level",
  "pick_and_drop_coins",
  "pose_master_current_level",
  "pose_master_coins",
  "robo_circle_current_level",
  "robo_circle_coins",
  "rogue_soul_level_progress",
  "rogue_soul_coins",
  "rogue_soul_gems",
  "rogue_soul_powerups",
  "robo_link_current_level",
  "robo_link_lives",
  "robo_link_last_loss",
  "robo_link_coins",
  "robo_jek_progress",
  "robo_maze_progress",
  "robo_bros_progress",
  "robo_pose_progress",
];

export async function resetAllGameProgress(): Promise<void> {
  try {
    const store = await getStore();
    await store.multiRemove(ALL_GAME_PROGRESS_KEYS);
    console.log("[resetProgress] All game progress cleared.");
  } catch (e) {
    console.warn("[resetProgress] Failed to clear game progress:", e);
  }
}

const RESET_VERSION_KEY = "robomind_progress_reset_v3";

export async function autoResetIfNeeded(): Promise<void> {
  try {
    const store = await getStore();
    const alreadyReset = await store.getItem(RESET_VERSION_KEY);
    if (alreadyReset !== "true") {
      await resetAllGameProgress();
      await store.setItem(RESET_VERSION_KEY, "true");
      console.log("[resetProgress] Auto-reset applied for fresh start.");
    }
  } catch (e) {
    console.warn("[resetProgress] autoResetIfNeeded error:", e);
  }
}
