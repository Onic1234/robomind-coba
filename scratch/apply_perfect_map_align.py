import os, shutil

src_file = r"d:\project-26\RoboMind\public\robo-delivery\index.html"

with open(src_file, "r", encoding="utf-8") as f:
    code = f.read()

start_marker = "/* ==========================================================================\n       LEVEL DEFINITIONS"
end_marker = "/* ==========================================================================\n       CANVAS CORE ENGINE & RENDERER"

new_levels_section = """/* ==========================================================================
       LEVEL DEFINITIONS (map-aligned node & edge positions for maps_robo-delivery2.png)
       ========================================================================== */
    const MAP_NODES_BASE = [
      { id: 0, x: 22, y: 17 }, // Top-Left Start / Food Platform
      { id: 1, x: 35, y: 26 }, // Upper Landing 1
      { id: 2, x: 52, y: 33 }, // Center High Bridge
      { id: 3, x: 62, y: 20 }, // Upper Landing 2
      { id: 4, x: 83, y: 11 }, // Top-Right Peak Customer 1
      { id: 5, x: 33, y: 43 }, // Mid-Left Terrace Food 2
      { id: 6, x: 50, y: 52 }, // Center Low Platform
      { id: 7, x: 73, y: 36 }, // Mid-Right Terrace Customer 2
      { id: 8, x: 18, y: 78 }, // Lower-Left Gift Platform
      { id: 9, x: 48, y: 78 }, // Lower-Center Terrace
      { id: 10, x: 75, y: 84 }  // Lower-Right Customer 3
    ];

    const MAP_EDGES_BASE = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [1, 5], [5, 6], [6, 7],
      [5, 8], [8, 9], [9, 10],
      [6, 9]
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
          { id: 'c1', nodeId: 4, wantsFood: FOOD_TYPES.PIZZA, delivered: false, gender: 'female' }
        ],
        obstacles: [
          { id: 'obs1', path: [1, 2, 3], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.015, icon: '🚶‍♂️' }
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
          { nodeId: 5, food: FOOD_TYPES.BURGER }
        ],
        customers: [
          { id: 'c1', nodeId: 4, wantsFood: FOOD_TYPES.PIZZA, delivered: false, gender: 'female' },
          { id: 'c2', nodeId: 7, wantsFood: FOOD_TYPES.BURGER, delivered: false, gender: 'male' }
        ],
        obstacles: [
          { id: 'obs1', path: [1, 2, 3], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.015, icon: '🚶‍♂️' },
          { id: 'obs2', path: [5, 6, 7], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.016, icon: '🚶‍♀️' }
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
          { nodeId: 5, food: FOOD_TYPES.BURGER },
          { nodeId: 8, food: FOOD_TYPES.GIFT }
        ],
        customers: [
          { id: 'c1', nodeId: 4, wantsFood: FOOD_TYPES.PIZZA, delivered: false, gender: 'female' },
          { id: 'c2', nodeId: 7, wantsFood: FOOD_TYPES.BURGER, delivered: false, gender: 'male' },
          { id: 'c3', nodeId: 10, wantsFood: FOOD_TYPES.GIFT, delivered: false, gender: 'female' }
        ],
        obstacles: [
          { id: 'obs1', path: [1, 2, 3], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.016, icon: '🚶‍♂️' },
          { id: 'obs2', path: [5, 6, 7], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.017, icon: '🚶‍♀️' },
          { id: 'obs3', path: [8, 9, 10], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.015, icon: '🛸' }
        ]
      },
      {
        id: 4,
        title: "Metropolis High",
        timeLimit: 320,
        rewardCoins: 650,
        nodes: MAP_NODES_BASE,
        edges: MAP_EDGES_BASE,
        startNode: 0,
        foodStations: [
          { nodeId: 0, food: FOOD_TYPES.PIZZA },
          { nodeId: 5, food: FOOD_TYPES.JUICE },
          { nodeId: 8, food: FOOD_TYPES.CAKE }
        ],
        customers: [
          { id: 'c1', nodeId: 4, wantsFood: FOOD_TYPES.PIZZA, delivered: false, gender: 'female' },
          { id: 'c2', nodeId: 7, wantsFood: FOOD_TYPES.JUICE, delivered: false, gender: 'male' },
          { id: 'c3', nodeId: 10, wantsFood: FOOD_TYPES.CAKE, delivered: false, gender: 'female' }
        ],
        obstacles: [
          { id: 'obs1', path: [1, 2, 3], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.018, icon: '🚶‍♂️' },
          { id: 'obs2', path: [5, 6, 7], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.018, icon: '🧹' },
          { id: 'obs3', path: [8, 9, 10], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.017, icon: '🚧' }
        ]
      },
      {
        id: 5,
        title: "Grand Citadel",
        timeLimit: 360,
        rewardCoins: 800,
        nodes: MAP_NODES_BASE,
        edges: MAP_EDGES_BASE,
        startNode: 0,
        foodStations: [
          { nodeId: 0, food: FOOD_TYPES.PIZZA },
          { nodeId: 5, food: FOOD_TYPES.BURGER },
          { nodeId: 8, food: FOOD_TYPES.GIFT }
        ],
        customers: [
          { id: 'c1', nodeId: 4, wantsFood: FOOD_TYPES.PIZZA, delivered: false, gender: 'female' },
          { id: 'c2', nodeId: 7, wantsFood: FOOD_TYPES.BURGER, delivered: false, gender: 'male' },
          { id: 'c3', nodeId: 10, wantsFood: FOOD_TYPES.GIFT, delivered: false, gender: 'female' }
        ],
        obstacles: [
          { id: 'obs1', path: [0, 1, 2, 3, 4], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.020, icon: '🚶‍♂️' },
          { id: 'obs2', path: [1, 5, 6, 7], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.020, icon: '🚶‍♀️' },
          { id: 'obs3', path: [5, 8, 9, 10], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.019, icon: '🧹' }
        ]
      }
    ];

    """

if start_marker in code and end_marker in code:
    parts = code.split(start_marker)
    rest = parts[1].split(end_marker)
    code = parts[0] + new_levels_section + end_marker + rest[1]
    print("SUCCESS: Replaced LEVELS array with clean map-aligned nodes!")

with open(src_file, "w", encoding="utf-8") as f:
    f.write(code)

targets = [
    r"d:\project-26\RoboMind\robo-delivery\index.html",
    r"d:\project-26\RoboMind\public\web-games\robo-delivery\index.html",
    r"d:\project-26\RoboMind\dist\robo-delivery\index.html",
    r"d:\project-26\RoboMind\dist\web-games\robo-delivery\index.html"
]

for t in targets:
    os.makedirs(os.path.dirname(t), exist_ok=True)
    shutil.copyfile(src_file, t)
    print(f"Synchronized to {t}")
