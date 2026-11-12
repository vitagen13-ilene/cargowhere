import type { IncomingMessage, ServerResponse } from 'http';

const LTA_CARPARK_API_URL = 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

export interface LTACarparkRecord {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string; // e.g. "1.29375 103.85718"
  AvailableLots: number;
  LotType: 'C' | 'H' | 'Y'; // C: Cars, H: Heavy, Y: Motorcycle
  Agency: 'HDB' | 'LTA' | 'URA';
}

export interface LTACarparkResponse {
  'odata.metadata'?: string;
  value: LTACarparkRecord[];
  cached?: boolean;
  fetchedAt: string;
  totalRecords: number;
}

// In-memory cache for serverless instance (60s TTL)
interface CacheStore {
  data: LTACarparkRecord[] | null;
  fetchedAt: number;
}

const memoryCache: CacheStore = {
  data: null,
  fetchedAt: 0,
};

const CACHE_TTL_MS = 60 * 1000; // 60 seconds

/**
 * Fetches one page (up to 500 records) from LTA DataMall
 */
async function fetchLTAPage(accountKey: string, skip = 0): Promise<LTACarparkRecord[]> {
  const url = `${LTA_CARPARK_API_URL}?$skip=${skip}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      AccountKey: accountKey,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LTA DataMall API responded with HTTP ${response.status} (${response.statusText}): ${errorText}`
    );
  }

  const json = await response.json();
  return Array.isArray(json.value) ? json.value : [];
}

/**
 * Fetches all available carparks across pagination batches (500 per page)
 */
async function fetchAllLTACarparks(accountKey: string): Promise<LTACarparkRecord[]> {
  const allCarparks: LTACarparkRecord[] = [];
  let skip = 0;
  const batchSize = 500;
  const maxBatches = 10; // Safety cap (up to 5000 records)

  for (let i = 0; i < maxBatches; i++) {
    const pageRecords = await fetchLTAPage(accountKey, skip);
    allCarparks.push(...pageRecords);

    // If less than batchSize returned, we have reached the end of the feed
    if (pageRecords.length < batchSize) {
      break;
    }
    skip += batchSize;
  }

  return allCarparks;
}

/**
 * Serverless function handler for LTA CarParkAvailabilityv2.
 * Compatible with Vercel, Netlify, and Express route handlers.
 */
export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, AccountKey');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // 1. Read LTA Account Key from Environment Variable or Request Header
  const accountKey =
    process.env.LTA_ACCOUNT_KEY?.trim() ||
    (req.headers?.['accountkey'] as string) ||
    (req.headers?.['account-key'] as string) ||
    (req.headers?.['authorization']?.replace(/^Bearer\s+/i, ''));

  // Parse URL query parameters
  const urlObj = new URL(req.url || '/', 'http://localhost');
  const skipParam = urlObj.searchParams.get('$skip') || urlObj.searchParams.get('skip');
  const singlePageOnly = skipParam !== null;
  const forceRefresh = urlObj.searchParams.get('refresh') === 'true';

  // 2. Validate Key
  if (!accountKey || accountKey === 'YOUR_LTA_ACCOUNT_KEY') {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify(
        {
          error: 'LTA_ACCOUNT_KEY_REQUIRED',
          message:
            'LTA DataMall AccountKey is not set. Please configure LTA_ACCOUNT_KEY in your environment variables.',
          upstreamEndpoint: LTA_CARPARK_API_URL,
          documentation: 'https://datamall.lta.gov.sg/content/datamall/en.html',
          sampleFormat: {
            header: 'AccountKey: <YOUR_KEY>',
            envVar: 'LTA_ACCOUNT_KEY=<YOUR_KEY>',
          },
        },
        null,
        2
      )
    );
    return;
  }

  try {
    const now = Date.now();

    // Check in-memory cache for full batch requests
    if (!singlePageOnly && !forceRefresh && memoryCache.data && now - memoryCache.fetchedAt < CACHE_TTL_MS) {
      const responsePayload: LTACarparkResponse = {
        'odata.metadata': `${LTA_CARPARK_API_URL}/$metadata#CarParkAvailabilityv2`,
        value: memoryCache.data,
        cached: true,
        fetchedAt: new Date(memoryCache.fetchedAt).toISOString(),
        totalRecords: memoryCache.data.length,
      };

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
      res.end(JSON.stringify(responsePayload));
      return;
    }

    // If specific $skip page was requested, fetch just that single page
    if (singlePageOnly) {
      const skip = parseInt(skipParam || '0', 10);
      const records = await fetchLTAPage(accountKey, isNaN(skip) ? 0 : skip);

      const responsePayload: LTACarparkResponse = {
        'odata.metadata': `${LTA_CARPARK_API_URL}/$metadata#CarParkAvailabilityv2`,
        value: records,
        cached: false,
        fetchedAt: new Date().toISOString(),
        totalRecords: records.length,
      };

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(responsePayload));
      return;
    }

    // Fetch all records (paginated automatically)
    const allRecords = await fetchAllLTACarparks(accountKey);

    // Save to cache
    memoryCache.data = allRecords;
    memoryCache.fetchedAt = now;

    const responsePayload: LTACarparkResponse = {
      'odata.metadata': `${LTA_CARPARK_API_URL}/$metadata#CarParkAvailabilityv2`,
      value: allRecords,
      cached: false,
      fetchedAt: new Date(now).toISOString(),
      totalRecords: allRecords.length,
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
    res.end(JSON.stringify(responsePayload));
  } catch (error: any) {
    console.error('Failed to query LTA DataMall:', error);

    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify(
        {
          error: 'LTA_DATAMALL_FETCH_ERROR',
          message: error.message || 'Error occurred while contacting LTA DataMall',
          upstreamEndpoint: LTA_CARPARK_API_URL,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      )
    );
  }
}
