import { Carpark, DataGovSgApiResponse, LotAvailabilityStatus } from '../types/carpark';
import { INITIAL_CARPARKS } from '../data/singaporeCarparksData';

/**
 * Service to manage real-time Singapore Carpark lot availability.
 * Designed with a clean abstraction layer so the backend can be plugged in later.
 * 
 * Target Backend Integration Point:
 * In future backend deployment, replace DATA_GOV_API_URL or forward requests
 * to your own Express/FastAPI proxy (e.g. `/api/carparks/availability`).
 */
export const LTA_DATAMALL_SERVERLESS_URL = '/api/carparkavailability';
export const DATA_GOV_API_URL = 'https://api.data.gov.sg/v1/transport/carpark-availability';

export interface CarparkSyncResult {
  carparks: Carpark[];
  lastUpdated: Date;
  source: 'lta' | 'api' | 'fallback';
  totalMonitoredLots: number;
  totalAvailableLots: number;
}

/**
 * Check backend health status and whether LTA_ACCOUNT_KEY is configured
 */
export async function checkLTAHealth(): Promise<{ status: string; ltaKeyConfigured: boolean } | null> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Compute status category from available lots and capacity
 */
export function determineStatus(available: number, total: number): LotAvailabilityStatus {
  if (available <= 0) return 'full';
  if (available < 15 || (total > 0 && available / total < 0.08)) return 'almost_full';
  if (available < 40 || (total > 0 && available / total < 0.20)) return 'filling_fast';
  return 'available';
}

/**
 * Haversine formula to calculate distance between two coordinates in km
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Fetches real-time lot availability.
 * Priority:
 * 1. /api/carparkavailability (LTA DataMall v2 serverless route)
 * 2. Data.gov.sg open public endpoint
 * 3. Graceful realistic simulation fallback
 */
