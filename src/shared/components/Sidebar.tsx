import { Link, useLocation } from 'react-router-dom';
import { Home, Map as MapIcon, PlusCircle, BarChart2, Bot, List, LogOut, FileText, Trophy, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { APP_CONFIG } from '@/lib/config';
import { signOut } from '@/lib/firebase/client';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function Sidebar({ className }: { className?: string }) {
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/auth';
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Map', path: '/map', icon: MapIcon },
    { name: 'Report', path: '/report', icon: PlusCircle },
    { name: 'My Reports', path: '/my-reports', icon: FileText },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart2 },
    { name: 'Agent', path: '/agent', icon: Bot },
  ];

  return (
    <aside className={cn("w-[240px] bg-bg-surface border-r border-border flex flex-col", className)}>
      <div className="p-6">
        <h1 className="text-2xl font-black text-text-primary tracking-tight">{APP_CONFIG.name}</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary-subtle text-primary border-l-2 border-primary" 
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
        
        <div className="pt-6 pb-2">
          <p className="px-4 text-xs font-medium text-text-tertiary uppercase tracking-wider">
            Management
          </p>
        </div>
        
        <Link
          to="/issues"
          className={cn(
            "flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors",
            location.pathname === '/issues'
              ? "bg-primary-subtle text-primary border-l-2 border-primary" 
              : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
          )}
        >
          <List className="mr-3 h-5 w-5" />
          Issues
        </Link>
      </nav>

      <div className="p-4 border-t border-border">
        <button 
          onClick={handleSignOut}
          className="flex w-full items-center px-4 py-3 text-sm font-medium text-text-secondary hover:bg-bg-elevated hover:text-text-primary rounded-md transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
