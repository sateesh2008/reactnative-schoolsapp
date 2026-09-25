import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { isApiConfigured } from "../services/api";
import { login } from "../services/authApi";
import { AppColors as colors } from "../constants/theme";

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setMessage("Enter your email address and password.");
      return;
    }

    if (!isApiConfigured) {
      setMessage("The login service is not configured.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const payload = await login(trimmedEmail, password);
      const result = payload?.data || payload;
      const user = result?.user || result?.profile || {};
      const token =
        result?.token ||
        result?.access_token ||
        result?.accessToken ||
        payload?.token ||
        payload?.access_token ||
        payload?.accessToken;
      const teacherId =
        user?.id ||
        user?.teacher_id ||
        user?.teacherId ||
        user?.staff_id ||
        user?.staffId ||
        user?.employee_id ||
        user?.employeeId ||
        result?.id ||
        result?.teacher_id ||
        result?.staff_id;
      const roleValue =
        result?.role || user.role || user.user_type || user.userType;
      const role = String(roleValue || "").toLowerCase();
      const normalizedRole = role.includes("teacher")
        ? "Teacher"
        : role.includes("parent")
          ? "Parent"
          : role.includes("admin")
            ? "School Admin"
            : "";

      if (!normalizedRole) {
        setMessage("The login response did not include a valid user role.");
        return;
      }

      if (normalizedRole === "School Admin") {
        setMessage("Admin portal is not included in this demo.");
        return;
      }

      if (!token) {
        setMessage(
          "Login succeeded, but the server did not return an access token.",
        );
        return;
      }

      onLogin({
        role: normalizedRole,
        email: result?.email || user.email || trimmedEmail,
        token,
        id: teacherId,
        name: user.name || user.full_name || user.fullName,
        schoolName: user.tenant?.name || user.school?.name || user.school_name,
        academicYearId:
          result?.academic_year_id ||
          result?.academicYearId ||
          user?.academic_year_id ||
          user?.academicYearId ||
          user?.tenant?.current_academic_year_id,
      });
    } catch (error) {
      setMessage(error?.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.brandHeader}>
              <View style={styles.brandMark}>
                <Image
                  source={require("../../assets/logo.png")}
                  resizeMode="contain"
                  style={styles.logo}
                />
              </View>
              <View style={styles.brandCopy}>
                <Text style={styles.title}>Welcome to</Text>
                <View style={styles.appNameRow}>
                  <Text
                    style={styles.appName}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    EduCampus360 ERP
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={19} color={colors.muted} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email address"
                  placeholderTextColor="#9AA7B7"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>

              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons
                  name="lock-closed-outline"
                  size={19}
                  color={colors.muted}
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#9AA7B7"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                />
                <Pressable onPress={() => setShowPassword((value) => !value)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.muted}
                  />
                </Pressable>
              </View>

              {message ? <Text style={styles.error}>{message}</Text> : null}
              <Pressable
                style={styles.forgotButton}
                onPress={() =>
                  setMessage("Password recovery is not included in this demo.")
                }
              >
                <Text style={styles.forgotText}>FORGOT PASSWORD?</Text>
              </Pressable>
              <Pressable
                onPress={handleLogin}
                disabled={loading}
                style={({ pressed }) => [
                  styles.button,
                  (pressed || loading) && styles.pressed,
                ]}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Signing in..." : "Sign in to Account"}
                </Text>
                {!loading ? (
                  <Ionicons name="arrow-forward" size={19} color={colors.white} />
                ) : null}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 24, justifyContent: "center" },
  brandHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  brandMark: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  logo: { width: 72, height: 72 },
  brandCopy: { flex: 1, minWidth: 0 },
  title: { color: colors.ink, fontSize: 31, fontWeight: "900", marginTop: 7 },
  appName: {
    color: colors.blue,
    fontSize: 25,
    fontWeight: "900",
    flexShrink: 1,
  },
  appNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    marginTop: 4,
    marginBottom: 28,
  },
  form: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
  },
  label: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 7,
    marginTop: 3,
  },
  inputWrap: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 9,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 17,
  },
  input: { flex: 1, color: colors.ink, fontSize: 14 },
  button: {
    backgroundColor: colors.blue,
    minHeight: 50,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
    marginTop: 4,
  },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: "800" },
  forgotButton: { alignSelf: "flex-end", marginBottom: 14 },
  forgotText: { color: colors.blue, fontSize: 11, fontWeight: "900" },
  pressed: { opacity: 0.75 },
  error: {
    color: colors.red,
    fontSize: 12,
    fontWeight: "700",
    marginTop: -5,
    marginBottom: 12,
  },
});
