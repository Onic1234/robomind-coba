import re

filepath = r"d:\project-26\RoboMind\app\robo-link.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update RadarChart component
new_radarchart = '''const RadarChart = ({ data, size = 140 }: { data: { axis: string; score: number }[]; size?: number }) => {
  const center = size / 2;
  const radius = Math.round(size * 0.27);
  const numAxes = data.length;

  const getPolygonPoints = (rFactor: number) => {
    return data
      .map((_, i) => {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const x = center + radius * rFactor * Math.cos(angle);
        const y = center + radius * rFactor * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(" ");
  };

  const dataPoints = data
    .map((d, i) => {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const r = radius * (Math.min(100, Math.max(20, d.score)) / 100);
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(" ");

  const labelWidth = 52;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((rFactor, idx) => (
          <Polygon
            key={idx}
            points={getPolygonPoints(rFactor)}
            fill="none"
            stroke="rgba(56, 189, 248, 0.25)"
            strokeWidth="1"
          />
        ))}

        {data.map((_, i) => {
          const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <Line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(56, 189, 248, 0.3)"
              strokeWidth="1"
            />
          );
        })}

        <Polygon
          points={dataPoints}
          fill="rgba(168, 85, 247, 0.45)"
          stroke="#C084FC"
          strokeWidth="2"
        />

        {data.map((d, i) => {
          const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
          const r = radius * (Math.min(100, Math.max(20, d.score)) / 100);
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
          return (
            <G key={i}>
              <Circle cx={x} cy={y} r="3.5" fill="#FFFFFF" stroke="#A855F7" strokeWidth="1.5" />
            </G>
          );
        })}
      </Svg>

      {data.map((d, i) => {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const labelR = radius + 17;
        const x = center + labelR * Math.cos(angle) - labelWidth / 2;
        const y = center + labelR * Math.sin(angle) - 7;
        return (
          <View
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: labelWidth,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 8.5, fontWeight: "800", color: "#F8FAFC", textAlign: "center" }}>
              {d.axis}
            </Text>
          </View>
        );
      })}
    </View>
  );
};'''

content = re.sub(r'const RadarChart = \(\{ data \}.*?^\};', new_radarchart, content, flags=re.DOTALL | re.MULTILINE)

# 2. Update Victory Modal
old_victory_modal = content[content.find('{/* VICTORY MODAL OVERLAY'):content.find('{/* COMPLETED ALL LEVELS MODAL OVERLAY')]

