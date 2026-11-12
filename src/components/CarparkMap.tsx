import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Carpark } from '../types/carpark';
import { Navigation, Compass, Layers, Zap } from 'lucide-react';

interface CarparkMapProps {
  carparks: Carpark[];
  selectedCarpark: Carpark | null;
  onSelectCarpark: (carpark: Carpark) => void;
  userLocation: { lat: number; lng: number } | null;
  onLocateMe: () => void;
  darkMode: boolean;
}

const REGION_BOUNDS: Record<string, { lat: number; lng: number; zoom: number }> = {
  All: { lat: 1.3521, lng: 103.8198, zoom: 12 },
  'Orchard': { lat: 1.3035, lng: 103.8340, zoom: 15 },
  'CBD / Marina': { lat: 1.2850, lng: 103.8550, zoom: 15 },
  'Tampines': { lat: 1.3532, lng: 103.9450, zoom: 14 },
  'Jurong East': { lat: 1.3340, lng: 103.7430, zoom: 14 },
  'Woodlands': { lat: 1.4350, lng: 103.7860, zoom: 14 },
  'Bugis': { lat: 1.2985, lng: 103.8540, zoom: 15 },
};

export const CarparkMap: React.FC<CarparkMapProps> = ({
  carparks,
  selectedCarpark,
  onSelectCarpark,
  userLocation,
  onLocateMe,
  darkMode,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [1.3521, 103.8198],
      zoom: 12,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // High quality OpenStreetMap tiles
    const tileUrl = darkMode
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tiles = L.tileLayer(tileUrl, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    });
    tiles.addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer if dark mode changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    const tileUrl = darkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
  }, [darkMode]);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    carparks.forEach((cp) => {
      const isSelected = selectedCarpark?.id === cp.id;
      const available = cp.lots.car.available;

      // Color coding according to availability
      let bgColor = '#10b981'; // green
      let textColor = '#ffffff';
      let ringColor = 'rgba(16, 185, 129, 0.3)';

      if (cp.status === 'filling_fast') {
        bgColor = '#f59e0b'; // amber
        ringColor = 'rgba(245, 158, 11, 0.3)';
      } else if (cp.status === 'almost_full') {
        bgColor = '#ef4444'; // red
        ringColor = 'rgba(239, 68, 68, 0.3)';
      } else if (cp.status === 'full') {
        bgColor = '#475569'; // slate
        ringColor = 'rgba(71, 85, 105, 0.3)';
      }

      // Marker badge with real-time lots count
      const customIcon = L.divIcon({
        className: 'custom-carpark-pin',
        html: `
          <div style="
            position: relative;
            transform: translate(-50%, -50%);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 3px 7px;
            background: ${bgColor};
            color: ${textColor};
            border-radius: 9999px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            font-weight: 700;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 0 0 ${isSelected ? '3px' : '1.5px'} ${isSelected ? '#2563eb' : '#ffffff'};
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s ease;
            scale: ${isSelected ? '1.2' : '1'};
          ">
            <span>${available}</span>
            ${cp.evCharging.hasEV ? `<span style="margin-left: 3px; font-size: 9px; opacity: 0.9;">⚡</span>` : ''}
          </div>
        `,
        iconSize: [36, 24],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([cp.lat, cp.lng], { icon: customIcon });

      // Click to select
      marker.on('click', () => {
        onSelectCarpark(cp);
      });

      // Popup with rich information
      const popupHtml = `
        <div style="font-family: inherit; min-width: 230px; padding: 12px; background: ${darkMode ? '#0f172a' : '#ffffff'}; color: ${darkMode ? '#f8fafc' : '#0f172a'};">
          <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 2px;">
            ${cp.agency} · ${cp.area}
          </div>
          <div style="font-size: 14px; font-weight: 700; margin-bottom: 6px; line-height: 1.2;">
            ${cp.name}
          </div>
          
          <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px; padding: 6px 8px; background: ${darkMode ? '#1e293b' : '#f1f5f9'}; border-radius: 6px;">
            <span style="font-size: 11px; color: #64748b;">Available Lots</span>
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 700; color: ${bgColor};">
              ${cp.lots.car.available} <span style="font-size: 11px; font-weight: 400; color: #94a3b8;">/ ${cp.lots.car.total}</span>
            </span>
          </div>

          <div style="font-size: 11px; margin-bottom: 4px; color: ${darkMode ? '#cbd5e1' : '#334155'};">
            <strong>Day Rate:</strong> ${cp.rates.weekdayDay}
          </div>
          ${cp.rates.nightCap ? `<div style="font-size: 11px; margin-bottom: 6px; color: #10b981;"><strong>Night Cap:</strong> ${cp.rates.nightCap}</div>` : ''}
          
          ${cp.evCharging.hasEV ? `<div style="font-size: 11px; color: #0284c7; margin-bottom: 8px;">⚡ ${cp.evCharging.chargerCount}x ${cp.evCharging.provider || 'EV Charger'} (${cp.evCharging.powerKw}kW)</div>` : ''}

          <div style="font-size: 10px; color: #94a3b8; margin-top: 6px;">
            Gantry Clearance: ${cp.gantryHeight}m · ${cp.carparkType}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      if (isSelected) {
        marker.openPopup();
      }

      markersLayerRef.current?.addLayer(marker);
    });
  }, [carparks, selectedCarpark, darkMode]);

  // Handle selected carpark pan
  useEffect(() => {
    if (selectedCarpark && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedCarpark.lat, selectedCarpark.lng], 15, {
        duration: 1.2,
      });
    }
  }, [selectedCarpark]);

  // Handle user location pin
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        const marker = L.circleMarker([userLocation.lat, userLocation.lng], {
          radius: 8,
          fillColor: '#2563eb',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        }).addTo(mapInstanceRef.current);

        marker.bindPopup('<strong style="font-size:12px;">Your Current Location</strong>');
        userMarkerRef.current = marker;
      }
    }
  }, [userLocation]);

  const jumpToRegion = (key: string) => {
    const target = REGION_BOUNDS[key];
    if (target && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([target.lat, target.lng], target.zoom, { duration: 1 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Region Jump Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-sm max-w-full">
          <div className="flex items-center gap-1 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Regions</span>
          </div>
          {Object.keys(REGION_BOUNDS).map((region) => (
            <button
              key={region}
              onClick={() => jumpToRegion(region)}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors whitespace-nowrap shrink-0"
            >
              {region}
            </button>
          ))}
        </div>

        {/* Locate Me button */}
        <button
          onClick={onLocateMe}
          title="Locate my position in Singapore"
          className="pointer-events-auto p-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors active:scale-95"
        >
          <Navigation className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm text-xs flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-600 dark:text-slate-400">&gt; 40 lots</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-600 dark:text-slate-400">15–40</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-slate-600 dark:text-slate-400">&lt; 15</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-700 pl-3">
          <Zap className="w-3.5 h-3.5 text-sky-500" />
          <span className="text-slate-600 dark:text-slate-400">EV Station</span>
        </div>
      </div>

      {/* Actual Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
