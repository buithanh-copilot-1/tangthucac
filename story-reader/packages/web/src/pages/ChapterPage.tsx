import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Settings2, AlignLeft, Home, CheckCircle2 } from 'lucide-react';
import type { Story, Chapter } from '@story-reader/shared';
import { useStore } from '../store/useStore';
import ReaderSettingsPanel from '../components/reader/ReaderSettings';
import { ChapterSkeleton } from '../components/common/Skeleton';
import { storiesApi } from '../services/stories.api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const fontSizeMap = { sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl' };
const lineHeightMap = { normal: 'leading-normal', relaxed: 'leading-relaxed', loose: 'leading-loose' };
const themeMap = {
  light: 'bg-white text-gray-900',
  sepia: 'bg-amber-50 text-stone-800',
  dark: 'bg-gray-900 text-gray-100',
};

export default function ChapterPage() {
  const { id, chapterNum } = useParams<{ id: string; chapterNum: string }>();
  const navigate = useNavigate();
  const { readerSettings, updateProgress, getProgress, getShelfEntry, addToShelf, updateShelfStatus } = useStore();
  const [showUI, setShowUI] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showCompletedToast, setShowCompletedToast] = useState(false);
  const [story, setStory] = useState<Story | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [totalChapters, setTotalChapters] = useState(0);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const restoredRef = useRef(false);
  useDocumentMeta({
    title: story && chapter ? `${story.title} - Chuong ${chapter.number}` : 'Doc truyen',
    description: story && chapter ? `${chapter.title} - ${story.title}` : 'Doc chuong truyen tren TruyenHay.',
  });

  const chapterNumber = parseInt(chapterNum ?? '1', 10);
  const hasPrev = chapterNumber > 1;
  const hasNext = chapterNumber < totalChapters;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([storiesApi.get(id), storiesApi.chapter(id, chapterNumber)])
      .then(([s, ch]) => {
        setStory(s);
        setChapter(ch);
        setTotalChapters(s.totalChapters);
      })
      .finally(() => setLoading(false));
  }, [id, chapterNumber]);

  // Reset cờ khôi phục mỗi khi đổi chương
  useEffect(() => { restoredRef.current = false; }, [chapterNumber]);

  // Mark "đang đọc" + auto-shelf + toast chương cuối (1 lần mỗi chương)
  useEffect(() => {
    if (!story || !chapter) return;

    // Lưu vị trí cuộn đã có (nếu cùng chương) để không bị reset về 0
    const saved = getProgress(story.id);
    const keepScroll = saved && saved.chapterNumber === chapter.number ? saved.scrollPosition : 0;

    updateProgress({
      storyId: story.id,
      chapterId: chapter.id,
      chapterNumber: chapter.number,
      scrollPosition: keepScroll,
      lastRead: new Date().toISOString(),
    });

    const entry = getShelfEntry(story.id);
    if (!entry) addToShelf(story.id, 'reading');

    if (chapter.number === totalChapters && entry?.status !== 'completed') {
      setShowCompletedToast(true);
      const t = setTimeout(() => setShowCompletedToast(false), 6000);
      return () => clearTimeout(t);
    }
  }, [story?.id, chapter?.id]);

  // Khôi phục vị trí cuộn sau khi nội dung render xong
  useEffect(() => {
    if (loading || !story || !chapter || restoredRef.current) return;
    restoredRef.current = true;
    const saved = getProgress(story.id);
    const y = saved && saved.chapterNumber === chapter.number ? saved.scrollPosition : 0;
    requestAnimationFrame(() => window.scrollTo(0, y || 0));
  }, [loading, story?.id, chapter?.id]);

  // Lưu vị trí cuộn liên tục (debounce 600ms)
  useEffect(() => {
    if (!story || !chapter) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        updateProgress({
          storyId: story.id,
          chapterId: chapter.id,
          chapterNumber: chapter.number,
          scrollPosition: window.scrollY,
          lastRead: new Date().toISOString(),
        });
      }, 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (timer) clearTimeout(timer);
    };
  }, [story?.id, chapter?.id]);

  const handleContentClick = useCallback(() => {
    setShowUI((v) => !v);
  }, []);

  const goChapter = (num: number) => {
    navigate(`/story/${id}/chapter/${num}`, { replace: false });
  };

  if (loading) {
    return <ChapterSkeleton />;
  }

  if (!story || !chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Không tìm thấy chương này</p>
      </div>
    );
  }

  const bgTheme = themeMap[readerSettings.theme];
  const headerBg = readerSettings.theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100';
  const headerText = readerSettings.theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const subText = readerSettings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`min-h-screen flex justify-center ${bgTheme}`}>
      <div className="w-full max-w-mobile relative">
        {/* Top bar */}
        <div
          className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-mobile z-40 border-b transition-all duration-300 ${headerBg}
            ${showUI ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
        >
          <div className="flex items-center justify-between h-14 px-4">
            <button
              onClick={() => navigate(`/story/${story.id}`)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <ChevronLeft size={22} className={headerText} />
            </button>
            <div className="text-center max-w-[180px]">
              <p className={`text-xs font-semibold truncate ${headerText}`}>{story.title}</p>
              <p className={`text-[10px] truncate ${subText}`}>Chương {chapter.number}: {chapter.title}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate('/')}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <Home size={18} className={headerText} />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <Settings2 size={18} className={headerText} />
              </button>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-0.5 bg-gray-100">
            <div
              className="h-full bg-primary-500 transition-all"
              style={{ width: `${(chapterNumber / totalChapters) * 100}%` }}
            />
          </div>
        </div>

        {/* Chapter content */}
        <div
          ref={contentRef}
          onClick={handleContentClick}
          className="px-5 pt-20 pb-32 cursor-pointer select-none"
        >
          <h1 className={`text-xl font-bold mb-6 text-center ${readerSettings.theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
            Chương {chapter.number}: {chapter.title}
          </h1>
          <div
            className={`
              ${fontSizeMap[readerSettings.fontSize]}
              ${lineHeightMap[readerSettings.lineHeight]}
              ${readerSettings.fontFamily === 'serif' ? 'font-serif' : 'font-sans'}
              ${readerSettings.theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}
              whitespace-pre-line
            `}
          >
            {chapter.content}
          </div>

          {/* Word count */}
          <div className={`flex items-center justify-center gap-1 mt-8 pb-4 ${subText}`}>
            <AlignLeft size={13} />
            <span className="text-xs">{chapter.wordCount.toLocaleString()} từ</span>
          </div>
        </div>

        {/* Bottom navigation */}
        <div
          className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile z-40 transition-all duration-300
            ${showUI ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
            ${headerBg} border-t`}
        >
          <div className="flex items-center justify-between px-6 py-4 safe-bottom">
            <button
              onClick={() => hasPrev && goChapter(chapterNumber - 1)}
              disabled={!hasPrev}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all
                ${hasPrev
                  ? 'bg-primary-500 text-white active:bg-primary-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              <ChevronLeft size={16} />
              Chương trước
            </button>

            <button
              onClick={() => navigate(`/story/${story.id}`)}
              className={`flex flex-col items-center gap-0.5 text-xs ${subText}`}
            >
              <span className="font-medium">{chapterNumber}/{totalChapters}</span>
              <span>Chương</span>
            </button>

            <button
              onClick={() => hasNext && goChapter(chapterNumber + 1)}
              disabled={!hasNext}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all
                ${hasNext
                  ? 'bg-primary-500 text-white active:bg-primary-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              Chương sau
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {showSettings && <ReaderSettingsPanel onClose={() => setShowSettings(false)} />}

      {/* Toast: đọc xong chương cuối */}
      {showCompletedToast && story && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[400px] z-50
                        bg-gray-900 text-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
          <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Bạn đã đọc đến chương cuối!</p>
            <p className="text-xs text-gray-400">Đánh dấu truyện này là đã đọc xong?</p>
          </div>
          <button
            onClick={() => {
              updateShelfStatus(story.id, 'completed');
              setShowCompletedToast(false);
            }}
            className="flex-shrink-0 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full"
          >
            Đánh dấu
          </button>
          <button
            onClick={() => setShowCompletedToast(false)}
            className="flex-shrink-0 text-gray-400 text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
