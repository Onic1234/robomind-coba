import os
import re

file_path = "d:/project-26/RoboMind/app/robo-link.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update ARENA_SIZE definition
old_arena_def = "const ARENA_SIZE = Math.min(360, SCREEN_WIDTH - 40);"
new_arena_def = "const ARENA_SIZE = Math.min(310, Math.max(230, SCREEN_WIDTH - 104), Math.max(230, SCREEN_HEIGHT - 380));"

content = content.replace(old_arena_def, new_arena_def)

# 2. Update robotPosition and pcPosition offsets (-62 -> -46, ARENA_SIZE + 12 -> ARENA_SIZE - 4)
content = content.replace("let x = -62;", "let x = -46;")
content = content.replace("y = -62;", "y = -46;")
content = content.replace("x = -62;", "x = -46;")

content = content.replace("x = ARENA_SIZE + 12;", "x = ARENA_SIZE - 4;")
content = content.replace("y = ARENA_SIZE + 12;", "y = ARENA_SIZE - 4;")

# 3. Update topCardBanner to be relative in flow (remove position: "absolute")
old_top_card_style = """  topCardBanner: {
    position: "absolute",
    top: 14,
    left: 20,
    right: 20,"""

new_top_card_style = """  topCardBanner: {
    width: "90%",
    maxWidth: 380,
    marginTop: 8,
    marginBottom: 8,
    alignSelf: "center","""

content = content.replace(old_top_card_style, new_top_card_style)

# 4. Update arenaContainer padding & alignment
old_arena_container_style = """  arenaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },"""

new_arena_container_style = """  arenaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    marginVertical: 4,
  },"""

content = content.replace(old_arena_container_style, new_arena_container_style)

# 5. Update header HUD padding & font sizes
old_header_style = """  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,"""

new_header_style = """  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 6,"""

content = content.replace(old_header_style, new_header_style)

# 6. Fix "coin" -> "currency-usd" icon if any
content = content.replace('name={"coin" as any}', 'name={"currency-usd" as any}')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated app/robo-link.tsx layout for mobile fit")