new_victory_modal = '''{/* VICTORY MODAL OVERLAY - 2 COLUMN COGNITIVE RADAR CHART */}
      <Modal visible={gameState === "victory"} transparent animationType="fade">
        <ScrollView style={{ flex: 1, backgroundColor: "rgba(3, 7, 18, 0.88)" }} contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 12, paddingHorizontal: 10 }}>
          <View style={styles.resultModalCard}>
            {/* HEADER */}
            <View style={styles.resultHeader}>
              <Text style={styles.resultBadgeText}>MISSION COMPLETED</Text>
              <Text style={styles.resultTitleText}>LEVEL {String(level).padStart(2, "0")} CLEARED!</Text>
              <Text style={styles.resultSubtitleText}>
                Sirkuit Data Berhasil Disambungkan!
              </Text>
            </View>

            {/* DUAL COLUMN CONTAINER */}
            <View style={styles.resultGrid}>
              {/* LEFT COLUMN: PENCAPAIAN MISI */}
              <View style={styles.resultColumnLeft}>
                <Text style={styles.columnTitle}>PENCAPAIAN MISI</Text>
                
                {/* STARS */}
                <View style={styles.starRow}>
                  <Text style={styles.starText}>⭐ ⭐ ⭐</Text>
                </View>

                {/* CHECKLIST */}
                <View style={styles.checklistContainer}>
                  <Text style={styles.checkItem}>⭐ Kabel 100% <Text style={styles.checkVal}>(Sukses)</Text></Text>
                  <Text style={styles.checkItem}>⭐ Waktu sirkuit <Text style={styles.checkVal}>(Bonus Cepat)</Text></Text>
                  <Text style={styles.checkItem}>⭐ Kebocoran daya <Text style={styles.checkVal}>(0 Leak)</Text></Text>
                </View>

                {/* LOOT BREAKDOWN */}
                <View style={styles.lootBreakdown}>
                  <View style={styles.lootRow}>
                    <Text style={styles.lootLabel}>Loot Base / Bonus:</Text>
                    <Text style={styles.lootVal}>+{currentConfig.rewardCoins} / +25</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>TOTAL KOIN:</Text>
                    <Text style={styles.totalVal}>{currentConfig.rewardCoins + 25} KOIN</Text>
                  </View>
                </View>
              </View>

              {/* RIGHT COLUMN: ANALISIS PERKEMBANGAN OTAK */}
              <View style={styles.resultColumnRight}>
                <Text style={styles.brainTitle}>🧠 Perkembangan Otak</Text>
                <Text style={styles.brainSubtitle}>(Cognitive Radar)</Text>

                {/* RADAR CHART */}
                <View style={styles.radarWrapper}>
                  <RadarChart
                    size={140}
                    data={[
                      { axis: "Spasial", score: 85 },
                      { axis: "Keputusan", score: 90 },
                      { axis: "Kontrol Diri", score: 78 },
                      { axis: "Memori Kerja", score: 95 },
                      { axis: "Fokus", score: 88 },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* ACTION BUTTONS */}
            <View style={styles.resultActions}>
              <Pressable style={styles.btnGhost} onPress={() => router.back()}>
                <Text style={styles.btnGhostText}>Kembali Ke Menu</Text>
              </Pressable>
              <Pressable style={styles.btnPrimaryNext} onPress={handleNextLevel}>
                <Text style={styles.btnPrimaryNextText}>Lanjut Level ➔</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </Modal>

      '''

content = content.replace(old_victory_modal, new_victory_modal)

# 3. Update Failed Modal
old_failed_modal = content[content.find('{/* FAILED MODAL OVERLAY'):content.find('{/* OUT OF LIVES MODAL OVERLAY')]

new_failed_modal = '''{/* FAILED MODAL OVERLAY - 2 COLUMN COGNITIVE RADAR CHART */}
      <Modal visible={gameState === "failed"} transparent animationType="fade">
        <ScrollView style={{ flex: 1, backgroundColor: "rgba(3, 7, 18, 0.88)" }} contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 12, paddingHorizontal: 10 }}>
          <View style={[styles.resultModalCard, { borderColor: "rgba(239, 68, 68, 0.4)" }]}>
            {/* HEADER */}
            <View style={styles.resultHeader}>
              <Text style={[styles.resultBadgeText, { color: "#EF4444" }]}>MISSION FAILED</Text>
              <Text style={[styles.resultTitleText, { color: "#F87171" }]}>WAKTU HABIS!</Text>
              <Text style={styles.resultSubtitleText}>
                Sirkuit Data Gagal Tersambung Dalam Batas Waktu.
              </Text>
            </View>

            {/* DUAL COLUMN CONTAINER */}
            <View style={styles.resultGrid}>
              {/* LEFT COLUMN: EVALUASI MISI */}
              <View style={[styles.resultColumnLeft, { borderColor: "rgba(239, 68, 68, 0.25)" }]}>
                <Text style={styles.columnTitle}>EVALUASI MISI</Text>
                
                {/* STARS */}
                <View style={styles.starRow}>
                  <Text style={styles.starText}>☆ ☆ ☆</Text>
                </View>

                {/* CHECKLIST */}
                <View style={styles.checklistContainer}>
                  <Text style={styles.checkItem}>❌ Kabel sirkuit <Text style={[styles.checkVal, { color: "#F87171" }]}> (Terputus)</Text></Text>
                  <Text style={styles.checkItem}>⚠️ Batas waktu <Text style={styles.checkVal}>(Waktu Habis)</Text></Text>
                  <Text style={styles.checkItem}>💡 Alur kabel <Text style={styles.checkVal}>(Coba Lagi)</Text></Text>
                </View>

                {/* LOOT BREAKDOWN */}
                <View style={styles.lootBreakdown}>
                  <View style={styles.lootRow}>
                    <Text style={styles.lootLabel}>Loot Koin Diraih:</Text>
                    <Text style={styles.lootVal}>+10 Koin</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: "#F87171" }]}>TOTAL KOIN:</Text>
                    <Text style={[styles.totalVal, { color: "#F87171" }]}>10 KOIN</Text>
                  </View>
                </View>
              </View>

              {/* RIGHT COLUMN: ANALISIS PERKEMBANGAN OTAK */}
              <View style={styles.resultColumnRight}>
                <Text style={styles.brainTitle}>🧠 Evaluasi Otak</Text>
                <Text style={styles.brainSubtitle}>(Focus & Spasial)</Text>

                {/* RADAR CHART */}
                <View style={styles.radarWrapper}>
                  <RadarChart
                    size={140}
                    data={[
                      { axis: "Spasial", score: 55 },
                      { axis: "Keputusan", score: 60 },
                      { axis: "Kontrol Diri", score: 68 },
                      { axis: "Memori Kerja", score: 50 },
                      { axis: "Fokus", score: 62 },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* ACTION BUTTONS */}
            <View style={styles.resultActions}>
              <Pressable style={styles.btnGhost} onPress={() => router.back()}>
                <Text style={styles.btnGhostText}>Kembali Ke Menu</Text>
              </Pressable>
              <Pressable style={[styles.btnPrimaryNext, { backgroundColor: "#DC2626" }]} onPress={handleRestartLevel}>
                <Text style={styles.btnPrimaryNextText}>Coba Lagi 🔄</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </Modal>

      '''

