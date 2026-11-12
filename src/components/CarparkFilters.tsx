import React from 'react';
import { Search, X, SlidersHorizontal, Map, List, Columns, Heart } from 'lucide-react';
import { FilterState, AgencyType } from '../types/carpark';
import { SINGAPORE_AREAS } from '../data/singaporeCarparksData';

interface CarparkFiltersProps {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  viewMode: 'split' | 'map' | 'list';
  onViewModeChange: (mode: 'split' | 'map' | 'list') => void;
  resultsCount: number;
  totalCount: number;
}

export const CarparkFilters: React.FC<CarparkFiltersProps> = ({
  filters,
  onChange,
  onReset,
  viewMode,
  onViewModeChange,
  resultsCount,
  totalCount,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const agencies: Array<'All' | AgencyType> = ['All', 'HDB', 'URA', 'Commercial'];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm transition-colors">
      {/* Top Search & Primary Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange({ searchQuery: e.target.value })}
            placeholder="Search by carpark name, address, HDB code (e.g. ACB, ION, Tampines)..."
            className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Region Dropdown */}
        <div className="w-full md:w-56">
          <select
            value={filters.area}
            onChange={(e) => onChange({ area: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            {SINGAPORE_AREAS.map((area) => (
              <option key={area} value={area === 'All Areas' ? '' : area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="w-full md:w-48">
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onChange({
                sortBy: e.target.value as FilterState['sortBy'],
              })
            }
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="lots_desc">Most Lots Available</option>
            <option value="lots_asc">Fewest Lots Available</option>
            <option value="occupancy_asc">Lowest Occupancy %</option>
            <option value="occupancy_desc">Highest Occupancy %</option>
            <option value="distance">Nearest Distance</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {/* View Mode Switcher */}
        <div className="hidden lg:flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => onViewModeChange('split')}
            title="Split Map & List"
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'split'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Columns className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('map')}
            title="Map View Focus"
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'map'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Map className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            title="List View Focus"
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Toggle Advanced Filters Button */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors shrink-0 ${
            showAdvanced
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
        </button>
      </div>

      {/* Advanced Filter Options Drawer */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Agency Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Agency / Operator
            </label>
            <div className="flex flex-wrap gap-1">
              {agencies.map((agency) => (
                <button
                  key={agency}
                  onClick={() => onChange({ agency })}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    filters.agency === agency
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {agency}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle & Lot Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Vehicle / Facility Type
            </label>
            <div className="flex flex-wrap gap-1">
              {[
                { label: 'All Lots', val: 'all' },
                { label: 'Cars', val: 'car' },
                { label: 'Motorcycles', val: 'motorcycle' },
                { label: '⚡ EV Only', val: 'ev' },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() =>
                    onChange({
                      vehicleType: item.val as FilterState['vehicleType'],
                      evOnly: item.val === 'ev',
                    })
                  }
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    filters.vehicleType === item.val
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Available Lots */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Minimum Available Lots
            </label>
            <div className="flex items-center gap-1">
              {[0, 10, 30, 50, 100].map((min) => (
                <button
                  key={min}
                  onClick={() => onChange({ minLotsAvailable: min })}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                    filters.minLotsAvailable === min
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {min === 0 ? 'Any' : `>${min}`}
                </button>
              ))}
            </div>
          </div>

          {/* Gantry Clearance Height */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Min Clearance Height
            </label>
            <div className="flex items-center gap-1">
              {[0, 2.0, 2.1, 2.15].map((height) => (
                <button
                  key={height}
                  onClick={() => onChange({ minHeightClearance: height })}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                    filters.minHeightClearance === height
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {height === 0 ? 'Any' : `≥${height}m`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Badges & Results Counter Bar */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-slate-900 dark:text-white tabular-nums">{resultsCount}</strong> of{' '}
            <span className="tabular-nums">{totalCount}</span> Singapore Carparks
          </span>

          {filters.favoritesOnly && (
            <span className="inline-flex items-center gap-1 text-rose-500 font-medium">
              <Heart className="w-3 h-3 fill-rose-500" />
              <span>Favorites Only</span>
            </span>
          )}
        </div>

        {(filters.searchQuery ||
          filters.area ||
          filters.agency !== 'All' ||
          filters.vehicleType !== 'all' ||
          filters.minLotsAvailable > 0 ||
          filters.minHeightClearance > 0 ||
          filters.favoritesOnly) && (
          <button
            onClick={onReset}
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
};
