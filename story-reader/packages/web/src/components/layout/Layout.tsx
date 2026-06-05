import type { ReactNode } from 'react';
import BottomNav from './BottomNav';
import Header from './Header';

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
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-mobile relative flex flex-col min-h-screen">
        {!hideHeader && <Header title={title} showSearch={showSearch} showBack={showBack} />}
        <main className={`flex-1 ${!hideHeader ? 'pt-14' : ''} ${!hideNav ? 'pb-20' : ''}`}>
          {children}
        </main>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
