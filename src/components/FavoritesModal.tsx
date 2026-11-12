import React from 'react';
import { Carpark } from '../types/carpark';
import { X, Bookmark, Navigation, Trash2, ArrowRight } from 'lucide-react';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Carpark[];
  onSelectCarpark: (carpark: Carpark) => void;
  onRemoveFavorite: (id: string) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favorites,
  onSelectCarpark,
  onRemoveFavorite,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-500">
              <Bookmark className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Saved Singapore Carparks
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quick 1-click status checking for your daily routes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {favorites.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
              <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>You haven't bookmarked any carparks yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                Click the bookmark icon on any carpark card to pin it here.
              </p>
            </div>
          ) : (
            favorites.map((cp) => (
              <div
                key={cp.id}
                onClick={() => {
                  onSelectCarpark(cp);
                  onClose();
                }}
                className="py-3 flex items-center justify-between gap-3 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 -mx-3 px-3 rounded-lg transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">{cp.agency}</span>
                    <span>·</span>
                    <span>{cp.area}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {cp.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs">
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {cp.lots.car.available} lots free
                    </span>
                    <span className="text-slate-400">/ {cp.lots.car.total}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 font-mono text-[11px]">{cp.gantryHeight}m</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${cp.lat},${cp.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title="Directions"
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Navigation className="w-4 h-4 text-blue-500" />
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite(cp.id);
                    }}
                    title="Remove"
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all ml-1" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
