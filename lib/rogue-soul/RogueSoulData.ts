export interface CostumeSkin {
  id: string;
  name: string;
  description: string;
  priceCoins: number;
  priceGems: number;
  speedMultiplier: number;
  defenseBonus: number;
  colorScheme: {
    primary: string;
    secondary: string;
    cape: string;
    glow: string;
  };
  unlockedByDefault?: boolean;
}

export interface WeaponItem {
  id: string;
  name: string;
  description: string;
  priceCoins: number;
  damage: number;
  range: number;
  bladeColor: string;
  trailColor: string;
  unlockedByDefault?: boolean;
}

export interface UpgradeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  currentLevel: number;
  maxLevel: number;
  costPerLevel: number[];
  effectLabel: (level: number) => string;
}

export interface LevelData {
  id: number;
  name: string;
  subtitle: string;
  environment: "forest" | "ramparts" | "dungeon" | "keep";
  themeColor: string;
  targetDistance: number;
  targetCoins: number;
  targetEnemies: number;
  rewardCoins: number;
  rewardGems: number;
  bossLevel?: boolean;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardCoins: number;
  rewardGems: number;
  currentProgress: number;
  targetProgress: number;
  completed: boolean;
}

// COSTUME SKINS
export const COSTUME_SKINS: CostumeSkin[] = [
  {
    id: "rogue_default",
    name: "Robo Runner",
    description: "Kostum petualang klasik. Lincah, cepat, dan selalu siap beraksi.",
    priceCoins: 0,
    priceGems: 0,
    speedMultiplier: 1.0,
    defenseBonus: 0,
    colorScheme: {
      primary: "#D97706",
      secondary: "#78350F",
      cape: "#DC2626",
      glow: "#FBBF24",
    },
    unlockedByDefault: true,
  },
  {
    id: "shadow_assassin",
    name: "Shadow Assassin",
    description: "Jubah bayangan kegelapan. Meningkatkan kecepatan lari +15%.",
    priceCoins: 500,
    priceGems: 0,
    speedMultiplier: 1.15,
    defenseBonus: 0,
    colorScheme: {
      primary: "#1E1B4B",
      secondary: "#312E81",
      cape: "#4C1D95",
      glow: "#8B5CF6",
    },
  },
  {
    id: "golden_knight",
    name: "Golden Paladin",
    description: "Zirah emas kerajaan yang megah. Memberikan perlindungan +1 ekstra HP.",
    priceCoins: 1200,
    priceGems: 5,
    speedMultiplier: 1.0,
    defenseBonus: 1,
    colorScheme: {
      primary: "#F59E0B",
      secondary: "#B45309",
      cape: "#2563EB",
      glow: "#FEF08A",
    },
  },
  {
    id: "flame_specter",
    name: "Flame Specter",
    description: "Diselimuti api abadi. Tebasan pedang meninggalkan jejak kobaran api!",
    priceCoins: 2500,
    priceGems: 15,
    speedMultiplier: 1.2,
    defenseBonus: 1,
    colorScheme: {
      primary: "#EF4444",
      secondary: "#991B1B",
      cape: "#F97316",
      glow: "#FDE047",
    },
  },
  {
    id: "cyber_rogue",
    name: "Cyber Knight 2099",
    description: "Kostum neon futuristik dengan perisai laser dan aura bercahaya.",
    priceCoins: 5000,
    priceGems: 30,
    speedMultiplier: 1.25,
    defenseBonus: 2,
    colorScheme: {
      primary: "#06B6D4",
      secondary: "#0E7490",
      cape: "#EC4899",
      glow: "#22D3EE",
    },
  },
];

// WEAPONS
export const WEAPONS: WeaponItem[] = [
  {
    id: "novice_dagger",
    name: "Novice Shortsword",
    description: "Pedang pendek bajak laut standar.",
    priceCoins: 0,
    damage: 1,
    range: 55,
    bladeColor: "#E2E8F0",
    trailColor: "rgba(255, 255, 255, 0.5)",
    unlockedByDefault: true,
  },
  {
    id: "steel_rapier",
    name: "Steel Broadsword",
    description: "Pedang baja tajam dengan daya tebas lebih jauh.",
    priceCoins: 400,
    damage: 2,
    range: 68,
    bladeColor: "#94A3B8",
    trailColor: "rgba(148, 163, 184, 0.7)",
  },
  {
    id: "flame_brandish",
    name: "Flame Brandish",
    description: "Pedang berapi yang membakar musuh dalam satu kali tebasan.",
    priceCoins: 1500,
    damage: 3,
    range: 78,
    bladeColor: "#F97316",
    trailColor: "rgba(249, 115, 22, 0.8)",
  },
  {
    id: "soul_reaver",
    name: "Soul Reaver Blade",
    description: "Pedang legendaris penyerap jiwa. Menghancurkan perisai musuh!",
    priceCoins: 3500,
    damage: 5,
    range: 90,
    bladeColor: "#A855F7",
    trailColor: "rgba(168, 85, 247, 0.9)",
  },
];

