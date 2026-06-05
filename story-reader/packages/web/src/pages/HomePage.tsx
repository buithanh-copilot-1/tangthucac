import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, TrendingUp } from 'lucide-react';
import { categories, formatNumber } from '@story-reader/shared';
import type { Story } from '@story-reader/shared';
import Layout from '../components/layout/Layout';
import StoryCard from '../components/story/StoryCard';
import CategoryBadge from '../components/story/CategoryBadge';
import SectionHeader from '../components/story/SectionHeader';
import { HomeSkeleton } from '../components/common/Skeleton';
import { storiesApi } from '../services/stories.api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function HomePage() {
  useDocumentMeta({
    title: 'Trang chu',
    description: 'Doc truyen chu online, truyen hot va truyen moi cap nhat tren TruyenHay.',
  });

  const [featured, setFeatured] = useState<Story[]>([]);
  const [hot, setHot] = useState<Story[]>([]);
  const [recent, setRecent] = useState<Story[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      storiesApi.featured(),
      storiesApi.hot(),
      storiesApi.list({ sort: 'updatedAt', limit: 12 }),
    ]).then(([f, h, r]) => {
      setFeatured(f);
      setHot(h);
      setRecent(r.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!featured.length) return;
    const timer = setInterval(() => setBannerIndex((i) => (i + 1) % featured.length), 4000);
    return () => clearInterval(timer);
  }, [featured.length]);

  const banner = featured[bannerIndex];

  if (loading) {
    return (
      <Layout>
        <HomeSkeleton />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Banner */}
      {banner && (
        <div className="relative overflow-hidden h-48 md:h-64 lg:h-80">
          <img src={banner.cover} alt={banner.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NỔI BẬT</span>
              <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full">{banner.genre}</span>
            </div>
            <h2 className="text-white font-bold text-lg leading-tight line-clamp-1">{banner.title}</h2>
            <p className="text-white/70 text-xs mt-0.5">{banner.author} · {formatNumber(banner.views)} lượt đọc</p>
          </div>
          <Link to={`/story/${banner.id}`} className="absolute inset-0" />
          {/* Dots */}
          <div className="absolute bottom-2 right-4 flex gap-1">
            {featured.map((_, i) => (
              <button key={i} onClick={() => setBannerIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === bannerIndex ? 'bg-white w-3' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="px-4 md:px-6 lg:px-8 pt-4 pb-24 lg:pb-10 space-y-6 max-w-screen-2xl">
        {/* Categories */}
        <div>
          <SectionHeader title="Thể Loại" />
          <div className="flex flex-wrap gap-2 pt-2">
            {categories.map((cat) => (
              <CategoryBadge key={cat.id} category={cat} asLink />
            ))}
          </div>
        </div>

        {/* Hot */}
        {hot.length > 0 && (
          <div>
            <SectionHeader title="Đang Hot" viewAllTo="/browse?sort=views" />
            {/* Mobile: horizontal scroll; Desktop: grid */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pt-2 lg:hidden">
              {hot.map((s) => <StoryCard key={s.id} story={s} variant="horizontal" />)}
            </div>
            <div className="hidden lg:grid grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 pt-2">
              {hot.slice(0, 6).map((s) => <StoryCard key={s.id} story={s} />)}
            </div>
          </div>
        )}

        {/* Recent */}
        {recent.length > 0 && (
          <div>
            <SectionHeader title="Mới Cập Nhật" viewAllTo="/browse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4 pt-2">
              {recent.map((s) => <StoryCard key={s.id} story={s} />)}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
