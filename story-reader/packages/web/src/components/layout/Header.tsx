import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, UserRound, Palette } from 'lucide-react';
import { readerThemes, translate, type TranslationKey } from '@story-reader/shared';
import { useStore } from '../../store/useStore';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  showBack?: boolean;
}

const AVATAR_COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];

function ThemeButton() {
  const { readerSettings, appTheme, setAppTheme } = useStore();
  const [open, setOpen] = useState(false);
  const t = (key: TranslationKey) => translate(readerSettings.language, key);
  const currentTheme = readerThemes.find((theme) => theme.value === appTheme) ?? readerThemes[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
        title={t('theme')}
      >
        <Palette size={19} className="text-gray-600" />
        <span
          className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full border border-white"
          style={{ backgroundColor: currentTheme.swatch }}
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close theme menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl">
            <p className="px-1 pb-2 text-xs font-semibold uppercase text-gray-400">{t('theme')}</p>
            <div className="grid grid-cols-2 gap-2">
              {readerThemes.map((theme) => (
                <button
                  key={theme.value}
                  type="button"
                  onClick={() => {
                      setAppTheme(theme.value);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-xs font-semibold transition-colors ${
                      appTheme === theme.value
                        ? 'border-primary-400 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-black/10"
                    style={{ backgroundColor: theme.swatch }}
                  />
                  <span className="truncate">{t(theme.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function UserAvatar() {
  const { currentUser, readerSettings } = useStore();
  const t = (key: TranslationKey) => translate(readerSettings.language, key);

  if (!currentUser) {
    return (
      <Link
        to="/login"
        className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 border border-gray-200 text-gray-500"
        title={t('login')}
      >
        <UserRound size={18} />
      </Link>
    );
  }

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
  title,
  showSearch = true,
  showBack = false,
}: HeaderProps) {
  const navigate = useNavigate();
  const { toggleSidebar, readerSettings } = useStore();
  const t = (key: TranslationKey) => translate(readerSettings.language, key);
  const siteTitle = title ?? t('siteName');

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        <div className="flex items-center gap-1">
          {!showBack && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden lg:flex w-9 h-9 items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
              title={t('toggleMenu')}
            >
              <Menu size={20} className="text-gray-600" />
            </button>
          )}

          {showBack ? (
            <button
              type="button"
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
              <span className="font-bold text-gray-900 text-lg leading-none">{t('siteName')}</span>
            </Link>
          )}
        </div>

        {showBack && (
          <h1 className="absolute left-1/2 -translate-x-1/2 font-semibold text-gray-900 text-base max-w-[200px] truncate">
            {siteTitle}
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
          <ThemeButton />
          <UserAvatar />
        </div>
      </div>
    </header>
  );
}
