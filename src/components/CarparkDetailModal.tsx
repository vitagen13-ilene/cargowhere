import React, { useState } from 'react';
import { Carpark } from '../types/carpark';
import {
  X,
  Navigation,
  Bookmark,
  Zap,
  Bike,
  Clock,
  DollarSign,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { estimateParkingFee } from '../services/carparkService';

interface CarparkDetailModalProps {
  carpark: Carpark | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const CarparkDetailModal: React.FC<CarparkDetailModalProps> = ({
  carpark,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);
  const [calcHours, setCalcHours] = useState(2);
  const [calcEntryHour, setCalcEntryHour] = useState(14); // 2pm
  const [calcIsWeekend, setCalcIsWeekend] = useState(false);

  if (!isOpen || !carpark) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${carpark.name}, ${carpark.address}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calculatedFee = estimateParkingFee(carpark, calcHours, calcEntryHour, calcIsWeekend);

  // Hourly typical occupancy profile (0 to 23 hours)
  const hourlyOccupancy = [
    20, 15, 12, 10, 10, 15, 35, 65, 85, 90, 88, 95, 98, 92, 85, 80, 82, 92, 95,
    88, 70, 50, 35, 25,
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">{carpark.agency}</span>
              <span>·</span>
              <span>{carpark.area}</span>
              <span>·</span>
              <span className="font-mono text-slate-400">{carpark.id}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {carpark.name}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="truncate">{carpark.address}</span>
              <button
                onClick={handleCopyAddress}
                title="Copy address"
                className="p-1 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleFavorite(carpark.id)}
              className={`p-2 rounded-lg border transition-colors ${
                isFavorite
                  ? 'text-rose-500 border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40'
                  : 'text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-600'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Live Capacity Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Available Car Lots
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                  {carpark.lots.car.available}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  / {carpark.lots.car.total}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {carpark.occupancyRate}% current occupancy
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Motorcycle Lots
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-sky-600 dark:text-sky-400 font-mono tabular-nums">
                  {carpark.lots.motorcycle.available}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  / {carpark.lots.motorcycle.total}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Class Y Bay Lots</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                EV Fast Charging
              </span>
              {carpark.evCharging.hasEV ? (
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>{carpark.evCharging.chargerCount}x Chargers</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {carpark.evCharging.provider} ({carpark.evCharging.powerKw}kW)
                  </span>
                </div>
              ) : (
                <div className="text-xs text-slate-400 mt-2">No EV chargers installed</div>
              )}
            </div>
          </div>

          {/* Typical Occupancy Forecast */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Typical 24-Hour Occupancy Pattern</span>
              </h3>
              <span className="text-[11px] text-slate-400">Peak at 12pm - 2pm & 7pm</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="h-20 flex items-end gap-1 sm:gap-1.5 pt-4">
                {hourlyOccupancy.map((occ, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center group relative h-full justify-end"
                  >
                    <div
                      className={`w-full rounded-t transition-all ${
                        occ > 90
                          ? 'bg-rose-500'
                          : occ > 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500/70'
                      }`}
                      style={{ height: `${occ}%` }}
                    />
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-7 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20 font-mono">
                      {idx}:00 - {occ}%
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5 px-0.5">
                <span>12 AM</span>
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
                <span>11 PM</span>
              </div>
            </div>
          </div>

          {/* Real-Time Parking Fee Calculator */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Estimated Parking Fee Calculator</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                Grace Period: {carpark.rates.gracePeriodMinutes} mins
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              {/* Duration */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Duration (Hours)
                </label>
                <select
                  value={calcHours}
                  onChange={(e) => setCalcHours(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value={0.25}>15 mins</option>
                  <option value={0.5}>30 mins</option>
                  <option value={1}>1 hour</option>
                  <option value={2}>2 hours</option>
                  <option value={3}>3 hours</option>
                  <option value={4}>4 hours</option>
                  <option value={6}>6 hours</option>
                  <option value={10}>10 hours (Full Day)</option>
                </select>
              </div>

              {/* Arrival Time */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Arrival Time
                </label>
                <select
                  value={calcEntryHour}
                  onChange={(e) => setCalcEntryHour(parseInt(e.target.value, 10))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value={9}>Morning (9:00 AM)</option>
                  <option value={13}>Lunch (1:00 PM)</option>
                  <option value={16}>Afternoon (4:00 PM)</option>
                  <option value={19}>Evening (7:00 PM)</option>
                  <option value={23}>Late Night (11:00 PM)</option>
                </select>
              </div>

              {/* Day of Week */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Day of Week
                </label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCalcIsWeekend(false)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      !calcIsWeekend
                        ? 'bg-slate-900 dark:bg-emerald-600 text-white border-transparent'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Weekday
                  </button>
                  <button
                    onClick={() => setCalcIsWeekend(true)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      calcIsWeekend
                        ? 'bg-slate-900 dark:bg-emerald-600 text-white border-transparent'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Weekend
                  </button>
                </div>
              </div>
            </div>

            {/* Calculated Result Box */}
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  {calculatedFee.breakdownText}
                </span>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  {carpark.rates.nightCap ? `Night Cap: ${carpark.rates.nightCap}` : 'Standard schedule rates'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Estimated</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  ${calculatedFee.totalFee.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Full Rate Breakdown & Specifications */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Rate Breakdown & Clearance
            </h3>
            <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Weekday Daytime</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right">
                  {carpark.rates.weekdayDay}
                </span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Weekday Evening</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right">
                  {carpark.rates.weekdayNight}
                </span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Saturday & Sunday/PH</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right">
                  {carpark.rates.weekend}
                </span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Free Parking Scheme</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-right">
                  {carpark.freeParking}
                </span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Gantry Height Clearance</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  {carpark.gantryHeight} meters
                </span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Parking Decks & Type</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {carpark.decks} decks · {carpark.carparkType}
                </span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Gantry System</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {carpark.parkingSystem}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Lat: {carpark.lat.toFixed(4)}, Lng: {carpark.lng.toFixed(4)}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${carpark.lat},${carpark.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions</span>
              <ArrowUpRight className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
