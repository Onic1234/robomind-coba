import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type GameResultVariant = "victory" | "defeat" | "completed";

export interface GameResultStat {
  label: string;
  value?: string;
  ok?: boolean;
}

export interface GameResultLoot {
  label: string;
  value: string;
  accent?: string;
}

export interface GameResultModalProps {
  visible: boolean;
  variant?: GameResultVariant;
  icon?: React.ReactNode;
  badge?: string;
  title: string;
  subtitle?: string;
  stars?: number;
  statsTitle?: string;
  stats?: GameResultStat[];
  loot?: GameResultLoot[];
  total?: { label?: string; value: string };
  radarTitle?: string;
  radar?: React.ReactNode;
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryTone?: "next" | "retry";
  secondaryLabel?: string;
  onSecondary?: () => void;
  tertiaryLabel?: string;
  onTertiary?: () => void;
  children?: React.ReactNode;
  onRequestClose?: () => void;
}

const VARIANTS: Record<
  GameResultVariant,
  { accent: string; border: string; title: string; badgeBg: string; badgeText: string }
> = {
  victory: {
    accent: "#34D399",
    border: "rgba(52, 211, 153, 0.45)",
    title: "#34D399",
    badgeBg: "rgba(245, 158, 11, 0.14)",
    badgeText: "#F59E0B",
  },
  defeat: {
    accent: "#F87171",
    border: "rgba(248, 113, 113, 0.45)",
    title: "#F87171",
    badgeBg: "rgba(239, 68, 68, 0.14)",
    badgeText: "#F87171",
  },
  completed: {
    accent: "#38BDF8",
    border: "rgba(56, 189, 248, 0.45)",
    title: "#38BDF8",
    badgeBg: "rgba(56, 189, 248, 0.14)",
    badgeText: "#38BDF8",
  },
};

