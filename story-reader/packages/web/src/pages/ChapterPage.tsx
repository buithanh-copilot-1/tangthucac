import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Settings2, AlignLeft, Home, CheckCircle2 } from 'lucide-react';
import { translate, type Chapter, type Story, type TranslationKey } from '@story-reader/shared';
import { useStore } from '../store/useStore';
import ReaderSettingsPanel from '../components/reader/ReaderSettings';
import { ChapterSkeleton } from '../components/common/Skeleton';
import { storiesApi } from '../services/stories.api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const fontSizeMap = { sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl' };
const lineHeightMap = { normal: 'leading-normal', relaxed: 'leading-relaxed', loose: 'leading-loose' };
const pageBackgroundMap = {
  default: 'bg-white text-gray-900',
  sepia: 'bg-[#f4ecd8] text-gray-900',
  black: 'bg-gray-900 text-gray-100',
};
const readerTextMap = {
  light: 'text-gray-800',
  dark: 'text-gray-200',
};
const titleTextMap = {
  light: 'text-gray-900',
  dark: 'text-gray-100',
};
const chromeMap = {
  light: { bg: 'bg-white border-gray-100', text: 'text-gray-900', sub: 'text-gray-500', hover: 'hover:bg-gray-100', track: 'bg-gray-100' },
  dark: { bg: 'bg-gray-900 border-gray-700', text: 'text-gray-100', sub: 'text-gray-400', hover: 'hover:bg-gray-800', track: 'bg-gray-800' },
};

export default function ChapterPage() {
  const { id, chapterNum } = useParams<{ id: string; chapterNum: string }>();
  const navigate = useNavigate();
  const { readerSettings, updateProgress, getProgress, getShelfEntry, addToShelf, updateShelfStatus } = useStore();
  const t = (key: TranslationKey) => translate(readerSettings.language, key);
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
    title: story && chapter ? `${story.title} - ${t('chapter')} ${chapter.number}` : 'Doc truyen',
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

  useEffect(() => { restoredRef.current = false; }, [chapterNumber]);

  useEffect(() => {
    if (!story || !chapter) return;
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
      const timer = setTimeout(() => setShowCompletedToast(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [story?.id, chapter?.id]);

  useEffect(() => {
    if (loading || !story || !chapter || restoredRef.current) return;
    restoredRef.current = true;
    const saved = getProgress(story.id);
    const y = saved && saved.chapterNumber === chapter.number ? saved.scrollPosition : 0;
    requestAnimationFrame(() => window.scrollTo(0, y || 0));
  }, [loading, story?.id, chapter?.id]);

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

  const handleContentClick = useCallback(() => setShowUI((value) => !value), []);
  const goChapter = (num: number) => navigate(`/story/${id}/chapter/${num}`, { replace: false });

  if (loading) return <ChapterSkeleton />;

  if (!story || !chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{t('chapterNotFound')}</p>
      </div>
    );
  }

  const chrome = chromeMap[readerSettings.theme];

  return (
    <div className={`min-h-screen flex justify-center ${pageBackgroundMap[readerSettings.background]}`}>
      <div className="w-full max-w-3xl relative mx-auto">
        <div
          className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl z-40 border-b transition-all duration-300 ${chrome.bg}
            ${showUI ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
        >
          <div className="flex items-center justify-between h-14 px-4">
            <button
              onClick={() => navigate(`/story/${story.id}`)}
              className={`w-9 h-9 flex items-center justify-center rounded-full ${chrome.hover}`}
            >
              <ChevronLeft size={22} className={chrome.text} />
            </button>
            <div className="text-center max-w-[180px]">
              <p className={`text-xs font-semibold truncate ${chrome.text}`}>{story.title}</p>
              <p className={`text-[10px] truncate ${chrome.sub}`}>{t('chapter')} {chapter.number}: {chapter.title}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate('/')}
                className={`w-9 h-9 flex items-center justify-center rounded-full ${chrome.hover}`}
              >
                <Home size={18} className={chrome.text} />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className={`w-9 h-9 flex items-center justify-center rounded-full ${chrome.hover}`}
              >
                <Settings2 size={18} className={chrome.text} />
              </button>
            </div>
          </div>
          <div className={`h-0.5 ${chrome.track}`}>
            <div
              className="h-full bg-primary-500 transition-all"
              style={{ width: `${(chapterNumber / totalChapters) * 100}%` }}
            />
          </div>
        </div>

        <div
          ref={contentRef}
          onClick={handleContentClick}
          className="px-6 md:px-10 lg:px-16 pt-20 pb-32 cursor-pointer select-none"
        >
          <h1 className={`text-xl font-bold mb-6 text-center ${titleTextMap[readerSettings.theme]}`}>
            {t('chapter')} {chapter.number}: {chapter.title}
          </h1>
          <div
            className={`
              ${fontSizeMap[readerSettings.fontSize]}
              ${lineHeightMap[readerSettings.lineHeight]}
              ${readerSettings.fontFamily === 'serif' ? 'font-serif' : 'font-sans'}
              ${readerTextMap[readerSettings.theme]}
              whitespace-pre-line
            `}
          >
            {chapter.content}
          </div>

          <div className={`flex items-center justify-center gap-1 mt-8 pb-4 ${chrome.sub}`}>
            <AlignLeft size={13} />
            <span className="text-xs">{chapter.wordCount.toLocaleString()} {t('words')}</span>
          </div>
        </div>

        <div
          className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl z-40 transition-all duration-300
            ${showUI ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
            ${chrome.bg} border-t`}
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
              {t('previousChapter')}
            </button>

            <button
              onClick={() => navigate(`/story/${story.id}`)}
              className={`flex flex-col items-center gap-0.5 text-xs ${chrome.sub}`}
            >
              <span className="font-medium">{chapterNumber}/{totalChapters}</span>
              <span>{t('chapter')}</span>
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
              {t('nextChapter')}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {showSettings && <ReaderSettingsPanel onClose={() => setShowSettings(false)} />}

      {showCompletedToast && story && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[400px] z-50
                        bg-gray-900 text-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
          <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{t('completedToastTitle')}</p>
            <p className="text-xs text-gray-400">{t('completedToastDesc')}</p>
          </div>
          <button
            onClick={() => {
              updateShelfStatus(story.id, 'completed');
              setShowCompletedToast(false);
            }}
            className="flex-shrink-0 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full"
          >
            {t('markCompleted')}
          </button>
          <button
            onClick={() => setShowCompletedToast(false)}
            className="flex-shrink-0 text-gray-400 text-xs"
          >
            x
          </button>
        </div>
      )}
    </div>
  );
}
