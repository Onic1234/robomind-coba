import json
import random

# Generate levels 6 to 20
levels = []
for i in range(6, 21):
    # determine grid size
    cols = min(4 + (i // 5), 6) # grows up to 6
    rows = min(4 + (i // 4), 7) # grows up to 7
    
    # generate a random zig-zag path from (0, rows-1) to (cols-1, 0)
    # just an L-shape with some steps
    tiles = []
    
    c, r = 0, rows-1
    # We will build a path
    path = [(c, r)]
    while c < cols - 1 or r > 0:
        if c == cols - 1:
            r -= 1
        elif r == 0:
            c += 1
        else:
            if random.random() > 0.5:
                c += 1
            else:
                r -= 1
        path.append((c, r))
        
    for idx, (tc, tr) in enumerate(path):
        if idx == 0:
            # start
            if path[1][0] > tc:
                tile_type = "straight"
                rot = 0
            else:
                tile_type = "elbow"
                rot = 90
        elif idx == len(path) - 1:
            # end
            tile_type = "straight"
            rot = 90
        else:
            pc, pr = path[idx-1]
            nc, nr = path[idx+1]
            if pc == nc or pr == nr:
                tile_type = "straight"
                rot = 0 if pr == nr else 90
            else:
                tile_type = "elbow"
                rot = random.choice([0, 90, 180, 270]) # Randomize initial rot for player to solve
                
        tiles.append({
            "col": tc, "row": tr,
            "type": tile_type,
            "initialRotation": random.choice([0, 90, 180, 270]) # shuffle all rotations
        })
        
    # add some decoy tiles
    num_decoys = i // 2
    for _ in range(num_decoys):
        dc = random.randint(0, cols-1)
        dr = random.randint(0, rows-1)
        if (dc, dr) not in path:
            tiles.append({
                "col": dc, "row": dr,
                "type": random.choice(["straight", "elbow", "t_junction"]),
                "initialRotation": random.choice([0, 90, 180, 270])
            })
            path.append((dc, dr)) # prevent duplicate decoys
            
    level = {
        "level": i,
        "cols": cols,
        "rows": rows,
        "startCol": 0,
        "startRow": rows-1,
        "startDir": "left",
        "endCol": cols-1,
        "endRow": 0,
        "endDir": "right",
        "tiles": tiles,
        "rewardCoins": 150 + i * 15,
        "rewardXP": 100 + i * 10,
        "instructions": f"Level {i}. Grid {cols}x{rows}. Semakin rumit, cari rute yang tepat!",
        "timeLimit": max(30, 50 - i)
    }
    levels.append(level)

levels_js = ",\n".join([json.dumps(l, indent=2) for l in levels])
levels_js = levels_js.replace('"level"', 'level').replace('"cols"', 'cols').replace('"rows"', 'rows').replace('"startCol"', 'startCol').replace('"startRow"', 'startRow').replace('"startDir"', 'startDir').replace('"endCol"', 'endCol').replace('"endRow"', 'endRow').replace('"endDir"', 'endDir').replace('"tiles"', 'tiles').replace('"col"', 'col').replace('"row"', 'row').replace('"type"', 'type').replace('"initialRotation"', 'initialRotation').replace('"rewardCoins"', 'rewardCoins').replace('"rewardXP"', 'rewardXP').replace('"instructions"', 'instructions').replace('"timeLimit"', 'timeLimit')


file_path = r'C:\Users\miftah\Desktop\project\robomind-coba\app\robo-link.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace generated levels 6-20
import re
content = re.sub(r'// Generated Levels 6-20.*?\];', '// Generated Levels 6-20\n' + levels_js + '\n];', content, flags=re.DOTALL)


# 2. Fix handleNextLevel so it doesn't go back to map, just continues
next_level_orig = '''  const handleNextLevel = async () => {
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
      
      // Lanjut main ke level berikutnya
      setLevel(nextLvl);
    } catch (e) {
      console.error("Failed to save progress", e);
      setLevel(nextLvl);
    }
  };'''
content = content.replace(next_level_orig, next_level_new)


# 3. Create Candy Crush style Map
map_view_orig = '''        <ScrollView style={{ flex: 1 }}>
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
        </ScrollView>'''

map_view_new = '''        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 40, alignItems: 'center' }}>
          {/* Path SVG behind the levels */}
          <View style={{ position: 'absolute', top: 40, bottom: 40, left: 0, right: 0, alignItems: 'center' }}>
            <Svg width="200" height={LEVEL_CONFIGS.length * 85}>
              <Path
                d={`M 100 30 ` + LEVEL_CONFIGS.slice().reverse().map((lvl, idx) => {
                  const x = 100 + Math.sin(lvl.level * 0.8) * 80;
                  const y = idx * 85 + 30;
                  return `L ${x} ${y}`;
                }).join(" ")}
                fill="none"
                stroke="#4ADE80"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d={`M 100 30 ` + LEVEL_CONFIGS.slice().reverse().map((lvl, idx) => {
                  const x = 100 + Math.sin(lvl.level * 0.8) * 80;
                  const y = idx * 85 + 30;
                  return `L ${x} ${y}`;
                }).join(" ")}
                fill="none"
                stroke="#BBF7D0"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          
          {LEVEL_CONFIGS.slice().reverse().map((lvl, idx) => {
            const isUnlocked = lvl.level <= highestUnlocked;
            const isCurrent = lvl.level === highestUnlocked;
            const offsetX = Math.sin(lvl.level * 0.8) * 80;
            
            return (
              <View key={lvl.level} style={{ height: 85, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
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
                      transform: [
                        { translateX: offsetX },
                        { scale: pressed && isUnlocked ? 0.9 : (isCurrent ? 1.1 : 1) }
                      ]
                    }
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
        </ScrollView>'''

content = content.replace(map_view_orig, map_view_new)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('done')
