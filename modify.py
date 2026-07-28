import re

file_path = r'C:\Users\miftah\Desktop\project\robomind-coba\app\robo-link.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Levels 6-20 to LEVEL_CONFIGS
levels_addition = '\n  // Generated Levels 6-20\n'
for i in range(6, 21):
    levels_addition += f'''  {{
    level: {i},
    cols: 5,
    rows: 5,
    startCol: 0,
    startRow: 2,
    startDir: "left",
    endCol: 4,
    endRow: 2,
    endDir: "right",
    tiles: [
      {{ col: 0, row: 2, type: "straight", initialRotation: 90 }},
      {{ col: 1, row: 2, type: "straight", initialRotation: 0 }},
      {{ col: 2, row: 2, type: "straight", initialRotation: 90 }},
      {{ col: 3, row: 2, type: "straight", initialRotation: 0 }},
      {{ col: 4, row: 2, type: "straight", initialRotation: 90 }},
      {{ col: 2, row: 1, type: "elbow", initialRotation: 90 }},
      {{ col: 2, row: 3, type: "elbow", initialRotation: 270 }},
    ],
    rewardCoins: {150 + i*10},
    rewardXP: {100 + i*5},
    instructions: "Hubungkan sirkuit! Level {i} semakin menantang.",
    timeLimit: {45 - (i%5)*2},
  }},
'''

content = content.replace('    timeLimit: 45,\n  },\n];', f'    timeLimit: 45,\n  }},\n{levels_addition}];')

# 2. State for View and Highest Unlocked
content = content.replace(
    'const [level, setLevel] = useState(1);',
    'const [level, setLevel] = useState(1);\n  const [highestUnlocked, setHighestUnlocked] = useState(1);\n  const [view, setView] = useState<"map" | "game">("map");'
)

# 3. Update loadGameData to set highestUnlocked
load_data_orig = '''        const storedLevel = await AsyncStorage.getItem("robo_link_current_level");
        if (storedLevel !== null) {
          setLevel(parseInt(storedLevel));
        }'''
load_data_new = '''        const storedLevel = await AsyncStorage.getItem("robo_link_current_level");
        if (storedLevel !== null) {
          setHighestUnlocked(parseInt(storedLevel));
        }'''
content = content.replace(load_data_orig, load_data_new)

# 4. In handleNextLevel, we should return to map if not completed
next_level_orig = '''  const handleNextLevel = async () => {
    triggerHaptic("light");
    const nextLvl = level + 1;
    const finalBalance = userCoins + currentConfig.rewardCoins;

    try {
      await AsyncStorage.setItem(COINS_STORAGE_KEY, finalBalance.toString());
      await AsyncStorage.setItem("robo_link_current_level", nextLvl.toString());
      setUserCoins(finalBalance);
      setLevel(nextLvl);
    } catch (e) {
      console.error("Failed to save progress", e);
      setLevel(nextLvl);
    }
  };'''

next_level_new = '''  const handleNextLevel = async () => {
    triggerHaptic("light");
    const nextLvl = level + 1;
    const finalBalance = userCoins + currentConfig.rewardCoins;
    const newHighest = Math.max(highestUnlocked, nextLvl);

    try {
      await AsyncStorage.setItem(COINS_STORAGE_KEY, finalBalance.toString());
      await AsyncStorage.setItem("robo_link_current_level", newHighest.toString());
      setUserCoins(finalBalance);
      setHighestUnlocked(newHighest);
      setView("map");
    } catch (e) {
      console.error("Failed to save progress", e);
      setView("map");
    }
  };'''
content = content.replace(next_level_orig, next_level_new)

# 5. Same for handleClaimAndExit
claim_exit_orig = '''  const handleClaimAndExit = async () => {
    triggerHaptic("success");
    const finalBalance = userCoins + currentConfig.rewardCoins;

    try {
      await AsyncStorage.setItem(COINS_STORAGE_KEY, finalBalance.toString());
      // Keep the current level saved
      router.back();
    } catch (e) {
      console.error("Failed to save progress", e);
      router.back();
    }
  };'''
claim_exit_new = '''  const handleClaimAndExit = async () => {
    triggerHaptic("success");
    const finalBalance = userCoins + currentConfig.rewardCoins;

    try {
      await AsyncStorage.setItem(COINS_STORAGE_KEY, finalBalance.toString());
      setView("map");
    } catch (e) {
      console.error("Failed to save progress", e);
      setView("map");
    }
  };'''
content = content.replace(claim_exit_orig, claim_exit_new)