// UPGRADES
export const INITIAL_UPGRADES: UpgradeItem[] = [
  {
    id: "max_hp",
    name: "Jantung Ksatria",
    description: "Meningkatkan jumlah Nyawa (HP) maksimum karakter.",
    icon: "heart-pulse",
    currentLevel: 1,
    maxLevel: 5,
    costPerLevel: [0, 200, 500, 1000, 2000],
    effectLabel: (lvl) => `${lvl + 2} Heart HP`,
  },
  {
    id: "dagger_capacity",
    name: "Kantong Pisau",
    description: "Meningkatkan batas kapasitas Pisau Lempar yang dapat dibawa.",
    icon: "sword-cross",
    currentLevel: 1,
    maxLevel: 5,
    costPerLevel: [0, 150, 400, 800, 1500],
    effectLabel: (lvl) => `${lvl * 3} Daggers`,
  },
  {
    id: "coin_magnet",
    name: "Magnet Koin",
    description: "Menarik koin & permata terdekat secara otomatis.",
    icon: "magnet",
    currentLevel: 0,
    maxLevel: 5,
    costPerLevel: [250, 500, 900, 1500, 2500],
    effectLabel: (lvl) => `${lvl * 35}px Radius`,
  },
  {
    id: "double_jump_power",
    name: "Sepatu Sayap",
    description: "Meningkatkan daya lompatan udara (Double Jump) dan kelincahan Wall Jump.",
    icon: "wings",
    currentLevel: 1,
    maxLevel: 5,
    costPerLevel: [0, 300, 700, 1200, 2200],
    effectLabel: (lvl) => `+${lvl * 10}% Jump Height`,
  },
];

// CAMPAIGN LEVELS
export const CAMPAIGN_LEVELS: LevelData[] = [
  {
    id: 1,
    name: "Hutan Pinggiran",
    subtitle: "Level 1: Outskirts of Robo Town",
    environment: "forest",
    themeColor: "#10B981",
    targetDistance: 1200,
    targetCoins: 40,
    targetEnemies: 5,
    rewardCoins: 150,
    rewardGems: 2,
  },
  {
    id: 2,
    name: "Benteng Atap Kerajaan",
    subtitle: "Level 2: Castle Ramparts & Towers",
    environment: "ramparts",
    themeColor: "#3B82F6",
    targetDistance: 1800,
    targetCoins: 75,
    targetEnemies: 10,
    rewardCoins: 300,
    rewardGems: 5,
  },
  {
    id: 3,
    name: "Bawah Tanah Istana",
    subtitle: "Level 3: Royal Dungeon & Vaults",
    environment: "dungeon",
    themeColor: "#8B5CF6",
    targetDistance: 2500,
    targetCoins: 120,
    targetEnemies: 15,
    rewardCoins: 600,
    rewardGems: 10,
  },
  {
    id: 4,
    name: "Kubah Naga Berapi",
    subtitle: "Level 4: Dragon Keep & Boss Arena",
    environment: "keep",
    themeColor: "#EF4444",
    targetDistance: 3200,
    targetCoins: 180,
    targetEnemies: 20,
    rewardCoins: 1200,
    rewardGems: 20,
    bossLevel: true,
  },
];

// ACHIEVEMENTS
export const INITIAL_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: "first_blood",
    title: "Tebasan Pertama",
    description: "Kalahkan 5 musuh dengan pedang atau pisau lempar.",
    icon: "sword",
    rewardCoins: 100,
    rewardGems: 1,
    currentProgress: 0,
    targetProgress: 5,
    completed: false,
  },
  {
    id: "parkour_master",
    title: "Master Parkour",
    description: "Lakukan 10x Wall Jump secara beruntun.",
    icon: "run-fast",
    rewardCoins: 200,
    rewardGems: 3,
    currentProgress: 0,
    targetProgress: 10,
    completed: false,
  },
  {
    id: "treasure_hunter",
    title: "Kolektor Harta",
    description: "Kumpulkan 150 koin emas di sepanjang petualangan.",
    icon: "star-circle",
    rewardCoins: 300,
    rewardGems: 5,
    currentProgress: 0,
    targetProgress: 150,
    completed: false,
  },
  {
    id: "boss_slayer",
    title: "Pembantai Boss",
    description: "Kalahkan Dark Warlord di Level 4 Kubah Naga.",
    icon: "crown",
    rewardCoins: 1000,
    rewardGems: 15,
    currentProgress: 0,
    targetProgress: 1,
    completed: false,
  },
];
