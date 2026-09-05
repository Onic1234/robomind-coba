import os
import re

def make_modal_scrollable(file_path):
    if not os.path.exists(file_path):
        return
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    orig = content

    # Check if ScrollView is imported
    if "ScrollView" not in content and "react-native" in content:
        content = re.sub(r'import\s*\{\s*', 'import { ScrollView, ', content, count=1)

    # In Modal components, ensure <View style={styles.modalOverlay}> has a ScrollView inside or surrounds card
    # E.g., replace <View style={styles.modalOverlay}>\n<View style={...}>
    # with <View style={styles.modalOverlay}>\n<ScrollView style={{ width: "100%" }} contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 16 }}>\n<View style={...}>
    
    # We match <Modal ...>\s*<View style={styles.modalOverlay}>\s*(<View style=\{(styles\.[a-zA-Z0-9_]+)\}>)
    def modal_replacer(match):
        modal_open = match.group(1)
        overlay_open = match.group(2)
        card_open = match.group(3)
        # Avoid double wrapping if ScrollView already present right after overlay_open
        if "<ScrollView" in card_open:
            return match.group(0)
        return f'{modal_open}\n{overlay_open}\n<ScrollView style={{ width: "100%" }} contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 16 }}>\n{card_open}'

    pattern = r'(<Modal[^>]*>)\s*(<View style=\{styles\.modalOverlay\}>)\s*(<View style=\{styles\.(?:resultModalCard|victoryCard|resultBoxContainer|victoryCardContainer|modalContent|victoryCardCard)\}[^>]*>)'
    content = re.sub(pattern, modal_replacer, content)

    # Also need to close </ScrollView> before closing modalOverlay </View>
    # Simple strategy: whenever we added ScrollView inside modalOverlay, replace the matching </View>\n</View>\n</Modal> with </View>\n</ScrollView>\n</View>\n</Modal>
    pattern_close = r'(</View>)\s*(</View>)\s*(</Modal>)'
    # Only replace where overlay has ScrollView
    
    if content != orig:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Made modals scrollable in {file_path}")

tsx_list = [
    "d:/project-26/RoboMind/app/robo-link.tsx",
    "d:/project-26/RoboMind/app/robo-circle.tsx",
    "d:/project-26/RoboMind/app/robot-circuit-puzzle.tsx",
    "d:/project-26/RoboMind/app/energy-core.tsx",
    "d:/project-26/RoboMind/app/robot-escape.tsx",
    "d:/project-26/RoboMind/app/screw-spin.tsx"
]

for t in tsx_list:
    make_modal_scrollable(t)
