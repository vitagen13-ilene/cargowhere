import React from 'react';
import { RefreshCw, Car, Sun, Moon, Bookmark, Calculator, Code2 } from 'lucide-react';

interface NavbarProps {
  lastUpdated: Date;
  isRefreshing: boolean;
  onRefresh: () => void;
  dataSource: 'api' | 'fallback';
  darkMode: boolean;
  onToggleDarkMode: () => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
  onOpenCalculator: () => void;
  onOpenDeveloperModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lastUpdated,
  isRefreshing,
  onRefresh,
  dataSource,
  darkMode,
  onToggleDarkMode,
  favoritesCount,
  onOpenFavorites,
  onOpenCalculator,
  onOpenDeveloperModal,
}) => {
  const formattedTime = lastUpdated.toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                SG Carpark Live
              </span>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Singapore Real-Time Lots</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{dataSource === 'api' ? 'Data.gov.sg' : 'Live Sync'}</span>
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={onOpenCalculator}
              className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <Calculator className="w-4 h-4 text-slate-400" />
              <span>Rate Calculator</span>
            </button>

            <button
              onClick={onOpenFavorites}
              className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <Bookmark className="w-4 h-4 text-slate-400" />
              <span>Saved Lots</span>
              {favoritesCount > 0 && (
                <span className="text-xs px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 rounded font-mono">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenDeveloperModal}
              className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <Code2 className="w-4 h-4 text-slate-400" />
              <span>Backend API Specs</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-col items-end text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Last Sync</span>
              <span className="tabular-nums font-medium">{formattedTime}</span>
            </div>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh real-time lot counts from Data.gov.sg"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-600 rounded-lg hover:bg-slate-800 dark:hover:bg-emerald-500 active:scale-95 disabled:opacity-50 transition-all whitespace-nowrap shrink-0 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Lots</span>
            </button>

            <button
              onClick={onToggleDarkMode}
              aria-label="Toggle theme"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
