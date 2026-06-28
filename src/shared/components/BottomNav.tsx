import { Link, useLocation } from 'react-router-dom';
import { Home, Map as MapIcon, PlusCircle, BarChart2, Bot } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function BottomNav({ className }: { className?: string }) {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Map', path: '/map', icon: MapIcon },
    { name: 'Report', path: '/report', icon: PlusCircle, isPrimary: true },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart2 },
    { name: 'Agent', path: '/agent', icon: Bot },
  ];

  return (
    <nav className={cn("fixed bottom-0 left-0 right-0 bg-bg-surface border-t border-border flex justify-around items-center h-16 px-2 pb-2", className)}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        
        if (item.isPrimary) {
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center -mt-6"
            >
              <div className="bg-primary text-white p-3 rounded-full shadow-primary hover:bg-primary-light transition-colors">
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-medium mt-1 text-text-secondary">{item.name}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center w-16",
              isActive ? "text-primary" : "text-text-secondary hover:text-text-primary transition-colors"
            )}
          >
            <Icon className="h-5 w-5 mb-1" />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
