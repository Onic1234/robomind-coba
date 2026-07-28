import json
import re

# 1. Generate Snake-like levels (guaranteed solvable and continuous)
levels = []
for i in range(6, 21):
    cols = min(4 + ((i-1) // 5), 5) # max 5 cols to fit on mobile easily
    rows = min(4 + ((i-1) // 4), 6) # max 6 rows
    
    # We build a snake from (0, rows-1) to (cols-1, 0)
    # Start at bottom-left: (0, rows-1)
    
    tiles = []
    path = []
    
    c = 0
    r = rows - 1
    direction = 'right' # moving right
    
    while r >= 0:
        path.append((c, r))
        if direction == 'right':
            if c < cols - 1:
                c += 1
            else:
                direction = 'up'
                r -= 1
        elif direction == 'left':
            if c > 0:
                c -= 1
            else:
                direction = 'up'
                r -= 1
        elif direction == 'up':
            # After moving up, we switch horizontal direction
            if c == 0:
                direction = 'right'
            else:
                direction = 'left'
                
    # Now path is a list of coordinates
    # We ensure the end is at the top row, but the game expects endCol and endRow.
    end_c, end_r = path[-1]
    
    # Let's assign tile types based on path segments
    for idx, (tc, tr) in enumerate(path):
        if idx == 0:
            rot = 0
            tile_type = "straight"
        elif idx == len(path) - 1:
            tile_type = "straight"
            rot = 90
        else:
            pc, pr = path[idx-1]
            nc, nr = path[idx+1]
            if pc == nc or pr == nr:
                tile_type = "straight"
                rot = 0
            else:
                tile_type = "elbow"
                rot = 0
        
        # We randomize initialRotation so user has to solve it!
        import random
        tiles.append({
            "col": tc, "row": tr,
            "type": tile_type,
            "initialRotation": random.choice([0, 90, 180, 270])
        })
        
    # Decoys
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
        "endCol": end_c,
        "endRow": end_r,
        "endDir": "right" if end_c == cols-1 else ("left" if end_c == 0 else "top"),
        "tiles": tiles,
        "rewardCoins": 150 + i * 15,
        "rewardXP": 100 + i * 10,
        "instructions": f"Level {i}. Rute ular {cols}x{rows}! Putar ubin agar energi mengalir.",
        "timeLimit": max(30, 50 - i)
    }
    levels.append(level)

levels_js = ",\n".join([json.dumps(l, indent=2) for l in levels])
levels_js = levels_js.replace('"level"', 'level').replace('"cols"', 'cols').replace('"rows"', 'rows').replace('"startCol"', 'startCol').replace('"startRow"', 'startRow').replace('"startDir"', 'startDir').replace('"endCol"', 'endCol').replace('"endRow"', 'endRow').replace('"endDir"', 'endDir').replace('"tiles"', 'tiles').replace('"col"', 'col').replace('"row"', 'row').replace('"type"', 'type').replace('"initialRotation"', 'initialRotation').replace('"rewardCoins"', 'rewardCoins').replace('"rewardXP"', 'rewardXP').replace('"instructions"', 'instructions').replace('"timeLimit"', 'timeLimit')


file_path = r'C:\Users\miftah\Desktop\project\robomind-coba\app\robo-link.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace generated levels 6-20
content = re.sub(r'// Generated Levels 6-20.*?\];', '// Generated Levels 6-20\n' + levels_js + '\n];', content, flags=re.DOTALL)


# 2. Fix Responsive Arena & Screen Scaling
import_orig = 'import { SafeAreaView } from "react-native-safe-area-context";\nimport { ScrollView } from "react-native";'
import_new = 'import { SafeAreaView } from "react-native-safe-area-context";\nimport { ScrollView, Dimensions } from "react-native";\n\nconst { width: SCREEN_WIDTH } = Dimensions.get("window");\nconst ARENA_SIZE = Math.min(360, SCREEN_WIDTH - 40);'
content = content.replace(import_orig, import_new)

# Replace 360 with ARENA_SIZE
content = content.replace('width: 360,\n    height: 360,', 'width: ARENA_SIZE,\n    height: ARENA_SIZE,')
content = content.replace('width={360} height={360}', 'width={ARENA_SIZE} height={ARENA_SIZE}')
content = content.replace('const tileSize = 360 / currentConfig.cols;', 'const tileSize = ARENA_SIZE / currentConfig.cols;')

# Also fix the PC target position because right now it's hardcoded to x: 372
pc_pos_orig = '''  const pcPosition = useMemo(() => {
    const pY = currentConfig.endRow * tileSize + (tileSize - 50) / 2;
    return { x: 372, y: pY };
  }, [currentConfig, tileSize]);'''
pc_pos_new = '''  const pcPosition = useMemo(() => {
    const pY = currentConfig.endRow * tileSize + (tileSize - 50) / 2;
    return { x: ARENA_SIZE + 12, y: pY };
  }, [currentConfig, tileSize]);'''
content = content.replace(pc_pos_orig, pc_pos_new)

# Trace path end point x: 372
content = content.replace('points.push({ x: 372, y: pcY });', 'points.push({ x: ARENA_SIZE + 12, y: pcY });')

# Line from PC to target
content = content.replace('x1={360}\n                  y1=', 'x1={ARENA_SIZE}\n                  y1=')
content = content.replace('x2={372}\n                  y2=', 'x2={ARENA_SIZE + 12}\n                  y2=')


# 3. Fix Timer Cooldown State Bug
timer_orig = '''  // Cooldown countdown
  useEffect(() => {
    if (lives >= MAX_LIVES || !lastLossTime) return;
    const timer = setInterval(() => {
      const now = Date.now();
      const nextLifeTime = lastLossTime + LIFE_COOLDOWN_MS;
      const remaining = Math.max(0, nextLifeTime - now);
      
      if (remaining <= 0) {
        const newLives = lives + 1;
        setLives(newLives);
        AsyncStorage.setItem(LIVES_STORAGE_KEY, newLives.toString());
        if (newLives < MAX_LIVES) {
          const newLossTime = Date.now();
          setLastLossTime(newLossTime);
          AsyncStorage.setItem(LAST_LOSS_STORAGE_KEY, newLossTime.toString());
        } else {
          setLastLossTime(null);
          AsyncStorage.removeItem(LAST_LOSS_STORAGE_KEY);
        }
        if (gameState === "outOfLives") setGameState("playing");
      } else {
        setCooldownLeft(Math.floor(remaining / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lives, lastLossTime, gameState]);'''

timer_new = '''  // Cooldown countdown
  useEffect(() => {
    if (lives >= MAX_LIVES || !lastLossTime) return;
    const timer = setInterval(() => {
      const now = Date.now();
      const nextLifeTime = lastLossTime + LIFE_COOLDOWN_MS;
      const remaining = Math.max(0, nextLifeTime - now);
      
      if (remaining <= 0) {
        setLives(prevLives => {
          const newLives = prevLives + 1;
          AsyncStorage.setItem(LIVES_STORAGE_KEY, newLives.toString());
          if (newLives < MAX_LIVES) {
            const newLossTime = Date.now();
            setLastLossTime(newLossTime);
            AsyncStorage.setItem(LAST_LOSS_STORAGE_KEY, newLossTime.toString());
          } else {
            setLastLossTime(null);
            AsyncStorage.removeItem(LAST_LOSS_STORAGE_KEY);
          }
          return newLives;
        });
        setGameState(prev => prev === "outOfLives" ? "playing" : prev);
      } else {
        setCooldownLeft(Math.floor(remaining / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lives, lastLossTime]);'''
content = content.replace(timer_orig, timer_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('done')
