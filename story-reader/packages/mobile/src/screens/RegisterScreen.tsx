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

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

interface FieldErrors { username?: string; email?: string; password?: string; confirm?: string }

function validate(u: string, e: string, p: string, c: string): FieldErrors {
  const errs: FieldErrors = {};
  if (!u.trim()) errs.username = 'Vui lòng nhập tên người dùng';
  else if (u.trim().length < 3) errs.username = 'Tên ít nhất 3 ký tự';
  else if (!/^[a-zA-Z0-9_]+$/.test(u.trim())) errs.username = 'Chỉ dùng chữ, số và _';
  if (!e.trim()) errs.email = 'Vui lòng nhập email';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())) errs.email = 'Email không hợp lệ';
  if (!p) errs.password = 'Vui lòng nhập mật khẩu';
  else if (p.length < 6) errs.password = 'Ít nhất 6 ký tự';
  if (!c) errs.confirm = 'Vui lòng xác nhận mật khẩu';
  else if (p !== c) errs.confirm = 'Mật khẩu không khớp';
  return errs;
}

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { register } = useStore();

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const googleAuth = useGoogleAuth(() => {
    // store updated, navigator re-renders
  });

  const change = (key: keyof typeof form) => (val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setFieldErrors((fe) => ({ ...fe, [key]: undefined }));
    setServerError('');
  };

  const handleRegister = async () => {
    const errs = validate(form.username, form.email, form.password, form.confirm);
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setLoading(true);
    const result = await register(form.username, form.email, form.password);
    setLoading(false);
    if (!result.success) setServerError(result.error ?? 'Đăng ký thất bại');
  };

  const strengthScore = (() => {
    const p = form.password;
    return [p.length >= 6, /[A-Z]/.test(p), /[0-9]/.test(p), /[^a-zA-Z0-9]/.test(p)].filter(Boolean).length;
  })();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.hero}>
            <View style={styles.logoBox}>
              <Ionicons name="person-add-outline" size={34} color="#fff" />
            </View>
            <Text style={styles.heroTitle}>Tạo tài khoản</Text>
            <Text style={styles.heroSub}>Đăng ký để lưu tiến độ đọc của bạn</Text>
          </View>

          <View style={styles.card}>
            {/* Google button — real OAuth */}
            <TouchableOpacity
              onPress={googleAuth.handleGooglePress}
              disabled={!googleAuth.request || loading || googleAuth.loading}
              style={[styles.googleBtn, (!googleAuth.request || loading || googleAuth.loading) && { opacity: 0.6 }]}
            >
              {googleAuth.loading ? (
                <>
                  <ActivityIndicator size="small" color="#4285F4" />
                  <Text style={styles.googleBtnText}>Đang xử lý...</Text>
                </>
              ) : (
                <>
                  <Text style={[styles.googleG, { color: '#4285F4' }]}>G</Text>
                  <Text style={styles.googleBtnText}>Đăng ký bằng Google</Text>
                </>
              )}
            </TouchableOpacity>

            {!!googleAuth.error && (
              <View style={styles.serverErrorBox}>
                <Text style={styles.serverErrorText}>{googleAuth.error}</Text>
              </View>
            )}

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>hoặc đăng ký bằng email</Text>
              <View style={styles.orLine} />
            </View>

            {/* Username */}
            <FormField label="TÊN NGƯỜI DÙNG" error={fieldErrors.username}>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={17} color="#94a3b8" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="vd: nguyen_van_a"
                  placeholderTextColor="#94a3b8"
                  value={form.username}
                  onChangeText={change('username')}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </FormField>

            {/* Email */}
            <FormField label="EMAIL" error={fieldErrors.email}>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={17} color="#94a3b8" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor="#94a3b8"
                  value={form.email}
                  onChangeText={change('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </FormField>

            {/* Password */}
            <FormField label="MẬT KHẨU" error={fieldErrors.password}>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={17} color="#94a3b8" style={styles.icon} />
                <TextInput
                  style={[styles.input, { paddingRight: 44 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={form.password}
                  onChangeText={change('password')}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPass((v) => !v)} style={styles.eyeBtn}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94a3b8" />
                </TouchableOpacity>
              </View>
              {!!form.password && (
                <View style={{ marginTop: 6 }}>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <View key={i} style={[styles.strengthBar, i <= strengthScore && strengthBarColor(strengthScore)]} />
                    ))}
                  </View>
                </View>
              )}
            </FormField>

            {/* Confirm */}
            <FormField label="XÁC NHẬN MẬT KHẨU" error={fieldErrors.confirm}>
              <View style={styles.inputWrap}>
                <Ionicons
                  name={form.confirm && form.confirm === form.password ? 'checkmark-circle-outline' : 'lock-closed-outline'}
                  size={17}
                  color={form.confirm && form.confirm === form.password ? '#22c55e' : '#94a3b8'}
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={form.confirm}
                  onChangeText={change('confirm')}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
              </View>
            </FormField>

            {/* Server error */}
            {!!serverError && (
              <View style={styles.errorBox}>
                <Ionicons name="warning-outline" size={14} color="#ef4444" />
                <Text style={styles.errorText}>{serverError}</Text>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.submitText}>Đăng ký</Text>
              }
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.switchText}>
              Đã có tài khoản?{' '}
              <Text onPress={() => navigation.replace('Login')} style={styles.switchLink}>
                Đăng nhập
              </Text>
            </Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.skipBtn}>
              <Text style={styles.skipText}>Tiếp tục không đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