# 6. Build Map View Component
map_view_code = '''
  if (view === "map") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#F0FDF4" }]} edges={["top", "bottom"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#86EFAC" />
        <View style={[styles.header, { backgroundColor: "#86EFAC", borderBottomColor: "#4ADE80" }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}>
              <Ionicons name="arrow-back" size={20} color="#166534" />
            </Pressable>
            <Text style={{ ...FONTS.heading, fontSize: 18, color: "#14532D" }}>Peta Sirkuit</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={[styles.coinsHeaderBadge, { borderColor: "#EF4444", backgroundColor: "#FEF2F2" }]}>
              <Ionicons name="heart" size={16} color="#EF4444" />
              <Text style={[styles.coinsHeaderVal, { color: "#B91C1C" }]}>{lives}</Text>
            </View>
            <View style={styles.coinsHeaderBadge}>
              <MaterialCommunityIcons name="coin" size={18} color="#D97706" />
              <Text style={styles.coinsHeaderVal}>{userCoins}</Text>
            </View>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }}>
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 8, backgroundColor: '#BBF7D0', marginLeft: -4, borderRadius: 4 }} />
          <View style={{ padding: 40, alignItems: 'center' }}>
            {LEVEL_CONFIGS.slice().reverse().map((lvl) => {
              const isUnlocked = lvl.level <= highestUnlocked;
              const isCurrent = lvl.level === highestUnlocked;
              const isZigZagRight = lvl.level % 2 === 0;
              return (
                <View key={lvl.level} style={{ flexDirection: 'row', width: '100%', justifyContent: isZigZagRight ? 'flex-end' : 'flex-start', marginBottom: 25 }}>
                  <Pressable
                    onPress={() => {
                      if (isUnlocked) {
                        if (lives <= 0) {
                          setGameState("outOfLives");
                        } else {
                          setLevel(lvl.level);
                          setView("game");
                        }
                      }
                    }}
                    style={({ pressed }) => [
                      {
                        width: 60, height: 60, borderRadius: 30,
                        backgroundColor: isUnlocked ? (isCurrent ? "#F59E0B" : "#10B981") : "#CBD5E1",
                        justifyContent: 'center', alignItems: 'center',
                        borderWidth: 4, borderColor: isUnlocked ? "#FFFFFF" : "#94A3B8",
                        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5,
                        transform: [{ scale: pressed && isUnlocked ? 0.9 : 1 }]
                      },
                      isZigZagRight ? { marginRight: 40 } : { marginLeft: 40 }
                    ]}
                  >
                    {isUnlocked ? (
                       <Text style={{ ...FONTS.heading, fontSize: 24, color: "#FFF" }}>{lvl.level}</Text>
                    ) : (
                       <Ionicons name="lock-closed" size={24} color="#94A3B8" />
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* OUT OF LIVES MODAL IN MAP */}
        <Modal visible={gameState === "outOfLives"} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={[styles.victoryIconCircle, { backgroundColor: "#FEF2F2" }]}>
                <Ionicons name="heart-half" size={50} color="#EF4444" />
              </View>
              <Text style={styles.modalTitle}>NYAWA HABIS!</Text>
              <Text style={styles.modalSubtitle}>Tunggu energi pulih untuk melanjutkan main. 1 Nyawa pulih dalam 15 menit.</Text>
              <View style={styles.rewardSummary}>
                <Text style={styles.rewardLabel}>WAKTU TUNGGU</Text>
                <Text style={{ fontSize: 24, fontWeight: "bold", color: "#EF4444" }}>
                  {Math.floor(cooldownLeft / 60)}:{(cooldownLeft % 60).toString().padStart(2, "0")}
                </Text>
              </View>
              <Button title="Kembali" onPress={() => setGameState("playing")} variant="primary" style={{ width: "100%", backgroundColor: "#64748B" }} />
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    );
  }
'''
# inject before return ( <SafeAreaView style={styles.container} edges={["top", "bottom"]}> )
content = content.replace('  return (\n    <SafeAreaView style={styles.container}', map_view_code + '\n  return (\n    <SafeAreaView style={styles.container}')

# add ScrollView import
content = content.replace('import { SafeAreaView } from "react-native-safe-area-context";', 'import { SafeAreaView } from "react-native-safe-area-context";\nimport { ScrollView } from "react-native";')

# 7. Add back to map button in game header
game_header_orig = '''          <Pressable
            onPress={() => {
              triggerHaptic("light");
              router.back();
            }}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="arrow-back" size={20} color="#0F766E" />
          </Pressable>'''
game_header_new = '''          <Pressable
            onPress={() => {
              triggerHaptic("light");
              setView("map");
            }}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="map" size={16} color="#0F766E" />
          </Pressable>'''
content = content.replace(game_header_orig, game_header_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('done')
