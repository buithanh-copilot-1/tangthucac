import { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  FlatList, StyleSheet, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { mockStories, categories, formatNumber, translate, type TranslationKey } from '@story-reader/shared';
import { useStore } from '../store/useStore';
import StoryCard from '../components/StoryCard';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const featured = mockStories.filter((s) => s.isFeatured);
const hotStories = mockStories.filter((s) => s.isHot);
const recentStories = [...mockStories].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)).slice(0, 12);
const suggestions = mockStories.filter((_, i) => i % 3 === 0).slice(0, 9);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { readerSettings } = useStore();
  const t = (k: TranslationKey) => translate(readerSettings.language, k);
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setBannerIndex((i) => (i + 1) % featured.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const banner = featured[bannerIndex];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>T</Text>
          </View>
          <Text style={styles.logoName}>TruyệnHay</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.iconBtn}>
            <Ionicons name="search" size={22} color="#475569" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color="#475569" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.banner}>
          <Image source={{ uri: banner.cover }} style={styles.bannerImg} resizeMode="cover" />
          <View style={styles.bannerOverlay} />
          <View style={styles.bannerContent}>
              <View style={styles.featuredRow}>
                <Ionicons name="trending-up" size={12} color="#f87171" />
                <Text style={styles.featuredLabel}>{t('featuredLabel')}</Text>
              </View>
            <Text style={styles.bannerTitle} numberOfLines={1}>{banner.title}</Text>
              <Text style={styles.bannerSub}>{banner.author} · {formatNumber(banner.views)} {t('viewsLabel')}</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('StoryDetail', { id: banner.id })}
              style={styles.readBtn}
            >
              <Ionicons name="book-outline" size={14} color="#fff" />
                <Text style={styles.readBtnText}>{t('readNow')}</Text>
            </TouchableOpacity>
          </View>
          {/* Dots */}
          <View style={styles.dots}>
            {featured.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setBannerIndex(i)}
                style={[styles.dot, i === bannerIndex ? styles.dotActive : {}]}
              />
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('categoriesTitle')}</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>{t('loadMore')}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(c) => c.id}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.catChip}
                onPress={() => (navigation as any).navigate('Browse', { genre: item.id })}
              >
                <Text style={styles.catIcon}>{item.icon}</Text>
                <Text style={styles.catName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Hot stories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 {t('hotLabel')}</Text>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={hotStories}
            keyExtractor={(s) => s.id}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item }) => (
              <StoryCard
                story={item}
                variant="horizontal"
                onPress={() => navigation.navigate('StoryDetail', { id: item.id })}
              />
            )}
          />
        </View>

        {/* Recently updated */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🆕 {t('recentlyUpdated')}</Text>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={recentStories}
            keyExtractor={(s) => s.id}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item }) => (
              <StoryCard
                story={item}
                variant="horizontal"
                onPress={() => navigation.navigate('StoryDetail', { id: item.id })}
              />
            )}
          />
        </View>

        {/* Grid suggestions */}
        <View style={[styles.section, { paddingBottom: 16 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✨ {t('suggestionsLabel')}</Text>
          </View>
          <View style={styles.grid}>
            {suggestions.map((story) => (
              <View key={story.id} style={styles.gridItem}>
                <StoryCard
                  story={story}
                  variant="grid"
                  onPress={() => navigation.navigate('StoryDetail', { id: story.id })}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox: { width: 32, height: 32, backgroundColor: '#ef4444', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  logoName: { fontWeight: '700', fontSize: 18, color: '#1e293b' },
  headerActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, position: 'relative' },
  notifDot: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: 4, borderWidth: 1.5, borderColor: '#fff' },

  banner: { position: 'relative', height: 220 },
  bannerImg: { width: '100%', height: '100%' },
  bannerOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  bannerContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  featuredRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  featuredLabel: { color: '#f87171', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  bannerTitle: { color: '#fff', fontSize: 18, fontWeight: '700', lineHeight: 24 },
  bannerSub: { color: '#cbd5e1', fontSize: 11, marginTop: 3 },
  readBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: '#ef4444', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, alignSelf: 'flex-start' },
  readBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  dots: { position: 'absolute', bottom: 14, right: 14, flexDirection: 'row', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { width: 16, backgroundColor: '#fff' },

  section: { marginTop: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  viewAll: { fontSize: 13, color: '#ef4444', fontWeight: '500' },

  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  catIcon: { fontSize: 14 },
  catName: { fontSize: 13, color: '#475569', fontWeight: '500' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  gridItem: { width: (SCREEN_WIDTH - 32 - 24) / 3 },
});
