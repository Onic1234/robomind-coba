import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface HowToStep {
  emoji: string;
  text: string;
}

interface HowToPlayModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  goal?: string;
  steps: HowToStep[];
  tips?: string[];
  accentColor?: string;
  subtitleColor?: string;
}

export function HowToPlayModal({
  visible,
  onClose,
  title = "Cara Main",
  goal,
  steps,
  tips = [],
  accentColor = "#006874",
  subtitleColor = "#0F766E",
}: HowToPlayModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color="#64748B" />
          </Pressable>

          <View style={styles.titleRow}>
            <View style={[styles.titleIconCircle, { backgroundColor: accentColor }]}>
              <Ionicons name="game-controller" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {goal ? (
              <View style={[styles.goalBox, { borderColor: accentColor }]}>
                <Ionicons name="flag" size={16} color={accentColor} />
                <Text style={[styles.goalText, { color: subtitleColor }]}>{goal}</Text>
              </View>
            ) : null}

            <View style={styles.steps}>
              {steps.map((step, idx) => (
                <View key={idx} style={[styles.stepRow, { borderLeftColor: accentColor }]}>
                  <Text style={styles.stepEmoji}>{step.emoji}</Text>
                  <Text style={styles.stepText}>{step.text}</Text>
                </View>
              ))}
            </View>

            {tips.length > 0 ? (
              <View style={styles.tipsBox}>
                <Text style={[styles.tipsTitle, { color: accentColor }]}>TIP PINTAR</Text>
                {tips.map((tip, idx) => (
                  <View key={idx} style={styles.tipRow}>
                    <Ionicons name="bulb" size={14} color="#F59E0B" />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </ScrollView>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.ctaBtn,
              { backgroundColor: accentColor },
              pressed && styles.ctaPressed,
            ]}
          >
            <Text style={styles.ctaText}>Saya Mengerti!</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(7, 30, 39, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
    // @ts-ignore - web cursor
    cursor: "pointer",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    paddingRight: 30,
  },
  titleIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#071E27",
  },
  content: {
    paddingBottom: 8,
  },
  goalBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0FDFA",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  goalText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  steps: {
    gap: 8,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#F8FAFC",
    borderLeftWidth: 4,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  stepEmoji: {
    fontSize: 20,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: "#0F172A",
  },
  tipsBox: {
    marginTop: 14,
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 12,
  },
  tipsTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 8,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#78350F",
  },
  ctaBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    // @ts-ignore - web cursor
    cursor: "pointer",
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
