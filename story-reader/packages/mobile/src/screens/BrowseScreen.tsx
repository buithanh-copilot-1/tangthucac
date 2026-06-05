import { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, FlatList,
  TextInput, StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { mockStories, categories, translate, type TranslationKey } from '@story-reader/shared';
import { useStore } from '../store/useStore';
import type { Genre } from '@story-reader/shared';
import StoryCard from '../components/StoryCard';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type SortOption = 'hot' | 'recent' | 'rating' | 'views';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BrowseScreen() {
  const navigation = useNavigation<Nav>();
  const { readerSettings } = useStore();
  const t = (k: TranslationKey) => translate(readerSettings.language, k);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [sort, setSort] = useState<SortOption>('hot');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    let list = [...mockStories];
    if (selectedGenre) list = list.filter((s) => s.genre === selectedGenre);
    switch (sort) {
      case 'hot': list.sort((a, b) => (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0) || b.views - a.views); break;
      case 'recent': list.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      case 'views': list.sort((a, b) => b.views - a.views); break;
    }
    return list;
  }, [selectedGenre, sort]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('browse')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.iconBtn}>
          <Ionicons name="search" size={22} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Genre chips */}
      <View style={styles.genreBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreScroll}>
          <TouchableOpacity
            onPress={() => setSelectedGenre(null)}
            style={[styles.genreChip, !selectedGenre && styles.genreChipActive]}
          >
            <Text style={[styles.genreText, !selectedGenre && styles.genreTextActive]}>{t('allLabel')}</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedGenre(cat.id === selectedGenre ? null : cat.id)}
              style={[styles.genreChip, selectedGenre === cat.id && styles.genreChipActive]}
            >
              <Text>{cat.icon}</Text>
              <Text style={[styles.genreText, selectedGenre === cat.id && styles.genreTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort bar */}
      <View style={styles.sortBar}>
        <Text style={styles.countText}>{filtered.length} {t('storiesLabel')}</Text>
        <View style={styles.sortRow}>
          {(['hot', 'recent', 'rating', 'views'] as SortOption[]).map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSort(s)}
              style={[styles.sortChip, sort === s && styles.sortChipActive]}
            >
              <Text style={[styles.sortText, sort === s && styles.sortTextActive]}>
                {s === 'hot' ? t('hotLabel') : s === 'recent' ? t('sortNewest') : s === 'rating' ? t('sortRating') : t('viewsLabel')}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            style={styles.viewToggle}
          >
            <Ionicons name={viewMode === 'grid' ? 'list' : 'grid'} size={16} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stories */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
        {viewMode === 'grid' ? (
          <View style={styles.grid}>
            {filtered.map((story) => (
              <View key={story.id} style={styles.gridItem}>
                <StoryCard
                  story={story}
                  variant="grid"
                  onPress={() => navigation.navigate('StoryDetail', { id: story.id })}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.listView}>
            {filtered.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                variant="list"
                onPress={() => navigation.navigate('StoryDetail', { id: story.id })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  genreBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 10 },
  genreScroll: { paddingHorizontal: 16, gap: 8 },
  genreChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9' },
  genreChipActive: { backgroundColor: '#ef4444' },
  genreText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  genreTextActive: { color: '#fff' },
  sortBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  countText: { fontSize: 12, color: '#94a3b8' },
  sortRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  sortChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: '#f1f5f9' },
  sortChipActive: { backgroundColor: '#ef4444' },
  sortText: { fontSize: 11, color: '#64748b', fontWeight: '500' },
  sortTextActive: { color: '#fff' },
  viewToggle: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#f1f5f9' },
  listContainer: { padding: 16, paddingBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: (SCREEN_WIDTH - 32 - 24) / 3 },
  listView: { gap: 10 },
});
