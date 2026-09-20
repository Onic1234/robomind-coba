import os, re

targets = [
    r"d:\project-26\RoboMind\public\robo-delivery\index.html",
    r"d:\project-26\RoboMind\public\web-games\robo-delivery\index.html",
]

# 1. Expanded 5 Levels Data
new_levels_code = """    const LEVELS = [
      {
        id: 1,
        title: "Taman Kota",
        timeLimit: 300,
        rewardCoins: 350,
        nodes: [
          { id: 0, x: 3, y: 6, z: 1, isPortal: true },
          { id: 1, x: 7, y: 6, z: 1 },
          { id: 2, x: 11, y: 6, z: 1 },
          { id: 3, x: 15, y: 6, z: 1 },
          { id: 4, x: 2.7, y: 3, z: 1 },
          { id: 5, x: 6, y: 3, z: 1 },
          { id: 6, x: 12, y: 3, z: 1 },
          { id: 7, x: 15.5, y: 3, z: 1 },
          { id: 8, x: 1, y: 9.5, z: 1 },
          { id: 9, x: 5, y: 9.5, z: 1 },
          { id: 10, x: 9, y: 9.5, z: 1 },
          { id: 11, x: 13, y: 9.5, z: 1 },
          { id: 12, x: 10.5, y: 12, z: 1 },
          { id: 13, x: 2.5, y: 12, z: 1 },
          { id: 14, x: 16, y: 1, z: 1 },
          { id: 15, x: 8, y: 1, z: 1 },
          { id: 16, x: 0.5, y: 1, z: 1 },
          { id: 17, x: 3, y: 2, z: 2 },
          { id: 18, x: 8, y: 2, z: 2 },
          { id: 19, x: 12, y: 2, z: 2 },
          { id: 20, x: 4, y: 5.5, z: 2 },
          { id: 21, x: 9, y: 5.5, z: 2 },
          { id: 22, x: 14, y: 5.5, z: 2 },
          { id: 23, x: 3, y: 9, z: 2 },
          { id: 24, x: 7, y: 9, z: 2 },
          { id: 25, x: 12, y: 9, z: 2 },
          { id: 26, x: 3, y: 3, z: 3 },
          { id: 27, x: 7.7, y: 3, z: 3 },
          { id: 28, x: 12, y: 3, z: 3 },
          { id: 29, x: 4, y: 6.5, z: 3 },
          { id: 30, x: 9, y: 6.5, z: 3 },
          { id: 31, x: 14, y: 6.5, z: 3 },
          { id: 32, x: 3, y: 10, z: 3 },
          { id: 33, x: 8, y: 10, z: 3 },
          { id: 34, x: 12, y: 10, z: 3 },
          { id: 35, x: 4, y: 3.5, z: 4 },
          { id: 36, x: 9, y: 3.5, z: 4 },
          { id: 37, x: 14, y: 3.5, z: 4 },
          { id: 38, x: 5, y: 7, z: 4 },
          { id: 39, x: 10, y: 7, z: 4 },
          { id: 40, x: 15, y: 7, z: 4 },
          { id: 41, x: 3, y: 10.5, z: 4 },
          { id: 42, x: 8, y: 10.5, z: 4 },
          { id: 43, x: 13, y: 10.5, z: 4 },
          { id: 44, x: 4, y: 4, z: 5 },
          { id: 45, x: 9, y: 4, z: 5 },
          { id: 46, x: 14, y: 4, z: 5 },
          { id: 47, x: 5, y: 7.5, z: 5 },
          { id: 48, x: 10, y: 7.5, z: 5 },
          { id: 49, x: 15, y: 7.5, z: 5 },
          { id: 50, x: 6, y: 11, z: 5 },
          { id: 51, x: 6, y: 5.5, z: 6 },
          { id: 52, x: 11, y: 5.5, z: 6 },
          { id: 53, x: 8, y: 2.8, z: 6 },
          { id: 54, x: 9, y: 8.8, z: 6 }
        ],
        edges: [
          [0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7],
          [8, 9], [9, 10], [10, 11], [12, 11], [13, 8], [14, 15], [15, 16],
          [0, 4], [1, 5], [2, 6], [3, 7], [9, 13], [10, 12], [3, 14], [16, 4],
          [4, 17], [5, 20], [2, 21], [3, 22], [6, 19], [10, 24], [11, 25], [8, 23],
          [17, 18], [18, 19], [20, 21], [21, 22], [23, 24], [24, 25],
          [17, 20], [18, 21], [19, 22],
          [17, 26], [18, 27], [19, 28], [20, 29], [21, 30], [22, 31], [23, 32], [24, 33], [25, 34],
          [26, 27], [27, 28], [29, 30], [30, 31], [32, 33], [33, 34],
          [26, 29], [27, 30], [28, 31],
          [26, 35], [27, 36], [28, 37], [29, 38], [30, 39], [31, 40], [32, 41], [33, 42], [34, 43],
          [35, 36], [36, 37], [38, 39], [39, 40], [41, 42], [42, 43],
          [35, 38], [36, 39], [37, 40],
          [35, 44], [36, 45], [37, 46], [38, 47], [39, 48], [40, 49], [41, 50],
          [44, 45], [45, 46], [47, 48], [48, 49],
          [44, 47], [45, 48], [46, 49], [48, 50],
          [44, 51], [45, 52], [47, 51], [48, 54], [49, 52],
          [51, 53], [52, 54]
        ],
        startNode: 0,
        foodStations: [
          { nodeId: 16, food: FOOD_TYPES.PIZZA },
          { nodeId: 34, food: FOOD_TYPES.GIFT },
          { nodeId: 46, food: FOOD_TYPES.JUICE }
        ],
        customers: [
          { id: 'c1', nodeId: 9, wantsFood: FOOD_TYPES.PIZZA, delivered: false, gender: 'female' },
          { id: 'c2', nodeId: 37, wantsFood: FOOD_TYPES.GIFT, delivered: false, gender: 'male' },
          { id: 'c3', nodeId: 51, wantsFood: FOOD_TYPES.JUICE, delivered: false, gender: 'female' }
        ],
        obstacles: [
          { id: 'obs1', path: [4, 5, 6, 7], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.012, icon: '🚶‍♂️' },
          { id: 'obs2', path: [0, 1, 2, 3], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.013, icon: '🚶‍♀️' },
          { id: 'obs3', path: [30, 39, 48, 45], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.012, icon: '🚶‍♀️' }
        ]
      },
      {
        id: 2,
        title: "Menara Cyber",
        timeLimit: 320,
        rewardCoins: 450,
        nodes: [
          { id: 0, x: 3, y: 6, z: 1, isPortal: true },
          { id: 1, x: 7, y: 6, z: 1 },
          { id: 2, x: 11, y: 6, z: 1 },
          { id: 3, x: 15, y: 6, z: 1 },
          { id: 4, x: 2.7, y: 3, z: 1 },
          { id: 5, x: 6, y: 3, z: 1 },
          { id: 6, x: 12, y: 3, z: 1 },
          { id: 7, x: 15.5, y: 3, z: 1 },
          { id: 8, x: 1, y: 9.5, z: 1 },
          { id: 9, x: 5, y: 9.5, z: 1 },
          { id: 10, x: 9, y: 9.5, z: 1 },
          { id: 11, x: 13, y: 9.5, z: 1 },
          { id: 12, x: 10.5, y: 12, z: 1 },
          { id: 13, x: 2.5, y: 12, z: 1 },
          { id: 14, x: 16, y: 1, z: 1 },
          { id: 15, x: 8, y: 1, z: 1 },
          { id: 16, x: 0.5, y: 1, z: 1 },
          { id: 17, x: 3, y: 2, z: 2 },
          { id: 18, x: 8, y: 2, z: 2 },
          { id: 19, x: 12, y: 2, z: 2 },
          { id: 20, x: 4, y: 5.5, z: 2 },
          { id: 21, x: 9, y: 5.5, z: 2 },
          { id: 22, x: 14, y: 5.5, z: 2 },
          { id: 23, x: 3, y: 9, z: 2 },
          { id: 24, x: 7, y: 9, z: 2 },
          { id: 25, x: 12, y: 9, z: 2 },
          { id: 26, x: 3, y: 3, z: 3 },
          { id: 27, x: 7.7, y: 3, z: 3 },
          { id: 28, x: 12, y: 3, z: 3 },
          { id: 29, x: 4, y: 6.5, z: 3 },
          { id: 30, x: 9, y: 6.5, z: 3 },
          { id: 31, x: 14, y: 6.5, z: 3 },
          { id: 32, x: 3, y: 10, z: 3 },
          { id: 33, x: 8, y: 10, z: 3 },
          { id: 34, x: 12, y: 10, z: 3 },
          { id: 35, x: 4, y: 3.5, z: 4 },
          { id: 36, x: 9, y: 3.5, z: 4 },
          { id: 37, x: 14, y: 3.5, z: 4 },
          { id: 38, x: 5, y: 7, z: 4 },
          { id: 39, x: 10, y: 7, z: 4 },
          { id: 40, x: 15, y: 7, z: 4 },
          { id: 41, x: 3, y: 10.5, z: 4 },
          { id: 42, x: 8, y: 10.5, z: 4 },
          { id: 43, x: 13, y: 10.5, z: 4 },
          { id: 44, x: 4, y: 4, z: 5 },
          { id: 45, x: 9, y: 4, z: 5 },
          { id: 46, x: 14, y: 4, z: 5 },
          { id: 47, x: 5, y: 7.5, z: 5 },
          { id: 48, x: 10, y: 7.5, z: 5 },
          { id: 49, x: 15, y: 7.5, z: 5 },
          { id: 50, x: 6, y: 11, z: 5 },
          { id: 51, x: 6, y: 5.5, z: 6 },
          { id: 52, x: 11, y: 5.5, z: 6 },
          { id: 53, x: 8, y: 2.8, z: 6 },
          { id: 54, x: 9, y: 8.8, z: 6 }
        ],
        edges: [
          [0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7],
          [8, 9], [9, 10], [10, 11], [12, 11], [13, 8], [14, 15], [15, 16],
          [0, 4], [1, 5], [2, 6], [3, 7], [9, 13], [10, 12], [3, 14], [16, 4],
          [4, 17], [5, 20], [2, 21], [3, 22], [6, 19], [10, 24], [11, 25], [8, 23],
          [17, 18], [18, 19], [20, 21], [21, 22], [23, 24], [24, 25],
          [17, 20], [18, 21], [19, 22],
          [17, 26], [18, 27], [19, 28], [20, 29], [21, 30], [22, 31], [23, 32], [24, 33], [25, 34],
          [26, 27], [27, 28], [29, 30], [30, 31], [32, 33], [33, 34],
          [26, 29], [27, 30], [28, 31],
          [26, 35], [27, 36], [28, 37], [29, 38], [30, 39], [31, 40], [32, 41], [33, 42], [34, 43],
          [35, 36], [36, 37], [38, 39], [39, 40], [41, 42], [42, 43],
          [35, 38], [36, 39], [37, 40],
          [35, 44], [36, 45], [37, 46], [38, 47], [39, 48], [40, 49], [41, 50],
          [44, 45], [45, 46], [47, 48], [48, 49],
          [44, 47], [45, 48], [46, 49], [48, 50],
          [44, 51], [45, 52], [47, 51], [48, 54], [49, 52],
          [51, 53], [52, 54]
        ],
        startNode: 0,
        foodStations: [
          { nodeId: 12, food: FOOD_TYPES.BURGER },
          { nodeId: 42, food: FOOD_TYPES.CAKE },
          { nodeId: 53, food: FOOD_TYPES.BENTO }
        ],
        customers: [
          { id: 'c1', nodeId: 14, wantsFood: FOOD_TYPES.BURGER, delivered: false, gender: 'male' },
          { id: 'c2', nodeId: 49, wantsFood: FOOD_TYPES.CAKE, delivered: false, gender: 'female' },
          { id: 'c3', nodeId: 0, wantsFood: FOOD_TYPES.BENTO, delivered: false, gender: 'female' }
        ],
        obstacles: [
          { id: 'obs1', path: [5, 6, 7], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.014, icon: '🚶‍♂️' },
          { id: 'obs2', path: [30, 39, 48, 45], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.015, icon: '🛸' },
          { id: 'obs3', path: [17, 18, 19, 22], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.014, icon: '🚶‍♀️' },
          { id: 'obs4', path: [8, 9, 10, 11], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.013, icon: '🧹' }
        ]
      },
      {
        id: 3,
        title: "Pasar Malam",
        timeLimit: 340,
        rewardCoins: 550,
        nodes: [
          { id: 0, x: 3, y: 6, z: 1, isPortal: true },
          { id: 1, x: 7, y: 6, z: 1 },
          { id: 2, x: 11, y: 6, z: 1 },
          { id: 3, x: 15, y: 6, z: 1 },
          { id: 4, x: 2.7, y: 3, z: 1 },
          { id: 5, x: 6, y: 3, z: 1 },
          { id: 6, x: 12, y: 3, z: 1 },
          { id: 7, x: 15.5, y: 3, z: 1 },
          { id: 8, x: 1, y: 9.5, z: 1 },
          { id: 9, x: 5, y: 9.5, z: 1 },
          { id: 10, x: 9, y: 9.5, z: 1 },
          { id: 11, x: 13, y: 9.5, z: 1 },
          { id: 12, x: 10.5, y: 12, z: 1 },
          { id: 13, x: 2.5, y: 12, z: 1 },
          { id: 14, x: 16, y: 1, z: 1 },
          { id: 15, x: 8, y: 1, z: 1 },
          { id: 16, x: 0.5, y: 1, z: 1 },
          { id: 17, x: 3, y: 2, z: 2 },
          { id: 18, x: 8, y: 2, z: 2 },
          { id: 19, x: 12, y: 2, z: 2 },
          { id: 20, x: 4, y: 5.5, z: 2 },
          { id: 21, x: 9, y: 5.5, z: 2 },
          { id: 22, x: 14, y: 5.5, z: 2 },
          { id: 23, x: 3, y: 9, z: 2 },
          { id: 24, x: 7, y: 9, z: 2 },
          { id: 25, x: 12, y: 9, z: 2 },
          { id: 26, x: 3, y: 3, z: 3 },
          { id: 27, x: 7.7, y: 3, z: 3 },
          { id: 28, x: 12, y: 3, z: 3 },
          { id: 29, x: 4, y: 6.5, z: 3 },
          { id: 30, x: 9, y: 6.5, z: 3 },
          { id: 31, x: 14, y: 6.5, z: 3 },
          { id: 32, x: 3, y: 10, z: 3 },
          { id: 33, x: 8, y: 10, z: 3 },
          { id: 34, x: 12, y: 10, z: 3 },
          { id: 35, x: 4, y: 3.5, z: 4 },
          { id: 36, x: 9, y: 3.5, z: 4 },
          { id: 37, x: 14, y: 3.5, z: 4 },
          { id: 38, x: 5, y: 7, z: 4 },
          { id: 39, x: 10, y: 7, z: 4 },
          { id: 40, x: 15, y: 7, z: 4 },
          { id: 41, x: 3, y: 10.5, z: 4 },
          { id: 42, x: 8, y: 10.5, z: 4 },
          { id: 43, x: 13, y: 10.5, z: 4 },
          { id: 44, x: 4, y: 4, z: 5 },
          { id: 45, x: 9, y: 4, z: 5 },
          { id: 46, x: 14, y: 4, z: 5 },
          { id: 47, x: 5, y: 7.5, z: 5 },
          { id: 48, x: 10, y: 7.5, z: 5 },
          { id: 49, x: 15, y: 7.5, z: 5 },
          { id: 50, x: 6, y: 11, z: 5 },
          { id: 51, x: 6, y: 5.5, z: 6 },
          { id: 52, x: 11, y: 5.5, z: 6 },
          { id: 53, x: 8, y: 2.8, z: 6 },
          { id: 54, x: 9, y: 8.8, z: 6 }
        ],
        edges: [
          [0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7],
          [8, 9], [9, 10], [10, 11], [12, 11], [13, 8], [14, 15], [15, 16],
          [0, 4], [1, 5], [2, 6], [3, 7], [9, 13], [10, 12], [3, 14], [16, 4],
          [4, 17], [5, 20], [2, 21], [3, 22], [6, 19], [10, 24], [11, 25], [8, 23],
          [17, 18], [18, 19], [20, 21], [21, 22], [23, 24], [24, 25],
          [17, 20], [18, 21], [19, 22],
          [17, 26], [18, 27], [19, 28], [20, 29], [21, 30], [22, 31], [23, 32], [24, 33], [25, 34],
          [26, 27], [27, 28], [29, 30], [30, 31], [32, 33], [33, 34],
          [26, 29], [27, 30], [28, 31],
          [26, 35], [27, 36], [28, 37], [29, 38], [30, 39], [31, 40], [32, 41], [33, 42], [34, 43],
          [35, 36], [36, 37], [38, 39], [39, 40], [41, 42], [42, 43],
          [35, 38], [36, 39], [37, 40],
          [35, 44], [36, 45], [37, 46], [38, 47], [39, 48], [40, 49], [41, 50],
          [44, 45], [45, 46], [47, 48], [48, 49],
          [44, 47], [45, 48], [46, 49], [48, 50],
          [44, 51], [45, 52], [47, 51], [48, 54], [49, 52],
          [51, 53], [52, 54]
        ],
        startNode: 0,
        foodStations: [
          { nodeId: 13, food: FOOD_TYPES.PIZZA },
          { nodeId: 23, food: FOOD_TYPES.BURGER },
          { nodeId: 41, food: FOOD_TYPES.JUICE },
          { nodeId: 54, food: FOOD_TYPES.CAKE }
        ],
        customers: [
          { id: 'c1', nodeId: 7, wantsFood: FOOD_TYPES.PIZZA, delivered: false, gender: 'female' },
          { id: 'c2', nodeId: 28, wantsFood: FOOD_TYPES.BURGER, delivered: false, gender: 'male' },
          { id: 'c3', nodeId: 46, wantsFood: FOOD_TYPES.JUICE, delivered: false, gender: 'female' },
          { id: 'c4', nodeId: 53, wantsFood: FOOD_TYPES.CAKE, delivered: false, gender: 'male' }
        ],
        obstacles: [
          { id: 'obs1', path: [0, 1, 2, 3], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.015, icon: '🚶‍♂️' },
          { id: 'obs2', path: [20, 21, 22, 19], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.016, icon: '🛸' },
          { id: 'obs3', path: [29, 30, 31, 40], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.015, icon: '🧹' },
          { id: 'obs4', path: [44, 45, 46, 49], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.016, icon: '🚶‍♀️' }
        ]
      },
      {
        id: 4,
        title: "Puncak Kristal",
        timeLimit: 360,
        rewardCoins: 650,
        nodes: [
          { id: 0, x: 3, y: 6, z: 1, isPortal: true },
          { id: 1, x: 7, y: 6, z: 1 },
          { id: 2, x: 11, y: 6, z: 1 },
          { id: 3, x: 15, y: 6, z: 1 },
          { id: 4, x: 2.7, y: 3, z: 1 },
          { id: 5, x: 6, y: 3, z: 1 },
          { id: 6, x: 12, y: 3, z: 1 },
          { id: 7, x: 15.5, y: 3, z: 1 },
          { id: 8, x: 1, y: 9.5, z: 1 },
          { id: 9, x: 5, y: 9.5, z: 1 },
          { id: 10, x: 9, y: 9.5, z: 1 },
          { id: 11, x: 13, y: 9.5, z: 1 },
          { id: 12, x: 10.5, y: 12, z: 1 },
          { id: 13, x: 2.5, y: 12, z: 1 },
          { id: 14, x: 16, y: 1, z: 1 },
          { id: 15, x: 8, y: 1, z: 1 },
          { id: 16, x: 0.5, y: 1, z: 1 },
          { id: 17, x: 3, y: 2, z: 2 },
          { id: 18, x: 8, y: 2, z: 2 },
          { id: 19, x: 12, y: 2, z: 2 },
          { id: 20, x: 4, y: 5.5, z: 2 },
          { id: 21, x: 9, y: 5.5, z: 2 },
          { id: 22, x: 14, y: 5.5, z: 2 },
          { id: 23, x: 3, y: 9, z: 2 },
          { id: 24, x: 7, y: 9, z: 2 },
          { id: 25, x: 12, y: 9, z: 2 },
          { id: 26, x: 3, y: 3, z: 3 },
          { id: 27, x: 7.7, y: 3, z: 3 },
          { id: 28, x: 12, y: 3, z: 3 },
          { id: 29, x: 4, y: 6.5, z: 3 },
          { id: 30, x: 9, y: 6.5, z: 3 },
          { id: 31, x: 14, y: 6.5, z: 3 },
          { id: 32, x: 3, y: 10, z: 3 },
          { id: 33, x: 8, y: 10, z: 3 },
          { id: 34, x: 12, y: 10, z: 3 },
          { id: 35, x: 4, y: 3.5, z: 4 },
          { id: 36, x: 9, y: 3.5, z: 4 },
          { id: 37, x: 14, y: 3.5, z: 4 },
          { id: 38, x: 5, y: 7, z: 4 },
          { id: 39, x: 10, y: 7, z: 4 },
          { id: 40, x: 15, y: 7, z: 4 },
          { id: 41, x: 3, y: 10.5, z: 4 },
          { id: 42, x: 8, y: 10.5, z: 4 },
          { id: 43, x: 13, y: 10.5, z: 4 },
          { id: 44, x: 4, y: 4, z: 5 },
          { id: 45, x: 9, y: 4, z: 5 },
          { id: 46, x: 14, y: 4, z: 5 },
          { id: 47, x: 5, y: 7.5, z: 5 },
          { id: 48, x: 10, y: 7.5, z: 5 },
          { id: 49, x: 15, y: 7.5, z: 5 },
          { id: 50, x: 6, y: 11, z: 5 },
          { id: 51, x: 6, y: 5.5, z: 6 },
          { id: 52, x: 11, y: 5.5, z: 6 },
          { id: 53, x: 8, y: 2.8, z: 6 },
          { id: 54, x: 9, y: 8.8, z: 6 }
        ],
        edges: [
          [0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7],
          [8, 9], [9, 10], [10, 11], [12, 11], [13, 8], [14, 15], [15, 16],
          [0, 4], [1, 5], [2, 6], [3, 7], [9, 13], [10, 12], [3, 14], [16, 4],
          [4, 17], [5, 20], [2, 21], [3, 22], [6, 19], [10, 24], [11, 25], [8, 23],
          [17, 18], [18, 19], [20, 21], [21, 22], [23, 24], [24, 25],
          [17, 20], [18, 21], [19, 22],
          [17, 26], [18, 27], [19, 28], [20, 29], [21, 30], [22, 31], [23, 32], [24, 33], [25, 34],
          [26, 27], [27, 28], [29, 30], [30, 31], [32, 33], [33, 34],
          [26, 29], [27, 30], [28, 31],
          [26, 35], [27, 36], [28, 37], [29, 38], [30, 39], [31, 40], [32, 41], [33, 42], [34, 43],
          [35, 36], [36, 37], [38, 39], [39, 40], [41, 42], [42, 43],
          [35, 38], [36, 39], [37, 40],
          [35, 44], [36, 45], [37, 46], [38, 47], [39, 48], [40, 49], [41, 50],
          [44, 45], [45, 46], [47, 48], [48, 49],
          [44, 47], [45, 48], [46, 49], [48, 50],
          [44, 51], [45, 52], [47, 51], [48, 54], [49, 52],
          [51, 53], [52, 54]
        ],
        startNode: 0,
        foodStations: [
          { nodeId: 16, food: FOOD_TYPES.BENTO },
          { nodeId: 25, food: FOOD_TYPES.PIZZA },
          { nodeId: 38, food: FOOD_TYPES.GIFT },
          { nodeId: 50, food: FOOD_TYPES.CAKE }
        ],
        customers: [
          { id: 'c1', nodeId: 3, wantsFood: FOOD_TYPES.BENTO, delivered: false, gender: 'male' },
          { id: 'c2', nodeId: 31, wantsFood: FOOD_TYPES.PIZZA, delivered: false, gender: 'female' },
          { id: 'c3', nodeId: 43, wantsFood: FOOD_TYPES.GIFT, delivered: false, gender: 'male' },
          { id: 'c4', nodeId: 52, wantsFood: FOOD_TYPES.CAKE, delivered: false, gender: 'female' }
        ],
        obstacles: [
          { id: 'obs1', path: [4, 5, 6, 7], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.016, icon: '🚶‍♂️' },
          { id: 'obs2', path: [17, 18, 19, 22], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.017, icon: '🛸' },
          { id: 'obs3', path: [26, 27, 28, 31], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.016, icon: '🧹' },
          { id: 'obs4', path: [35, 36, 37, 40], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.017, icon: '🚶‍♀️' },
          { id: 'obs5', path: [44, 45, 46, 49], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.018, icon: '🚧' }
        ]
      },
      {
        id: 5,
        title: "Grand Citadel",
        timeLimit: 400,
        rewardCoins: 800,
        nodes: [
          { id: 0, x: 3, y: 6, z: 1, isPortal: true },
          { id: 1, x: 7, y: 6, z: 1 },
          { id: 2, x: 11, y: 6, z: 1 },
          { id: 3, x: 15, y: 6, z: 1 },
          { id: 4, x: 2.7, y: 3, z: 1 },
          { id: 5, x: 6, y: 3, z: 1 },
          { id: 6, x: 12, y: 3, z: 1 },
          { id: 7, x: 15.5, y: 3, z: 1 },
          { id: 8, x: 1, y: 9.5, z: 1 },
          { id: 9, x: 5, y: 9.5, z: 1 },
          { id: 10, x: 9, y: 9.5, z: 1 },
          { id: 11, x: 13, y: 9.5, z: 1 },
          { id: 12, x: 10.5, y: 12, z: 1 },
          { id: 13, x: 2.5, y: 12, z: 1 },
          { id: 14, x: 16, y: 1, z: 1 },
          { id: 15, x: 8, y: 1, z: 1 },
          { id: 16, x: 0.5, y: 1, z: 1 },
          { id: 17, x: 3, y: 2, z: 2 },
          { id: 18, x: 8, y: 2, z: 2 },
          { id: 19, x: 12, y: 2, z: 2 },
          { id: 20, x: 4, y: 5.5, z: 2 },
          { id: 21, x: 9, y: 5.5, z: 2 },
          { id: 22, x: 14, y: 5.5, z: 2 },
          { id: 23, x: 3, y: 9, z: 2 },
          { id: 24, x: 7, y: 9, z: 2 },
          { id: 25, x: 12, y: 9, z: 2 },
          { id: 26, x: 3, y: 3, z: 3 },
          { id: 27, x: 7.7, y: 3, z: 3 },
          { id: 28, x: 12, y: 3, z: 3 },
          { id: 29, x: 4, y: 6.5, z: 3 },
          { id: 30, x: 9, y: 6.5, z: 3 },
          { id: 31, x: 14, y: 6.5, z: 3 },
          { id: 32, x: 3, y: 10, z: 3 },
          { id: 33, x: 8, y: 10, z: 3 },
          { id: 34, x: 12, y: 10, z: 3 },
          { id: 35, x: 4, y: 3.5, z: 4 },
          { id: 36, x: 9, y: 3.5, z: 4 },
          { id: 37, x: 14, y: 3.5, z: 4 },
          { id: 38, x: 5, y: 7, z: 4 },
          { id: 39, x: 10, y: 7, z: 4 },
          { id: 40, x: 15, y: 7, z: 4 },
          { id: 41, x: 3, y: 10.5, z: 4 },
          { id: 42, x: 8, y: 10.5, z: 4 },
          { id: 43, x: 13, y: 10.5, z: 4 },
          { id: 44, x: 4, y: 4, z: 5 },
          { id: 45, x: 9, y: 4, z: 5 },
          { id: 46, x: 14, y: 4, z: 5 },
          { id: 47, x: 5, y: 7.5, z: 5 },
          { id: 48, x: 10, y: 7.5, z: 5 },
          { id: 49, x: 15, y: 7.5, z: 5 },
          { id: 50, x: 6, y: 11, z: 5 },
          { id: 51, x: 6, y: 5.5, z: 6 },
          { id: 52, x: 11, y: 5.5, z: 6 },
          { id: 53, x: 8, y: 2.8, z: 6 },
          { id: 54, x: 9, y: 8.8, z: 6 }
        ],
        edges: [
          [0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7],
          [8, 9], [9, 10], [10, 11], [12, 11], [13, 8], [14, 15], [15, 16],
          [0, 4], [1, 5], [2, 6], [3, 7], [9, 13], [10, 12], [3, 14], [16, 4],
          [4, 17], [5, 20], [2, 21], [3, 22], [6, 19], [10, 24], [11, 25], [8, 23],
          [17, 18], [18, 19], [20, 21], [21, 22], [23, 24], [24, 25],
          [17, 20], [18, 21], [19, 22],
          [17, 26], [18, 27], [19, 28], [20, 29], [21, 30], [22, 31], [23, 32], [24, 33], [25, 34],
          [26, 27], [27, 28], [29, 30], [30, 31], [32, 33], [33, 34],
          [26, 29], [27, 30], [28, 31],
          [26, 35], [27, 36], [28, 37], [29, 38], [30, 39], [31, 40], [32, 41], [33, 42], [34, 43],
          [35, 36], [36, 37], [38, 39], [39, 40], [41, 42], [42, 43],
          [35, 38], [36, 39], [37, 40],
          [35, 44], [36, 45], [37, 46], [38, 47], [39, 48], [40, 49], [41, 50],
          [44, 45], [45, 46], [47, 48], [48, 49],
          [44, 47], [45, 48], [46, 49], [48, 50],
          [44, 51], [45, 52], [47, 51], [48, 54], [49, 52],
          [51, 53], [52, 54]
        ],
        startNode: 0,
        foodStations: [
          { nodeId: 16, food: FOOD_TYPES.PIZZA },
          { nodeId: 20, food: FOOD_TYPES.BURGER },
          { nodeId: 33, food: FOOD_TYPES.GIFT },
          { nodeId: 42, food: FOOD_TYPES.JUICE },
          { nodeId: 54, food: FOOD_TYPES.CAKE }
        ],
        customers: [
          { id: 'c1', nodeId: 7, wantsFood: FOOD_TYPES.PIZZA, delivered: false, gender: 'female' },
          { id: 'c2', nodeId: 25, wantsFood: FOOD_TYPES.BURGER, delivered: false, gender: 'male' },
          { id: 'c3', nodeId: 37, wantsFood: FOOD_TYPES.GIFT, delivered: false, gender: 'female' },
          { id: 'c4', nodeId: 49, wantsFood: FOOD_TYPES.JUICE, delivered: false, gender: 'male' },
          { id: 'c5', nodeId: 53, wantsFood: FOOD_TYPES.CAKE, delivered: false, gender: 'female' }
        ],
        obstacles: [
          { id: 'obs1', path: [0, 1, 2, 3], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.016, icon: '🚶‍♂️' },
          { id: 'obs2', path: [4, 5, 6, 7], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.017, icon: '🚶‍♀️' },
          { id: 'obs3', path: [17, 18, 19, 22], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.016, icon: '🛸' },
          { id: 'obs4', path: [26, 27, 28, 31], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.017, icon: '🧹' },
          { id: 'obs5', path: [35, 36, 37, 40], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.018, icon: '🚧' },
          { id: 'obs6', path: [44, 45, 46, 49], currentIndex: 0, targetIndex: 1, t: 0, speed: 0.018, icon: '🛸' }
        ]
      }
    ];"""

