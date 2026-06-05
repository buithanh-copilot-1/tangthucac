import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, Trash2, CornerDownRight } from 'lucide-react';
import { formatDate } from '@story-reader/shared';
import { useStore } from '../../store/useStore';
import { useToast } from '../../store/useToast';
import { commentApi, type Comment } from '../../services/engagement.api';

const AVATAR_COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];

function Avatar({ user }: { user: Comment['user'] }) {
  if (user.avatarUrl?.startsWith('http')) {
    return <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />;
  }
  const name = user.displayName ?? user.username;
  const idx = user.id.charCodeAt(user.id.length - 1) % AVATAR_COLORS.length;
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[idx]}`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function CommentItem({
  comment, isReply, onReply, onDelete, currentUserId,
}: {
  comment: Comment;
  isReply?: boolean;
  onReply: (c: Comment) => void;
  onDelete: (id: string) => void;
  currentUserId?: string;
}) {
  return (
    <div className={`flex gap-2.5 ${isReply ? 'ml-9 mt-3' : ''}`}>
      {isReply && <CornerDownRight size={14} className="text-gray-300 mt-2 flex-shrink-0" />}
      <Avatar user={comment.user} />
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-2xl px-3.5 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-gray-900 truncate">
              {comment.user.displayName ?? comment.user.username}
            </span>
            <span className="text-[10px] text-gray-400 flex-shrink-0">{formatDate(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap break-words">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-1 ml-1">
          {!isReply && (
            <button onClick={() => onReply(comment)} className="text-xs text-gray-500 font-medium">
              Trả lời
            </button>
          )}
          {currentUserId === comment.userId && (
            <button onClick={() => onDelete(comment.id)} className="text-xs text-red-400 font-medium flex items-center gap-1">
              <Trash2 size={11} /> Xóa
            </button>
          )}
        </div>
        {/* Replies */}
        {comment.replies?.map((r) => (
          <CommentItem key={r.id} comment={r} isReply onReply={onReply} onDelete={onDelete} currentUserId={currentUserId} />
        ))}
      </div>
    </div>
  );
}

export default function CommentsSection({ storyId }: { storyId: string }) {
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.currentUser);
  const toast = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    commentApi.list(storyId)
      .then(setComments)
      .catch(() => { /* silent */ })
      .finally(() => setLoading(false));
  };

  useEffect(load, [storyId]);

  const totalCount = comments.reduce((sum, c) => sum + 1 + (c.replies?.length ?? 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.info('Đăng nhập để bình luận');
      navigate('/login', { state: { from: `/story/${storyId}` } });
      return;
    }
    if (!input.trim()) return;
    setSubmitting(true);
    try {
      await commentApi.create(storyId, input.trim(), replyTo?.id);
      setInput('');
      setReplyTo(null);
      load();
    } catch {
      toast.error('Gửi bình luận thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await commentApi.remove(id);
      load();
      toast.success('Đã xóa bình luận');
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  return (
    <div className="mt-6">
      <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-4">
        <MessageCircle size={18} className="text-primary-500" />
        Bình luận
        <span className="text-sm font-normal text-gray-400">({totalCount})</span>
      </h3>

      {/* Input box */}
      <form onSubmit={handleSubmit} className="mb-5">
        {replyTo && (
          <div className="flex items-center justify-between bg-primary-50 rounded-lg px-3 py-1.5 mb-2">
            <span className="text-xs text-primary-600">
              Đang trả lời <b>{replyTo.user.displayName ?? replyTo.user.username}</b>
            </span>
            <button type="button" onClick={() => setReplyTo(null)} className="text-xs text-gray-400">Hủy</button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={currentUser ? 'Viết bình luận...' : 'Đăng nhập để bình luận...'}
            rows={1}
            className="flex-1 resize-none bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-400 max-h-32"
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = `${Math.min(t.scrollHeight, 128)}px`;
            }}
          />
          <button
            type="submit"
            disabled={submitting || !input.trim()}
            className="w-10 h-10 flex-shrink-0 bg-primary-500 text-white rounded-full flex items-center justify-center disabled:opacity-40 active:bg-primary-600"
          >
            <Send size={16} />
          </button>
        </div>
      </form>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <MessageCircle size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Chưa có bình luận nào</p>
          <p className="text-xs mt-0.5">Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              onReply={setReplyTo}
              onDelete={handleDelete}
              currentUserId={currentUser?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
