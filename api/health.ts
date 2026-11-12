import type { IncomingMessage, ServerResponse } from 'http';

interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  ltaKeyConfigured: boolean;
  service: string;
  endpoints: {
    carparkAvailability: string;
    health: string;
  };
}

/**
 * Serverless health check endpoint.
 * Works seamlessly with Vercel/Netlify serverless and Express.
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

  const isLtaKeyConfigured = Boolean(
    process.env.LTA_ACCOUNT_KEY && process.env.LTA_ACCOUNT_KEY.trim() !== '' && process.env.LTA_ACCOUNT_KEY !== 'YOUR_LTA_ACCOUNT_KEY'
  );

  const payload: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    ltaKeyConfigured: isLtaKeyConfigured,
    service: 'Singapore Carpark LTA DataMall Connector',
    endpoints: {
      carparkAvailability: '/api/carparkavailability',
      health: '/api/health',
    },
  };

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload, null, 2));
}
