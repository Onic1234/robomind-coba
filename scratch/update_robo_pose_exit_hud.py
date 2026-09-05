import os

html_targets = [
    r"d:\project-26\RoboMind\public\robo-pose\index.html",
    r"d:\project-26\RoboMind\public\web-games\robo-pose\index.html",
    r"d:\project-26\RoboMind\robo-pose\index.html",
]

# 1. New HUD Layer 2 Header HTML
old_hud_block = """            <!-- LAYER 2: Floating HUD Bar Top -->
            <div class="relative z-30 w-full max-w-4xl pl-12 pr-12 pt-2.5 sm:pt-4 sm:px-4 flex items-center justify-between gap-1 sm:gap-2">
                <!-- Level & Target Badge -->
                <div class="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-2 rounded-2xl border border-indigo-500/40 shadow-lg">
                    <span id="gameLevelBadge" class="px-2.5 py-1 bg-indigo-600 text-white font-black rounded-xl text-xs sm:text-sm">
                        Level 1
                    </span>
                    <span id="targetCounter" class="text-xs text-yellow-300 font-bold hidden sm:inline">
                        Sisa Target: 10
                    </span>
                </div>"""

new_hud_block = """            <!-- LAYER 2: Integrated HUD Bar Top (No Floating Overlap) -->
            <div class="relative z-30 w-full max-w-4xl px-3 pt-2.5 sm:pt-4 flex items-center justify-between gap-1.5 sm:gap-2">
                <!-- Exit Button & Level Badge -->
                <div class="flex items-center gap-1.5">
                    <button onclick="confirmExitGame()" class="px-2.5 py-1.5 bg-rose-500/25 hover:bg-rose-500/40 text-rose-200 rounded-2xl border border-rose-400/40 backdrop-blur-md transition-all shadow-md text-xs font-black flex items-center gap-1.5 active:translate-y-0.5" title="Keluar Game">
                        <i class="fas fa-arrow-left text-[11px]"></i>
                        <span class="font-extrabold heading-font text-xs">Keluar</span>
                    </button>
                    <div class="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-indigo-500/40 shadow-lg">
                        <span id="gameLevelBadge" class="px-2 py-0.5 bg-indigo-600 text-white font-black rounded-xl text-xs">
                            Lvl 1
                        </span>
                        <span id="targetCounter" class="text-xs text-yellow-300 font-bold hidden md:inline">
                            Sisa: 10
                        </span>
                    </div>
                </div>"""

# 2. Pause Modal HTML to insert before </body>
pause_modal_html = """
    <!-- Pause Game Modal -->
    <div id="pauseModal" class="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 hidden flex flex-col items-center justify-center text-center p-6 transition-all duration-300">
        <div class="w-full max-w-sm bg-slate-900/90 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
            <div class="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-300 text-2xl flex items-center justify-center mb-3 border border-indigo-400/30">
                ⏸️
            </div>
            <h3 class="heading-font text-2xl font-black text-yellow-300 mb-1">Permainan Di-Pause</h3>
            <p class="text-xs text-indigo-200/80 mb-6">Pilih aksi di bawah ini untuk melanjutkan atau keluar</p>

            <div class="w-full flex flex-col gap-3">
                <button onclick="resumeGame()" class="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-black rounded-2xl text-sm shadow-md heading-font flex items-center justify-center gap-2 active:translate-y-0.5">
                    <i class="fas fa-play text-xs"></i> Lanjutkan Bermain
                </button>
                <button onclick="restartLevelFromPause()" class="w-full py-3 bg-slate-800 hover:bg-slate-700 text-indigo-200 font-bold rounded-2xl text-xs border border-indigo-500/30 flex items-center justify-center gap-2 active:translate-y-0.5">
                    <i class="fas fa-rotate-right text-xs"></i> Ulangi Level
                </button>
                <button onclick="confirmExitGame()" class="w-full py-3 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 font-bold rounded-2xl text-xs border border-rose-500/40 flex items-center justify-center gap-2 active:translate-y-0.5">
                    <i class="fas fa-arrow-left text-xs"></i> Keluar ke Menu Utama
                </button>
            </div>
        </div>
    </div>
"""

# 3. Updated pauseGame & confirmExitGame JS functions
old_js_block = """        function pauseGame() {
            if (!isGameRunning) return;
            isPaused = !isPaused;
            if (!isPaused) {
                scheduleNextTileSpawn();
            }
        }

        function confirmExitGame() {
            returnToStartMenu();
        }"""

new_js_block = """        function pauseGame() {
            if (!isGameRunning) return;
            isPaused = true;
            const pauseMdl = document.getElementById('pauseModal');
            if (pauseMdl) pauseMdl.classList.remove('hidden');
        }

        function resumeGame() {
            isPaused = false;
            const pauseMdl = document.getElementById('pauseModal');
            if (pauseMdl) pauseMdl.classList.add('hidden');
            scheduleNextTileSpawn();
        }

        function restartLevelFromPause() {
            isPaused = false;
            const pauseMdl = document.getElementById('pauseModal');
            if (pauseMdl) pauseMdl.classList.add('hidden');
            startGame();
        }

        function confirmExitGame() {
            isGameRunning = false;
            isPaused = false;
            if (spawnTimeout) clearTimeout(spawnTimeout);

            const pauseMdl = document.getElementById('pauseModal');
            if (pauseMdl) pauseMdl.classList.add('hidden');

            try {
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ type: "GAME_EXIT" }, "*");
                }
            } catch (e) {}

            document.getElementById('resultModal')?.classList.add('hidden');
            document.getElementById('gameScreen')?.classList.add('hidden');
            document.getElementById('startScreen')?.classList.remove('hidden');
        }"""

for target in html_targets:
    if os.path.exists(target):
        with open(target, "r", encoding="utf-8") as f:
            content = f.read()

        if old_hud_block in content:
            content = content.replace(old_hud_block, new_hud_block)

        if old_js_block in content:
            content = content.replace(old_js_block, new_js_block)

        if 'id="pauseModal"' not in content:
            content = content.replace('</body>', pause_modal_html + '\n</body>')

        with open(target, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {target}")

