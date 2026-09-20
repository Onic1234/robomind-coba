import os
import shutil

with open('robo-delivery/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace MAP_NODES_BASE and MAP_EDGES_BASE and LEVELS
nodes_code = """    const MAP_NODES_BASE = [
      { id: 0, x: 21.0, y: 22.8 }, // Start / Dapur Utama (Top-Left)
      { id: 1, x: 29.3, y: 19.2 }, // Tangga Atas Kiri
      { id: 2, x: 21.5, y: 33.2 }, // Teras Kiri Atas
      { id: 3, x: 35.2, y: 16.5 }, // Lorong Atas Tengah
      { id: 4, x: 44.0, y: 12.4 }, // Tangga Atas Tengah
      { id: 5, x: 55.6, y: 15.5 }, // Teras Atas Kanan
      { id: 6, x: 71.3, y: 11.4 }, // Tangga Puncak Kanan
      { id: 7, x: 80.0, y: 8.3  }, // Puncak Kanan (Pelanggan 1)
      { id: 8, x: 21.0, y: 44.5 }, // Teras Tengah Kiri
      { id: 9, x: 36.1, y: 33.1 }, // Jembatan Tengah Kiri
      { id: 10, x: 46.8, y: 37.3 }, // Jembatan Utama Lengkung Tengah
      { id: 11, x: 56.6, y: 28.0 }, // Jalur Pohon Taman Tengah
      { id: 12, x: 67.4, y: 27.0 }, // Jembatan Lengkung Kanan
      { id: 13, x: 69.3, y: 39.4 }, // Teras Tengah Kanan (Pelanggan 2)
      { id: 14, x: 15.6, y: 60.1 }, // Tangga Bawah Kiri
      { id: 15, x: 23.0, y: 80.8 }, // Taman Pohon Bawah Kiri (Kedai Burger)
      { id: 16, x: 37.1, y: 66.3 }, // Jalur Tengah Bawah
      { id: 17, x: 50.8, y: 80.8 }, // Taman Pohon Tengah Bawah (Kedai Hadiah)
      { id: 18, x: 66.4, y: 76.7 }, // Jalur Jembatan Bawah Kanan
      { id: 19, x: 74.2, y: 87.0 }, // Platform Bawah Kanan (Pelanggan 3)
      { id: 20, x: 81.0, y: 53.9 }  // Tangga Samping Kanan
    ];

    const MAP_EDGES_BASE = [
      // Jalur Atas (Puncak Gunung ke Pelanggan 1)
      [0, 1], [1, 3], [3, 4], [4, 5], [5, 6], [6, 7],
      
      // Jalur Tengah (Jembatan & Taman ke Pelanggan 2)
      [0, 2], [2, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13],
      
      // Jalur Bawah (Hutan Taman ke Pelanggan 3)
      [8, 14], [14, 15], [15, 16], [16, 17], [17, 18], [18, 19],
      
      // Tangga & Jembatan Penghubung antar Level
      [3, 9],
      [11, 13],
      [13, 20], [20, 19],
      [10, 16]
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
          { id: 'c1', nodeId: 7, wantsFood: FOOD_TYPES.PIZZA, delivered: false, gender: 'female' }
        ],
        obstacles: [
          { id: 'obs1', path: [1, 3, 4, 5], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.015, icon: '⚠️' }
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
          { nodeId: 15, food: FOOD_TYPES.BURGER }
        ],
        customers: [
          { id: 'c1', nodeId: 7, wantsFood: FOOD_TYPES.PIZZA, delivered: false, gender: 'female' },
          { id: 'c2', nodeId: 13, wantsFood: FOOD_TYPES.BURGER, delivered: false, gender: 'male' }
        ],
        obstacles: [
          { id: 'obs1', path: [1, 3, 4, 5], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.015, icon: '⚠️' },
          { id: 'obs2', path: [8, 9, 10, 11], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.016, icon: '⚠️' }
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
          { nodeId: 15, food: FOOD_TYPES.BURGER },
          { nodeId: 17, food: FOOD_TYPES.GIFT }
        ],
        customers: [
          { id: 'c1', nodeId: 7, wantsFood: FOOD_TYPES.PIZZA, delivered: false, gender: 'female' },
          { id: 'c2', nodeId: 13, wantsFood: FOOD_TYPES.BURGER, delivered: false, gender: 'male' },
          { id: 'c3', nodeId: 19, wantsFood: FOOD_TYPES.GIFT, delivered: false, gender: 'female' }
        ],
        obstacles: [
          { id: 'obs1', path: [1, 3, 4, 5], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.015, icon: '⚠️' },
          { id: 'obs2', path: [8, 9, 10, 11], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.016, icon: '⚠️' },
          { id: 'obs3', path: [16, 17, 18, 19], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.014, icon: '⚠️' }
        ]
      }
    ];"""

# Replace in html from MAP_NODES_BASE start to LEVELS end
s_start = html.find('const MAP_NODES_BASE =')
s_end = html.find('const MAZE_COLLECTIBLES =')
if s_end < s_start:
    s_end = html.find('/* ------------------------------------------------------------------------\n       COLLECTIBLES')

# Let's find end of LEVELS array
levels_end = html.find('];', html.find('const LEVELS =')) + 2

html = html[:s_start] + nodes_code + html[levels_end:]

with open('robo-delivery/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated MAP_NODES_BASE, MAP_EDGES_BASE, and LEVELS in robo-delivery/index.html successfully!")
