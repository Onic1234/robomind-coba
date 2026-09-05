import os
import re

file_path = "d:/project-26/RoboMind/app/robo-link.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update RadarChart component size for compact mobile fit (200 -> 175)
old_radar_code = """const RadarChart = ({ data }: { data: { axis: string; score: number }[] }) => {
  const size = 200;
  const center = size / 2;
  const radius = 62;"""

new_radar_code = """const RadarChart = ({ data }: { data: { axis: string; score: number }[] }) => {
  const size = 175;
  const center = size / 2;
  const radius = 52;"""

content = content.replace(old_radar_code, new_radar_code)

# 2. Update styles for resultModalCard, resultHeader, resultGrid, etc.
content = content.replace("maxWidth: 720,\n    backgroundColor: \"rgba(11, 19, 41, 0.96)\",\n    borderWidth: 1.5,\n    borderColor: \"rgba(56, 189, 248, 0.4)\",\n    borderRadius: 24,\n    padding: 24,", "maxWidth: 620,\n    backgroundColor: \"rgba(11, 19, 41, 0.98)\",\n    borderWidth: 1.5,\n    borderColor: \"rgba(56, 189, 248, 0.4)\",\n    borderRadius: 20,\n    padding: 16,")

content = content.replace("fontSize: 24,\n    fontWeight: \"900\",\n    color: \"#34D399\",\n    marginBottom: 4,", "fontSize: 20,\n    fontWeight: \"900\",\n    color: \"#34D399\",\n    marginBottom: 2,")

content = content.replace("gap: 16,\n    marginBottom: 20,", "gap: 10,\n    marginBottom: 14,")

content = content.replace("radarWrapper: {\n    alignItems: \"center\",\n    justifyContent: \"center\",\n    height: 200,\n  },", "radarWrapper: {\n    alignItems: \"center\",\n    justifyContent: \"center\",\n    height: 175,\n  },")

# 3. Wrap all Modal bodies in ScrollView
# Pattern for victory modal:
old_vic_modal = """      {/* VICTORY MODAL OVERLAY - 2 COLUMN COGNITIVE RADAR CHART */}
      <Modal visible={gameState === "victory"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.resultModalCard}>"""

new_vic_modal = """      {/* VICTORY MODAL OVERLAY - 2 COLUMN COGNITIVE RADAR CHART */}
      <Modal visible={gameState === "victory"} transparent animationType="fade">
        <ScrollView style={{ flex: 1, backgroundColor: "rgba(3, 7, 18, 0.88)" }} contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 20, paddingHorizontal: 12 }}>
          <View style={styles.resultModalCard}>"""

content = content.replace(old_vic_modal, new_vic_modal)

# Pattern for completed modal:
old_comp_modal = """      {/* COMPLETED ALL LEVELS MODAL OVERLAY */}
      <Modal visible={gameState === "completed"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>"""

new_comp_modal = """      {/* COMPLETED ALL LEVELS MODAL OVERLAY */}
      <Modal visible={gameState === "completed"} transparent animationType="fade">
        <ScrollView style={{ flex: 1, backgroundColor: "rgba(3, 7, 18, 0.88)" }} contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 20, paddingHorizontal: 12 }}>
          <View style={styles.modalContent}>"""

content = content.replace(old_comp_modal, new_comp_modal)

# Pattern for failed modal:
old_failed_modal = """      {/* FAILED MODAL OVERLAY - 2 COLUMN COGNITIVE RADAR CHART */}
      <Modal visible={gameState === "failed"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.resultModalCard, { borderColor: "rgba(239, 68, 68, 0.4)" }]}>"""

new_failed_modal = """      {/* FAILED MODAL OVERLAY - 2 COLUMN COGNITIVE RADAR CHART */}
      <Modal visible={gameState === "failed"} transparent animationType="fade">
        <ScrollView style={{ flex: 1, backgroundColor: "rgba(3, 7, 18, 0.88)" }} contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 20, paddingHorizontal: 12 }}>
          <View style={[styles.resultModalCard, { borderColor: "rgba(239, 68, 68, 0.4)" }]}>"""

content = content.replace(old_failed_modal, new_failed_modal)

# Pattern for outOfLives modal:
old_lives_modal = """      {/* OUT OF LIVES MODAL OVERLAY */}
      <Modal visible={gameState === "outOfLives"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>"""

new_lives_modal = """      {/* OUT OF LIVES MODAL OVERLAY */}
      <Modal visible={gameState === "outOfLives"} transparent animationType="fade">
        <ScrollView style={{ flex: 1, backgroundColor: "rgba(3, 7, 18, 0.88)" }} contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 20, paddingHorizontal: 12 }}>
          <View style={styles.modalContent}>"""

content = content.replace(old_lives_modal, new_lives_modal)

# Now fix closing tags for those 4 modals: replace </View>\n        </View>\n      </Modal> with </View>\n        </ScrollView>\n      </Modal>
content = re.sub(
    r'(</View>)\s*(</View>)\s*(</Modal>)',
    r'\1\n        </ScrollView>\n      </Modal>',
    content
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated app/robo-link.tsx modals with ScrollView & compact responsive sizing")
