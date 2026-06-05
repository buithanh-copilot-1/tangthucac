import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { categories, translate, type TranslationKey } from '@story-reader/shared';
import type { Genre, Story } from '@story-reader/shared';
import { useStore } from '../store/useStore';
import Layout from '../components/layout/Layout';
import StoryCard from '../components/story/StoryCard';
import { StoryListSkeleton } from '../components/common/Skeleton';
import { storiesApi } from '../services/stories.api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const hotSearches = ['Tiên hiệp', 'Đấu phá', 'Kim Dung', 'Ngôn tình', 'Trọng sinh', 'Tam Thể'];

export default function SearchPage() {
  const { readerSettings } = useStore();
  const t = (k: TranslationKey) => translate(readerSettings.language, k);

  useDocumentMeta({
    title: t('searchTitle'),
    description: t('searchDescription'),
  });

  const navigate = useNavigate();
  const { recentSearches, addRecentSearch, clearRecentSearches } = useStore();
  const [query, setQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState<Genre | null>(null);
  const [results, setResults] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const runSearch = useCallback(async (q: string, genre: Genre | null) => {
    if (!q.trim() && !genre) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await storiesApi.list({
        q: q.trim() || undefined,
        genre: genre ?? undefined,
        limit: 30,
      });
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search khi gõ
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(query, activeGenre);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, activeGenre, runSearch]);

  const handlePickKeyword = (q: string) => {
    setQuery(q);
    if (q.trim()) addRecentSearch(q.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) addRecentSearch(query.trim());
    runSearch(query, activeGenre);
  };

  const showLanding = !searched && !query && !activeGenre;
  const suggestions = query.trim() && results.length > 0 ? results.slice(0, 5) : [];

  return (
    <Layout hideHeader hideNav={false}>
      {/* Search bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(-1)} className="flex-shrink-0">
            <X size={22} className="text-gray-500" />
          </button>
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2.5">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')}>
                <X size={14} className="text-gray-400" />
              </button>
            )}
          </div>
          <button type="submit" className="text-primary-500 text-sm font-semibold flex-shrink-0">
            {t('searchLabel')}
          </button>
        </form>
        {suggestions.length > 0 && !loading && (
          <div className="mt-3 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            {suggestions.map((story) => (
              <button
                key={story.id}
                type="button"
                onClick={() => navigate(`/story/${story.id}`)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left active:bg-gray-50 border-b border-gray-50 last:border-0"
              >
                <img src={story.cover} alt="" className="h-10 w-8 rounded object-cover flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{story.title}</p>
                  <p className="truncate text-xs text-gray-500">{story.author}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Landing — recents, hot, genres */}
      {showLanding && (
        <div className="px-4 lg:px-8 pt-4 max-w-screen-xl">
          {recentSearches.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" /> {t('recentSearchesLabel')}
                </p>
                <button onClick={clearRecentSearches} className="text-xs text-primary-500">{t('delete')}</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((q) => (
                  <button key={q} onClick={() => handlePickKeyword(q)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-primary-500" /> {t('hotSearchesLabel')}
            </p>
            <div className="flex flex-wrap gap-2">
              {hotSearches.map((q, i) => (
                <button key={q} onClick={() => handlePickKeyword(q)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-full text-sm">
                  <span className={`text-xs font-bold ${i < 3 ? 'text-primary-500' : 'text-gray-400'}`}>{i + 1}</span>
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">{t('byGenre')}</p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setActiveGenre(cat.id)}
                  className="flex flex-col items-center gap-1 p-2 bg-white border border-gray-100 rounded-xl text-center active:bg-gray-50">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-[10px] text-gray-600 leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {searched && (
        <div className="px-4 lg:px-8 pt-4 pb-4 max-w-screen-xl">
          {activeGenre && (
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setActiveGenre(null)}
                className="flex items-center gap-1 bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-xs font-medium">
                {categories.find((c) => c.id === activeGenre)?.name}
                <X size={12} />
              </button>
            </div>
          )}

          {loading ? (
            <StoryListSkeleton count={5} />
          ) : (
            <>
                <p className="text-xs text-gray-500 mb-3">
                {results.length} {t('resultsLabel')} {query ? `cho "${query}"` : ''}
              </p>
              {results.length > 0 ? (
                <div className="flex flex-col gap-2 max-w-3xl">
                  {results.map((story) => (
                    <StoryCard key={story.id} story={story} variant="list" highlightQuery={query} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <span className="text-5xl mb-4">🔍</span>
                  <p className="text-sm">{t('noResultsFound')}</p>
                  <p className="text-xs mt-1">{t('tryDifferentQuery')}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Layout>
  );
}
