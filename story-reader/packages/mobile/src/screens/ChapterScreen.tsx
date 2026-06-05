import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, RouteProp } from '@react-navigation/native-stack';
import { mockStories, getChapter, getChapters } from '@story-reader/shared';
import { useStore } from '../store/useStore';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Chapter'>;

const FONT_SIZES = { sm: 13, md: 15, lg: 17, xl: 19 };
const LINE_HEIGHTS = { normal: 22, relaxed: 26, loose: 32 };
const THEMES = {
  light: { bg: '#fff', text: '#1e293b', header: '#fff', headerBorder: '#f1f5f9', sub: '#64748b' },
  sepia: { bg: '#fdf6e3', text: '#3d2b1f', header: '#fdf0d0', headerBorder: '#e8d5b5', sub: '#78614a' },
  dark: { bg: '#1e293b', text: '#e2e8f0', header: '#0f172a', headerBorder: '#334155', sub: '#64748b' },
};

export default function ChapterScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { id, chapterNum } = route.params;
  const { readerSettings, updateProgress, getShelfEntry, addToShelf, updateShelfStatus } = useStore();
  const [showUI, setShowUI] = useState(true);
  const [showCompletedBanner, setShowCompletedBanner] = useState(false);

  const story = mockStories.find((s) => s.id === id);
  const chapter = story ? getChapter(story.id, chapterNum) : undefined;
  const allChapters = story ? getChapters(story.id) : [];
  const hasPrev = chapterNum > 1;
  const hasNext = chapterNum < allChapters.length;
  const theme = THEMES[readerSettings.theme];

  useEffect(() => {
    if (!story || !chapter) return;

    updateProgress({
      storyId: story.id,
      chapterId: chapter.id,
      chapterNumber: chapter.number,
      scrollPosition: 0,
      lastRead: new Date().toISOString(),
    });

    // Auto-thêm vào tủ "Đang đọc" nếu chưa có
    const entry = getShelfEntry(story.id);
    if (!entry) addToShelf(story.id, 'reading');

    // Gợi ý đánh dấu hoàn thành nếu đọc đến chương cuối
    if (chapter.number === allChapters.length && entry?.status !== 'completed') {
      setShowCompletedBanner(true);
      const t = setTimeout(() => setShowCompletedBanner(false), 7000);
      return () => clearTimeout(t);
    }
  }, [story?.id, chapter?.id]);

  const goChapter = (num: number) => {
    navigation.replace('Chapter', { id: id, chapterNum: num });
  };

  if (!story || !chapter) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar hidden={!showUI} />

      {/* Top bar */}
      {showUI && (
        <SafeAreaView edges={['top']} style={{ backgroundColor: theme.header }}>
          <View style={[styles.topBar, { backgroundColor: theme.header, borderBottomColor: theme.headerBorder }]}>
            <TouchableOpacity
              onPress={() => navigation.navigate('StoryDetail', { id: story.id })}
              style={styles.iconBtn}
            >
              <Ionicons name="chevron-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <View style={styles.topCenter}>
              <Text style={[styles.topTitle, { color: theme.text }]} numberOfLines={1}>{story.title}</Text>
              <Text style={[styles.topSub, { color: theme.sub }]}>Chương {chapter.number}: {chapter.title}</Text>
            </View>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="settings-outline" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.headerBorder }]}>
            <View
              style={[styles.progress, { width: `${(chapterNum / allChapters.length) * 100}%` }]}
            />
          </View>
        </SafeAreaView>
      )}

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        onScrollBeginDrag={() => setShowUI(false)}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => setShowUI((v) => !v)}>
          <Text style={[styles.chapterTitle, { color: theme.text }]}>
            Chương {chapter.number}: {chapter.title}
          </Text>
          <Text
            style={[
              styles.content,
              {
                color: theme.text,
                fontSize: FONT_SIZES[readerSettings.fontSize],
                lineHeight: LINE_HEIGHTS[readerSettings.lineHeight],
                fontFamily: readerSettings.fontFamily === 'serif' ? 'Georgia' : undefined,
              },
            ]}
          >
            {chapter.content}
          </Text>
          <View style={styles.wordCount}>
            <Ionicons name="document-text-outline" size={13} color={theme.sub} />
            <Text style={[styles.wordCountText, { color: theme.sub }]}>{chapter.wordCount.toLocaleString()} từ</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Toast: đọc xong chương cuối */}
      {showCompletedBanner && story && (
        <View style={styles.completedToast}>
          <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
          <View style={{ flex: 1 }}>
            <Text style={styles.toastTitle}>Bạn đã đọc đến chương cuối!</Text>
            <Text style={styles.toastDesc}>Đánh dấu truyện này là đã đọc xong?</Text>
          </View>
          <TouchableOpacity
            onPress={() => { updateShelfStatus(story.id, 'completed'); setShowCompletedBanner(false); }}
            style={styles.toastBtn}
          >
            <Text style={styles.toastBtnText}>Đánh dấu</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowCompletedBanner(false)} style={{ padding: 4 }}>
            <Ionicons name="close" size={16} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom nav */}
      {showUI && (
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: theme.header }}>
          <View style={[styles.bottomBar, { backgroundColor: theme.header, borderTopColor: theme.headerBorder }]}>
            <TouchableOpacity
              onPress={() => hasPrev && goChapter(chapterNum - 1)}
              style={[styles.navBtn, !hasPrev && styles.navBtnDisabled]}
            >
              <Ionicons name="chevron-back" size={16} color={hasPrev ? '#fff' : '#94a3b8'} />
              <Text style={[styles.navBtnText, !hasPrev && { color: '#94a3b8' }]}>Trước</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('StoryDetail', { id: story.id })}
            >
              <Text style={[styles.chapterCount, { color: theme.sub }]}>{chapterNum}/{allChapters.length}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => hasNext && goChapter(chapterNum + 1)}
              style={[styles.navBtn, !hasNext && styles.navBtnDisabled]}
            >
              <Text style={[styles.navBtnText, !hasNext && { color: '#94a3b8' }]}>Tiếp</Text>
              <Ionicons name="chevron-forward" size={16} color={hasNext ? '#fff' : '#94a3b8'} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle: { fontSize: 13, fontWeight: '600' },
  topSub: { fontSize: 10, marginTop: 1 },
  progressBar: { height: 2 },
  progress: { height: '100%', backgroundColor: '#ef4444' },
  scrollContent: { padding: 20, paddingTop: 24 },
  chapterTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
  content: { lineHeight: 26 },
  wordCount: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center', marginTop: 32, marginBottom: 16 },
  wordCountText: { fontSize: 12 },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1 },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  navBtnDisabled: { backgroundColor: '#f1f5f9' },
  navBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  chapterCount: { fontSize: 13, fontWeight: '500' },

  completedToast: { position: 'absolute', bottom: 90, left: 16, right: 16, backgroundColor: '#1e293b', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 50 },
  toastTitle: { color: '#fff', fontSize: 13, fontWeight: '600' },
  toastDesc: { color: '#94a3b8', fontSize: 11, marginTop: 1 },
  toastBtn: { backgroundColor: '#22c55e', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  toastBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
