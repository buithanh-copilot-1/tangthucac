import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Heart, CheckCircle2, BookMarked, Trash2, ChevronRight, MoreHorizontal } from 'lucide-react';
import { mockStories, formatDate, formatNumber } from '@story-reader/shared';
import type { ShelfStatus } from '@story-reader/shared';
import { useStore } from '../store/useStore';
import Layout from '../components/layout/Layout';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

type Tab = 'reading' | 'completed' | 'favorites';

const TABS: { id: Tab; label: string; icon: typeof BookOpen; emptyIcon: string; emptyMsg: string; emptyDesc: string }[] = [
  {
    id: 'reading',
    label: 'Đang đọc',
    icon: BookOpen,
    emptyIcon: '📖',
    emptyMsg: 'Chưa có truyện đang đọc',
    emptyDesc: 'Mở một truyện và bắt đầu đọc để thêm vào đây',
  },
  {
    id: 'completed',
    label: 'Đã đọc',
    icon: CheckCircle2,
    emptyIcon: '✅',
    emptyMsg: 'Chưa có truyện hoàn thành',
    emptyDesc: 'Đánh dấu truyện đã đọc xong để lưu vào đây',
  },
  {
    id: 'favorites',
    label: 'Yêu thích',
    icon: Heart,
    emptyIcon: '❤️',
    emptyMsg: 'Chưa có truyện yêu thích',
    emptyDesc: 'Nhấn ❤️ trên trang truyện để thêm vào đây',
  },
];

