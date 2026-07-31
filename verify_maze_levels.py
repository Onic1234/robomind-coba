from collections import deque

COLS = 9
ROWS = 6

levels = {
    1: {
        'start': {'x': 0, 'y': 5},
        'goal': {'x': 8, 'y': 0},
        'walls': [
            {'type': 'H', 'x': 0, 'y': 2, 'len': 3},
            {'type': 'V', 'x': 3, 'y': 0, 'len': 3},
            {'type': 'H', 'x': 4, 'y': 3, 'len': 4},
            {'type': 'V', 'x': 5, 'y': 1, 'len': 3},
        ],
        'peeks': 3
    },
    2: {
        # Level 2 (Replica)
        'start': {'x': 6, 'y': 0},
        'goal': {'x': 0, 'y': 5},
        'walls': [
            {'type': 'H', 'x': 4, 'y': 0, 'len': 3},
            {'type': 'V', 'x': 2, 'y': 0, 'len': 1},
            {'type': 'V', 'x': 2, 'y': 1, 'len': 1},
            {'type': 'V', 'x': 3, 'y': 1, 'len': 1},
            {'type': 'H', 'x': 0, 'y': 2, 'len': 1},
            {'type': 'H', 'x': 2, 'y': 2, 'len': 4},
            {'type': 'V', 'x': 6, 'y': 2, 'len': 1},
            {'type': 'V', 'x': 5, 'y': 3, 'len': 1},
            {'type': 'H', 'x': 0, 'y': 3, 'len': 2},
            {'type': 'H', 'x': 3, 'y': 3, 'len': 3},
            {'type': 'H', 'x': 7, 'y': 3, 'len': 2},
            {'type': 'V', 'x': 1, 'y': 4, 'len': 1},
            {'type': 'H', 'x': 3, 'y': 4, 'len': 5},
            {'type': 'V', 'x': 2, 'y': 5, 'len': 1}
        ],
        'peeks': 2
    },
    3: {
        # Level 3: Jalur Berliku (S-Corridor)
        'start': {'x': 0, 'y': 0},
        'goal': {'x': 8, 'y': 5},
        'walls': [
            {'type': 'V', 'x': 1, 'y': 0, 'len': 3},
            {'type': 'H', 'x': 2, 'y': 1, 'len': 4},
            {'type': 'V', 'x': 4, 'y': 2, 'len': 3},
            {'type': 'H', 'x': 0, 'y': 4, 'len': 4},
            {'type': 'V', 'x': 6, 'y': 0, 'len': 4},
            {'type': 'H', 'x': 6, 'y': 4, 'len': 2},
        ],
        'peeks': 2
    },
    4: {
        # Level 4: Zig-Zag Labirin
        'start': {'x': 0, 'y': 0},
        'goal': {'x': 8, 'y': 5},
        'walls': [
            {'type': 'H', 'x': 0, 'y': 1, 'len': 6},
            {'type': 'V', 'x': 6, 'y': 1, 'len': 2},
            {'type': 'H', 'x': 2, 'y': 3, 'len': 6},
            {'type': 'V', 'x': 2, 'y': 4, 'len': 2},
            {'type': 'H', 'x': 4, 'y': 4, 'len': 4},
        ],
        'peeks': 2
    },
    5: {
        # Level 5: Perangkap Cabang Ganda
        'start': {'x': 4, 'y': 0},
        'goal': {'x': 4, 'y': 5},
        'walls': [
            {'type': 'V', 'x': 3, 'y': 0, 'len': 4},
            {'type': 'V', 'x': 5, 'y': 1, 'len': 4},
            {'type': 'H', 'x': 0, 'y': 2, 'len': 3},
            {'type': 'H', 'x': 6, 'y': 3, 'len': 3},
            {'type': 'H', 'x': 2, 'y': 4, 'len': 5},
        ],
        'peeks': 2
    },
    6: {
        # Level 6: Spiral Labirin Putar
        'start': {'x': 0, 'y': 0},
        'goal': {'x': 4, 'y': 2},
        'walls': [
            {'type': 'H', 'x': 0, 'y': 0, 'len': 8},
            {'type': 'V', 'x': 7, 'y': 1, 'len': 4},
            {'type': 'H', 'x': 1, 'y': 4, 'len': 6},
            {'type': 'V', 'x': 1, 'y': 2, 'len': 2},
            {'type': 'H', 'x': 2, 'y': 1, 'len': 4},
        ],
        'peeks': 1
    },
    7: {
        # Level 7: Ring Ganda
        'start': {'x': 0, 'y': 5},
        'goal': {'x': 8, 'y': 0},
        'walls': [
            {'type': 'V', 'x': 0, 'y': 1, 'len': 4},
            {'type': 'H', 'x': 1, 'y': 0, 'len': 7},
            {'type': 'V', 'x': 7, 'y': 1, 'len': 4},
            {'type': 'H', 'x': 2, 'y': 4, 'len': 5},
            {'type': 'V', 'x': 2, 'y': 2, 'len': 2},
            {'type': 'H', 'x': 3, 'y': 2, 'len': 3},
        ],
        'peeks': 1
    },
    8: {
        # Level 8: Cyber Matrix
        'start': {'x': 0, 'y': 0},
        'goal': {'x': 8, 'y': 5},
        'walls': [
            {'type': 'H', 'x': 0, 'y': 1, 'len': 4},
            {'type': 'V', 'x': 4, 'y': 0, 'len': 3},
            {'type': 'H', 'x': 5, 'y': 2, 'len': 3},
            {'type': 'V', 'x': 2, 'y': 3, 'len': 2},
            {'type': 'H', 'x': 3, 'y': 4, 'len': 4},
            {'type': 'V', 'x': 7, 'y': 3, 'len': 2},
        ],
        'peeks': 1
    },
    9: {
        # Level 9: Master Memory Labyrinth
        'start': {'x': 0, 'y': 5},
        'goal': {'x': 8, 'y': 0},
        'walls': [
            {'type': 'H', 'x': 0, 'y': 4, 'len': 3},
            {'type': 'V', 'x': 2, 'y': 1, 'len': 4},
            {'type': 'H', 'x': 3, 'y': 1, 'len': 4},
            {'type': 'V', 'x': 5, 'y': 2, 'len': 3},
            {'type': 'H', 'x': 1, 'y': 2, 'len': 3},
            {'type': 'H', 'x': 4, 'y': 3, 'len': 3},
            {'type': 'V', 'x': 7, 'y': 0, 'len': 3},
        ],
        'peeks': 1
    },
    10: {
        # Level 10: Grandmaster Ultimate Maze
        'start': {'x': 0, 'y': 0},
        'goal': {'x': 8, 'y': 5},
        'walls': [
            {'type': 'V', 'x': 0, 'y': 1, 'len': 3},
            {'type': 'H', 'x': 1, 'y': 0, 'len': 3},
            {'type': 'V', 'x': 3, 'y': 1, 'len': 3},
            {'type': 'H', 'x': 2, 'y': 4, 'len': 4},
            {'type': 'V', 'x': 5, 'y': 0, 'len': 3},
            {'type': 'H', 'x': 6, 'y': 2, 'len': 2},
            {'type': 'V', 'x': 7, 'y': 3, 'len': 2},
            {'type': 'H', 'x': 4, 'y': 2, 'len': 2},
            {'type': 'V', 'x': 2, 'y': 1, 'len': 2},
        ],
        'peeks': 1
    }
}