content = content.replace(old_failed_modal, new_failed_modal)

# 4. Update Styles
old_styles_block = content[content.find('resultModalCard: {'):content.find('modalContent: {')]

new_styles_block = '''resultModalCard: {
    width: "96%",
    maxWidth: 540,
    backgroundColor: "rgba(11, 19, 41, 0.98)",
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.4)",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  resultHeader: {
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    paddingBottom: 6,
    marginBottom: 8,
  },
  resultBadgeText: {
    fontSize: 10.5,
    fontWeight: "900",
    color: "#F59E0B",
    letterSpacing: 2,
    marginBottom: 1,
  },
  resultTitleText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#34D399",
    marginBottom: 1,
  },
  resultSubtitleText: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "center",
  },
  resultGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  resultColumnLeft: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.25)",
  },
  columnTitle: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: "center",
  },
  starRow: {
    alignItems: "center",
    marginBottom: 6,
  },
  starText: {
    fontSize: 18,
    color: "#F59E0B",
  },
  checklistContainer: {
    gap: 3,
    marginBottom: 8,
  },
  checkItem: {
    fontSize: 10.5,
    color: "#E2E8F0",
    lineHeight: 14,
  },
  checkVal: {
    fontWeight: "800",
    color: "#34D399",
  },
  lootBreakdown: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.12)",
    paddingTop: 6,
    gap: 2,
  },
  lootRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  lootLabel: {
    fontSize: 10.5,
    color: "#CBD5E1",
  },
  lootVal: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#F59E0B",
  },
  lootValCyan: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#38BDF8",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: 4,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#34D399",
  },
  totalVal: {
    fontSize: 11.5,
    fontWeight: "900",
    color: "#34D399",
  },
  resultColumnRight: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.35)",
    alignItems: "center",
    justify.Content: "center",
  },
  brainTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#C084FC",
    marginBottom: 1,
    textAlign: "center",
  },
  brainSubtitle: {
    fontSize: 9,
    color: "#94A3B8",
    marginBottom: 4,
    textAlign: "center",
  },
  radarWrapper: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  resultActions: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  btnGhost: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  btnGhostText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#94A3B8",
  },
  btnPrimaryNext: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#0284C7",
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  btnPrimaryNextText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  '''

# Fix any typo in replacement string (justifyContent)
new_styles_block = new_styles_block.replace("justify.Content", "justifyContent")

content = content.replace(old_styles_block, new_styles_block)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Successfully updated robo-link.tsx result modal layout!")