# 2. Enhanced Obstacle Warning Circle Drawing
old_draw_obs_snippet = """        // Pejalan kaki
        ctx.font = `${Math.round(20 * scaleFactor)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obs.icon || '🚶‍♂️', pos.x, pos.y - 10 * scaleFactor);"""

new_draw_obs_snippet = """        // Danger Warning Circle under moving obstacle
        ctx.save();
        const pulseR = (16 + Math.sin(Date.now() * 0.008 + idx) * 4) * scaleFactor;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pulseR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2 * scaleFactor;
        ctx.stroke();
        ctx.restore();

        // Pejalan kaki / Drone / Obstacle
        ctx.font = `${Math.round(22 * scaleFactor)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obs.icon || '🚶‍♂️', pos.x, pos.y - 12 * scaleFactor);"""

for target in targets:
    if os.path.exists(target):
        with open(target, "r", encoding="utf-8") as f:
            code = f.read()

        # Replace LEVELS block
        pattern = r"const LEVELS = \[[\s\S]*?\n    \];"
        if re.search(pattern, code):
            code = re.sub(pattern, new_levels_code, code)

        # Replace draw obstacle warning snippet if found
        if old_draw_obs_snippet in code:
            code = code.replace(old_draw_obs_snippet, new_draw_obs_snippet)

        with open(target, "w", encoding="utf-8") as f:
            f.write(code)
        print(f"Updated {target}")