def solve_level(level_num, data):
    blocked = set()
    for w in data['walls']:
        if w['type'] == 'H':
            for i in range(w['len']):
                cx, cy = w['x'] + i, w['y']
                if cx < COLS and cy < ROWS - 1:
                    blocked.add(((cx, cy), (cx, cy + 1)))
                    blocked.add(((cx, cy + 1), (cx, cy)))
        elif w['type'] == 'V':
            for i in range(w['len']):
                cx, cy = w['x'], w['y'] + i
                if cx < COLS - 1 and cy < ROWS:
                    blocked.add(((cx, cy), (cx + 1, cy)))
                    blocked.add(((cx + 1, cy), (cx, cy)))

    start = (data['start']['x'], data['start']['y'])
    goal = (data['goal']['x'], data['goal']['y'])

    queue = deque([[start]])
    visited = {start}

    found_path = None
    while queue:
        path = queue.popleft()
        curr = path[-1]
        if curr == goal:
            found_path = path
            break

        cx, cy = curr
        for dx, dy in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < COLS and 0 <= ny < ROWS:
                nxt = (nx, ny)
                if (curr, nxt) not in blocked and nxt not in visited:
                    visited.add(nxt)
                    queue.append(path + [nxt])

    if found_path:
        print(f"Level {level_num:2d}: SUCCESS! Shortest path length = {len(found_path) - 1:2d} steps")
    else:
        print(f"Level {level_num:2d}: FAILED (Dead end / No path!)")

for num, data in levels.items():
    solve_level(num, data)
