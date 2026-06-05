import { NavLink } from 'react-router-dom';
import { Home, Compass, BookMarked, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { translate, type TranslationKey } from '@story-reader/shared';
import { useStore } from '../../store/useStore';

const tabs = [
  { to: '/', icon: Home, labelKey: 'home' },
  { to: '/browse', icon: Compass, labelKey: 'browse' },
  { to: '/library', icon: BookMarked, labelKey: 'library' },
  { to: '/settings', icon: Settings, labelKey: 'settingsTitle' },
] satisfies Array<{ to: string; icon: typeof Home; labelKey: TranslationKey }>;

export default function SideNav() {
  const { sidebarCollapsed, toggleSidebar, readerSettings } = useStore();
  const t = (key: TranslationKey) => translate(readerSettings.language, key);

  return (
    <aside
      className={`hidden lg:flex flex-col fixed top-0 left-0 bottom-0 bg-white border-r border-gray-100 z-30 pt-14 overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      <nav className="flex flex-col gap-1 px-2 py-3 flex-1 overflow-y-auto overflow-x-hidden">
        {tabs.map(({ to, icon: Icon, labelKey }) => {
          const label = t(labelKey);
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              title={sidebarCollapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors duration-150 min-w-0
                ${sidebarCollapsed ? 'justify-center' : ''}
                ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} className="flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="truncate transition-opacity duration-200">{label}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 p-2">
        <button
          onClick={toggleSidebar}
          title={sidebarCollapsed ? t('expandSidebar') : t('collapseSidebar')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors duration-150 ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={18} className="flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft size={18} className="flex-shrink-0" />
              <span className="text-xs font-medium truncate">{t('collapseSidebar')}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
