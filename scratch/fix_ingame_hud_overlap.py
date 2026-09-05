import os

# 1. Update app/robo-pose.tsx
rn_path = r"d:\project-26\RoboMind\app\robo-pose.tsx"
with open(rn_path, "r", encoding="utf-8") as f:
    rn_code = f.read()

# Make floatingExit & floatingFs ultra-sleek, 34px circular glass pills at top: 8
old_exit = """  floatingExit: {
    position: "absolute", top: 10, left: 10,
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.95)",
    zIndex: 9999, elevation: 10,
    borderWidth: 1.5, borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 4,
  },"""

new_exit = """  floatingExit: {
    position: "absolute", top: 8, left: 8,
    width: 34, height: 34, borderRadius: 17,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    zIndex: 9999, elevation: 10,
    borderWidth: 1.5, borderColor: "rgba(248, 113, 113, 0.6)",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 4,
  },"""

old_fs = """  floatingFs: {
    position: "absolute", top: 10, right: 10,
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    zIndex: 9999, elevation: 10,
    borderWidth: 1.5, borderColor: "rgba(167, 139, 250, 0.5)",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 4,
  },"""

new_fs = """  floatingFs: {
    position: "absolute", top: 8, right: 8,
    width: 34, height: 34, borderRadius: 17,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    zIndex: 9999, elevation: 10,
    borderWidth: 1.5, borderColor: "rgba(167, 139, 250, 0.5)",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 4,
  },"""

if old_exit in rn_code:
    rn_code = rn_code.replace(old_exit, new_exit)
if old_fs in rn_code:
    rn_code = rn_code.replace(old_fs, new_fs)

with open(rn_path, "w", encoding="utf-8") as f:
    f.write(rn_code)

print("Updated app/robo-pose.tsx!")

# 2. Function to update HTML files
html_targets = [
    r"d:\project-26\RoboMind\public\robo-pose\index.html",
    r"d:\project-26\RoboMind\public\web-games\robo-pose\index.html",
    r"d:\project-26\RoboMind\robo-pose\index.html",
]

old_hud_header = '<div class="relative z-30 w-full max-w-4xl px-3 pt-14 sm:pt-4 flex items-center justify-between gap-1.5 sm:gap-2">'
new_hud_header = '<div class="relative z-30 w-full max-w-4xl pl-12 pr-12 pt-2.5 sm:pt-4 sm:px-4 flex items-center justify-between gap-1 sm:gap-2">'

old_exit_btn_in_hud = """                    <button onclick="confirmExitGame()" class="p-2.5 bg-rose-900/80 hover:bg-rose-800 text-rose-200 rounded-2xl border border-rose-400/40 backdrop-blur-md transition-all shadow-md">
                        <i class="fas fa-xmark text-xs"></i>
                    </button>"""

for target in html_targets:
    if os.path.exists(target):
        with open(target, "r", encoding="utf-8") as f:
            content = f.read()

        if old_hud_header in content:
            content = content.replace(old_hud_header, new_hud_header)
        
        # Remove redundant xmark button inside HUD if present
        if old_exit_btn_in_hud in content:
            content = content.replace(old_exit_btn_in_hud, "")

        with open(target, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {target}")

