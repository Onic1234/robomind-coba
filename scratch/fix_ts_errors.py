import os
import re

# 1. Fix robo-link.tsx: modalContent in styles and coin icon name
with open("d:/project-26/RoboMind/app/robo-link.tsx", "r", encoding="utf-8") as f:
    rl = f.read()

# Fix modalContent missing style in robo-link.tsx
if "modalContent:" not in rl:
    rl = rl.replace("  resultModalCard: {", "  modalContent: {\n    backgroundColor: 'rgba(11, 19, 41, 0.96)',\n    borderRadius: 24,\n    padding: 24,\n    maxWidth: 600,\n    width: '90%',\n    alignItems: 'center',\n  },\n  resultModalCard: {")

# Fix coin icon name
rl = rl.replace('name="coin"', 'name="currency-usd"')

# Clean up any leftover syntax from automated script if any
rl = re.sub(r'<ScrollView style=\{\{ width: "100%" \}\} contentContainerStyle=\{\{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 16 \}\}>\s*<View style=\{styles\.modalContent\}>', '<View style={styles.modalContent}>', rl)

with open("d:/project-26/RoboMind/app/robo-link.tsx", "w", encoding="utf-8") as f:
    f.write(rl)
print("Fixed app/robo-link.tsx")

# 2. Fix rogue-soul.tsx: resultsScrollContent in styles and saw obstacle type
with open("d:/project-26/RoboMind/app/rogue-soul.tsx", "r", encoding="utf-8") as f:
    rs = f.read()

if "resultsScrollContent:" not in rs:
    rs = rs.replace("  resultsScrollContainer: {", "  resultsScrollContent: {\n    alignItems: 'center',\n    justify: 'center',\n    paddingVertical: 16,\n  },\n  resultsScrollContainer: {")

rs = rs.replace('obs.type === "saw"', 'obs.type === ("saw" as any)')

with open("d:/project-26/RoboMind/app/rogue-soul.tsx", "w", encoding="utf-8") as f:
    f.write(rs)
print("Fixed app/rogue-soul.tsx")

# 3. Fix web wrappers (robo-bros, robo-delivery, robo-jek, robo-maze, robo-pose):
# Cast View to any for onClick prop: <View ref={containerRef} ... -> <View {...({ ref: containerRef, style: ... , onClick: ... } as any)}>
# and fix style border: "none" -> borderWidth: 0
web_files = [
    "d:/project-26/RoboMind/app/robo-bros.tsx",
    "d:/project-26/RoboMind/app/robo-delivery.tsx",
    "d:/project-26/RoboMind/app/robo-jek.tsx",
    "d:/project-26/RoboMind/app/robo-maze.tsx",
    "d:/project-26/RoboMind/app/robo-pose.tsx"
]

for wf in web_files:
    if not os.path.exists(wf): continue
    with open(wf, "r", encoding="utf-8") as f:
        c = f.read()

    # Fix border: "none"
    c = c.replace('border: "none"', 'borderWidth: 0')
    c = c.replace("border: 'none'", 'borderWidth: 0')

    # Fix onClick prop on View
    c = re.sub(
        r'<View\s+ref=\{containerRef\}\s+style=\{\[(.*?)\]\}\s+onClick=\{([^\}]+)\}',
        r'<View ref={containerRef} style={[\1]} {...({ onClick: \2 } as any)}',
        c,
        flags=re.DOTALL
    )
    c = re.sub(
        r'<View\s+ref=\{containerRef\}\s+style=\{(.*?)\}\s+onClick=\{([^\}]+)\}',
        r'<View ref={containerRef} style={\1} {...({ onClick: \2 } as any)}',
        c,
        flags=re.DOTALL
    )

    with open(wf, "w", encoding="utf-8") as f:
        f.write(c)
    print(f"Fixed {wf}")
