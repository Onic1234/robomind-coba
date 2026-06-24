import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, SHAPES, FONTS, SHADOWS } from "../constants/Theme";
import { useRegistration } from "../hooks/useRegistration";
import Input from "./ui/Input";
import Button from "./ui/Button";

export default function RegistrationForm() {
  const {
    parentName,
    setParentName,
    email,
    setEmail,
    childAge,
    setChildAge,
    spanishLevel,
    setSpanishLevel,
    errors,
    loading,
    success,
    response,
    handleRegister,
    resetForm,
  } = useRegistration();

  // Custom picker options for Spanish levels
  const levelOptions = [
    { value: "beginner", label: "Pemula (Beginner)" },
    { value: "intermediate", label: "Menengah (Intermediate)" },
    { value: "advanced", label: "Mahir (Advanced)" },
  ];

  if (success) {
    return (
      <View style={[styles.formContainer, styles.successContainer]}>
        <View style={styles.successIconCircle}>
          <Ionicons name="checkmark-circle" size={54} color={COLORS.success} />
        </View>
        
        <Text style={styles.successTitle}>Pendaftaran Berhasil!</Text>
        
        <Text style={styles.successMessage}>
          {response?.message || "Terima kasih! Kami akan segera menghubungi Anda melalui email untuk menjadwalkan kelas percobaan gratis 7 hari."}
        </Text>
        
        {response?.data?.id && (
          <View style={styles.ticketBadge}>
            <Text style={styles.ticketLabel}>ID PENDAFTARAN</Text>
            <Text style={styles.ticketId}>{response.data.id}</Text>
          </View>
        )}

        <Button
          title="Daftar Siswa Lain"
          onPress={resetForm}
          variant="secondary"
          style={styles.successResetButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Jadwalkan Kelas Gratis</Text>
      <Text style={styles.formSubtitle}>
        Isi formulir di bawah ini untuk memulai uji coba belajar bahasa Spanyol selama 7 hari.
      </Text>

      {/* Parent's Name Input */}
      <Input
        label="Nama Lengkap Orang Tua"
        placeholder="Contoh: Budi Santoso"
        value={parentName}
        onChangeText={setParentName}
        error={errors.parentName}
        icon={<Ionicons name="person-outline" size={20} color={COLORS.textLight} />}
        autoCapitalize="words"
        editable={!loading}
      />

      {/* Email Address Input */}
      <Input
        label="Alamat Email"
        placeholder="Contoh: budi@gmail.com"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        icon={<Ionicons name="mail-outline" size={20} color={COLORS.textLight} />}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />

      {/* Child's Age Input */}
      <Input
        label="Umur Anak"
        placeholder="Contoh: 8"
        value={childAge}
        onChangeText={setChildAge}
        error={errors.childAge}
        icon={<Ionicons name="calendar-outline" size={20} color={COLORS.textLight} />}
        keyboardType="number-pad"
        maxLength={2}
        editable={!loading}
      />

      {/* Custom Spanish Level Picker */}
      <View style={styles.pickerSection}>
        <Text style={styles.pickerLabel}>Tingkat Kemampuan Anak</Text>
        
        <View style={styles.optionsWrapper}>
          {levelOptions.map((option) => {
            const isSelected = spanishLevel === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => !loading && setSpanishLevel(option.value)}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
              >
                <View style={styles.optionContent}>
                  <Ionicons
                    name={isSelected ? "radio-button-on" : "radio-button-off"}
                    size={18}
                    color={isSelected ? COLORS.brandBlue : COLORS.textLight}
                    style={styles.radioIcon}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        {errors.spanishLevel && (
          <Text style={styles.errorText}>{errors.spanishLevel}</Text>
        )}
      </View>

      {/* General Submission Error Feedback */}
      {response && !response.success && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={20} color={COLORS.error} />
          <Text style={styles.errorBannerText}>{response.message}</Text>
        </View>
      )}

      {/* Submit Button */}
      <Button
        title="Daftar Percobaan Gratis"
        onPress={handleRegister}
        variant="accent"
        loading={loading}
        style={styles.submitBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: SHAPES.radiusXl,
    padding: SPACING.xl,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  formTitle: {
    ...FONTS.subheading,
    fontSize: 20,
    color: COLORS.textDark,
    marginBottom: SPACING.xs,
  },
  formSubtitle: {
    ...FONTS.bodyRegular,
    fontSize: 13,
    color: COLORS.textMedium,
    lineHeight: 18,
    marginBottom: SPACING.lg,
  },
  pickerSection: {
    marginBottom: SPACING.lg,
  },
  pickerLabel: {
    ...FONTS.bodyMedium,
    color: COLORS.textDark,
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  optionsWrapper: {
    gap: SPACING.sm,
  },
  optionCard: {
    backgroundColor: COLORS.bgPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: SHAPES.radiusMd,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  optionCardSelected: {
    borderColor: COLORS.brandBlue,
    backgroundColor: "#F0F7FF", // Light tint blue
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioIcon: {
    marginRight: SPACING.sm,
  },
  optionText: {
    ...FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.textMedium,
  },
  optionTextSelected: {
    color: COLORS.brandBlue,
    fontWeight: "700",
  },
  errorText: {
    ...FONTS.caption,
    color: COLORS.error,
    fontSize: 12,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: SHAPES.radiusMd,
    padding: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  errorBannerText: {
    ...FONTS.bodyMedium,
    flex: 1,
    fontSize: 13,
    color: COLORS.error,
  },
  submitBtn: {
    marginTop: SPACING.sm,
  },
  
  // Success states
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxl + 8,
  },
  successIconCircle: {
    marginBottom: SPACING.md,
  },
  successTitle: {
    ...FONTS.subheading,
    fontSize: 22,
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  successMessage: {
    ...FONTS.bodyRegular,
    fontSize: 14,
    color: COLORS.textMedium,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  ticketBadge: {
    backgroundColor: COLORS.bgPrimary,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.brandGreen,
    borderRadius: SHAPES.radiusMd,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: "center",
    marginBottom: SPACING.xxl,
  },
  ticketLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.textLight,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  ticketId: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.brandGreen,
    letterSpacing: 1.5,
  },
  successResetButton: {
    width: "100%",
  },
});
