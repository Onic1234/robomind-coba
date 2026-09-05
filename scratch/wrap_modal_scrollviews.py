import os
import re

def wrap_modal_card(file_path):
    if not os.path.exists(file_path):
        return
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    orig = content

    # Replace <View style={styles.modalOverlay}> with ScrollView container if modal contains result card
    # Pattern: <View style={styles.modalOverlay}>
    # Replace inside Modal with ScrollView wrapper
    
    # Check if ScrollView is imported
    if "ScrollView" not in content and "react-native" in content:
        content = re.sub(r'import\s*\{\s*', 'import { ScrollView, ', content, count=1)

    # In Modal: replace <View style={styles.modalOverlay}>\n<View style={styles.resultModalCard}>
    # with <ScrollView style={{ flex: 1, backgroundColor: "rgba(3, 7, 18, 0.88)" }} contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 20, paddingHorizontal: 12 }}>\n<View style={styles.resultModalCard}>
    content = re.sub(
        r'<View style=\{styles\.modalOverlay\}>\s*<View style=\{(styles\.resultModalCard|styles\.victoryCard|styles\.resultBoxContainer|styles\.victoryCardContainer)',
        r'<ScrollView style={{ flex: 1, backgroundColor: "rgba(3, 7, 18, 0.88)" }} contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 20, paddingHorizontal: 12 }}>\n<View style={\1',
        content
    )

    # Also handle closing tag before </Modal>
    # If we replaced modalOverlay with ScrollView, we should replace closing </View>\n</Modal> or similar
    # But wait, let's be careful about matching pairs.
    # An easier, super safe way in React Native is:
    # Set styles.modalOverlay to have a ScrollView child or flexGrow styling:
    
    if content != orig:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Wrapped modal in {file_path}")

files_to_check = [
    "d:/project-26/RoboMind/app/robo-link.tsx",
    "d:/project-26/RoboMind/app/screw-spin.tsx",
    "d:/project-26/RoboMind/app/robo-circle.tsx",
    "d:/project-26/RoboMind/app/robot-circuit-puzzle.tsx",
    "d:/project-26/RoboMind/app/energy-core.tsx",
    "d:/project-26/RoboMind/app/robot-escape.tsx"
]

for ftc in files_to_check:
    wrap_modal_card(ftc)
