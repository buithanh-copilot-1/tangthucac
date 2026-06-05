import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, BookOpen, Eye, Heart, Share2, ChevronDown, ChevronUp, CheckCircle2, BookMarked, Plus, X, Loader2 } from 'lucide-react';
import { categories, formatNumber, formatDate, statusLabel, statusColor } from '@story-reader/shared';
import type { ShelfStatus, Story, Chapter } from '@story-reader/shared';
import { useStore } from '../store/useStore';
import { useToast } from '../store/useToast';
import Layout from '../components/layout/Layout';
import { storiesApi } from '../services/stories.api';
import RatingStars from '../components/story/RatingStars';
import CommentsSection from '../components/story/CommentsSection';
import { StoryDetailSkeleton } from '../components/common/Skeleton';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const SHELF_OPTIONS: { status: ShelfStatus; label: string; icon: typeof BookOpen; color: string; activeCls: string }[] = [
  { status: 'reading',      label: 'Đang đọc',   icon: BookOpen,     color: '#3b82f6', activeCls: 'bg-blue-500 text-white border-blue-500' },
  { status: 'completed',    label: 'Đã đọc',      icon: CheckCircle2, color: '#22c55e', activeCls: 'bg-green-500 text-white border-green-500' },
  { status: 'want_to_read', label: 'Muốn đọc',   icon: BookMarked,   color: '#8b5cf6', activeCls: 'bg-purple-500 text-white border-purple-500' },
];

