import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { languages, readerThemes, translate, type TranslationKey } from '@story-reader/shared';
import { useStore } from '../store/useStore';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const {
    currentUser, logout, updateProfile,
    readerSettings, updateReaderSettings,
    clearHistory, clearRecentSearches,
    bookmarks, shelf,
  } = useStore();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser?.username ?? '');
  const t = (key: TranslationKey) => translate(readerSettings.language, key);

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed.length < 3) {
      Alert.alert(t('errorTitle'), t('usernameTooShort'));
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      Alert.alert(t('errorTitle'), t('usernameInvalid'));
      return;
    }
    updateProfile({ username: trimmed });
    setEditingName(false);
  };

  const handleLogout = () => {
    Alert.alert(t('confirmLogoutTitle'), t('confirmLogoutMessage'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logout'), style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert(t('confirmDeleteDataTitle'), t('confirmDeleteDataMessage'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => { clearHistory(); clearRecentSearches(); } },
    ]);
  };

  const displayName = currentUser?.displayName ?? currentUser?.username ?? '';
  const initials = displayName.slice(0, 2).toUpperCase();
  const COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f97316', '#ec4899'];
  const colorIdx = currentUser ? currentUser.id.charCodeAt(currentUser.id.length - 1) % COLORS.length : 0;
  const hasGooglePhoto = currentUser?.avatar?.startsWith('http');
  const joinedDate = currentUser
    ? new Date(currentUser.joinedAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' })
    : '';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settingsTitle')}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.content}>

          {/* Profile / Login CTA */}
          {currentUser ? (
            <View style={styles.profileCard}>
              {/* Avatar + info */}
              <View style={styles.profileTop}>
                {/* Avatar: ảnh Google hoặc initials */}
                <View style={{ position: 'relative', flexShrink: 0 }}>
                  {hasGooglePhoto ? (
                    <Image source={{ uri: currentUser!.avatar }} style={styles.avatarImg} />
                  ) : (
                    <View style={[styles.avatar, { backgroundColor: COLORS[colorIdx] }]}>
                      <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                  )}
                  {currentUser!.provider === 'google' && (
                    <View style={styles.providerBadge}>
                      <Text style={styles.providerBadgeText}>G</Text>
                    </View>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  {editingName ? (
                    <View style={styles.editRow}>
                      <TextInput
                        autoFocus
                        value={nameInput}
                        onChangeText={setNameInput}
                        style={styles.nameInput}
                        onSubmitEditing={handleSaveName}
                      />
                      <TouchableOpacity onPress={handleSaveName} style={styles.editConfirmBtn}>
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { setEditingName(false); setNameInput(currentUser.username); }} style={styles.editCancelBtn}>
                        <Ionicons name="close" size={14} color="#64748b" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => { setEditingName(true); setNameInput(currentUser.username); }} style={styles.nameRow}>
                      <Text style={styles.username} numberOfLines={1}>
                        {currentUser.displayName ?? currentUser.username}
                      </Text>
                      <Ionicons name="pencil-outline" size={13} color="#94a3b8" />
                    </TouchableOpacity>
                  )}
                  {currentUser.displayName && currentUser.displayName !== currentUser.username && (
                    <Text style={styles.usernameSmall}>@{currentUser.username}</Text>
                  )}
                  <Text style={styles.email} numberOfLines={1}>{currentUser.email}</Text>
                  {currentUser.provider === 'google' ? (
                    <View style={styles.googleBadge}>
                      <Text style={styles.googleBadgeText}>G  {t('googleInfo')}</Text>
                    </View>
                  ) : (
                    <View style={styles.emailBadge}>
                      <Text style={styles.emailBadgeText}>📧  {t('email')}</Text>
                    </View>
                  )}
                  <Text style={styles.joined}>{t('joined')} {joinedDate}</Text>
                </View>
              </View>

              {/* Google profile detail */}
                  {currentUser.provider === 'google' && (
                <View style={styles.googleCard}>
                  <View style={styles.googleCardHeader}>
                    <Text style={styles.googleCardHeaderText}>G  {t('googleInfo')}</Text>
                    {currentUser.emailVerified && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={10} color="#22c55e" />
                        <Text style={styles.verifiedText}>{t('verified')}</Text>
                      </View>
                    )}
                  </View>
                  {[
                    { label: t('fullName'), value: currentUser.displayName },
                    { label: t('familyName'),        value: currentUser.familyName },
                    { label: t('givenName'),       value: currentUser.givenName },
                    { label: t('email'),     value: currentUser.email },
                    { label: t('googleId'), value: currentUser.googleId },
                  ].filter(r => r.value).map(({ label, value }, i, arr) => (
                    <View key={label} style={[styles.googleRow, i < arr.length - 1 && styles.googleRowBorder]}>
                      <Text style={styles.googleRowLabel}>{label}</Text>
                      <Text style={styles.googleRowValue} numberOfLines={1}>{value}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Stats */}
              <View style={styles.statsRow}>
                {[
                  { label: t('favorites'), value: bookmarks.length, color: '#ef4444' },
                  { label: t('reading'), value: shelf.filter((e) => e.status === 'reading').length, color: '#3b82f6' },
                  { label: t('completed'), value: shelf.filter((e) => e.status === 'completed').length, color: '#22c55e' },
                ].map(({ label, value, color }, i, arr) => (
                  <View key={label} style={[styles.statItem, i < arr.length - 1 && styles.statBorder]}>
                    <Text style={[styles.statNum, { color }]}>{value}</Text>
                    <Text style={styles.statLabel}>{label}</Text>
                  </View>
                ))}
              </View>

              {/* Logout */}
              <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                <Ionicons name="log-out-outline" size={17} color="#ef4444" />
                <Text style={styles.logoutText}>{t('logout')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.loginCta}>
                <Text style={styles.ctaTitle}>{t('notLoggedIn')}</Text>
                <Text style={styles.ctaDesc}>{t('loginPrompt')}</Text>
              <View style={styles.ctaBtns}>
                <TouchableOpacity
                  onPress={() => (navigation as any).navigate('Auth')}
                  style={styles.ctaLoginBtn}
                >
                    <Text style={styles.ctaLoginText}>{t('login')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => (navigation as any).navigate('Auth')}
                  style={styles.ctaRegisterBtn}
                >
                    <Text style={styles.ctaRegisterText}>{t('register')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Reading settings */}
          <Text style={styles.sectionLabel}>{t('readerSettings')}</Text>
          <View style={styles.card}>
            {/* Font size */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                  <Ionicons name="text" size={18} color="#3b82f6" />
                </View>
                <Text style={styles.rowLabel}>{t('fontSize')}</Text>
              </View>
              <View style={styles.segmented}>
                {(['sm', 'md', 'lg', 'xl'] as const).map((fs) => (
                  <TouchableOpacity
                    key={fs}
                    onPress={() => updateReaderSettings({ fontSize: fs })}
                    style={[styles.seg, readerSettings.fontSize === fs && styles.segActive]}
                  >
                    <Text style={[styles.segText, readerSettings.fontSize === fs && styles.segTextActive]}>
                      {fs === 'sm' ? 'S' : fs === 'md' ? 'M' : fs === 'lg' ? 'L' : 'XL'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Theme */}
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#fefce8' }]}>
                  <Ionicons name={readerSettings.theme === 'dark' ? 'moon' : 'sunny'} size={18} color="#eab308" />
                </View>
                <Text style={styles.rowLabel}>{t('background')}</Text>
              </View>
              <View style={styles.segmented}>
                {readerThemes.map((theme) => (
                  <TouchableOpacity
                    key={theme.value}
                    onPress={() => updateReaderSettings({ theme: theme.value })}
                    style={[styles.seg, readerSettings.theme === theme.value && styles.segActive]}
                  >
                    <View style={[styles.themeDot, { backgroundColor: theme.swatch }]} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Data */}
          <Text style={styles.sectionLabel}>{t('data')}</Text>
          <View style={styles.card}>
            <TouchableOpacity onPress={clearHistory} style={styles.menuItem}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#fff7ed' }]}>
                  <Ionicons name="time-outline" size={18} color="#f97316" />
                </View>
                <Text style={styles.rowLabel}>{t('clearReadingHistory')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity onPress={handleClearAll} style={styles.menuItem}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#fff1f2' }]}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </View>
                <Text style={[styles.rowLabel, { color: '#ef4444' }]}>{t('clearAllData')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
            </TouchableOpacity>
          </View>

          {/* About */}
          <Text style={styles.sectionLabel}>{t('other')}</Text>
          <View style={styles.card}>
            <View style={styles.menuItem}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#f5f3ff' }]}>
                  <Ionicons name="globe-outline" size={18} color="#8b5cf6" />
                </View>
                <Text style={styles.rowLabel}>{t('language')}</Text>
              </View>
              <View style={styles.segmented}>
                {languages.map((language) => (
                  <TouchableOpacity
                    key={language.value}
                    onPress={() => updateReaderSettings({ language: language.value })}
                    style={[styles.seg, readerSettings.language === language.value && styles.segActive]}
                  >
                    <Text style={[styles.segText, readerSettings.language === language.value && styles.segTextActive]}>
                      {language.shortLabel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.menuItem}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                  <Ionicons name="information-circle-outline" size={18} color="#22c55e" />
                </View>
                <Text style={styles.rowLabel}>{t('version')}</Text>
              </View>
              <Text style={styles.valueText}>1.0.0</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
  content: { padding: 16, gap: 8 },

  profileCard: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 8 },
  profileTop: { flexDirection: 'row', gap: 14, padding: 16, alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  username: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  email: { fontSize: 12, color: '#64748b', marginTop: 2 },
  joined: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nameInput: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1e293b', borderBottomWidth: 2, borderBottomColor: '#ef4444', paddingVertical: 2 },
  editConfirmBtn: { width: 28, height: 28, backgroundColor: '#ef4444', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  editCancelBtn: { width: 28, height: 28, backgroundColor: '#f1f5f9', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f8fafc' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statBorder: { borderRightWidth: 1, borderRightColor: '#f8fafc' },
  statNum: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  avatarImg: { width: 60, height: 60, borderRadius: 18 },
  providerBadge: { position: 'absolute', bottom: -4, right: -4, width: 20, height: 20, backgroundColor: '#fff', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  providerBadgeText: { fontSize: 11, fontWeight: '700', color: '#4285F4' },
  usernameSmall: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  providerRow: { flexDirection: 'row', marginTop: 4 },
  googleBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  googleBadgeText: { fontSize: 10, fontWeight: '600', color: '#4285F4' },
  emailBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  emailBadgeText: { fontSize: 10, fontWeight: '500', color: '#64748b' },
  googleCard: { marginHorizontal: 14, marginBottom: 12, backgroundColor: '#f0f4ff', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#dde6ff' },
  googleCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#dde6ff' },
  googleCardHeaderText: { fontSize: 11, fontWeight: '700', color: '#4285F4' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#f0fdf4', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
  verifiedText: { fontSize: 9, fontWeight: '600', color: '#22c55e' },
  googleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 9 },
  googleRowBorder: { borderBottomWidth: 1, borderBottomColor: '#dde6ff' },
  googleRowLabel: { fontSize: 11, color: '#64748b', width: 72 },
  googleRowValue: { fontSize: 11, fontWeight: '600', color: '#1e293b', flex: 1, textAlign: 'right' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderTopWidth: 1, borderTopColor: '#f8fafc' },
  logoutText: { fontSize: 14, color: '#ef4444', fontWeight: '500' },

  loginCta: { backgroundColor: '#fef2f2', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#fecaca', marginBottom: 8 },
  ctaTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  ctaDesc: { fontSize: 12, color: '#64748b', lineHeight: 18, marginBottom: 14 },
  ctaBtns: { flexDirection: 'row', gap: 10 },
  ctaLoginBtn: { flex: 1, backgroundColor: '#ef4444', borderRadius: 12, paddingVertical: 11, alignItems: 'center' },
  ctaLoginText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  ctaRegisterBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 11, alignItems: 'center', borderWidth: 1.5, borderColor: '#fca5a5' },
  ctaRegisterText: { color: '#ef4444', fontSize: 14, fontWeight: '600' },

  sectionLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.8, marginTop: 10, marginBottom: 6, paddingHorizontal: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 14, fontWeight: '500', color: '#1e293b' },
  valueText: { fontSize: 13, color: '#94a3b8' },
  divider: { height: 1, backgroundColor: '#f8fafc', marginHorizontal: 14 },
  segmented: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 4, maxWidth: 220 },
  seg: { width: 32, height: 32, borderRadius: 8, borderWidth: 1.5, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  segActive: { borderColor: '#ef4444', backgroundColor: '#fff1f2' },
  segText: { fontSize: 11, fontWeight: '700', color: '#94a3b8' },
  segTextActive: { color: '#ef4444' },
  themeDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(15, 23, 42, 0.18)' },
});
