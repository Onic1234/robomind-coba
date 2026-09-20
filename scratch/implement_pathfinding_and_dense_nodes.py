import os

with open('robo-delivery/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update MAP_NODES_BASE and MAP_EDGES_BASE with 37 precise corner & stair nodes
new_nodes_and_edges = """    const MAP_NODES_BASE = [
      // --- TOP MOUNTAIN CORRIDOR & STAIRS (To Customer 1) ---
      { id: 0,  x: 21.0, y: 22.8 },  // Dapur Utama / Start (Top-Left)
      { id: 1,  x: 27.2, y: 20.2 },  // Tikungan Teras Kiri Atas
      { id: 2,  x: 29.5, y: 19.2 },  // Atas Tangga Kiri
      { id: 3,  x: 32.5, y: 24.5 },  // Bawah Tangga Kiri
      { id: 4,  x: 35.2, y: 16.5 },  // Tikungan Lorong Atas Tengah
      { id: 5,  x: 44.0, y: 12.4 },  // Lorong Atas Tengah
      { id: 6,  x: 48.0, y: 14.0 },  // Atas Tangga Tengah
      { id: 7,  x: 52.0, y: 19.0 },  // Bawah Tangga Tengah
      { id: 8,  x: 55.6, y: 15.5 },  // Teras Atas Kanan
      { id: 9,  x: 64.0, y: 13.0 },  // Atas Tangga Puncak
      { id: 10, x: 71.3, y: 11.4 },  // Bawah Tangga Puncak
      { id: 11, x: 80.0, y: 8.3  },  // Puncak Kanan (Pelanggan 1)

      // --- MID LEVEL CORRIDOR, BRIDGES & STAIRS (To Customer 2) ---
      { id: 12, x: 18.0, y: 28.0 },  // Atas Tangga Turun Kiri
      { id: 13, x: 15.5, y: 35.0 },  // Bawah Tangga Turun Kiri
      { id: 14, x: 21.0, y: 44.5 },  // Tikungan Teras Tengah Kiri
      { id: 15, x: 28.5, y: 39.0 },  // Ujung Teras Tengah Kiri
      { id: 16, x: 36.1, y: 33.1 },  // Masuk Jembatan Kiri
      { id: 17, x: 41.5, y: 35.5 },  // Keluar Jembatan Kiri
      { id: 18, x: 46.8, y: 37.3 },  // Puncak Jembatan Lengkung Utama
      { id: 19, x: 51.5, y: 32.0 },  // Masuk Taman Tengah
      { id: 20, x: 56.6, y: 28.0 },  // Jalur Taman Tengah
      { id: 21, x: 62.0, y: 26.0 },  // Masuk Jembatan Lengkung Kanan
      { id: 22, x: 67.4, y: 27.0 },  // Keluar Jembatan Lengkung Kanan
      { id: 23, x: 69.3, y: 39.4 },  // Teras Tengah Kanan (Pelanggan 2)

      // --- LOWER LEVEL FOREST GARDEN & STAIRS (To Customer 3) ---
      { id: 24, x: 18.0, y: 52.0 },  // Atas Tangga Bawah Kiri
      { id: 25, x: 15.6, y: 60.1 },  // Bawah Tangga Bawah Kiri
      { id: 26, x: 19.5, y: 70.0 },  // Tikungan Taman Bawah Kiri
      { id: 27, x: 23.0, y: 80.8 },  // Kedai Burger (Taman Bawah Kiri)
      { id: 28, x: 30.5, y: 73.0 },  // Ujung Taman Bawah Kiri
      { id: 29, x: 37.1, y: 66.3 },  // Jalur Tengah Bawah
      { id: 30, x: 44.0, y: 73.0 },  // Tikungan Taman Bawah Tengah
      { id: 31, x: 50.8, y: 80.8 },  // Kedai Hadiah (Taman Bawah Tengah)
      { id: 32, x: 59.0, y: 76.0 },  // Masuk Jembatan Bawah Kanan
      { id: 33, x: 66.4, y: 76.7 },  // Keluar Jembatan Bawah Kanan
      { id: 34, x: 74.2, y: 87.0 },  // Platform Bawah Kanan (Pelanggan 3)
      { id: 35, x: 77.0, y: 68.0 },  // Bawah Tangga Samping Kanan
      { id: 36, x: 81.0, y: 53.9 }   // Atas Tangga Samping Kanan
    ];

    const MAP_EDGES_BASE = [
      // Jalur Atas (Puncak Gunung ke Pelanggan 1)
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11],

      // Jalur Tengah (Teras & Jembatan ke Pelanggan 2)
      [0, 12], [12, 13], [13, 14], [14, 15], [15, 16], [16, 17], [17, 18], [18, 19], [19, 20], [20, 21], [21, 22], [22, 23],

      // Jalur Bawah (Taman Hutan ke Pelanggan 3)
      [14, 24], [24, 25], [25, 26], [26, 27], [27, 28], [28, 29], [29, 30], [30, 31], [31, 32], [32, 33], [33, 34],

      // Tangga & Jembatan Penghubung Antar-Level
      [4, 16],
      [20, 23],
      [23, 36], [36, 35], [35, 34],
      [18, 29]
    ];

    const LEVELS = [
      {
        id: 1,
        title: "Taman Kota",
        timeLimit: 180,
        rewardCoins: 350,
        nodes: MAP_NODES_BASE,
        edges: MAP_EDGES_BASE,
        startNode: 0,
        foodStations: [
          { nodeId: 0, food: FOOD_TYPES.PIZZA }
        ],
        customers: [
          { id: 'c1', nodeId: 11, wantsFood: FOOD_TYPES.PIZZA, delivered: false, gender: 'female' }
        ],
        obstacles: [
          { id: 'obs1', path: [1, 2, 3, 4, 5, 6, 7], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.012, icon: '⚠️' }
        ]
      },
      {
        id: 2,
        title: "Pusat Kota",
        timeLimit: 240,
        rewardCoins: 450,
        nodes: MAP_NODES_BASE,
        edges: MAP_EDGES_BASE,
        startNode: 0,
        foodStations: [
          { nodeId: 0, food: FOOD_TYPES.PIZZA },
          { nodeId: 27, food: FOOD_TYPES.BURGER }
        ],
        customers: [
          { id: 'c1', nodeId: 11, wantsFood: FOOD_TYPES.PIZZA, delivered: false, gender: 'female' },
          { id: 'c2', nodeId: 23, wantsFood: FOOD_TYPES.BURGER, delivered: false, gender: 'male' }
        ],
        obstacles: [
          { id: 'obs1', path: [1, 2, 3, 4, 5, 6, 7], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.012, icon: '⚠️' },
          { id: 'obs2', path: [14, 15, 16, 17, 18, 19, 20], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.014, icon: '⚠️' }
        ]
      },
      {
        id: 3,
        title: "Pasar Malam",
        timeLimit: 300,
        rewardCoins: 550,
        nodes: MAP_NODES_BASE,
        edges: MAP_EDGES_BASE,
        startNode: 0,
        foodStations: [
          { nodeId: 0, food: FOOD_TYPES.PIZZA },
          { nodeId: 27, food: FOOD_TYPES.BURGER },
          { nodeId: 31, food: FOOD_TYPES.GIFT }
        ],
        customers: [
          { id: 'c1', nodeId: 11, wantsFood: FOOD_TYPES.PIZZA, delivered: false, gender: 'female' },
          { id: 'c2', nodeId: 23, wantsFood: FOOD_TYPES.BURGER, delivered: false, gender: 'male' },
          { id: 'c3', nodeId: 34, wantsFood: FOOD_TYPES.GIFT, delivered: false, gender: 'female' }
        ],
        obstacles: [
          { id: 'obs1', path: [1, 2, 3, 4, 5, 6, 7], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.012, icon: '⚠️' },
          { id: 'obs2', path: [14, 15, 16, 17, 18, 19, 20], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.014, icon: '⚠️' },
          { id: 'obs3', path: [28, 29, 30, 31, 32, 33, 34], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.013, icon: '⚠️' }
        ]
      }
    ];"""

# Replace in html from MAP_NODES_BASE start to LEVELS end
s_start = html.find('const MAP_NODES_BASE =')
levels_end = html.find('];', html.find('const LEVELS =')) + 2

html = html[:s_start] + new_nodes_and_edges + html[levels_end:]

# 2. Add BFS pathfinding and queue logic to robotState & movement functions
pathfinding_code = """
    /* ==========================================================================
       BFS PATHFINDING & QUEUED MOVEMENT
       ========================================================================== */
    function findPath(startId, targetId) {
      if (startId === targetId || !currentLevelData) return [];
      const queue = [[startId]];
      const visited = new Set([startId]);

      while (queue.length > 0) {
        const path = queue.shift();
        const curr = path[path.length - 1];
        if (curr === targetId) return path.slice(1);

        for (const edge of currentLevelData.edges) {
          let neighbor = null;
          if (edge[0] === curr) neighbor = edge[1];
          else if (edge[1] === curr) neighbor = edge[0];

          if (neighbor !== null && !visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push([...path, neighbor]);
          }
        }
      }
      return [];
    }

    function moveToNode(targetId) {
      if (!isGameRunning || !currentLevelData) return;

      const startNodeId = robotState.isMoving ? (robotState.targetNodeId || robotState.currentNodeId) : robotState.currentNodeId;
      const path = findPath(startNodeId, targetId);
      if (path.length === 0) return;

      if (!robotState.isMoving) {
        robotState.pathQueue = path;
        startNextPathStep();
      } else {
        robotState.pathQueue = path;
      }
      playSound('step');
    }

    function startNextPathStep() {
      if (!robotState.pathQueue || robotState.pathQueue.length === 0) {
        robotState.isMoving = false;
        robotState.targetNodeId = null;
        checkArrival();
        return;
      }

      const nextId = robotState.pathQueue.shift();
      robotState.prevNodeId = robotState.currentNodeId;
      robotState.targetNodeId = nextId;
      robotState.isMoving = true;
      robotState.moveProgress = 0;
    }

    function updateRobot() {
      if (!robotState.isMoving || !currentLevelData) return;

      robotState.moveProgress += 0.08;
      if (robotState.moveProgress >= 1.0) {
        robotState.moveProgress = 1.0;
        robotState.currentNodeId = robotState.targetNodeId;

        const currN = currentLevelData.nodes.find(n => n.id === robotState.currentNodeId);
        if (currN) {
          const pos = proj(currN.x, currN.y, currN.z);
          robotState.x = pos.x;
          robotState.y = pos.y;
        }

        startNextPathStep();
      } else {
        const fromNode = currentLevelData.nodes.find(n => n.id === robotState.currentNodeId);
        const toNode = currentLevelData.nodes.find(n => n.id === robotState.targetNodeId);
        if (fromNode && toNode) {
          const p1 = proj(fromNode.x, fromNode.y, fromNode.z);
          const p2 = proj(toNode.x, toNode.y, toNode.z);

          const t = robotState.moveProgress;
          robotState.x = p1.x + (p2.x - p1.x) * t;
          robotState.y = p1.y + (p2.y - p1.y) * t;
        }
      }
    }
"""

# Replace old movement section
m_start = html.find('/* ==========================================================================\n       MOVEMENT & PATHFINDING')
m_end = html.find('function checkObstacleCollisions()')

html = html[:m_start] + pathfinding_code + "\n    " + html[m_end:]

# Also update robotState object at top of script to include pathQueue: []
html = html.replace('const robotState = {', 'const robotState = {\n      pathQueue: [],')

with open('robo-delivery/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated pathfinding and dense 37-node waypoint network in robo-delivery/index.html!")
