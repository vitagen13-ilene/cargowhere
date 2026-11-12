import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Carpark, FilterState } from './types/carpark';
import { INITIAL_CARPARKS } from './data/singaporeCarparksData';
import { fetchLiveCarparkAvailability } from './services/carparkService';
import { Navbar } from './components/Navbar';
import { CarparkStatsBanner } from './components/CarparkStatsBanner';
import { CarparkFilters } from './components/CarparkFilters';
import { CarparkMap } from './components/CarparkMap';
import { CarparkCard } from './components/CarparkCard';
import { CarparkDetailModal } from './components/CarparkDetailModal';
import { FavoritesModal } from './components/FavoritesModal';
import { FeeCalculatorModal } from './components/FeeCalculatorModal';
import { DeveloperBackendModal } from './components/DeveloperBackendModal';
import { Car, AlertCircle, RefreshCw, Bookmark, Sparkles } from 'lucide-react';

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  area: '',
  agency: 'All',
  vehicleType: 'all',
  minLotsAvailable: 0,
  minHeightClearance: 0,
  evOnly: false,
  favoritesOnly: false,
  sortBy: 'lots_desc',
};

export default function App() {
  const [carparks, setCarparks] = useState<Carpark[]>(INITIAL_CARPARKS);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<'lta' | 'api' | 'fallback'>('api');
  const [totalMonitoredLots, setTotalMonitoredLots] = useState<number>(0);
  const [totalAvailableLots, setTotalAvailableLots] = useState<number>(0);

  // User Preferences & State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('sg_carpark_theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sg_carpark_favorites');
      return saved ? JSON.parse(saved) : ['OR1', 'CBD1', 'ACB'];
    } catch {
      return ['OR1', 'CBD1', 'ACB'];
    }
  });

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [selectedCarpark, setSelectedCarpark] = useState<Carpark | null>(null);
  const [detailCarpark, setDetailCarpark] = useState<Carpark | null>(null);

  // Modals
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isDeveloperOpen, setIsDeveloperOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Sync dark mode class on document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sg_carpark_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sg_carpark_theme', 'light');
    }
  }, [darkMode]);

  // Save favorites
  useEffect(() => {
    localStorage.setItem('sg_carpark_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Initial Data Fetch & Periodic 60s Sync
  const loadAvailability = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsRefreshing(true);
      try {
        const result = await fetchLiveCarparkAvailability(carparks, userLocation);
        setCarparks(result.carparks);
        setLastUpdated(result.lastUpdated);
        setDataSource(result.source);
        setTotalMonitoredLots(result.totalMonitoredLots);
        setTotalAvailableLots(result.totalAvailableLots);

        // Keep selectedCarpark in sync with latest lot counts
        if (selectedCarpark) {
          const fresh = result.carparks.find((c) => c.id === selectedCarpark.id);
          if (fresh) setSelectedCarpark(fresh);
        }
        if (detailCarpark) {
          const fresh = result.carparks.find((c) => c.id === detailCarpark.id);
          if (fresh) setDetailCarpark(fresh);
        }
      } catch (err) {
        console.error('Failed to load lot availability:', err);
      } finally {
        if (showLoading) setIsRefreshing(false);
      }
    },
    [carparks, userLocation, selectedCarpark, detailCarpark]
  );

  // Initial load
  useEffect(() => {
    loadAvailability(true);
  }, []);

  // 60-second background polling
  useEffect(() => {
    const timer = setInterval(() => {
      loadAvailability(false);
    }, 60000);
    return () => clearInterval(timer);
  }, [loadAvailability]);

  // Request user geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);
        loadAvailability(false);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err.message);
        // Fallback default to central Singapore location (e.g. Orchard / CBD)
        setUserLocation({ lat: 1.3040, lng: 103.8318 });
      },
      { timeout: 8000 }
    );
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenDetails = (carpark: Carpark) => {
    setDetailCarpark(carpark);
    setIsDetailOpen(true);
  };

  // Filter & Sort Logic
  const filteredCarparks = useMemo(() => {
    return carparks
      .filter((cp) => {
        // Search query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchName = cp.name.toLowerCase().includes(q);
          const matchAddress = cp.address.toLowerCase().includes(q);
          const matchId = cp.id.toLowerCase().includes(q);
          const matchArea = cp.area.toLowerCase().includes(q);
          if (!matchName && !matchAddress && !matchId && !matchArea) return false;
        }

        // Area
        if (filters.area && cp.area !== filters.area) {
          return false;
        }

        // Agency
        if (filters.agency !== 'All' && cp.agency !== filters.agency) {
          return false;
        }

        // Vehicle / Facility Type
        if (filters.vehicleType === 'car' && cp.lots.car.total <= 0) return false;
        if (filters.vehicleType === 'motorcycle' && cp.lots.motorcycle.available <= 0) return false;
        if ((filters.vehicleType === 'ev' || filters.evOnly) && !cp.evCharging.hasEV) return false;

        // Min lots available
        if (filters.minLotsAvailable > 0 && cp.lots.car.available < filters.minLotsAvailable) {
          return false;
        }

        // Min height clearance
        if (filters.minHeightClearance > 0 && cp.gantryHeight < filters.minHeightClearance) {
          return false;
        }

        // Favorites only
        if (filters.favoritesOnly && !favorites.includes(cp.id)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'lots_desc') {
          return b.lots.car.available - a.lots.car.available;
        }
        if (filters.sortBy === 'lots_asc') {
          return a.lots.car.available - b.lots.car.available;
        }
        if (filters.sortBy === 'occupancy_asc') {
          return a.occupancyRate - b.occupancyRate;
        }
        if (filters.sortBy === 'occupancy_desc') {
          return b.occupancyRate - a.occupancyRate;
        }
        if (filters.sortBy === 'distance') {
          const distA = a.distanceKm ?? 9999;
          const distB = b.distanceKm ?? 9999;
          return distA - distB;
        }
        if (filters.sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [carparks, filters, favorites]);

  const favoriteCarparks = useMemo(() => {
    return carparks.filter((cp) => favorites.includes(cp.id));
  }, [carparks, favorites]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar Contract Navbar */}
      <Navbar
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={() => loadAvailability(true)}
        dataSource={dataSource}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        favoritesCount={favorites.length}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenDeveloperModal={() => setIsDeveloperOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Citywide Statistics KPI Strip */}
        <CarparkStatsBanner
          carparks={carparks}
          totalAvailableLots={totalAvailableLots}
          totalMonitoredLots={totalMonitoredLots}
        />

        {/* Search, Region, and Filters Toolbar */}
        <CarparkFilters
          filters={filters}
          onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
          onReset={() => setFilters(DEFAULT_FILTERS)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          resultsCount={filteredCarparks.length}
          totalCount={carparks.length}
        />

        {/* Dynamic Layout by ViewMode */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Interactive Map (5 cols) */}
            <div className="lg:col-span-5 h-[420px] lg:h-[calc(100vh-280px)] lg:sticky lg:top-24">
              <CarparkMap
                carparks={filteredCarparks}
                selectedCarpark={selectedCarpark}
                onSelectCarpark={setSelectedCarpark}
                userLocation={userLocation}
                onLocateMe={handleLocateMe}
                darkMode={darkMode}
              />
            </div>

            {/* Right Column: Carpark Cards Grid (7 cols) */}
            <div className="lg:col-span-7 space-y-3.5">
              {filteredCarparks.length === 0 ? (
                <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
                  <Car className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    No matching carparks found
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Try loosening your search query or reset your clearance and availability filters.
                  </p>
                  <button
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredCarparks.map((cp) => (
                  <CarparkCard
                    key={cp.id}
                    carpark={cp}
                    isSelected={selectedCarpark?.id === cp.id}
                    isFavorite={favorites.includes(cp.id)}
                    onSelect={(c) => setSelectedCarpark(c)}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenDetails={handleOpenDetails}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {viewMode === 'map' && (
          <div className="h-[calc(100vh-250px)] min-h-[500px]">
            <CarparkMap
              carparks={filteredCarparks}
              selectedCarpark={selectedCarpark}
              onSelectCarpark={setSelectedCarpark}
              userLocation={userLocation}
              onLocateMe={handleLocateMe}
              darkMode={darkMode}
            />
          </div>
        )}

        {viewMode === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCarparks.map((cp) => (
              <CarparkCard
                key={cp.id}
                carpark={cp}
                isSelected={selectedCarpark?.id === cp.id}
                isFavorite={favorites.includes(cp.id)}
                onSelect={(c) => setSelectedCarpark(c)}
                onToggleFavorite={handleToggleFavorite}
                onOpenDetails={handleOpenDetails}
              />
            ))}
          </div>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-6 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>SG Carpark Live Tracker</span>
            <span aria-hidden="true">·</span>
            <span>Real-time availability feed</span>
            <span aria-hidden="true">·</span>
            <span>Data courtesy of Data.gov.sg & LTA</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDeveloperOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Developer Integration API
            </button>
            <button
              onClick={() => setIsCalculatorOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Rate Comparator
            </button>
            <button
              onClick={() => handleLocateMe()}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Nearby Lots
            </button>
          </div>
        </div>
      </footer>

      {/* Modal Dialogs */}
      <CarparkDetailModal
        carpark={detailCarpark}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        isFavorite={detailCarpark ? favorites.includes(detailCarpark.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favoriteCarparks}
        onSelectCarpark={(cp) => {
          setSelectedCarpark(cp);
          handleOpenDetails(cp);
        }}
        onRemoveFavorite={handleToggleFavorite}
      />

      <FeeCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        carparks={carparks}
        onSelectCarpark={(cp) => {
          setSelectedCarpark(cp);
          handleOpenDetails(cp);
        }}
      />

      <DeveloperBackendModal
        isOpen={isDeveloperOpen}
        onClose={() => setIsDeveloperOpen(false)}
      />
    </div>
  );
}
