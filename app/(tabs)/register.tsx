import React from "react";
import { StyleSheet, View, Text, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING, FONTS } from "../../constants/Theme";
import RegistrationForm from "../../components/RegistrationForm";

export default function RegisterScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Block */}
        <View style={styles.headerContainer}>
          <Text style={styles.pageTitle}>JADWALKAN KELAS GRATIS</Text>
          <Text style={styles.pageSubtitle}>
            Mulai petualangan belajar si kecil. Daftarkan uji coba gratis 7 hari untuk kelas bahasa Spanyol anak Anda.
          </Text>
        </View>

        {/* Registration Form Component */}
        <RegistrationForm />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.bgPrimary,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  pageTitle: {
    ...FONTS.heading,
    fontSize: 22,
    color: COLORS.textDark,
    textAlign: "center",
    marginBottom: SPACING.sm,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    ...FONTS.bodyRegular,
    fontSize: 13,
    color: COLORS.textMedium,
    textAlign: "center",
    lineHeight: 18,
  },
});
