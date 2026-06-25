import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, View, Text, Pressable, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform, PanResponder, Animated, Dimensions } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, SPACING, SHAPES, FONTS, SHADOWS } from "../constants/Theme";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
}

export default function ChatbotButton() {
  const [modalVisible, setModalVisible] = useState(false);
  
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const listenerId = pan.addListener((value) => {
      offsetRef.current = value;
    });
    return () => {
      pan.removeListener(listenerId);
    };
  }, [pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: offsetRef.current.x,
          y: offsetRef.current.y,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gestureState) => {
        pan.flattenOffset();

        const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
        const baselineX = screenWidth - 20 - 27; 
        const baselineY = screenHeight - 24 - 54; 

        const currentTranslateX = offsetRef.current.x;
        const currentTranslateY = offsetRef.current.y;

        const centerX = baselineX + currentTranslateX;

        let targetX = 0;
        if (centerX < screenWidth / 2) {
          targetX = 90 - screenWidth; 
        } else {
          targetX = 4; 
        }

        const minY = Platform.OS === "ios" ? 80 : 60;
        const maxY = screenHeight - (Platform.OS === "ios" ? 140 : 120);
        
        const minTranslateY = minY - baselineY;
        const maxTranslateY = maxY - baselineY;
        const targetY = Math.min(Math.max(currentTranslateY, minTranslateY), maxTranslateY);

        Animated.parallel([
          Animated.spring(pan.x, {
            toValue: targetX,
            useNativeDriver: false,
            tension: 40,
            friction: 7,
          }),
          Animated.spring(pan.y, {
            toValue: targetY,
            useNativeDriver: false,
            tension: 40,
            friction: 7,
          }),
        ]).start();
      },
    })
  ).current;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      sender: "bot",
      text: "¡Hola! Saya RoboMind AI. Ada yang bisa saya bantu terkait game, modul, atau perkembangan belajar anak hari ini?",
    },
  ]);
  const [inputText, setInputText] = useState("");

  const handleSend = (textToSend = inputText) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    // Simulate bot response
    setTimeout(() => {
      let botResponseText = "Saya sedang memproses pertanyaan Anda. Silakan pilih menu rekomendasi jika ingin saran khusus!";
      const textLower = textToSend.toLowerCase();

      if (textLower.includes("game") || textLower.includes("main")) {
        botResponseText = "Untuk hari ini, Aira disarankan menyelesaikan Misi Kognitif 'Math Quest' dan Misi Fokus 'Problem Solving' untuk melatih daya logika.";
      } else if (textLower.includes("progress") || textLower.includes("level")) {
        botResponseText = "Aira saat ini berada di Level 12 dengan 856 XP. Kemampuan terkuatnya ada pada aspek Bahasa (90%), sedangkan aspek Logika (65%) perlu sedikit didorong.";
      } else if (textLower.includes("tips") || textLower.includes("belajar")) {
        botResponseText = "Tips hari ini: Batasi waktu bermain game non-edukasi maksimal 30 menit sehari, dan gantilah dengan game logika interaktif di tab 'Play' RoboMind.";
      }

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: "bot",
        text: botResponseText,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1000);
  };

  const handleChipPress = (chipText: string) => {
    handleSend(chipText);
  };

  const quickChips = [
    "Rekomendasi game",
    "Tanya progress belajar",
    "Tips belajar anak",
  ];

  return (
    <>
      {/* Floating Action Button */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: pan.getTranslateTransform(),
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Pressable 
          style={({ pressed }) => [
            styles.fab,
            pressed && styles.fabPressed
          ]}
          onPress={() => setModalVisible(true)}
        >
          <MaterialCommunityIcons name="robot" size={24} color="#FFFFFF" />
          <View style={styles.onlineIndicator} />
        </Pressable>
      </Animated.View>

      {/* Chatbot Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.chatWindow}>
            {/* Header */}
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderLeft}>
                <View style={styles.robotAvatar}>
                  <MaterialCommunityIcons name="robot" size={20} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.chatHeaderTitle}>RoboMind AI</Text>
                  <View style={styles.onlineBadge}>
                    <View style={styles.greenDot} />
                    <Text style={styles.onlineText}>Online</Text>
                  </View>
                </View>
              </View>
              
              <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color={COLORS.textDark} />
              </Pressable>
            </View>

            {/* Messages Scroll Area */}
            <ScrollView 
              style={styles.messagesList}
              contentContainerStyle={styles.messagesScrollContent}
              ref={(ref) => ref?.scrollToEnd({ animated: true })}
            >
              {messages.map((msg) => {
                const isBot = msg.sender === "bot";
                return (
                  <View 
                    key={msg.id} 
                    style={[
                      styles.messageBubbleWrapper,
                      isBot ? styles.messageBotWrapper : styles.messageUserWrapper
                    ]}
                  >
                    <View style={[
                      styles.messageBubble,
                      isBot ? styles.messageBot : styles.messageUser
                    ]}>
                      <Text style={[
                        styles.messageText,
                        isBot ? styles.messageTextBot : styles.messageTextUser
                      ]}>
                        {msg.text}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Quick chips filter */}
            <View style={styles.chipsWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                {quickChips.map((chip) => (
                  <Pressable 
                    key={chip} 
                    style={styles.chip}
                    onPress={() => handleChipPress(chip)}
                  >
                    <Text style={styles.chipText}>{chip}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Input Bar */}
            <View style={styles.inputBar}>
              <TextInput
                placeholder="Tulis pesan..."
                value={inputText}
                onChangeText={setInputText}
                placeholderTextColor={COLORS.textLight}
                style={styles.textInput}
                onSubmitEditing={() => handleSend()}
              />
              <Pressable style={styles.sendButton} onPress={() => handleSend()}>
                <Ionicons name="send" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    bottom: 24,
    right: 20,
    zIndex: 999,
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#14B8A6",
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.premium,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
  onlineIndicator: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  chatWindow: {
    backgroundColor: COLORS.cardWhite,
    borderTopLeftRadius: SHAPES.radiusXl,
    borderTopRightRadius: SHAPES.radiusXl,
    height: "75%",
    ...SHADOWS.premium,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  chatHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  robotAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#14B8A6",
    justifyContent: "center",
    alignItems: "center",
  },
  chatHeaderTitle: {
    ...FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.textDark,
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  onlineText: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.textLight,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.bgPrimary,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  messagesScrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  messageBubbleWrapper: {
    flexDirection: "row",
    width: "100%",
  },
  messageBotWrapper: {
    justifyContent: "flex-start",
  },
  messageUserWrapper: {
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: SHAPES.radiusLg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  messageBot: {
    backgroundColor: COLORS.cardWhite,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderTopLeftRadius: 4,
    ...SHADOWS.light,
  },
  messageUser: {
    backgroundColor: COLORS.brandBlue,
    borderTopRightRadius: 4,
    ...SHADOWS.light,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  messageTextBot: {
    ...FONTS.bodyRegular,
    color: COLORS.textDark,
  },
  messageTextUser: {
    ...FONTS.bodyBold,
    color: "#FFFFFF",
  },
  chipsWrapper: {
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.bgPrimary,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  chipsScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  chip: {
    backgroundColor: COLORS.cardWhite,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: SHAPES.radiusRound,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
  },
  chipText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textMedium,
  },
  inputBar: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.cardWhite,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: SPACING.md,
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 30 : SPACING.md,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: SHAPES.radiusRound,
    height: 40,
    paddingHorizontal: SPACING.lg,
    ...FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.textDark,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.brandBlue,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.light,
  },
});
