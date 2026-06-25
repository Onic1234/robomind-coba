import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, Pressable, TextInput, Modal, StatusBar, Platform, Linking, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../hooks/useAuth";
import { COLORS, SPACING, SHAPES, FONTS, SHADOWS } from "../../constants/Theme";

interface MenuItemProps {
  icon: string;
  iconType: "ionicons" | "material" | "mci";
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  onPress: () => void;
}

function MenuItem({ icon, iconType, title, subtitle, badge, badgeColor, onPress }: MenuItemProps) {
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed
      ]} 
      onPress={onPress}
    >
      <View style={styles.menuLeft}>
        <View style={styles.menuIconCircle}>
          {iconType === "ionicons" ? (
            <Ionicons name={icon as any} size={18} color={COLORS.textMedium} />
          ) : iconType === "material" ? (
            <Ionicons name={icon as any} size={18} color={COLORS.textMedium} />
          ) : (
            <MaterialCommunityIcons name={icon as any} size={18} color={COLORS.textMedium} />
          )}
        </View>
        <View>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      
      <View style={styles.menuRight}>
        {badge ? (
          <View style={[styles.menuBadge, badgeColor ? { backgroundColor: badgeColor } : null]}>
            <Text style={styles.menuBadgeText}>{badge}</Text>
          </View>
        ) : null}
        <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { isLoggedIn, login, logout, childName, updateChildName, avatarUrl, updateAvatarUrl } = useAuth();
  const [passcodeVisible, setPasscodeVisible] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  // Avatar Picking State
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  const handlePickAvatar = async () => {
    if (!isLoggedIn) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Maaf, kami memerlukan izin akses galeri untuk mengubah foto profil.");
      return;
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setIsSavingAvatar(true);
        const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        await updateAvatarUrl(base64Uri);
      }
    } catch (err: any) {
      alert(err?.message || "Gagal mengubah foto profil.");
    } finally {
      setIsSavingAvatar(false);
    }
  };

  // Name Editing States
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [nameError, setNameError] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  // Login Form States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleParentModeAccess = () => {
    setPasscode("");
    setPasscodeError("");
    setPasscodeVisible(true);
  };

  const verifyPasscode = () => {
    if (passcode === "1234" || passcode === "2026") {
      setPasscodeVisible(false);
      router.push("/parent-mode");
    } else {
      setPasscodeError("Passcode salah! Silakan coba lagi (Hint: 1234)");
    }
  };

  const handleSaveName = async () => {
    setNameError("");
    if (!editName.trim()) {
      setNameError("Nama tidak boleh kosong.");
      return;
    }
    setIsSavingName(true);
    try {
      await updateChildName(editName.trim());
      setNameModalVisible(false);
    } catch (err: any) {
      setNameError(err?.message || "Terjadi kesalahan saat menyimpan nama.");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleLogin = async () => {
    setLoginError("");
    if (!username.trim() || !password.trim()) {
      setLoginError("Harap masukkan username/email dan kata sandi.");
      return;
    }

    setIsLoading(true);
    try {
      await login(username.trim(), password.trim());
      setUsername("");
      setPassword("");
    } catch (err: any) {
      let errMsg = err?.message || "Terjadi kesalahan koneksi. Silakan coba lagi.";
      if (errMsg.includes("Invalid login credentials")) {
        errMsg = "Username/email atau kata sandi salah. Silakan periksa kembali.";
      } else if (errMsg.includes("Email not confirmed")) {
        errMsg = "Email belum terkonfirmasi. Silakan periksa kotak masuk email Anda.";
      }
      setLoginError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />
        <ScrollView 
          contentContainerStyle={styles.loginScrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.loginContainer}>
            {/* Header / Logo */}
            <View style={styles.loginHeader}>
              <View style={styles.loginLogoContainer}>
                <Image
                  source={require("../../assets/images/robomind_hero.png")}
                  style={styles.loginLogo}
                  contentFit="contain"
                />
              </View>
              <Text style={styles.loginWelcomeText}>Selamat Datang!</Text>
              <Text style={styles.loginTitleText}>Masuk ke RoboMind</Text>
              <Text style={styles.loginSubtitleText}>
                Masuk untuk menyimpan kemajuan belajar anak dan mengakses fitur lengkap.
              </Text>
            </View>

            {/* Login Card Form */}
            <View style={styles.loginCard}>
              {/* Username Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username atau Email</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan username atau email"
                    placeholderTextColor={COLORS.textLight}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Kata Sandi</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan kata sandi"
                    placeholderTextColor={COLORS.textLight}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={COLORS.textMedium}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Error Message */}
              {loginError ? (
                <View style={styles.loginErrorContainer}>
                  <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
                  <Text style={styles.loginErrorText}>{loginError}</Text>
                </View>
              ) : null}

              {/* Submit Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.loginBtn,
                  pressed && styles.loginBtnPressed,
                  isLoading && styles.loginBtnDisabled
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginBtnText}>Masuk Sekarang</Text>
                )}
              </Pressable>
            </View>

            {/* Hint */}
            <View style={styles.loginHintCard}>
              <Ionicons name="information-circle-outline" size={18} color={COLORS.brandBlue} />
              <Text style={styles.loginHintText}>
                Demo mode: Ketik username & kata sandi apa saja untuk mencoba masuk.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Child Profile Header */}
        <View style={styles.profileHeaderCard}>
          <Pressable 
            onPress={handlePickAvatar} 
            disabled={!isLoggedIn || isSavingAvatar}
            style={({ pressed }) => [
              styles.avatarWrapper, 
              pressed && { opacity: 0.8 }
            ]}
          >
            {isSavingAvatar ? (
              <View style={[styles.avatarImage, { justifyContent: "center", alignItems: "center", backgroundColor: `${COLORS.brandGreen}15` }]}>
                <ActivityIndicator size="small" color={COLORS.brandGreen} />
              </View>
            ) : (
              <Image
                source={avatarUrl ? { uri: avatarUrl } : require("../../assets/images/robomind_hero.png")}
                style={styles.avatarImage}
                contentFit="cover"
              />
            )}
            {isLoggedIn && (
              <View style={styles.editAvatarBadge}>
                <Ionicons name="camera" size={10} color="#FFFFFF" />
              </View>
            )}
            <View style={styles.rankBadge}>
              <Ionicons name="star" size={10} color="#FFFFFF" />
            </View>
          </Pressable>
          
          <Pressable 
            onPress={() => {
              if (isLoggedIn) {
                setEditName(childName);
                setNameModalVisible(true);
                setNameError("");
              }
            }} 
            style={styles.nameEditTrigger}
            disabled={!isLoggedIn}
          >
            <Text style={styles.profileName}>{childName}</Text>
            {isLoggedIn && (
              <Ionicons name="pencil-sharp" size={14} color={COLORS.textMedium} style={styles.editIcon} />
            )}
          </Pressable>
          <View style={styles.explorerTag}>
            <Text style={styles.explorerTagText}>Junior Explorer</Text>
          </View>
        </View>

        {/* Menu Items List */}
        <View style={styles.menuList}>
          <MenuItem
            icon="robot"
            iconType="mci"
            title="Robot Pet"
            subtitle="Robo Junior • Level 12"
            onPress={() => alert("Mengakses status robot pet")}
          />
          <MenuItem
            icon="shirt-outline"
            iconType="ionicons"
            title="Robot & Skin"
            subtitle="Kustomisasi tampilan robot"
            onPress={() => alert("Membuka lemari skin robot")}
          />
          <MenuItem
            icon="trophy-outline"
            iconType="ionicons"
            title="Achievement"
            badge="24/120"
            badgeColor={COLORS.brandGreen}
            onPress={() => alert("Membuka pencapaian")}
          />
          <MenuItem
            icon="card-outline"
            iconType="ionicons"
            title="Berlangganan"
            badge="Premium Aktif"
            badgeColor={COLORS.brandBlue}
            onPress={() => Linking.openURL("https://gambaran-robomind-nanti1.vercel.app/#berlangganan")}
          />
          <MenuItem
            icon="lock-closed-outline"
            iconType="ionicons"
            title="Parent Mode"
            subtitle="Dashboard orang tua & analitik"
            onPress={handleParentModeAccess}
          />
          <MenuItem
            icon="settings-outline"
            iconType="ionicons"
            title="Pengaturan"
            onPress={() => alert("Membuka pengaturan")}
          />
          <MenuItem
            icon="help-circle-outline"
            iconType="ionicons"
            title="Bantuan & FAQ"
            onPress={() => alert("Membuka pusat bantuan")}
          />
          <MenuItem
            icon="log-out-outline"
            iconType="ionicons"
            title="Keluar"
            subtitle="Keluar dari akun Anda"
            onPress={logout}
          />
        </View>

      </ScrollView>

      {/* Parent Passcode modal */}
      <Modal
        visible={passcodeVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPasscodeVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.lockIconCircle}>
              <Ionicons name="lock-closed" size={24} color={COLORS.brandOrange} />
            </View>
            
            <Text style={styles.modalTitle}>Parent Passcode Gate</Text>
            <Text style={styles.modalSubtitle}>
              Khusus Orang Tua. Masukkan PIN keamanan untuk mengakses analitik perkembangan anak.
            </Text>

            <TextInput
              secureTextEntry
              keyboardType="number-pad"
              maxLength={4}
              value={passcode}
              onChangeText={setPasscode}
              placeholder="Masukkan 4 digit PIN"
              placeholderTextColor={COLORS.textLight}
              style={styles.passcodeInput}
              onSubmitEditing={verifyPasscode}
            />

            {passcodeError ? (
              <Text style={styles.errorText}>{passcodeError}</Text>
            ) : (
              <Text style={styles.hintText}>Petunjuk: masukkan 1234 untuk demo</Text>
            )}

            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalBtn, styles.modalBtnSecondary]} 
                onPress={() => setPasscodeVisible(false)}
              >
                <Text style={styles.modalBtnTextSecondary}>Batal</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.modalBtn, styles.modalBtnPrimary]} 
                onPress={verifyPasscode}
              >
                <Text style={styles.modalBtnTextPrimary}>Masuk</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Ubah Nama Modal */}
      <Modal
        visible={nameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.lockIconCircle, { backgroundColor: "#F0FDF4", borderColor: "#DCFCE7" }]}>
              <Ionicons name="pencil" size={24} color={COLORS.brandGreen} />
            </View>
            
            <Text style={styles.modalTitle}>Ubah Nama Anak</Text>
            <Text style={styles.modalSubtitle}>
              Masukkan nama baru untuk mengubah panggilan anak di aplikasi.
            </Text>

            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Masukkan nama anak"
              placeholderTextColor={COLORS.textLight}
              style={[styles.passcodeInput, { letterSpacing: 0, textAlign: "left", paddingHorizontal: 12 }]}
              autoCapitalize="words"
              maxLength={20}
              onSubmitEditing={handleSaveName}
            />

            {nameError ? (
              <Text style={styles.errorText}>{nameError}</Text>
            ) : null}

            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalBtn, styles.modalBtnSecondary]} 
                onPress={() => setNameModalVisible(false)}
                disabled={isSavingName}
              >
                <Text style={styles.modalBtnTextSecondary}>Batal</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.modalBtn, styles.modalBtnPrimary, { backgroundColor: COLORS.brandGreen }]} 
                onPress={handleSaveName}
                disabled={isSavingName}
              >
                {isSavingName ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalBtnTextPrimary}>Simpan</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: Platform.OS === "ios" ? SPACING.xxl + 20 : SPACING.xxl,
  },
  profileHeaderCard: {
    alignItems: "center",
    backgroundColor: COLORS.cardWhite,
    borderRadius: SHAPES.radiusXl,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    paddingVertical: SPACING.xl + 4,
    marginBottom: SPACING.xl + 4,
    ...SHADOWS.medium,
  },
  avatarWrapper: {
    position: "relative",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: `${COLORS.brandGreen}30`,
    padding: 3,
    marginBottom: SPACING.md,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 45,
  },
  rankBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.brandOrange,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileName: {
    ...FONTS.heading,
    fontSize: 20,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  explorerTag: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: `${COLORS.brandGreen}20`,
    borderRadius: SHAPES.radiusRound,
    paddingVertical: 4,
    paddingHorizontal: SPACING.md,
  },
  explorerTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.brandGreen,
  },
  menuList: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: SHAPES.radiusLg,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    overflow: "hidden",
    ...SHADOWS.light,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuItemPressed: {
    backgroundColor: "#F8FAFC",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  menuIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.bgPrimary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  menuTitle: {
    ...FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.textDark,
  },
  menuSubtitle: {
    ...FONTS.caption,
    fontSize: 10,
    color: COLORS.textMedium,
    marginTop: 2,
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  menuBadge: {
    backgroundColor: COLORS.brandBlue,
    borderRadius: SHAPES.radiusSm,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  menuBadgeText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  
  // Modal PIN styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: COLORS.cardWhite,
    width: "100%",
    maxWidth: 320,
    borderRadius: SHAPES.radiusXl,
    padding: SPACING.xl + 4,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    ...SHADOWS.medium,
  },
  lockIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFEDD5",
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...FONTS.subheading,
    fontSize: 16,
    color: COLORS.textDark,
    textAlign: "center",
    marginBottom: 6,
  },
  modalSubtitle: {
    ...FONTS.bodyRegular,
    fontSize: 11,
    color: COLORS.textMedium,
    textAlign: "center",
    lineHeight: 15,
    marginBottom: SPACING.lg,
  },
  passcodeInput: {
    backgroundColor: COLORS.bgPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: SHAPES.radiusMd,
    width: "100%",
    height: 45,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textDark,
    letterSpacing: 8,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: 10,
    color: COLORS.error,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  hintText: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    gap: SPACING.md,
  },
  modalBtn: {
    flex: 1,
    height: 40,
    borderRadius: SHAPES.radiusRound,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBtnPrimary: {
    backgroundColor: COLORS.brandOrange,
  },
  modalBtnSecondary: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  modalBtnTextPrimary: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  modalBtnTextSecondary: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textMedium,
  },
  
  // Login Form Styles
  loginScrollContent: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: Platform.OS === "ios" ? SPACING.xxl + 40 : SPACING.xxl,
  },
  loginContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loginHeader: {
    alignItems: "center",
    marginBottom: SPACING.xl + 4,
    width: "100%",
  },
  loginLogoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${COLORS.brandGreen}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: `${COLORS.brandGreen}30`,
  },
  loginLogo: {
    width: 70,
    height: 70,
  },
  loginWelcomeText: {
    ...FONTS.caption,
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.brandOrange,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  loginTitleText: {
    ...FONTS.heading,
    fontSize: 24,
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  loginSubtitleText: {
    ...FONTS.bodyRegular,
    fontSize: 13,
    color: COLORS.textMedium,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: SPACING.lg,
  },
  loginCard: {
    backgroundColor: COLORS.cardWhite,
    borderRadius: SHAPES.radiusXl,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    padding: SPACING.xl,
    width: "100%",
    ...SHADOWS.medium,
    marginBottom: SPACING.xl,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
    width: "100%",
  },
  inputLabel: {
    ...FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.textDark,
    marginBottom: SPACING.xs + 2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bgPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: SHAPES.radiusMd,
    height: 48,
    paddingHorizontal: SPACING.md,
    position: "relative",
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: "500",
  },
  passwordToggle: {
    padding: SPACING.xs,
  },
  loginErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  loginErrorText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.error,
  },
  loginBtn: {
    backgroundColor: COLORS.brandOrange,
    borderRadius: SHAPES.radiusRound,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: SPACING.sm,
    ...SHADOWS.light,
  },
  loginBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  loginBtnDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  loginHintCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    borderRadius: SHAPES.radiusLg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    width: "100%",
  },
  loginHintText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "500",
    color: "#1E40AF",
    lineHeight: 15,
  },
  nameEditTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 2,
    alignSelf: "center",
  },
  editIcon: {
    opacity: 0.6,
    marginLeft: 4,
    marginBottom: 4,
  },
  editAvatarBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.brandGreen,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
