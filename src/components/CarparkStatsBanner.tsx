import React from 'react';
import { Car, Zap, Bike, AlertCircle } from 'lucide-react';
import { Carpark } from '../types/carpark';

interface CarparkStatsBannerProps {
  carparks: Carpark[];
  totalAvailableLots: number;
  totalMonitoredLots: number;
}

export const CarparkStatsBanner: React.FC<CarparkStatsBannerProps> = ({
  carparks,
  totalAvailableLots,
  totalMonitoredLots,
}) => {
  const totalMotoAvailable = carparks.reduce((sum, c) => sum + c.lots.motorcycle.available, 0);
  const evLocationsCount = carparks.filter((c) => c.evCharging.hasEV).length;
  const criticalCarparksCount = carparks.filter(
    (c) => c.status === 'almost_full' || c.status === 'full'
  ).length;

  const occupancyPercent =
    totalMonitoredLots > 0
      ? Math.round(((totalMonitoredLots - totalAvailableLots) / totalMonitoredLots) * 100)
      : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Metric 1: Available Car Lots */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="text-xs font-medium">Available Car Lots</span>
          <Car className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {totalAvailableLots.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 tabular-nums">
            / {totalMonitoredLots.toLocaleString()}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{carparks.length} monitored hubs</span>
          <span className="tabular-nums font-mono text-emerald-600 dark:text-emerald-400 font-medium">
            {100 - occupancyPercent}% free
          </span>
        </div>
      </div>

      {/* Metric 2: Citywide Occupancy Rate */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="text-xs font-medium">City Occupancy Rate</span>
          <div className="text-xs font-mono text-slate-400">SG AVG</div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {occupancyPercent}%
          </span>
        </div>
        <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              occupancyPercent > 85
                ? 'bg-rose-500'
                : occupancyPercent > 65
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${occupancyPercent}%` }}
          />
        </div>
      </div>

      {/* Metric 3: Motorcycle Lots */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="text-xs font-medium">Motorcycle Lots</span>
          <Bike className="w-4 h-4 text-sky-600 dark:text-sky-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {totalMotoAvailable.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400">available</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Class Y Lots across SG</span>
        </div>
      </div>

      {/* Metric 4: EV Charging & High Demand */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="text-xs font-medium">EV & Status Watch</span>
          <Zap className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {evLocationsCount}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">EV hubs</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          {criticalCarparksCount > 0 ? (
            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="tabular-nums font-mono">{criticalCarparksCount}</span> almost full
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400">All carparks flowing well</span>
          )}
        </div>
      </div>
    </div>
  );
};
