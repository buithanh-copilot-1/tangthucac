import type { ReactNode } from 'react';
import BottomNav from './BottomNav';
import Header from './Header';
import SideNav from './SideNav';
import { useStore } from '../../store/useStore';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showSearch?: boolean;
  showBack?: boolean;
  hideHeader?: boolean;
  hideNav?: boolean;
}

export default function Layout({
  children,
  title,
  showSearch = true,
  showBack = false,
  hideHeader = false,
  hideNav = false,
}: LayoutProps) {
  const { sidebarCollapsed } = useStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideHeader && <Header title={title} showSearch={showSearch} showBack={showBack} />}
      {!hideNav && <SideNav />}
      <div
        className={[
          !hideHeader ? 'pt-14' : '',
          !hideNav ? (sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60') : '',
          'transition-[padding-left] duration-300',
        ].filter(Boolean).join(' ')}
      >
        <main className={!hideNav ? 'pb-20 lg:pb-8' : ''}>
          {children}
        </main>
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
}