export async function fetchLiveCarparkAvailability(
  currentCarparks: Carpark[] = INITIAL_CARPARKS,
  userCoords?: { lat: number; lng: number } | null
): Promise<CarparkSyncResult> {
  // 1. Try serverless LTA DataMall route first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const ltaResponse = await fetch(LTA_DATAMALL_SERVERLESS_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (ltaResponse.ok) {
      const ltaData = await ltaResponse.json();
      if (Array.isArray(ltaData.value) && ltaData.value.length > 0) {
        const ltaMap = new Map<string, { car?: number; moto?: number }>();

        for (const item of ltaData.value) {
          const id = (item.CarParkID || '').toUpperCase();
          const lots = Number(item.AvailableLots) || 0;
          const current = ltaMap.get(id) || {};
          if (item.LotType === 'C') current.car = lots;
          else if (item.LotType === 'Y') current.moto = lots;
          ltaMap.set(id, current);
        }

        const updatedCarparks: Carpark[] = currentCarparks.map((cp) => {
          const match = ltaMap.get(cp.id.toUpperCase());
          let carAvail = cp.lots.car.available;
          let motoAvail = cp.lots.motorcycle.available;

          if (match) {
            if (match.car !== undefined) carAvail = match.car;
            if (match.moto !== undefined) motoAvail = match.moto;
          }

          const carTot = cp.lots.car.total;
          const occ = carTot > 0 ? Math.round(((carTot - carAvail) / carTot) * 100) : 0;
          const status = determineStatus(carAvail, carTot);
          const distanceKm = userCoords
            ? calculateDistanceKm(userCoords.lat, userCoords.lng, cp.lat, cp.lng)
            : undefined;

          return {
            ...cp,
            lots: {
              ...cp.lots,
              car: { total: carTot, available: carAvail },
              motorcycle: { total: cp.lots.motorcycle.total, available: motoAvail },
            },
            occupancyRate: occ,
            status,
            updateTime: ltaData.fetchedAt || new Date().toISOString(),
            distanceKm,
          };
        });

        const totalMonitoredLots = updatedCarparks.reduce((sum, cp) => sum + cp.lots.car.total, 0);
        const totalAvailableLots = updatedCarparks.reduce((sum, cp) => sum + cp.lots.car.available, 0);

        return {
          carparks: updatedCarparks,
          lastUpdated: new Date(ltaData.fetchedAt || Date.now()),
          source: 'lta',
          totalMonitoredLots,
          totalAvailableLots,
        };
      }
    }
  } catch {
    // Continue to Data.gov.sg fallback
  }

  // 2. Try Data.gov.sg open endpoint
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(DATA_GOV_API_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Data.gov.sg responded with status ${response.status}`);
    }

    const data: DataGovSgApiResponse = await response.json();
    const latestItem = data.items?.[0];

    if (!latestItem || !Array.isArray(latestItem.carpark_data)) {
      throw new Error('Invalid Data.gov.sg response payload structure');
    }

    // Map carpark_number to lot availability
    const availabilityMap = new Map<
      string,
      { carAvailable?: number; carTotal?: number; motoAvailable?: number; motoTotal?: number }
    >();

    for (const item of latestItem.carpark_data) {
      const code = item.carpark_number.toUpperCase();
      let carAvailable: number | undefined;
      let carTotal: number | undefined;
      let motoAvailable: number | undefined;
      let motoTotal: number | undefined;

      for (const info of item.carpark_info) {
        const avail = parseInt(info.lots_available, 10);
        const total = parseInt(info.total_lots, 10);
        if (info.lot_type === 'C') {
          if (!isNaN(avail)) carAvailable = avail;
          if (!isNaN(total)) carTotal = total;
        } else if (info.lot_type === 'Y') {
          if (!isNaN(avail)) motoAvailable = avail;
          if (!isNaN(total)) motoTotal = total;
        }
      }

      if (carAvailable !== undefined || motoAvailable !== undefined) {
        availabilityMap.set(code, { carAvailable, carTotal, motoAvailable, motoTotal });
      }
    }

    // Merge into our rich Singapore carpark catalog
    const updatedCarparks: Carpark[] = currentCarparks.map((cp) => {
      const govData = availabilityMap.get(cp.id.toUpperCase());

      let carAvail = cp.lots.car.available;
      let carTot = cp.lots.car.total;
      let motoAvail = cp.lots.motorcycle.available;
      let motoTot = cp.lots.motorcycle.total;

      if (govData) {
        if (govData.carAvailable !== undefined) carAvail = govData.carAvailable;
        if (govData.carTotal !== undefined && govData.carTotal > 0) carTot = govData.carTotal;
        if (govData.motoAvailable !== undefined) motoAvail = govData.motoAvailable;
        if (govData.motoTotal !== undefined && govData.motoTotal > 0) motoTot = govData.motoTotal;
      } else {
        const delta = Math.floor(Math.random() * 5) - 2;
        carAvail = Math.max(0, Math.min(carTot, carAvail + delta));
      }

      const occupancyRate = carTot > 0 ? Math.round(((carTot - carAvail) / carTot) * 100) : 0;
      const status = determineStatus(carAvail, carTot);
      const distanceKm = userCoords
        ? calculateDistanceKm(userCoords.lat, userCoords.lng, cp.lat, cp.lng)
        : undefined;

      return {
        ...cp,
        lots: {
          ...cp.lots,
          car: { total: carTot, available: carAvail },
          motorcycle: { total: motoTot, available: motoAvail },
        },
        occupancyRate,
        status,
        updateTime: latestItem.timestamp || new Date().toISOString(),
        distanceKm,
      };
    });

    const totalMonitoredLots = updatedCarparks.reduce((sum, cp) => sum + cp.lots.car.total, 0);
    const totalAvailableLots = updatedCarparks.reduce((sum, cp) => sum + cp.lots.car.available, 0);

    return {
      carparks: updatedCarparks,
      lastUpdated: new Date(latestItem.timestamp || Date.now()),
      source: 'api',
      totalMonitoredLots,
      totalAvailableLots,
    };
  } catch {
    // 3. Graceful fallback with realistic simulation

    const simulatedCarparks: Carpark[] = currentCarparks.map((cp) => {
      // Natural fluctuation: +/- 1 to 4 lots
      const change = Math.floor(Math.random() * 7) - 3;
      const newAvail = Math.max(0, Math.min(cp.lots.car.total, cp.lots.car.available + change));
      const occ = Math.round(((cp.lots.car.total - newAvail) / cp.lots.car.total) * 100);

      let distanceKm: number | undefined;
      if (userCoords) {
        distanceKm = calculateDistanceKm(userCoords.lat, userCoords.lng, cp.lat, cp.lng);
      }

      return {
        ...cp,
        lots: {
          ...cp.lots,
          car: {
            ...cp.lots.car,
            available: newAvail,
          },
        },
        occupancyRate: occ,
        status: determineStatus(newAvail, cp.lots.car.total),
        updateTime: new Date().toISOString(),
        distanceKm,
      };
    });

    const totalMonitoredLots = simulatedCarparks.reduce((sum, cp) => sum + cp.lots.car.total, 0);
    const totalAvailableLots = simulatedCarparks.reduce((sum, cp) => sum + cp.lots.car.available, 0);

    return {
      carparks: simulatedCarparks,
      lastUpdated: new Date(),
      source: 'fallback',
      totalMonitoredLots,
      totalAvailableLots,
    };
  }
}

/**
 * Calculates estimated parking fee in Singapore Dollars (SGD)
 */
export function estimateParkingFee(
  carpark: Carpark,
  hours: number,
  entryHour: number = 14, // 0 - 23
  isWeekend: boolean = false
): { totalFee: number; breakdownText: string } {
  // If duration is within grace period
  const totalMinutes = hours * 60;
  if (totalMinutes <= carpark.rates.gracePeriodMinutes) {
    return {
      totalFee: 0,
      breakdownText: `Free within ${carpark.rates.gracePeriodMinutes}-min grace period`,
    };
  }

  // HDB standard calculation
  if (carpark.agency === 'HDB' || carpark.agency === 'URA') {
    const isCentral = carpark.area.includes('Orchard') || carpark.area.includes('CBD') || carpark.area.includes('Bugis');
    const dayRatePerHalfHour = isCentral ? 1.20 : 0.60;
    
    // Check if free parking applies (Sunday & PH daytime for many HDBs)
    if (isWeekend && carpark.freeParking.includes('SUN')) {
      return {
        totalFee: 0,
        breakdownText: 'Free parking on Sunday / Public Holiday daytime scheme',
      };
    }

    const halfHours = Math.ceil(totalMinutes / 30);
    const fee = halfHours * dayRatePerHalfHour;
    return {
      totalFee: Math.round(fee * 100) / 100,
      breakdownText: `${halfHours} blocks of 30 mins @ $${dayRatePerHalfHour.toFixed(2)}`,
    };
  }

  // Commercial / Shopping Mall pricing heuristic
  let fee = 0;
  if (isWeekend) {
    // Typical weekend 1st 2 hours rate then subsequent
    const baseFirst2Hrs = 3.50;
    if (hours <= 2) {
      fee = baseFirst2Hrs;
    } else {
      const remainingHours = hours - 2;
      fee = baseFirst2Hrs + remainingHours * 2.40;
    }
  } else {
    // Weekday: if entry after 6pm, entry per entry applies
    if (entryHour >= 18) {
      fee = 3.50; // flat per entry
      return {
        totalFee: 3.50,
        breakdownText: 'Per-entry evening rate after 6:00 PM',
      };
    } else {
      // 1st hour around $2.40, then $1.20 - $2.40/hr
      const firstHour = 2.50;
      if (hours <= 1) {
        fee = firstHour;
      } else {
        fee = firstHour + (hours - 1) * 2.40;
      }
    }
  }

  return {
    totalFee: Math.round(fee * 100) / 100,
    breakdownText: `Estimated rate based on ${hours} hr(s) duration`,
  };
}