const CHAPTERS_PER_PAGE = 50;

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingStory, setLoadingStory] = useState(true);
  useDocumentMeta({
    title: story?.title ?? 'Chi tiet truyen',
    description: story ? `${story.title} cua ${story.author}. ${story.description.slice(0, 140)}` : 'Thong tin chi tiet truyen tren TruyenHay.',
  });
  const {
    isBookmarked, isBookmarkPending, addBookmark, removeBookmark,
    getProgress,
    getShelfEntry, isShelfPending, addToShelf, updateShelfStatus, removeFromShelf,
  } = useStore();

  useEffect(() => {
    if (!id) return;
    setLoadingStory(true);
    Promise.all([storiesApi.get(id), storiesApi.chapters(id)])
      .then(([s, ch]) => { setStory(s); setChapters(ch); })
      .finally(() => setLoadingStory(false));
  }, [id]);

  const [descExpanded, setDescExpanded] = useState(false);
  const [chapterSortDesc, setChapterSortDesc] = useState(false);
  const [showShelfMenu, setShowShelfMenu] = useState(false);
  const [chapterPage, setChapterPage] = useState(1);
  const [jumpChapter, setJumpChapter] = useState('');

  useEffect(() => {
    setChapterPage(1);
  }, [id, chapterSortDesc]);

  if (loadingStory) {
    return (
      <Layout showBack title="...">
        <StoryDetailSkeleton />
      </Layout>
    );
  }

  if (!story) {
    return (
      <Layout showBack title="Không tìm thấy">
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-5xl mb-4">😔</span>
          <p>Truyện không tồn tại</p>
        </div>
      </Layout>
    );
  }

  const sortedChapters = chapterSortDesc ? [...chapters].reverse() : chapters;
  const chapterPageCount = Math.max(1, Math.ceil(sortedChapters.length / CHAPTERS_PER_PAGE));
  const safeChapterPage = Math.min(chapterPage, chapterPageCount);
  const pagedChapters = sortedChapters.slice(
    (safeChapterPage - 1) * CHAPTERS_PER_PAGE,
    safeChapterPage * CHAPTERS_PER_PAGE,
  );
  const bookmarked = isBookmarked(story.id);
  const bookmarkPending = isBookmarkPending(story.id);
  const progress = getProgress(story.id);
  const category = categories.find((c) => c.id === story.genre);
  const shelfEntry = getShelfEntry(story.id);
  const shelfPending = isShelfPending(story.id);
  const currentShelf = SHELF_OPTIONS.find((o) => o.status === shelfEntry?.status);

  const handleShelfSelect = (status: ShelfStatus) => {
    if (shelfPending) return;
    if (shelfEntry) {
      if (shelfEntry.status === status) {
        removeFromShelf(story.id);
      } else {
        updateShelfStatus(story.id, status);
      }
    } else {
      addToShelf(story.id, status);
    }
    setShowShelfMenu(false);
  };

  const startReading = () => {
    const chapter = progress ? progress.chapterNumber : 1;
    navigate(`/story/${story.id}/chapter/${chapter}`);
  };

  const handleJumpChapter = (e: React.FormEvent) => {
    e.preventDefault();
    const chapter = Number(jumpChapter);
    if (!Number.isInteger(chapter) || chapter < 1 || chapter > story.totalChapters) return;
    navigate(`/story/${story.id}/chapter/${chapter}`);
  };

  const readPercent = progress
    ? Math.min(100, Math.round((progress.chapterNumber / story.totalChapters) * 100))
    : 0;

  return (
    <Layout showBack title={story.title} hideNav={false}>
      {/* Cover hero */}
      <div className="relative">
        <div className="relative overflow-hidden" style={{ height: 200 }}>
          <img src={story.cover} alt={story.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50" />
        </div>

        <div className="px-4 -mt-4 relative">
          {/* Cover + Info */}
          <div className="flex gap-4">
            <img
              src={story.cover}
              alt={story.title}
              className="w-24 h-36 object-cover rounded-xl shadow-lg flex-shrink-0 -mt-12 border-2 border-white"
            />
            <div className="flex-1 pt-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2">{story.title}</h1>
              <p className="text-sm text-gray-600 mt-1">{story.author}</p>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {category && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon} {category.name}
                  </span>
                )}
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(story.status)}`}>
                  {statusLabel(story.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-around mt-4 py-3 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-gray-900">{story.rating.toFixed(1)}</span>
              </div>
              <span className="text-[10px] text-gray-500">{formatNumber(story.ratingCount)} đánh giá</span>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <BookOpen size={14} className="text-blue-500" />
                <span className="text-sm font-bold text-gray-900">{formatNumber(story.totalChapters)}</span>
              </div>
              <span className="text-[10px] text-gray-500">Chương</span>
            </div>
            <div className="w-px bg-gray-100" />
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <Eye size={14} className="text-green-500" />
                <span className="text-sm font-bold text-gray-900">{formatNumber(story.views)}</span>
              </div>
              <span className="text-[10px] text-gray-500">Lượt đọc</span>
            </div>
          </div>

          {/* Reading progress bar (nếu đang đọc) */}
          {progress && (
            <div className="mt-3 bg-white rounded-xl px-4 py-3 border border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                <span className="font-medium text-gray-700">Tiến độ đọc</span>
                <span className="text-primary-500 font-semibold">
                  C.{progress.chapterNumber} / {formatNumber(story.totalChapters)} — {readPercent}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${readPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">Đọc lần cuối {formatDate(progress.lastRead)}</p>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {story.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <div className="mt-4">
            <div className={`text-sm text-gray-700 leading-relaxed ${!descExpanded ? 'line-clamp-3' : ''}`}>
              {story.description}
            </div>
            <button
              onClick={() => setDescExpanded((v) => !v)}
              className="flex items-center gap-1 text-primary-500 text-xs font-medium mt-1"
            >
              {descExpanded ? <><ChevronUp size={13} /> Thu gọn</> : <><ChevronDown size={13} /> Xem thêm</>}
            </button>
          </div>

          {/* Đánh giá truyện */}
          <div className="mt-4 bg-white rounded-2xl border border-gray-100 px-4 py-3.5">
            <p className="text-xs font-semibold text-gray-500 mb-2">ĐÁNH GIÁ TRUYỆN</p>
            <RatingStars
              storyId={story.id}
              onRated={(avg, count) =>
                setStory((s) => (s ? { ...s, rating: avg, ratingCount: count } : s))
              }
            />
          </div>

          {/* Primary action buttons */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={startReading}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <BookOpen size={16} />
              {progress ? `Đọc tiếp C.${progress.chapterNumber}` : 'Đọc từ đầu'}
            </button>
            <button
              onClick={() => bookmarked ? removeBookmark(story.id) : addBookmark(story.id)}
              disabled={bookmarkPending}
              className={`w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all
                ${bookmarked ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'}
                disabled:opacity-70 disabled:cursor-wait`}
            >
              {bookmarkPending ? (
                <Loader2 size={18} className="animate-spin text-primary-500" />
              ) : (
                <Heart size={20} className={bookmarked ? 'fill-primary-500 text-primary-500' : 'text-gray-400'} />
              )}
            </button>
            <button
              onClick={async () => {
                const url = window.location.href;
                if (navigator.share) {
                  try { await navigator.share({ title: story.title, url }); } catch { /* cancelled */ }
                } else {
                  await navigator.clipboard.writeText(url);
                  toast.success('Đã sao chép link truyện');
                }
              }}
              className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-200 bg-white"
            >
              <Share2 size={18} className="text-gray-400" />
            </button>
          </div>

          {/* Shelf / Tủ truyện section */}
          <div className="mt-4 relative">
            <p className="text-xs font-semibold text-gray-500 mb-2">TỦ TRUYỆN</p>

            {/* Current shelf status or add button */}
            <button
              onClick={() => setShowShelfMenu((v) => !v)}
              disabled={shelfPending}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all
                ${shelfEntry
                  ? 'border-transparent bg-gray-50'
                  : 'border-dashed border-gray-200 bg-white'
                }
                disabled:opacity-75 disabled:cursor-wait`}
            >
              <div className="flex items-center gap-3">
                {shelfEntry && currentShelf ? (
                  <>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${currentShelf.color}20` }}
                    >
                      <currentShelf.icon size={16} style={{ color: currentShelf.color }} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">{currentShelf.label}</p>
                      <p className="text-xs text-gray-400">Nhấn để thay đổi</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Plus size={16} className="text-gray-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-600">Thêm vào tủ truyện</p>
                      <p className="text-xs text-gray-400">Đang đọc · Đã đọc · Muốn đọc</p>
                    </div>
                  </>
                )}
              </div>
              {shelfPending ? (
                <Loader2 size={16} className="animate-spin text-gray-400" />
              ) : (
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${showShelfMenu ? 'rotate-180' : ''}`}
                />
              )}
            </button>

            {/* Dropdown menu */}
            {showShelfMenu && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20">
                {SHELF_OPTIONS.map((opt) => {
                  const isActive = shelfEntry?.status === opt.status;
                  return (
                    <button
                      key={opt.status}
                      onClick={() => handleShelfSelect(opt.status)}
                      disabled={shelfPending}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left
                        ${isActive ? 'bg-gray-50' : 'hover:bg-gray-50 active:bg-gray-100'}
                        disabled:opacity-60 disabled:cursor-wait`}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${opt.color}15` }}
                      >
                        <opt.icon size={18} style={{ color: opt.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                      </div>
                      {isActive && <CheckCircle2 size={18} style={{ color: opt.color }} />}
                    </button>
                  );
                })}
                {shelfEntry && (
                  <>
                    <div className="h-px bg-gray-100 mx-4" />
                    <button
                      onClick={() => { removeFromShelf(story.id); setShowShelfMenu(false); }}
                      disabled={shelfPending}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-500 active:bg-red-50"
                    >
                      <X size={16} />
                      <span className="text-sm font-medium">Xóa khỏi tủ truyện</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Chapter list */}
          <div className="mt-6 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900">
                Danh sách chương
                <span className="text-sm text-gray-400 font-normal ml-2">({chapters.length} chương)</span>
              </h2>
              <button
                onClick={() => setChapterSortDesc((v) => !v)}
                className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full"
              >
                {chapterSortDesc ? 'Mới nhất' : 'Cũ nhất'}
                {chapterSortDesc ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
              </button>
            </div>

            <form onSubmit={handleJumpChapter} className="mb-3 flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={story.totalChapters}
                value={jumpChapter}
                onChange={(e) => setJumpChapter(e.target.value)}
                placeholder="Nhap chuong"
                className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400"
              />
              <button
                type="submit"
                className="h-10 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white"
              >
                Di toi
              </button>
            </form>

            <div className="flex flex-col gap-1">
              {pagedChapters.map((ch) => {
                const isCurrentChapter = progress?.chapterNumber === ch.number;
                const isRead = progress ? ch.number <= progress.chapterNumber : false;
                return (
                  <Link
                    key={ch.id}
                    to={`/story/${story.id}/chapter/${ch.number}`}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors
                      ${isCurrentChapter ? 'bg-primary-50 border border-primary-100' : 'bg-white border border-gray-100'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate
                        ${isCurrentChapter ? 'text-primary-600' : isRead ? 'text-gray-400' : 'text-gray-900'}`}>
                        Chương {ch.number}: {ch.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(ch.publishedAt)}</p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      {isCurrentChapter ? (
                        <span className="text-xs text-primary-500 font-medium">Đang đọc</span>
                      ) : isRead ? (
                        <CheckCircle2 size={14} className="text-green-400" />
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>

            {chapterPageCount > 1 && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setChapterPage((p) => Math.max(1, p - 1))}
                  disabled={safeChapterPage <= 1}
                  className="h-10 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 disabled:opacity-40"
                >
                  Truoc
                </button>
                <span className="text-xs font-medium text-gray-500">
                  Trang {safeChapterPage}/{chapterPageCount}
                </span>
                <button
                  type="button"
                  onClick={() => setChapterPage((p) => Math.min(chapterPageCount, p + 1))}
                  disabled={safeChapterPage >= chapterPageCount}
                  className="h-10 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 disabled:opacity-40"
                >
                  Sau
                </button>
              </div>
            )}
          </div>

          {/* Bình luận */}
          <CommentsSection storyId={story.id} />
        </div>
      </div>

      {/* Backdrop để đóng shelf menu */}
      {showShelfMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowShelfMenu(false)} />
      )}
    </Layout>
  );
}