function ShelfStatusBadge({ status }: { status: ShelfStatus }) {
  const map: Record<ShelfStatus, { label: string; cls: string }> = {
    reading: { label: 'Đang đọc', cls: 'text-blue-600 bg-blue-50' },
    completed: { label: 'Đã đọc', cls: 'text-green-600 bg-green-50' },
    want_to_read: { label: 'Muốn đọc', cls: 'text-purple-600 bg-purple-50' },
  };
  const { label, cls } = map[status];
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

export default function LibraryPage() {
  useDocumentMeta({
    title: 'Thu vien',
    description: 'Quan ly truyen dang doc, da doc va yeu thich cua ban.',
  });

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('reading');
  const {
    bookmarks, removeBookmark,
    shelf, removeFromShelf, updateShelfStatus, getProgress,
  } = useStore();

  const readingEntries = shelf
    .filter((e) => e.status === 'reading')
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));

  const completedEntries = shelf
    .filter((e) => e.status === 'completed')
    .sort((a, b) => (b.completedAt ?? b.lastUpdated).localeCompare(a.completedAt ?? a.lastUpdated));

  const favoriteStories = mockStories.filter((s) => bookmarks.includes(s.id));

  const tabCounts: Record<Tab, number> = {
    reading: readingEntries.length,
    completed: completedEntries.length,
    favorites: favoriteStories.length,
  };

  return (
    <Layout title="Tủ Truyện">
      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-white sticky top-14 z-30">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium border-b-2 transition-all
              ${activeTab === id ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-400'}`}
          >
            <Icon size={18} strokeWidth={activeTab === id ? 2.5 : 1.8} />
            <span>{label}</span>
            {tabCounts[id] > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none
                ${activeTab === id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                {tabCounts[id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Đang đọc */}
      {activeTab === 'reading' && (
        <div className="px-4 pt-4 pb-4">
          {readingEntries.length === 0 ? (
            <EmptyState tab={TABS[0]} />
          ) : (
            <div className="flex flex-col gap-3">
              {readingEntries.map((entry) => {
                const story = mockStories.find((s) => s.id === entry.storyId);
                if (!story) return null;
                const progress = getProgress(story.id);
                const pct = progress
                  ? Math.min(100, Math.round((progress.chapterNumber / story.totalChapters) * 100))
                  : 0;

                return (
                  <div key={entry.storyId} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex gap-3 p-3">
                      <img
                        src={story.cover}
                        alt={story.title}
                        className="w-16 h-24 object-cover rounded-xl flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{story.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{story.author}</p>

                        {progress ? (
                          <div className="flex items-center gap-1.5 mt-2">
                            <BookOpen size={12} className="text-primary-500" />
                            <span className="text-xs text-primary-500 font-semibold">
                              Chương {progress.chapterNumber}
                            </span>
                            <span className="text-xs text-gray-400">/ {formatNumber(story.totalChapters)}</span>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 mt-2">Chưa bắt đầu đọc</p>
                        )}

                        {/* Progress bar */}
                        <div className="mt-2 mb-1">
                          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                            <span>{pct}% hoàn thành</span>
                            <span>{formatDate(entry.lastUpdated)}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-500 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action row */}
                    <div className="flex border-t border-gray-50">
                      <button
                        onClick={() => navigate(`/story/${story.id}/chapter/${progress?.chapterNumber ?? 1}`)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-primary-500 active:bg-primary-50"
                      >
                        <BookOpen size={13} />
                        {progress ? 'Đọc tiếp' : 'Bắt đầu đọc'}
                      </button>
                      <div className="w-px bg-gray-50" />
                      <button
                        onClick={() => updateShelfStatus(story.id, 'completed')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-green-600 active:bg-green-50"
                      >
                        <CheckCircle2 size={13} />
                        Đánh dấu xong
                      </button>
                      <div className="w-px bg-gray-50" />
                      <button
                        onClick={() => navigate(`/story/${story.id}`)}
                        className="px-4 flex items-center justify-center py-2.5 text-xs text-gray-400 active:bg-gray-50"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Đã đọc */}
      {activeTab === 'completed' && (
        <div className="px-4 pt-4 pb-4">
          {completedEntries.length === 0 ? (
            <EmptyState tab={TABS[1]} />
          ) : (
            <div className="flex flex-col gap-2">
              {completedEntries.map((entry) => {
                const story = mockStories.find((s) => s.id === entry.storyId);
                if (!story) return null;

                return (
                  <Link
                    key={entry.storyId}
                    to={`/story/${story.id}`}
                    className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100 active:bg-gray-50"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={story.cover}
                        alt={story.title}
                        className="w-14 h-20 object-cover rounded-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                        <CheckCircle2 size={10} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{story.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{story.author}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-400">
                          {formatNumber(story.totalChapters)} chương
                        </span>
                        {entry.completedAt && (
                          <>
                            <span className="text-gray-200">·</span>
                            <span className="text-xs text-gray-400">Xong {formatDate(entry.completedAt)}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={(e) => { e.preventDefault(); updateShelfStatus(story.id, 'reading'); }}
                          className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium"
                        >
                          Đọc lại
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); removeFromShelf(story.id); }}
                          className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Yêu thích */}
      {activeTab === 'favorites' && (
        <div className="px-4 pt-4 pb-4">
          {favoriteStories.length === 0 ? (
            <EmptyState tab={TABS[2]} />
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {favoriteStories.map((story) => {
                const entry = shelf.find((e) => e.storyId === story.id);
                return (
                  <div key={story.id} className="relative">
                    <Link to={`/story/${story.id}`} className="block">
                      <img
                        src={story.cover}
                        alt={story.title}
                        className="w-full aspect-[3/4] object-cover rounded-xl shadow-sm"
                      />
                      {entry && (
                        <div className="absolute top-1.5 left-1.5">
                          <ShelfStatusBadge status={entry.status} />
                        </div>
                      )}
                      <p className="text-xs font-semibold text-gray-900 leading-tight line-clamp-2 mt-2">
                        {story.title}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{story.author}</p>
                    </Link>
                    <button
                      onClick={() => removeBookmark(story.id)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                    >
                      <Trash2 size={10} className="text-white" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

function EmptyState({ tab }: { tab: (typeof TABS)[number] }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <span className="text-5xl mb-4">{tab.emptyIcon}</span>
      <p className="text-sm font-medium text-gray-500">{tab.emptyMsg}</p>
      <p className="text-xs text-gray-400 mt-1 text-center px-8">{tab.emptyDesc}</p>
      <Link to="/browse" className="btn-primary mt-6 inline-block">
        Khám phá truyện
      </Link>
    </div>
  );
}