export function GameResultModal({
  visible,
  variant = "victory",
  icon,
  badge,
  title,
  subtitle,
  stars,
  statsTitle,
  stats = [],
  loot = [],
  total,
  radarTitle,
  radar,
  primaryLabel,
  onPrimary,
  primaryTone = "next",
  secondaryLabel,
  onSecondary,
  tertiaryLabel,
  onTertiary,
  children,
  onRequestClose,
}: GameResultModalProps) {
  const { width, height } = useWindowDimensions();
  const compact = width < 380;
  const theme = VARIANTS[variant];
  const cardWidth = Math.min(width - 28, 440);
  const cardMaxHeight = Math.max(height - 40, 320);

  const renderStars = () => {
    if (typeof stars !== "number") return null;
    const base = compact ? 22 : 26;
    const mid = compact ? 28 : 34;
    return (
      <View style={styles.starsRow}>
        {[0, 1, 2].map((i) => {
          const filled = i < stars;
          const size = i === 1 ? mid : base;
          return (
            <Ionicons
              key={i}
              name={filled ? "star" : "star-outline"}
              size={size}
              color={filled ? "#FFD700" : "#475569"}
              style={i === 1 ? { marginTop: -4 } : undefined}
            />
          );
        })}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              width: cardWidth,
              maxHeight: cardMaxHeight,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.header}>
            {icon ? <View style={styles.headerIcon}>{icon}</View> : null}
            {badge ? (
              <View style={[styles.badge, { backgroundColor: theme.badgeBg }]}>
                <Text style={[styles.badgeText, { color: theme.badgeText }]}>
                  {badge}
                </Text>
              </View>
            ) : null}
            <Text style={[styles.title, { color: theme.title }]} numberOfLines={2}>
              {title}
            </Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {renderStars()}

            {stats.length > 0 ? (
              <View style={styles.section}>
                {statsTitle ? (
                  <Text style={styles.sectionTitle}>{statsTitle}</Text>
                ) : null}
                {stats.map((item, idx) => (
                  <View key={idx} style={styles.statRow}>
                    {item.ok !== undefined ? (
                      <Ionicons
                        name={item.ok ? "checkmark-circle" : "close-circle"}
                        size={14}
                        color={item.ok ? "#22C55E" : "#F87171"}
                      />
                    ) : (
                      <View style={styles.statBullet} />
                    )}
                    <Text style={styles.statLabel}>{item.label}</Text>
                    {item.value ? (
                      <Text style={styles.statValue}>{item.value}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}

            {radar ? (
              <View style={[styles.section, styles.radarSection]}>
                {radarTitle ? (
                  <Text style={styles.sectionTitle}>{radarTitle}</Text>
                ) : null}
                <View style={styles.radarWrap}>{radar}</View>
              </View>
            ) : null}

            {loot.length > 0 ? (
              <View style={styles.section}>
                {loot.map((item, idx) => (
                  <View key={idx} style={styles.lootRow}>
                    <Text style={styles.lootLabel}>{item.label}</Text>
                    <Text
                      style={[styles.lootValue, { color: item.accent || "#00E5FF" }]}
                    >
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {total ? (
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>{total.label || "TOTAL"}</Text>
                <Text style={styles.totalValue}>{total.value}</Text>
              </View>
            ) : null}

            {children}
          </ScrollView>

          {(primaryLabel || secondaryLabel || tertiaryLabel) && (
            <View style={styles.actions}>
              {secondaryLabel ? (
                <Pressable
                  onPress={onSecondary}
                  style={({ pressed }) => [
                    styles.btn,
                    styles.btnSecondary,
                    pressed && styles.btnPressed,
                  ]}
                >
                  <Text style={styles.btnSecondaryText}>{secondaryLabel}</Text>
                </Pressable>
              ) : null}
              {tertiaryLabel ? (
                <Pressable
                  onPress={onTertiary}
                  style={({ pressed }) => [
                    styles.btn,
                    styles.btnSecondary,
                    pressed && styles.btnPressed,
                  ]}
                >
                  <Text style={styles.btnSecondaryText}>{tertiaryLabel}</Text>
                </Pressable>
              ) : null}
              {primaryLabel ? (
                <Pressable
                  onPress={onPrimary}
                  style={({ pressed }) => [
                    styles.btn,
                    styles.btnPrimary,
                    primaryTone === "retry" && styles.btnRetry,
                    pressed && styles.btnPressed,
                  ]}
                >
                  <Text style={styles.btnPrimaryText}>{primaryLabel}</Text>
                </Pressable>
              ) : null}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(3, 7, 18, 0.88)",
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
  },
  card: {
    backgroundColor: "#0B132B",
    borderRadius: 24,
    borderWidth: 2,
    overflow: "hidden",
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.12)",
  },
  headerIcon: {
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 23,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: "center",
    color: "#94A3B8",
  },
  body: {
    flexShrink: 1,
  },
  bodyContent: {
    padding: 16,
    gap: 12,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  section: {
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.18)",
    padding: 12,
    gap: 8,
  },
  radarSection: {
    alignItems: "center",
  },
  radarWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#7DD3FC",
    marginBottom: 2,
    textAlign: "center",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#38BDF8",
  },
  statLabel: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    color: "#CBD5E1",
  },
  statValue: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#F8FAFC",
  },
  lootRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  lootLabel: {
    flex: 1,
    fontSize: 11.5,
    color: "#94A3B8",
  },
  lootValue: {
    fontSize: 12,
    fontWeight: "900",
  },
  totalBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    backgroundColor: "rgba(0, 229, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(0, 229, 255, 0.35)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#7DD3FC",
  },
  totalValue: {
    fontSize: 15,
    fontWeight: "900",
    color: "#00E5FF",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.12)",
  },
  btn: {
    flexGrow: 1,
    flexBasis: 130,
    minHeight: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  btnSecondary: {
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.35)",
  },
  btnSecondaryText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#E2E8F0",
  },
  btnPrimary: {
    backgroundColor: "#0891B2",
  },
  btnRetry: {
    backgroundColor: "#DC2626",
  },
  btnPrimaryText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  btnPressed: {
    opacity: 0.85,
  },
});
