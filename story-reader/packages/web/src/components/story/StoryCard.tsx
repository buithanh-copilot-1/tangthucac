import { Link } from 'react-router-dom';
import { Star, BookOpen } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Story } from '@story-reader/shared';
import { formatNumber, statusLabel, statusColor, translate, type TranslationKey } from '@story-reader/shared';
import { useStore } from '../../store/useStore';

interface StoryCardProps {
  story: Story;
  variant?: 'grid' | 'list' | 'horizontal';
  highlightQuery?: string;
}

function highlightText(text: string, query?: string): ReactNode {
  const q = query?.trim();
  if (!q) return text;
  const index = text.toLowerCase().indexOf(q.toLowerCase());
  if (index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-yellow-100 px-0.5 text-yellow-800">{text.slice(index, index + q.length)}</mark>
      {text.slice(index + q.length)}
    </>
  );
}

export default function StoryCard({ story, variant = 'grid', highlightQuery }: StoryCardProps) {
  const { readerSettings } = useStore();
  const t = (k: TranslationKey) => translate(readerSettings.language, k);
  if (variant === 'horizontal') {
    return (
      <Link to={`/story/${story.id}`} className="flex-shrink-0 w-32 story-card-hover block">
        <div className="relative">
          <img
            src={story.cover}
            alt={story.title}
            className="w-32 h-44 object-cover rounded-xl shadow-sm"
            loading="lazy"
          />
          {story.isHot && (
            <span className="absolute top-1.5 left-1.5 bg-primary-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
              HOT
            </span>
          )}
        </div>
        <div className="mt-2">
          <p className="text-xs font-semibold text-gray-900 leading-tight line-clamp-2">{highlightText(story.title, highlightQuery)}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">{highlightText(story.author, highlightQuery)}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star size={9} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] text-gray-500">{(story.rating ?? 0).toFixed(1)}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'list') {
    return (
      <Link to={`/story/${story.id}`} className="flex gap-3 p-3 bg-white rounded-xl story-card-hover active:bg-gray-50">
        <div className="relative flex-shrink-0">
          <img
            src={story.cover}
            alt={story.title}
            className="w-16 h-22 object-cover rounded-lg shadow-sm"
            style={{ height: '88px' }}
            loading="lazy"
          />
          {story.isHot && (
            <span className="absolute -top-1 -left-1 bg-primary-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
              HOT
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">{highlightText(story.title, highlightQuery)}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{highlightText(story.author, highlightQuery)}</p>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">{highlightText(story.description, highlightQuery)}</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Star size={11} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-gray-500">{(story.rating ?? 0).toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen size={11} className="text-gray-400" />
              <span className="text-xs text-gray-500">{formatNumber(story.totalChapters)} {t('chaptersLabel')}</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(story.status)}`}>
              {statusLabel(story.status)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // grid variant
  return (
    <Link to={`/story/${story.id}`} className="story-card-hover block">
      <div className="relative">
        <img
          src={story.cover}
          alt={story.title}
          className="w-full aspect-[3/4] object-cover rounded-xl shadow-sm"
          loading="lazy"
        />
        {story.isHot && (
          <span className="absolute top-2 left-2 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            HOT
          </span>
        )}
        {story.status === 'completed' && (
          <span className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            Full
          </span>
        )}
      </div>
      <div className="mt-2">
        <p className="text-xs font-semibold text-gray-900 leading-tight line-clamp-2">{highlightText(story.title, highlightQuery)}</p>
        <p className="text-[10px] text-gray-500 mt-0.5">{highlightText(story.author, highlightQuery)}</p>
        <div className="flex items-center gap-1 mt-1">
          <Star size={10} className="text-yellow-400 fill-yellow-400" />
          <span className="text-[10px] text-gray-500">{(story.rating ?? 0).toFixed(1)}</span>
          <span className="text-[10px] text-gray-400">· {formatNumber(story.views)}</span>
        </div>
      </div>
    </Link>
  );
}
