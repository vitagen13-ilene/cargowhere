import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import healthHandler from './api/health.js';
import carparkAvailabilityHandler from './api/carparkavailability.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // JSON middleware
  app.use(express.json());

  // Mount serverless handlers as Express routes
  app.all('/api/health', (req, res) => {
    return healthHandler(req, res);
  });

  app.all('/api/carparkavailability', (req, res) => {
    return carparkAvailabilityHandler(req, res);
  });

  // Alias with hyphen or case variants if needed
  app.all('/api/carpark-availability', (req, res) => {
    return carparkAvailabilityHandler(req, res);
  });

  // Dev vs Prod Vite mounting
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: Number(PORT),
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`- LTA Endpoint: http://localhost:${PORT}/api/carparkavailability`);
    console.log(`- Health Check: http://localhost:${PORT}/api/health`);
  });
}

startServer();
