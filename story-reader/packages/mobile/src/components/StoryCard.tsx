import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Story } from '@story-reader/shared';
import { formatNumber } from '@story-reader/shared';

interface StoryCardProps {
  story: Story;
  variant?: 'grid' | 'list' | 'horizontal';
  onPress: () => void;
}

export default function StoryCard({ story, variant = 'grid', onPress }: StoryCardProps) {
  if (variant === 'horizontal') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.horizontal}>
        <View style={styles.coverContainer}>
          <Image source={{ uri: story.cover }} style={styles.horizontalCover} resizeMode="cover" />
          {story.isHot && (
            <View style={styles.hotBadge}>
              <Text style={styles.hotText}>HOT</Text>
            </View>
          )}
        </View>
        <Text style={styles.horizontalTitle} numberOfLines={2}>{story.title}</Text>
        <Text style={styles.author} numberOfLines={1}>{story.author}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={10} color="#facc15" />
          <Text style={styles.ratingText}>{story.rating.toFixed(1)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'list') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.listCard}>
        <View style={styles.coverContainer}>
          <Image source={{ uri: story.cover }} style={styles.listCover} resizeMode="cover" />
          {story.isHot && (
            <View style={styles.hotBadge}>
              <Text style={styles.hotText}>HOT</Text>
            </View>
          )}
        </View>
        <View style={styles.listInfo}>
          <Text style={styles.listTitle} numberOfLines={1}>{story.title}</Text>
          <Text style={styles.author}>{story.author}</Text>
          <Text style={styles.desc} numberOfLines={2}>{story.description}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color="#facc15" />
            <Text style={styles.ratingText}>{story.rating.toFixed(1)}</Text>
            <Ionicons name="book-outline" size={11} color="#94a3b8" style={{ marginLeft: 8 }} />
            <Text style={styles.ratingText}>{formatNumber(story.totalChapters)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.gridCard}>
      <View style={styles.coverContainer}>
        <Image source={{ uri: story.cover }} style={styles.gridCover} resizeMode="cover" />
        {story.isHot && (
          <View style={styles.hotBadge}>
            <Text style={styles.hotText}>HOT</Text>
          </View>
        )}
        {story.status === 'completed' && (
          <View style={[styles.hotBadge, { right: 6, left: undefined, backgroundColor: '#3b82f6' }]}>
            <Text style={styles.hotText}>Full</Text>
          </View>
        )}
      </View>
      <Text style={styles.gridTitle} numberOfLines={2}>{story.title}</Text>
      <Text style={styles.author}>{story.author}</Text>
      <View style={styles.ratingRow}>
        <Ionicons name="star" size={10} color="#facc15" />
        <Text style={styles.ratingText}>{story.rating.toFixed(1)}</Text>
        <Text style={[styles.ratingText, { color: '#cbd5e1' }]}> · {formatNumber(story.views)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  coverContainer: { position: 'relative' },
  hotBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#ef4444',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  hotText: { color: '#fff', fontSize: 8, fontWeight: '700' },
  author: { fontSize: 10, color: '#94a3b8', marginTop: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  ratingText: { fontSize: 10, color: '#94a3b8' },
  desc: { fontSize: 11, color: '#64748b', marginTop: 3, lineHeight: 16 },

  horizontal: { width: 112, marginRight: 0 },
  horizontalCover: { width: 112, height: 158, borderRadius: 10 },
  horizontalTitle: { fontSize: 11, fontWeight: '600', color: '#1e293b', marginTop: 6, lineHeight: 15 },

  listCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 0,
  },
  listCover: { width: 64, height: 88, borderRadius: 8 },
  listInfo: { flex: 1 },
  listTitle: { fontSize: 13, fontWeight: '600', color: '#1e293b' },

  gridCard: { marginBottom: 0 },
  gridCover: { width: '100%', aspectRatio: 3 / 4, borderRadius: 12 },
  gridTitle: { fontSize: 11, fontWeight: '600', color: '#1e293b', marginTop: 6, lineHeight: 15 },
});
