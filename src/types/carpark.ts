/**
 * Singapore Carpark Data Structures & Types
 */

export type AgencyType = 'HDB' | 'URA' | 'LTA' | 'Commercial';

export type CarparkType =
  | 'Multi-Storey Car Park'
  | 'Basement Car Park'
  | 'Surface Car Park'
  | 'Mechanized Car Park';

export type LotAvailabilityStatus = 'available' | 'filling_fast' | 'almost_full' | 'full';

export interface LotDetails {
  total: number;
  available: number;
}

export interface EVChargerInfo {
  hasEV: boolean;
  provider?: string;
  chargerCount?: number;
  powerKw?: number;
  connectorType?: string;
}

export interface ParkingRates {
  weekdayDay: string; // e.g., "$0.60 / 30 mins (7:00am - 5:00pm)"
  weekdayNight: string; // e.g., "$0.60 / 30 mins (5:00pm - 10:30pm)"
  weekend: string; // e.g., "$0.60 / 30 mins" or "$2.50 for 1st hr"
  nightCap?: string; // e.g., "$5.00 max (10:30pm - 7:00am)"
  gracePeriodMinutes: number; // e.g. 15 minutes
  description?: string;
}

export interface Carpark {
  id: string; // Carpark code, e.g. "ACB", "TP21", "OR1"
  name: string;
  address: string;
  agency: AgencyType;
  carparkType: CarparkType;
  parkingSystem: 'Electronic Parking System (EPS)' | 'Coupon Parking';
  shortTermParking: string;
  freeParking: string;
  nightParking: boolean;
  gantryHeight: number; // in meters, e.g. 2.15
  decks: number;
  lat: number;
  lng: number;
  area: string; // Region/Town, e.g. "Orchard", "Tampines", "CBD / Marina Bay", "Ang Mo Kio"
  rates: ParkingRates;
  evCharging: EVChargerInfo;
  lots: {
    car: LotDetails;
    motorcycle: LotDetails;
    heavy?: LotDetails;
  };
  updateTime: string;
  occupancyRate: number; // 0 to 100 percentage
  status: LotAvailabilityStatus;
  distanceKm?: number;
}

export interface FilterState {
  searchQuery: string;
  area: string;
  agency: 'All' | AgencyType;
  vehicleType: 'all' | 'car' | 'motorcycle' | 'heavy' | 'ev';
  minLotsAvailable: number;
  minHeightClearance: number;
  evOnly: boolean;
  favoritesOnly: boolean;
  sortBy: 'lots_desc' | 'lots_asc' | 'occupancy_asc' | 'occupancy_desc' | 'distance' | 'name';
}

export interface DataGovSgLotInfo {
  total_lots: string;
  lot_type: 'C' | 'H' | 'Y';
  lots_available: string;
}

export interface DataGovSgCarparkItem {
  carpark_number: string;
  update_datetime: string;
  carpark_info: DataGovSgLotInfo[];
}

export interface DataGovSgApiResponse {
  items: Array<{
    timestamp: string;
    carpark_data: DataGovSgCarparkItem[];
  }>;
}
