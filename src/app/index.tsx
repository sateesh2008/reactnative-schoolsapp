import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email.trim()) {
      Alert.alert("Validation", "Please enter your email address.");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Validation", "Please enter your password.");
      return;
    }

    Alert.alert("Login", `Login request submitted for ${email}`);

    // Later we will connect your FastAPI login API here.
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password",
      "Password reset functionality will be available here.",
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Heading */}
          <Text style={styles.title}>Welcome to EduCampus360 ERP</Text>

          <Text style={styles.subtitle}>
            Transforming education through smart technology.
          </Text>

          <Text style={styles.description}>
            Login to explore your personalized dashboard.
          </Text>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={21}
                color="#666"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={21}
                color="#666"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />

              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotContainer}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotText}>FORGOT PASSWORD?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Sign in to Account</Text>

            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>

          {/* Support */}
          <View style={styles.supportContainer}>
            <Text style={styles.supportText}>For Support Queries:</Text>

            <TouchableOpacity>
              <Text style={styles.supportLink}>supportsmartschoolserp.com</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FF",
  },

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingVertical: 30,
    justifyContent: "center",
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 15,
  },

  logo: {
    width: 150,
    height: 150,
  },

  title: {
    fontSize: 25,
    fontWeight: "700",
    color: "#29235C",
    textAlign: "center",
    marginTop: 5,
  },

  subtitle: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
  },

  description: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 30,
  },

  inputGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },

  inputContainer: {
    height: 52,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#222",
  },

  forgotContainer: {
    alignItems: "flex-end",
    marginTop: 2,
    marginBottom: 22,
  },

  forgotText: {
    color: "#4B2AAD",
    fontSize: 13,
    fontWeight: "700",
  },

  loginButton: {
    height: 52,
    backgroundColor: "#4B2AAD",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  supportContainer: {
    alignItems: "center",
    marginTop: 35,
  },

  supportText: {
    fontSize: 13,
    color: "#777",
    marginBottom: 5,
  },

  supportLink: {
    fontSize: 14,
    color: "#4B2AAD",
    fontWeight: "600",
  },
});