function strengthBarColor(score: number) {
  if (score <= 1) return { backgroundColor: '#f87171' };
  if (score === 2) return { backgroundColor: '#facc15' };
  if (score === 3) return { backgroundColor: '#60a5fa' };
  return { backgroundColor: '#4ade80' };
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {!!error && <Text style={{ fontSize: 11, color: '#ef4444', marginTop: 4, marginLeft: 4 }}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#dadce0', borderRadius: 12, paddingVertical: 12, marginBottom: 4 },
  googleG: { fontSize: 16, fontWeight: '700', color: '#4285F4', width: 20, textAlign: 'center' },
  googleBtnText: { fontSize: 14, fontWeight: '500', color: '#3c4043' },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 14 },
  orLine: { flex: 1, height: 1, backgroundColor: '#f1f5f9' },
  orText: { fontSize: 11, color: '#94a3b8' },
  serverErrorBox: { backgroundColor: '#fef2f2', borderRadius: 10, padding: 10, marginTop: 6 },
  serverErrorText: { fontSize: 12, color: '#ef4444' },
  safe: { flex: 1, backgroundColor: '#ef4444' },
  hero: { alignItems: 'center', paddingTop: 32, paddingBottom: 32, paddingHorizontal: 24 },
  logoBox: { width: 72, height: 72, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  heroTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 5 },
  card: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 28 },
  label: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.8, marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1.5, borderColor: '#e2e8f0' },
  icon: { marginLeft: 14, marginRight: 4 },
  input: { flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 14, color: '#1e293b' },
  eyeBtn: { padding: 12 },
  strengthBar: { flex: 1, height: 4, backgroundColor: '#f1f5f9', borderRadius: 4 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef2f2', borderRadius: 12, padding: 12, marginBottom: 10 },
  errorText: { fontSize: 12, color: '#ef4444', flex: 1 },
  submitBtn: { backgroundColor: '#ef4444', borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#f1f5f9' },
  dividerText: { fontSize: 12, color: '#94a3b8' },
  switchText: { textAlign: 'center', fontSize: 14, color: '#64748b' },
  switchLink: { color: '#ef4444', fontWeight: '700' },
  skipBtn: { marginTop: 14, alignItems: 'center' },
  skipText: { fontSize: 12, color: '#94a3b8', textDecorationLine: 'underline' },
});
