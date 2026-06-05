import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  showBack?: boolean;
}

const AVATAR_COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];

function UserAvatar() {
  const currentUser = useStore((s) => s.currentUser);

  if (!currentUser) {
    return (
      <Link
        to="/login"
        className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 border border-gray-200 text-gray-500 text-xs"
        title="Đăng nhập"
      >
        👤
      </Link>
    );
  }

  // Có ảnh Google thật → hiện ảnh
  if (currentUser.avatar?.startsWith('http')) {
    return (
      <Link to="/settings" title={currentUser.displayName ?? currentUser.username}>
        <img
          src={currentUser.avatar}
          alt={currentUser.displayName ?? currentUser.username}
          className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
          referrerPolicy="no-referrer"
        />
      </Link>
    );
  }

  // Fallback: chữ cái đầu + màu
  const initials = (currentUser.displayName ?? currentUser.username).slice(0, 2).toUpperCase();
  const colorIdx = currentUser.id.charCodeAt(currentUser.id.length - 1) % AVATAR_COLORS.length;
  return (
    <Link
      to="/settings"
      className={`w-9 h-9 flex items-center justify-center rounded-full text-white text-xs font-bold ${AVATAR_COLORS[colorIdx]}`}
      title={currentUser.displayName ?? currentUser.username}
    >
      {initials}
    </Link>
  );
}

export default function Header({
  title = 'TruyệnHay',
  showSearch = true,
  showBack = false,
}: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-mobile z-40 bg-white border-b border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between h-14 px-4">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
        ) : (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <span className="font-bold text-gray-900 text-lg leading-none">TruyệnHay</span>
          </Link>
        )}

        {showBack && (
          <h1 className="absolute left-1/2 -translate-x-1/2 font-semibold text-gray-900 text-base max-w-[200px] truncate">
            {title}
          </h1>
        )}

        <div className="flex items-center gap-2">
          {showSearch && (
            <Link
              to="/search"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <Search size={20} className="text-gray-600" />
            </Link>
          )}
          <UserAvatar />
        </div>
      </div>
    </header>
  );
}
