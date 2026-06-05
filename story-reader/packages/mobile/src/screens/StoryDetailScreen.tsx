import { useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, Share, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, RouteProp } from '@react-navigation/native-stack';
import { mockStories, categories, getChapters, formatNumber, formatDate, statusLabel } from '@story-reader/shared';
import type { ShelfStatus } from '@story-reader/shared';
import { useStore } from '../store/useStore';
import type { RootStackParamList } from '../navigation/AppNavigator';

const SHELF_OPTIONS: { status: ShelfStatus; label: string; icon: string; color: string }[] = [
  { status: 'reading',      label: 'Đang đọc',  icon: 'book-outline',             color: '#3b82f6' },
  { status: 'completed',    label: 'Đã đọc',    icon: 'checkmark-circle-outline', color: '#22c55e' },
  { status: 'want_to_read', label: 'Muốn đọc',  icon: 'bookmark-outline',         color: '#8b5cf6' },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'StoryDetail'>;

export default function StoryDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { id } = route.params;
  const { isBookmarked, addBookmark, removeBookmark, getProgress, getShelfEntry, addToShelf, updateShelfStatus, removeFromShelf } = useStore();
  const [descExpanded, setDescExpanded] = useState(false);
  const [showShelfModal, setShowShelfModal] = useState(false);

  const story = mockStories.find((s) => s.id === id);
  if (!story) return null;

  const chapters = getChapters(story.id);
  const bookmarked = isBookmarked(story.id);
  const progress = getProgress(story.id);
  const category = categories.find((c) => c.id === story.genre);
  const shelfEntry = getShelfEntry(story.id);
  const currentShelfOpt = SHELF_OPTIONS.find((o) => o.status === shelfEntry?.status);
  const readPct = progress ? Math.min(100, Math.round((progress.chapterNumber / story.totalChapters) * 100)) : 0;

  const handleShelfSelect = (status: ShelfStatus) => {
    if (shelfEntry) {
      shelfEntry.status === status ? removeFromShelf(story.id) : updateShelfStatus(story.id, status);
    } else {
      addToShelf(story.id, status);
    }
    setShowShelfModal(false);
  };

  const startReading = () => {
    const chNum = progress?.chapterNumber ?? 1;
    navigation.navigate('Chapter', { id: story.id, chapterNum: chNum });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{story.title}</Text>
        <TouchableOpacity
          onPress={() => Share.share({ message: `${story.title} - ${story.author}` })}
          style={styles.iconBtn}
        >
          <Ionicons name="share-outline" size={22} color="#475569" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover hero */}
        <View style={{ height: 180 }}>
          <Image source={{ uri: story.cover }} style={styles.heroCover} resizeMode="cover" />
          <View style={styles.heroOverlay} />
        </View>

        <View style={styles.content}>
          {/* Cover + Info */}
          <View style={styles.infoRow}>
            <Image source={{ uri: story.cover }} style={styles.smallCover} resizeMode="cover" />
            <View style={styles.infoText}>
              <Text style={styles.title}>{story.title}</Text>
              <Text style={styles.author}>{story.author}</Text>
              {category && (
                <View style={[styles.genreBadge, { backgroundColor: category.color }]}>
                  <Text style={styles.genreText}>{category.icon} {category.name}</Text>
                </View>
              )}
              <View style={[styles.statusBadge]}>
                <Text style={styles.statusText}>{statusLabel(story.status)}</Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statVal}>
                <Ionicons name="star" size={14} color="#facc15" />
                <Text style={styles.statNum}>{story.rating.toFixed(1)}</Text>
              </View>
              <Text style={styles.statLabel}>{formatNumber(story.ratingCount)} đánh giá</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statVal}>
                <Ionicons name="book-outline" size={14} color="#3b82f6" />
                <Text style={styles.statNum}>{formatNumber(story.totalChapters)}</Text>
              </View>
              <Text style={styles.statLabel}>Chương</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statVal}>
                <Ionicons name="eye-outline" size={14} color="#10b981" />
                <Text style={styles.statNum}>{formatNumber(story.views)}</Text>
              </View>
              <Text style={styles.statLabel}>Lượt đọc</Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tags}>
            {story.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <View style={styles.descSection}>
            <Text style={styles.desc} numberOfLines={descExpanded ? undefined : 3}>
              {story.description}
            </Text>
            <TouchableOpacity onPress={() => setDescExpanded((v) => !v)} style={styles.descToggle}>
              <Ionicons name={descExpanded ? 'chevron-up' : 'chevron-down'} size={14} color="#ef4444" />
              <Text style={styles.descToggleText}>{descExpanded ? 'Thu gọn' : 'Xem thêm'}</Text>
            </TouchableOpacity>
          </View>

          {/* Reading progress (if started) */}
          {progress && (
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Tiến độ đọc</Text>
                <Text style={styles.progressValue}>C.{progress.chapterNumber}/{formatNumber(story.totalChapters)} · {readPct}%</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${readPct}%` as any }]} />
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={startReading} style={styles.readBtn}>
              <Ionicons name="book-outline" size={17} color="#fff" />
              <Text style={styles.readBtnText}>
                {progress ? `Đọc tiếp C.${progress.chapterNumber}` : 'Đọc từ đầu'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => bookmarked ? removeBookmark(story.id) : addBookmark(story.id)}
              style={[styles.iconCircle, bookmarked && styles.iconCircleActive]}
            >
              <Ionicons name={bookmarked ? 'heart' : 'heart-outline'} size={20} color={bookmarked ? '#ef4444' : '#94a3b8'} />
            </TouchableOpacity>
          </View>

          {/* Shelf / Tủ truyện */}
          <TouchableOpacity onPress={() => setShowShelfModal(true)} style={styles.shelfBtn}>
            <View style={[styles.shelfIcon, { backgroundColor: currentShelfOpt ? `${currentShelfOpt.color}20` : '#f1f5f9' }]}>
              <Ionicons
                name={(currentShelfOpt?.icon ?? 'add-outline') as any}
                size={18}
                color={currentShelfOpt?.color ?? '#94a3b8'}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.shelfBtnTitle}>
                {currentShelfOpt ? currentShelfOpt.label : 'Thêm vào tủ truyện'}
              </Text>
              <Text style={styles.shelfBtnDesc}>
                {currentShelfOpt ? 'Nhấn để thay đổi' : 'Đang đọc · Đã đọc · Muốn đọc'}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={16} color="#94a3b8" />
          </TouchableOpacity>

          {/* Chapter list */}
          <View style={styles.chapterSection}>
            <Text style={styles.chapterTitle}>Danh sách chương ({chapters.length})</Text>
            {chapters.map((ch) => {
              const isCurrent = progress?.chapterNumber === ch.number;
              return (
                <TouchableOpacity
                  key={ch.id}
                  onPress={() => navigation.navigate('Chapter', { id: story.id, chapterNum: ch.number })}
                  style={[styles.chapterItem, isCurrent && styles.chapterItemActive]}
                >
                  <View style={styles.chapterInfo}>
                    <Text style={[styles.chapterName, isCurrent && styles.chapterNameActive]} numberOfLines={1}>
                      Chương {ch.number}: {ch.title}
                    </Text>
                    <Text style={styles.chapterDate}>{formatDate(ch.publishedAt)}</Text>
                  </View>
                  {isCurrent && <Text style={styles.readingLabel}>Đang đọc</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Shelf Modal */}
      <Modal visible={showShelfModal} transparent animationType="slide" onRequestClose={() => setShowShelfModal(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowShelfModal(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Tủ truyện</Text>
          {SHELF_OPTIONS.map((opt) => {
            const isActive = shelfEntry?.status === opt.status;
            return (
              <TouchableOpacity
                key={opt.status}
                onPress={() => handleShelfSelect(opt.status)}
                style={[styles.modalOption, isActive && styles.modalOptionActive]}
              >
                <View style={[styles.modalOptIcon, { backgroundColor: `${opt.color}15` }]}>
                  <Ionicons name={opt.icon as any} size={20} color={opt.color} />
                </View>
                <Text style={styles.modalOptLabel}>{opt.label}</Text>
                {isActive && <Ionicons name="checkmark-circle" size={20} color={opt.color} />}
              </TouchableOpacity>
            );
          })}
          {shelfEntry && (
            <>
              <View style={styles.modalDivider} />
              <TouchableOpacity onPress={() => { removeFromShelf(story.id); setShowShelfModal(false); }} style={styles.modalRemove}>
                <Ionicons name="close-circle-outline" size={18} color="#ef4444" />
                <Text style={styles.modalRemoveText}>Xóa khỏi tủ truyện</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '600', color: '#1e293b', marginHorizontal: 8 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  heroCover: { width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(248,250,252,0.3)' },
  content: { padding: 16, marginTop: -16 },
  infoRow: { flexDirection: 'row', gap: 14 },
  smallCover: { width: 90, height: 130, borderRadius: 12, marginTop: -50, borderWidth: 2, borderColor: '#fff' },
  infoText: { flex: 1, paddingTop: 4 },
  title: { fontSize: 16, fontWeight: '700', color: '#1e293b', lineHeight: 22 },
  author: { fontSize: 13, color: '#64748b', marginTop: 2 },
  genreBadge: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  genreText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  statusBadge: { alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, backgroundColor: '#dcfce7' },
  statusText: { color: '#16a34a', fontSize: 11, fontWeight: '500' },

  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 16, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  statItem: { alignItems: 'center', gap: 2 },
  statVal: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statNum: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  statLabel: { fontSize: 10, color: '#94a3b8' },
  statDivider: { width: 1, height: 32, backgroundColor: '#f1f5f9' },

  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#f1f5f9', borderRadius: 20 },
  tagText: { fontSize: 11, color: '#64748b' },

  descSection: { marginTop: 14 },
  desc: { fontSize: 13, color: '#475569', lineHeight: 20 },
  descToggle: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  descToggleText: { color: '#ef4444', fontSize: 12, fontWeight: '500' },

  progressCard: { backgroundColor: '#fff', borderRadius: 14, padding: 12, marginTop: 14, borderWidth: 1, borderColor: '#f1f5f9' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12, fontWeight: '600', color: '#475569' },
  progressValue: { fontSize: 12, fontWeight: '600', color: '#ef4444' },
  progressBg: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#ef4444', borderRadius: 4 },

  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  readBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#ef4444', borderRadius: 25, paddingVertical: 14 },
  readBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  iconCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  iconCircleActive: { borderColor: '#fecaca', backgroundColor: '#fff1f2' },

  shelfBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, backgroundColor: '#f8fafc', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#f1f5f9' },
  shelfIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  shelfBtnTitle: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  shelfBtnDesc: { fontSize: 11, color: '#94a3b8', marginTop: 1 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 36, paddingTop: 12 },
  modalHandle: { width: 36, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  modalOption: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 4, borderRadius: 12 },
  modalOptionActive: { backgroundColor: '#f8fafc' },
  modalOptIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  modalOptLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#1e293b' },
  modalDivider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 8 },
  modalRemove: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 4 },
  modalRemoveText: { fontSize: 14, color: '#ef4444', fontWeight: '500' },

  chapterSection: { marginTop: 24 },
  chapterTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  chapterItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#f1f5f9' },
  chapterItemActive: { backgroundColor: '#fff1f2', borderColor: '#fecaca' },
  chapterInfo: { flex: 1 },
  chapterName: { fontSize: 13, fontWeight: '500', color: '#1e293b' },
  chapterNameActive: { color: '#ef4444' },
  chapterDate: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  readingLabel: { fontSize: 11, color: '#ef4444', fontWeight: '600' },
});
