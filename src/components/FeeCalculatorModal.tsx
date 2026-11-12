import React, { useState } from 'react';
import { Carpark } from '../types/carpark';
import { X, Calculator, ArrowRight, DollarSign, Clock } from 'lucide-react';
import { estimateParkingFee } from '../services/carparkService';
import { SINGAPORE_AREAS } from '../data/singaporeCarparksData';

interface FeeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  carparks: Carpark[];
  onSelectCarpark: (carpark: Carpark) => void;
}

export const FeeCalculatorModal: React.FC<FeeCalculatorModalProps> = ({
  isOpen,
  onClose,
  carparks,
  onSelectCarpark,
}) => {
  const [selectedArea, setSelectedArea] = useState<string>('Orchard / Somerset');
  const [hours, setHours] = useState<number>(2);
  const [entryHour, setEntryHour] = useState<number>(14);
  const [isWeekend, setIsWeekend] = useState<boolean>(false);

  if (!isOpen) return null;

  // Filter carparks in the chosen precinct
  const precinctCarparks = carparks.filter(
    (c) => selectedArea === 'All Areas' || c.area === selectedArea
  );

  // Compute fees for each and sort ascending by price
  const comparedCarparks = precinctCarparks.map((cp) => {
    const feeInfo = estimateParkingFee(cp, hours, entryHour, isWeekend);
    return {
      carpark: cp,
      fee: feeInfo.totalFee,
      breakdown: feeInfo.breakdownText,
    };
  }).sort((a, b) => a.fee - b.fee);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Singapore Parking Rate Comparator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compare parking fees across carparks in the same precinct
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

        {/* Filter / Inputs */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Precinct / Area
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white"
            >
              {SINGAPORE_AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Parking Duration
            </label>
            <select
              value={hours}
              onChange={(e) => setHours(parseFloat(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white"
            >
              <option value={0.5}>30 mins</option>
              <option value={1}>1 hour</option>
              <option value={1.5}>1.5 hours</option>
              <option value={2}>2 hours</option>
              <option value={3}>3 hours</option>
              <option value={4}>4 hours</option>
              <option value={6}>6 hours</option>
              <option value={8}>8 hours</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Entry Time
            </label>
            <select
              value={entryHour}
              onChange={(e) => setEntryHour(parseInt(e.target.value, 10))}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white"
            >
              <option value={10}>Morning (10:00 AM)</option>
              <option value={13}>Lunch (1:00 PM)</option>
              <option value={18}>Dinner / Night (6:00 PM)</option>
              <option value={20}>Evening (8:00 PM)</option>
              <option value={23}>Late Night (11:00 PM)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Day Type
            </label>
            <div className="flex gap-1">
              <button
                onClick={() => setIsWeekend(false)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  !isWeekend
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white border-transparent'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
                }`}
              >
                Weekday
              </button>
              <button
                onClick={() => setIsWeekend(true)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  isWeekend
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white border-transparent'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
                }`}
              >
                Weekend
              </button>
            </div>
          </div>
        </div>

        {/* Compared Carparks Ranked List */}
        <div className="p-5 max-h-[55vh] overflow-y-auto space-y-2.5">
          {comparedCarparks.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No carparks found in this precinct.
            </div>
          ) : (
            comparedCarparks.map((item, index) => {
              const isCheapest = index === 0;
              return (
                <div
                  key={item.carpark.id}
                  onClick={() => {
                    onSelectCarpark(item.carpark);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isCheapest
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 hover:border-emerald-400'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      {isCheapest && (
                        <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">
                          Cheapest
                        </span>
                      )}
                      <span className="font-semibold text-slate-600 dark:text-slate-400">
                        {item.carpark.agency}
                      </span>
                      <span>·</span>
                      <span className="text-slate-400 font-mono text-[11px]">{item.carpark.id}</span>
                      <span>·</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                        {item.carpark.lots.car.available} lots free
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                      {item.carpark.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.breakdown}
                    </p>
                  </div>

                  <div className="text-right flex items-center gap-3 shrink-0">
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider block">Est. Cost</span>
                      <span className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                        ${item.fee.toFixed(2)}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 hover:text-slate-900" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
