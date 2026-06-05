import { useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, Image,
  StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { mockStories, formatDate, formatNumber, translate, type TranslationKey } from '@story-reader/shared';
import { useStore } from '../store/useStore';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Tab = 'reading' | 'completed' | 'favorites';
const { width: W } = Dimensions.get('window');

// TABS will be created inside the component so translations are available

export default function LibraryScreen() {
  const navigation = useNavigation<Nav>();
  const [activeTab, setActiveTab] = useState<Tab>('reading');
  const { bookmarks, shelf, removeBookmark, removeFromShelf, updateShelfStatus, getProgress, readerSettings } = useStore();
  const t = (k: TranslationKey) => translate(readerSettings.language, k);

  const TABS: { id: Tab; label: string; icon: string; activeIcon: string; emptyIcon?: string; emptyMsg?: string; emptyDesc?: string }[] = [
    { id: 'reading', label: t('reading'), icon: 'book-outline', activeIcon: 'book', emptyIcon: '📖', emptyMsg: t('emptyReadingMsg'), emptyDesc: t('emptyReadingDesc') },
    { id: 'completed', label: t('completed'), icon: 'checkmark-circle-outline', activeIcon: 'checkmark-circle', emptyIcon: '✅', emptyMsg: t('emptyCompletedMsg'), emptyDesc: t('emptyCompletedDesc') },
    { id: 'favorites', label: t('favorites'), icon: 'heart-outline', activeIcon: 'heart', emptyIcon: '❤️', emptyMsg: t('emptyFavoritesMsg'), emptyDesc: t('emptyFavoritesDesc') },
  ];

  const readingEntries = shelf
    .filter((e) => e.status === 'reading')
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));

  const completedEntries = shelf
    .filter((e) => e.status === 'completed')
    .sort((a, b) => (b.completedAt ?? b.lastUpdated).localeCompare(a.completedAt ?? a.lastUpdated));

  const favoriteStories = mockStories.filter((s) => bookmarks.includes(s.id));

  const counts = { reading: readingEntries.length, completed: completedEntries.length, favorites: favoriteStories.length };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('libraryTitle')}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(({ id, label, icon, activeIcon }) => {
          const isActive = activeTab === id;
          return (
            <TouchableOpacity key={id} onPress={() => setActiveTab(id)} style={styles.tab}>
              <Ionicons name={(isActive ? activeIcon : icon) as any} size={20} color={isActive ? '#ef4444' : '#94a3b8'} />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{label}</Text>
              {counts[id] > 0 && (
                <View style={[styles.badge, isActive && styles.badgeActive]}>
                  <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>{counts[id]}</Text>
                </View>
              )}
              {isActive && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Đang đọc */}
      {activeTab === 'reading' && (
        readingEntries.length === 0
          ? <EmptyState icon="book-outline" msg={TABS[0].emptyMsg!} desc={TABS[0].emptyDesc!} />
          : <FlatList
              data={readingEntries}
              keyExtractor={(e) => e.storyId}
              contentContainerStyle={styles.listPad}
              renderItem={({ item: entry }) => {
                const story = mockStories.find((s) => s.id === entry.storyId);
                if (!story) return null;
                const progress = getProgress(story.id);
                const pct = progress ? Math.min(100, Math.round((progress.chapterNumber / story.totalChapters) * 100)) : 0;

                return (
                  <View style={styles.readingCard}>
                    <View style={styles.readingCardTop}>
                      <Image source={{ uri: story.cover }} style={styles.readingCover} resizeMode="cover" />
                      <View style={styles.readingInfo}>
                        <Text style={styles.readingTitle} numberOfLines={1}>{story.title}</Text>
                        <Text style={styles.readingAuthor}>{story.author}</Text>
                        {progress ? (
                          <View style={styles.chapterRow}>
                            <Ionicons name="book-outline" size={12} color="#ef4444" />
                            <Text style={styles.chapterText}>{t('chapter')} {progress.chapterNumber}</Text>
                            <Text style={styles.chapterTotal}>/ {formatNumber(story.totalChapters)} {t('chaptersLabel')}</Text>
                          </View>
                        ) : (
                          <Text style={styles.noProgress}>{t('notStarted')}</Text>
                        )}
                        <View style={styles.progressSection}>
                          <View style={styles.progressRow}>
                            <Text style={styles.pctText}>{pct}%</Text>
                            <Text style={styles.dateText}>{formatDate(entry.lastUpdated)}</Text>
                          </View>
                          <View style={styles.progressBg}>
                            <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.readingActions}>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('Chapter', { id: story.id, chapterNum: progress?.chapterNumber ?? 1 })}
                        style={styles.actionBtn}
                      >
                        <Ionicons name="book-outline" size={14} color="#ef4444" />
                        <Text style={styles.actionBtnText}>{progress ? t('continueReading') : t('startReading')}</Text>
                      </TouchableOpacity>
                      <View style={styles.actionDivider} />
                      <TouchableOpacity
                        onPress={() => updateShelfStatus(story.id, 'completed')}
                        style={styles.actionBtn}
                      >
                        <Ionicons name="checkmark-circle-outline" size={14} color="#22c55e" />
                        <Text style={[styles.actionBtnText, { color: '#22c55e' }]}>{t('markCompleted')}</Text>
                      </TouchableOpacity>
                      <View style={styles.actionDivider} />
                      <TouchableOpacity
                        onPress={() => navigation.navigate('StoryDetail', { id: story.id })}
                        style={{ paddingHorizontal: 12, justifyContent: 'center' }}
                      >
                        <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
      )}

      {/* Đã đọc */}
      {activeTab === 'completed' && (
        completedEntries.length === 0
          ? <EmptyState icon="checkmark-circle-outline" msg={TABS[1].emptyMsg!} desc={TABS[1].emptyDesc!} />
          : <FlatList
              data={completedEntries}
              keyExtractor={(e) => e.storyId}
              contentContainerStyle={styles.listPad}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              renderItem={({ item: entry }) => {
                const story = mockStories.find((s) => s.id === entry.storyId);
                if (!story) return null;
                return (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('StoryDetail', { id: story.id })}
                    style={styles.completedCard}
                  >
                    <View style={styles.coverWrap}>
                      <Image source={{ uri: story.cover }} style={styles.completedCover} resizeMode="cover" />
                      <View style={styles.completedBadge}>
                        <Ionicons name="checkmark" size={10} color="#fff" />
                      </View>
                    </View>
                    <View style={styles.completedInfo}>
                      <Text style={styles.readingTitle} numberOfLines={1}>{story.title}</Text>
                      <Text style={styles.readingAuthor}>{story.author}</Text>
                      <Text style={styles.chapterTotal}>{formatNumber(story.totalChapters)} {t('chaptersLabel')}</Text>
                      {entry.completedAt && (
                          <Text style={styles.dateText}>{t('doneAt')} {formatDate(entry.completedAt)}</Text>
                      )}
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                        <TouchableOpacity
                          onPress={() => updateShelfStatus(story.id, 'reading')}
                          style={styles.miniBtn}
                        >
                          <Text style={[styles.miniBtnText, { color: '#3b82f6' }]}>{t('readAgain')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => removeFromShelf(story.id)}
                          style={styles.miniBtn}
                        >
                          <Text style={styles.miniBtnText}>{t('delete')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
      )}

      {/* Yêu thích */}
      {activeTab === 'favorites' && (
        favoriteStories.length === 0
          ? <EmptyState icon="heart-outline" msg={TABS[2].emptyMsg!} desc={TABS[2].emptyDesc!} />
          : <FlatList
              data={favoriteStories}
              keyExtractor={(s) => s.id}
              numColumns={3}
              contentContainerStyle={styles.gridPad}
              columnWrapperStyle={styles.gridRow}
              renderItem={({ item: story }) => {
                const entry = shelf.find((e) => e.storyId === story.id);
                return (
                  <View style={styles.favItem}>
                    <TouchableOpacity onPress={() => navigation.navigate('StoryDetail', { id: story.id })}>
                      <Image source={{ uri: story.cover }} style={styles.favCover} resizeMode="cover" />
                      <Text style={styles.favTitle} numberOfLines={2}>{story.title}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeBookmark(story.id)}
                      style={styles.removeFavBtn}
                    >
                      <Ionicons name="trash-outline" size={10} color="#fff" />
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
      )}
    </SafeAreaView>
  );
}

function EmptyState({ icon, msg, desc }: { icon: string; msg: string; desc: string }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon as any} size={56} color="#e2e8f0" />
      <Text style={styles.emptyTitle}>{msg}</Text>
      <Text style={styles.emptyDesc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b' },

  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 2, position: 'relative' },
  tabLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
  tabLabelActive: { color: '#ef4444' },
  badge: { position: 'absolute', top: 6, right: 12, backgroundColor: '#f1f5f9', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 10 },
  badgeActive: { backgroundColor: '#fef2f2' },
  badgeText: { fontSize: 9, fontWeight: '700', color: '#94a3b8' },
  badgeTextActive: { color: '#ef4444' },
  tabIndicator: { position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 2, backgroundColor: '#ef4444', borderRadius: 2 },

  listPad: { padding: 16, gap: 12 },

  readingCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' },
  readingCardTop: { flexDirection: 'row', gap: 12, padding: 12 },
  readingCover: { width: 64, height: 90, borderRadius: 10, flexShrink: 0 },
  readingInfo: { flex: 1 },
  readingTitle: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  readingAuthor: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  chapterRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  chapterText: { fontSize: 12, color: '#ef4444', fontWeight: '600' },
  chapterTotal: { fontSize: 11, color: '#94a3b8' },
  noProgress: { fontSize: 11, color: '#94a3b8', marginTop: 6 },
  progressSection: { marginTop: 8 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  pctText: { fontSize: 10, color: '#64748b', fontWeight: '600' },
  dateText: { fontSize: 10, color: '#94a3b8' },
  progressBg: { height: 4, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#ef4444', borderRadius: 4 },
  readingActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f8fafc' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10 },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: '#ef4444' },
  actionDivider: { width: 1, backgroundColor: '#f8fafc' },

  completedCard: { flexDirection: 'row', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 12 },
  coverWrap: { position: 'relative', flexShrink: 0 },
  completedCover: { width: 56, height: 78, borderRadius: 8 },
  completedBadge: { position: 'absolute', bottom: -4, right: -4, width: 18, height: 18, backgroundColor: '#22c55e', borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  completedInfo: { flex: 1 },
  miniBtn: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#f1f5f9', borderRadius: 20 },
  miniBtnText: { fontSize: 11, color: '#64748b', fontWeight: '500' },

  gridPad: { padding: 16 },
  gridRow: { gap: 12, marginBottom: 12 },
  favItem: { width: (W - 56) / 3, position: 'relative' },
  favCover: { width: '100%', aspectRatio: 3 / 4, borderRadius: 10 },
  favTitle: { fontSize: 10, fontWeight: '600', color: '#1e293b', marginTop: 5, lineHeight: 14 },
  removeFavBtn: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: '#94a3b8' },
  emptyDesc: { fontSize: 12, color: '#cbd5e1', textAlign: 'center' },
});
