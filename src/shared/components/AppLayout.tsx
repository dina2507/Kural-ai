import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/shared/components/Sidebar';
import { BottomNav } from '@/shared/components/BottomNav';

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      <Sidebar className="hidden md:flex" />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto h-full">
          <Outlet />
        </div>
      </main>
      <BottomNav className="md:hidden" />
    </div>
  );
}
