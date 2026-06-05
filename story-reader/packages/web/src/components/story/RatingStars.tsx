import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useToast } from '../../store/useToast';
import { ratingApi } from '../../services/engagement.api';

interface Props {
  storyId: string;
  /** Callback khi rating thay đổi để parent cập nhật avg/count hiển thị */
  onRated?: (avg: number, count: number) => void;
}

export default function RatingStars({ storyId, onRated }: Props) {
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.currentUser);
  const toast = useToast();
  const [myScore, setMyScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser) { setMyScore(0); return; }
    ratingApi.getMine(storyId)
      .then((r) => setMyScore(r.score))
      .catch(() => { /* silent */ });
  }, [storyId, currentUser]);

  const handleRate = async (score: number) => {
    if (!currentUser) {
      toast.info('Đăng nhập để đánh giá truyện');
      navigate('/login', { state: { from: `/story/${storyId}` } });
      return;
    }
    setSubmitting(true);
    const prev = myScore;
    setMyScore(score); // optimistic
    try {
      const res = await ratingApi.rate(storyId, score);
      onRated?.(res.rating, res.ratingCount);
      toast.success(`Đã đánh giá ${score} sao!`);
    } catch {
      setMyScore(prev);
      toast.error('Đánh giá thất bại, thử lại sau');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = (hover || myScore) >= n;
          return (
            <button
              key={n}
              disabled={submitting}
              onClick={() => handleRate(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="p-0.5 transition-transform active:scale-90 disabled:opacity-60"
              aria-label={`Đánh giá ${n} sao`}
            >
              <Star
                size={26}
                className={active ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
              />
            </button>
          );
        })}
      </div>
      <span className="text-xs text-gray-500">
        {myScore > 0 ? `Bạn: ${myScore}★` : 'Chạm để đánh giá'}
      </span>
    </div>
  );
}
