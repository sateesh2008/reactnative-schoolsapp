import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const accounts = [
  { role: 'School Admin', email: 'India2026@gmail.com', password: 'India@2026' },
  { role: 'Parent', email: 'joshi@gmail.com', password: '9087654321' },
  { role: 'Teacher', email: 'sudarsan@gmail.com', password: '9876543212' },
];

const colors = {
  navy: '#183B67',
  blue: '#2574D8',
  ink: '#13233A',
  muted: '#718096',
  line: '#DDE5EF',
  canvas: '#F7F9FC',
  white: '#FFFFFF',
  paleBlue: '#EAF3FF',
  red: '#C84D52',
};

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = () => {
    const account = accounts.find(
      (item) => item.email.toLowerCase() === email.trim().toLowerCase(),
    );

    if (!account || account.password !== password) {
      setMessage('Invalid login ID or password.');
      return;
    }

    if (account.role === 'School Admin') {
      setMessage('Admin portal is not included in this demo.');
      return;
    }

    setMessage('');
    onLogin(account.role);
  };

  const fillAccount = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setMessage('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandMark}>
            <Ionicons name="school" size={28} color={colors.white} />
          </View>
          <Text style={styles.kicker}>DEMO SCHOOL</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to access your school account.</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Login ID</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={19} color={colors.muted} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your login ID"
                placeholderTextColor="#9AA7B7"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={19} color={colors.muted} />
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
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.muted}
                />
              </Pressable>
            </View>

            {message ? <Text style={styles.error}>{message}</Text> : null}
            <Pressable
              onPress={handleLogin}
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            >
              <Text style={styles.buttonText}>Sign in</Text>
              <Ionicons name="arrow-forward" size={19} color={colors.white} />
            </Pressable>
          </View>

          <View style={styles.demoBox}>
            <View style={styles.demoHeader}>
              <Ionicons name="information-circle-outline" size={18} color={colors.blue} />
              <Text style={styles.demoTitle}>Demo Login IDs</Text>
            </View>
            <Text style={styles.demoHint}>Tap an account to fill the login form.</Text>
            {accounts.map((account) => (
              <Pressable
                key={account.role}
                onPress={() => fillAccount(account)}
                style={styles.accountRow}
              >
                <View style={styles.accountText}>
                  <Text style={styles.accountRole}>{account.role}</Text>
                  <Text style={styles.accountEmail}>{account.email}</Text>
                </View>
                <Ionicons
                  name="arrow-forward-circle-outline"
                  size={19}
                  color={colors.blue}
                />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  brandMark: { width: 58, height: 58, borderRadius: 17, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  kicker: { color: colors.blue, fontSize: 11, fontWeight: '900', letterSpacing: 1.8 },
  title: { color: colors.ink, fontSize: 31, fontWeight: '900', marginTop: 7 },
  subtitle: { color: colors.muted, fontSize: 14, marginTop: 7, marginBottom: 28 },
  form: { backgroundColor: colors.white, borderRadius: 14, borderWidth: 1, borderColor: colors.line, padding: 18 },
  label: { color: colors.ink, fontSize: 12, fontWeight: '800', marginBottom: 7, marginTop: 3 },
  inputWrap: { minHeight: 50, borderWidth: 1, borderColor: colors.line, borderRadius: 9, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 17 },
  input: { flex: 1, color: colors.ink, fontSize: 14 },
  button: { backgroundColor: colors.blue, minHeight: 50, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, marginTop: 4 },
  buttonText: { color: colors.white, fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.75 },
  error: { color: colors.red, fontSize: 12, fontWeight: '700', marginTop: -5, marginBottom: 12 },
  demoBox: { backgroundColor: colors.paleBlue, borderRadius: 12, padding: 15, marginTop: 16 },
  demoHeader: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  demoTitle: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  demoHint: { color: colors.muted, fontSize: 11, marginTop: 5, marginBottom: 9 },
  accountRow: { backgroundColor: colors.white, borderRadius: 9, padding: 11, flexDirection: 'row', alignItems: 'center', marginTop: 7 },
  accountText: { flex: 1 },
  accountRole: { color: colors.blue, fontSize: 11, fontWeight: '900' },
  accountEmail: { color: colors.ink, fontSize: 12, fontWeight: '700', marginTop: 2 },
});
