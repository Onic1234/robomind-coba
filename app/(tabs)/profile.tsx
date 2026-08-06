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
            <Ionicons name={icon as any} size={18} color="#0B84FF" />
          ) : iconType === "material" ? (
            <Ionicons name={icon as any} size={18} color="#0B84FF" />
          ) : (
            <MaterialCommunityIcons name={icon as any} size={18} color="#0B84FF" />
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
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
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
        <StatusBar barStyle="dark-content" backgroundColor="#F3FAFF" />
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
                  <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan username atau email"
                    placeholderTextColor="#94A3B8"
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
                  <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan kata sandi"
                    placeholderTextColor="#94A3B8"
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
                      color="#64748B"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Error Message */}
              {loginError ? (
                <View style={styles.loginErrorContainer}>
                  <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
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
              <Ionicons name="information-circle-outline" size={18} color="#0B84FF" />
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
      <StatusBar barStyle="dark-content" backgroundColor="#F3FAFF" />

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
              <View style={[styles.avatarImage, { justifyContent: "center", alignItems: "center", backgroundColor: "rgba(11, 132, 255, 0.1)" }]}>
                <ActivityIndicator size="small" color="#0B84FF" />
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
              <Ionicons name="pencil-sharp" size={14} color="#0B84FF" style={styles.editIcon} />
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
            badgeColor="#00C3A0"
            onPress={() => alert("Membuka pencapaian")}
          />
          <MenuItem
            icon="card-outline"
            iconType="ionicons"
            title="Berlangganan"
            badge="Premium Aktif"
            badgeColor="#0B84FF"
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
              <Ionicons name="lock-closed" size={24} color="#FF9F0A" />
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
              placeholder="Masukkan PIN"
              placeholderTextColor="#94A3B8"
              style={styles.passcodeInput}
              onSubmitEditing={verifyPasscode}
            />

            {passcodeError ? (
              <Text style={styles.errorText}>{passcodeError}</Text>
            ) : (
              <Text style={styles.hintText}>Hint: masukkan 1234 untuk demo</Text>
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
            <View style={[styles.lockIconCircle, { backgroundColor: "rgba(0, 195, 160, 0.1)", borderColor: "rgba(0, 195, 160, 0.2)" }]}>
              <Ionicons name="pencil" size={24} color="#00C3A0" />
            </View>
            
            <Text style={styles.modalTitle}>Ubah Nama Anak</Text>
            <Text style={styles.modalSubtitle}>
              Masukkan nama baru untuk mengubah panggilan anak di aplikasi.
            </Text>

            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Masukkan nama anak"
              placeholderTextColor="#94A3B8"
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
                style={[styles.modalBtn, styles.modalBtnPrimary, { backgroundColor: "#00C3A0" }]} 
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
    backgroundColor: "#F3FAFF",
  },
  scrollContent: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: Platform.OS === "ios" ? SPACING.xxl + 40 : SPACING.xxl + 20,
  },
  profileHeaderCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: SHAPES.radiusXl,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: SPACING.xl + 4,
    marginBottom: SPACING.xl,
    ...SHADOWS.light,
  },
  avatarWrapper: {
    position: "relative",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#0B84FF",
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
    backgroundColor: "#0B84FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1F2937",
    marginBottom: 4,
  },
  explorerTag: {
    backgroundColor: "rgba(11, 132, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(11, 132, 255, 0.2)",
    borderRadius: SHAPES.radiusRound,
    paddingVertical: 4,
    paddingHorizontal: SPACING.md,
  },
  explorerTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0B84FF",
  },
  menuList: {
    backgroundColor: "#FFFFFF",
    borderRadius: SHAPES.radiusLg,
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
    borderBottomColor: "#F1F5F9",
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
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
  },
  menuSubtitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  menuBadge: {
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
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    maxWidth: 320,
    borderRadius: SHAPES.radiusXl,
    padding: SPACING.xl + 4,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    ...SHADOWS.medium,
  },
  lockIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 159, 10, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 159, 10, 0.2)",
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 15,
    marginBottom: SPACING.lg,
  },
  passcodeInput: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: SHAPES.radiusMd,
    width: "100%",
    height: 45,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: 8,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: 10,
    color: "#EF4444",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  hintText: {
    fontSize: 10,
    color: "#64748B",
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
    backgroundColor: "#FF9F0A",
  },
  modalBtnSecondary: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
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
    color: "#4B5563",
  },
  
  // Login Form Styles
  loginScrollContent: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: Platform.OS === "ios" ? SPACING.xxl + 40 : SPACING.xxl + 20,
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
    backgroundColor: "rgba(11, 132, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: "#0B84FF",
  },
  loginLogo: {
    width: 70,
    height: 70,
  },
  loginWelcomeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0B84FF",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  loginTitleText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1F2937",
    marginBottom: SPACING.sm,
  },
  loginSubtitleText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: SPACING.lg,
  },
  loginCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: SHAPES.radiusXl,
    width: "100%",
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: SHAPES.radiusMd,
    height: 48,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#1F2937",
    fontSize: 13,
    fontWeight: "600",
  },
  passwordToggle: {
    padding: 4,
  },
  loginErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: SHAPES.radiusMd,
    padding: 10,
    marginBottom: SPACING.lg,
    gap: 8,
  },
  loginErrorText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#EF4444",
    flex: 1,
  },
  loginBtn: {
    backgroundColor: "#0B84FF",
    height: 48,
    borderRadius: SHAPES.radiusRound,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "#0062C4",
  },
  loginBtnPressed: {
    opacity: 0.9,
  },
  loginBtnDisabled: {
    opacity: 0.5,
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  loginHintCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: SHAPES.radiusLg,
    padding: SPACING.md,
    width: "100%",
    gap: 10,
  },
  loginHintText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#1E3A8A",
    flex: 1,
    lineHeight: 15,
  },
  nameEditTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  editIcon: {
    marginTop: 2,
  },
  editAvatarBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#0B84FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
