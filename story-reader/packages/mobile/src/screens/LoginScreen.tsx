import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import type { AuthStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

// Google G mark (approximation without SVG lib)
function GoogleG() {
  return (
    <View style={g.wrap}>
      <Text style={[g.letter, { color: '#4285F4' }]}>G</Text>
      <Text style={[g.letter, { color: '#EA4335' }]}>o</Text>
      <Text style={[g.letter, { color: '#FBBC05' }]}>o</Text>
      <Text style={[g.letter, { color: '#4285F4' }]}>g</Text>
      <Text style={[g.letter, { color: '#34A853' }]}>l</Text>
      <Text style={[g.letter, { color: '#EA4335' }]}>e</Text>
    </View>
  );
}
const g = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center' },
  letter: { fontSize: 13, fontWeight: '700' },
});

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ← Hook dùng Google OAuth thật
  const googleAuth = useGoogleAuth(() => {
    // currentUser updated in store → navigator sẽ tự re-render
  });

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) setError(result.error ?? 'Đăng nhập thất bại');
  };

  const isBusy = loading || googleAuth.loading;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.logoBox}>
              <Ionicons name="book-outline" size={36} color="#fff" />
            </View>
            <Text style={styles.heroTitle}>Chào mừng trở lại</Text>
            <Text style={styles.heroSub}>Đăng nhập để tiếp tục đọc truyện</Text>
          </View>

          <View style={styles.card}>
            {/* Google button — real OAuth */}
            <TouchableOpacity
              onPress={googleAuth.handleGooglePress}
              disabled={!googleAuth.request || isBusy}
              style={[styles.googleBtn, (!googleAuth.request || isBusy) && { opacity: 0.6 }]}
            >
              {googleAuth.loading ? (
                <>
                  <ActivityIndicator size="small" color="#4285F4" />
                  <Text style={styles.googleBtnText}>Đang xử lý...</Text>
                </>
              ) : (
                <>
                  <GoogleG />
                  <Text style={styles.googleBtnText}>Tiếp tục với Google</Text>
                </>
              )}
            </TouchableOpacity>

            {!!googleAuth.error && (
              <View style={styles.errorBox}>
                <Ionicons name="warning-outline" size={14} color="#ef4444" />
                <Text style={styles.errorText}>{googleAuth.error}</Text>
              </View>
            )}

            {/* OR */}
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>hoặc đăng nhập bằng email</Text>
              <View style={styles.orLine} />
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={17} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>MẬT KHẨU</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={17} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 44 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(''); }}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPass((v) => !v)} style={styles.eyeBtn}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Email error */}
            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons name="warning-outline" size={14} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isBusy}
              style={[styles.submitBtn, isBusy && { opacity: 0.7 }]}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.submitText}>Đăng nhập</Text>
              }
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>chưa có tài khoản?</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity onPress={() => navigation.replace('Register')} style={styles.registerBtn}>
              <Text style={styles.registerText}>Đăng ký tài khoản mới</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.skipBtn}>
              <Text style={styles.skipText}>Tiếp tục không đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ef4444' },
  hero: { alignItems: 'center', paddingTop: 40, paddingBottom: 36, paddingHorizontal: 24 },
  logoBox: { width: 72, height: 72, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  heroTitle: { fontSize: 24, fontWeight: '700', color: '#fff' },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 6 },

  card: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 32 },

  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#dadce0', borderRadius: 14, paddingVertical: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  googleBtnText: { fontSize: 14, fontWeight: '500', color: '#3c4043' },

  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 18 },
  orLine: { flex: 1, height: 1, backgroundColor: '#f1f5f9' },
  orText: { fontSize: 11, color: '#94a3b8' },

  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.8, marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1.5, borderColor: '#e2e8f0' },
  inputIcon: { marginLeft: 14, marginRight: 4 },
  input: { flex: 1, paddingVertical: 13, paddingHorizontal: 10, fontSize: 14, color: '#1e293b' },
  eyeBtn: { padding: 12 },

  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef2f2', borderRadius: 12, padding: 12, marginBottom: 12 },
  errorText: { fontSize: 12, color: '#ef4444', flex: 1 },

  submitBtn: { backgroundColor: '#ef4444', borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 6 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#f1f5f9' },
  dividerText: { fontSize: 12, color: '#94a3b8' },

  registerBtn: { borderWidth: 2, borderColor: '#ef4444', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  registerText: { color: '#ef4444', fontSize: 14, fontWeight: '700' },

  skipBtn: { marginTop: 16, alignItems: 'center' },
  skipText: { fontSize: 12, color: '#94a3b8', textDecorationLine: 'underline' },
});
