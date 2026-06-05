import { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { mockStories, categories } from '@story-reader/shared';
import { useStore } from '../store/useStore';
import StoryCard from '../components/StoryCard';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const hotSearches = ['Tiên hiệp', 'Đấu phá', 'Kim Dung', 'Ngôn tình', 'Trọng sinh', 'Tam Thể'];

export default function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const { recentSearches, addRecentSearch, clearRecentSearches } = useStore();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return mockStories.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.author.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [query, submitted]);

  const handleSearch = (q: string) => {
    setQuery(q);
    setSubmitted(true);
    Keyboard.dismiss();
    if (q.trim()) addRecentSearch(q.trim());
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#64748b" />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <Ionicons name="search" size={16} color="#94a3b8" />
          <TextInput
            autoFocus
            value={query}
            onChangeText={(t) => { setQuery(t); setSubmitted(false); }}
            onSubmitEditing={() => handleSearch(query)}
            placeholder="Tìm truyện, tác giả..."
            style={styles.input}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setSubmitted(false); }}>
              <Ionicons name="close-circle" size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => handleSearch(query)}>
          <Text style={styles.searchBtn}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {!submitted ? (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <View style={styles.suggestContainer}>
              {recentSearches.length > 0 && (
                <View style={styles.suggestSection}>
                  <View style={styles.suggestHeader}>
                    <View style={styles.suggestTitleRow}>
                      <Ionicons name="time-outline" size={14} color="#94a3b8" />
                      <Text style={styles.suggestTitle}>Gần đây</Text>
                    </View>
                    <TouchableOpacity onPress={clearRecentSearches}>
                      <Text style={styles.clearText}>Xóa</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.chips}>
                    {recentSearches.map((q) => (
                      <TouchableOpacity key={q} onPress={() => handleSearch(q)} style={styles.chip}>
                        <Text style={styles.chipText}>{q}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.suggestSection}>
                <View style={styles.suggestTitleRow}>
                  <Ionicons name="trending-up" size={14} color="#ef4444" />
                  <Text style={styles.suggestTitle}>Nổi bật</Text>
                </View>
                <View style={styles.chips}>
                  {hotSearches.map((q, i) => (
                    <TouchableOpacity key={q} onPress={() => handleSearch(q)} style={styles.chip}>
                      <Text style={[styles.chipRank, i < 3 && styles.chipRankHot]}>{i + 1}</Text>
                      <Text style={styles.chipText}>{q}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.suggestSection}>
                <Text style={[styles.suggestTitle, { marginBottom: 12 }]}>Theo thể loại</Text>
                <View style={styles.categoryGrid}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={styles.catItem}
                      onPress={() => handleSearch(cat.name)}
                    >
                      <Text style={styles.catIcon}>{cat.icon}</Text>
                      <Text style={styles.catName}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          }
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.results}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListHeaderComponent={
            <Text style={styles.resultCount}>{results.length} kết quả cho "{query}"</Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
            </View>
          }
          renderItem={({ item }) => (
            <StoryCard
              story={item}
              variant="list"
              onPress={() => navigation.navigate('StoryDetail', { id: item.id })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  input: { flex: 1, fontSize: 14, color: '#1e293b', padding: 0 },
  searchBtn: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
  suggestContainer: { padding: 16 },
  suggestSection: { marginBottom: 20 },
  suggestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  suggestTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  suggestTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  clearText: { fontSize: 12, color: '#ef4444' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  chipRank: { fontSize: 11, fontWeight: '700', color: '#94a3b8' },
  chipRankHot: { color: '#ef4444' },
  chipText: { fontSize: 13, color: '#475569' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catItem: { width: '22%', alignItems: 'center', gap: 4, padding: 10, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  catIcon: { fontSize: 22 },
  catName: { fontSize: 10, color: '#64748b', textAlign: 'center' },
  results: { padding: 16, paddingBottom: 24 },
  resultCount: { fontSize: 12, color: '#94a3b8', marginBottom: 12 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, color: '#94a3b8' },
});
