import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import { categories, translate, type TranslationKey } from '@story-reader/shared';
import type { Genre, Story } from '@story-reader/shared';
import Layout from '../components/layout/Layout';
import StoryCard from '../components/story/StoryCard';
import CategoryBadge from '../components/story/CategoryBadge';
import { storiesApi } from '../services/stories.api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

type SortOption = 'views' | 'updatedAt' | 'rating';
type StatusFilter = 'all' | 'ongoing' | 'completed';

export default function BrowsePage() {
  const { readerSettings } = useStore();
  const t = (k: TranslationKey) => translate(readerSettings.language, k);

  useDocumentMeta({
    title: t('browse'),
    description: t('browse'),
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const genreParam = searchParams.get('genre') as Genre | null;

  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(genreParam);
  const [sort, setSort] = useState<SortOption>('views');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const res = await storiesApi.list({
        genre: selectedGenre ?? undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort,
        page: currentPage,
        limit: 20,
      });
      setStories((prev) => reset ? res.data : [...prev, ...res.data]);
      setTotal(res.meta.total);
      if (reset) setPage(1);
    } finally {
      setLoading(false);
    }
  }, [selectedGenre, sort, statusFilter, page]);

  useEffect(() => { load(true); }, [selectedGenre, sort, statusFilter]);

  const handleGenre = (genre: Genre | null) => {
    setSelectedGenre(genre);
    if (genre) setSearchParams({ genre });
    else setSearchParams({});
  };

  return (
    <Layout title={t('browse')} showBack={false}>
      {/* Genre chips */}
      <div className="sticky top-14 z-30 bg-white border-b border-gray-100 px-0 py-3">
        <div className="flex gap-2 px-4 lg:px-6 overflow-x-auto no-scrollbar lg:flex-wrap">
          <button
            onClick={() => handleGenre(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${!selectedGenre ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {t('allLabel')}
          </button>
          {categories.map((cat) => (
            <CategoryBadge key={cat.id} category={cat} selected={selectedGenre === cat.id} onClick={() => handleGenre(cat.id)} />
          ))}
        </div>
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        <span className="text-sm text-gray-500">{total} {t('storiesLabel')}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
              ${showFilters ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200'}`}
          >
            <SlidersHorizontal size={13} />
            {t('filter')}
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600"
          >
            {viewMode === 'grid' ? <List size={15} /> : <LayoutGrid size={15} />}
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mx-4 lg:mx-6 mb-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2 tracking-wide">{t('sortLabel')}</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'views', label: t('sortViews') },
                { value: 'updatedAt', label: t('sortNewest') },
                { value: 'rating', label: t('sortRating') },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSort(opt.value as SortOption)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                    ${sort === opt.value ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2 tracking-wide">{t('statusLabel')}</p>
            <div className="flex gap-2">
              {(['all', 'ongoing', 'completed'] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                    ${statusFilter === s ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200'}`}
                >
                  {s === 'all' ? t('allLabel') : s === 'ongoing' ? t('ongoingLabel') : t('completedLabel')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stories grid/list */}
      <div className="px-4 lg:px-6 pb-24 lg:pb-10 max-w-screen-2xl">
        {loading && stories.length === 0 ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-16 text-gray-400">{t('noStoriesFound')}</div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
            {stories.map((s) => <StoryCard key={s.id} story={s} />)}
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl">
            {stories.map((s) => <StoryCard key={s.id} story={s} variant="horizontal" />)}
          </div>
        )}

        {/* Load more */}
        {stories.length < total && (
          <button
            onClick={() => { setPage((p) => p + 1); load(); }}
            disabled={loading}
            className="w-full mt-4 py-3 text-sm font-medium text-primary-500 border border-primary-200 rounded-2xl disabled:opacity-50"
          >
            {loading ? t('loading') : t('loadMore')}
          </button>
        )}
      </div>
    </Layout>
  );
}
