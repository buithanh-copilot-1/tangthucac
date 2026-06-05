import { NavLink } from 'react-router-dom';
import { Home, Compass, BookMarked, Settings } from 'lucide-react';
import { translate, type TranslationKey } from '@story-reader/shared';
import { useStore } from '../../store/useStore';

const tabs = [
  { to: '/', icon: Home, labelKey: 'home' },
  { to: '/browse', icon: Compass, labelKey: 'browse' },
  { to: '/library', icon: BookMarked, labelKey: 'library' },
  { to: '/settings', icon: Settings, labelKey: 'settingsTitle' },
] satisfies Array<{ to: string; icon: typeof Home; labelKey: TranslationKey }>;

export default function BottomNav() {
  const language = useStore((state) => state.readerSettings.language);
  const t = (key: TranslationKey) => translate(language, key);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-bottom z-40 shadow-[0_-1px_8px_rgba(0,0,0,0.06)] lg:hidden">
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ to, icon: Icon, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-2 transition-colors duration-150 ${
                isActive ? 'text-primary-500' : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[10px] font-medium ${isActive ? 'text-primary-500' : 'text-gray-400'}`}>
                  {t(labelKey)}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
