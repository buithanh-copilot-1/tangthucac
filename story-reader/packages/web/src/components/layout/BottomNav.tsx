import { NavLink } from 'react-router-dom';
import { Home, Compass, BookMarked, Settings } from 'lucide-react';

const tabs = [
  { to: '/', icon: Home, label: 'Trang chủ' },
  { to: '/browse', icon: Compass, label: 'Khám phá' },
  { to: '/library', icon: BookMarked, label: 'Thư viện' },
  { to: '/settings', icon: Settings, label: 'Cài đặt' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-white border-t border-gray-100 safe-bottom z-40 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ to, icon: Icon, label }) => (
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
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
