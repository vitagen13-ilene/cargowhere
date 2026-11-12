import React from 'react';
import { Carpark } from '../types/carpark';
import { Navigation, Bookmark, Zap, Bike, ShieldCheck, ChevronRight } from 'lucide-react';

interface CarparkCardProps {
  carpark: Carpark;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (carpark: Carpark) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenDetails: (carpark: Carpark) => void;
}

export const CarparkCard: React.FC<CarparkCardProps> = ({
  carpark,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onOpenDetails,
}) => {
  const { car, motorcycle } = carpark.lots;
  const availableLots = car.available;
  const totalLots = car.total;
  const occupancy = carpark.occupancyRate;

  // Status visual treatment
  let statusBadgeColor = 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
  let statusLabel = 'Lots Available';
  let barColor = 'bg-emerald-500';

  if (carpark.status === 'filling_fast') {
    statusBadgeColor = 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
    statusLabel = 'Filling Fast';
    barColor = 'bg-amber-500';
  } else if (carpark.status === 'almost_full') {
    statusBadgeColor = 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';
    statusLabel = 'Limited Lots';
    barColor = 'bg-rose-500';
  } else if (carpark.status === 'full') {
    statusBadgeColor = 'text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800 border-slate-300 dark:border-slate-700';
    statusLabel = 'Carpark Full';
    barColor = 'bg-slate-400';
  }

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${carpark.lat},${carpark.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={() => onSelect(carpark)}
      className={`group relative bg-white dark:bg-slate-900 border rounded-xl p-4 transition-all duration-150 cursor-pointer ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
      }`}
    >
      {/* Top Header: Agency & Location metadata */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{carpark.agency}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{carpark.area}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px] text-slate-400">{carpark.id}</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
            {carpark.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
            {carpark.address}
          </p>
        </div>

        {/* Favorite Bookmark Button */}
        <button
          onClick={(e) => onToggleFavorite(carpark.id, e)}
          title={isFavorite ? 'Remove from saved carparks' : 'Save carpark'}
          className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
            isFavorite
              ? 'text-rose-500 border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40'
              : 'text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Real-Time Lot Counter Hero Zone */}
      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg flex items-center justify-between border border-slate-100 dark:border-slate-800/80">
        <div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Car Lots Available
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums font-mono">
              {availableLots}
            </span>
            <span className="text-xs text-slate-400 tabular-nums">
              / {totalLots} total
            </span>
          </div>
        </div>

        <div className="text-right flex flex-col items-end">
          <span
            className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-md border ${statusBadgeColor}`}
          >
            {statusLabel}
          </span>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
            {occupancy}% occupied
          </span>
        </div>
      </div>

      {/* Linear Occupancy Gauge */}
      <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width: `${occupancy}%` }}
        />
      </div>

      {/* Facilities & Rates Strip */}
      <div className="mt-3 flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-slate-600 dark:text-slate-300">
        {carpark.evCharging.hasEV && (
          <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
            <Zap className="w-3.5 h-3.5" />
            <span>{carpark.evCharging.chargerCount}x EV ({carpark.evCharging.powerKw}kW)</span>
          </span>
        )}

        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <Bike className="w-3.5 h-3.5" />
          <span className="tabular-nums font-mono">{motorcycle.available}</span> moto lots
        </span>

        <span className="text-slate-400 dark:text-slate-500">
          Clearance: <strong className="text-slate-700 dark:text-slate-300">{carpark.gantryHeight}m</strong>
        </span>

        {carpark.distanceKm !== undefined && (
          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium ml-auto">
            {carpark.distanceKm} km away
          </span>
        )}
      </div>

      {/* Rate Preview */}
      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <div className="text-slate-600 dark:text-slate-400 truncate max-w-[240px]">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Rate:</span>{' '}
          {carpark.rates.weekdayDay}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDirections}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Directions</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(carpark);
            }}
            className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-medium hover:underline px-2 py-1"
          >
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
