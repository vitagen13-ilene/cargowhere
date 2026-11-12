import React, { useState } from 'react';
import { X, Code2, Server, Terminal, Copy, Check, ExternalLink } from 'lucide-react';

interface DeveloperBackendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperBackendModal: React.FC<DeveloperBackendModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'express' | 'fastapi' | 'schema'>('overview');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const expressSnippet = `// server.ts (Express Node.js Backend Example)
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory cache for Data.gov.sg (updates every 1 min)
let cachedData: any = null;
let lastFetchTime = 0;

app.get('/api/carparks/availability', async (req, res) => {
  const now = Date.now();
  if (!cachedData || now - lastFetchTime > 60000) {
    try {
      const response = await fetch('https://api.data.gov.sg/v1/transport/carpark-availability');
      cachedData = await response.json();
      lastFetchTime = now;
    } catch (err) {
      return res.status(502).json({ error: 'Failed to fetch Data.gov.sg' });
    }
  }
  res.json(cachedData);
});

app.listen(3001, () => {
  console.log('Carpark backend server running on port 3001');
});`;

  const fastApiSnippet = `# main.py (FastAPI Python Backend Example)
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import time

app = FastAPI(title="Singapore Carpark API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

cache = {"data": None, "timestamp": 0}

@app.get("/api/carparks/availability")
async def get_availability():
    now = time.time()
    if not cache["data"] or (now - cache["timestamp"] > 60):
        async with httpx.AsyncClient() as client:
            resp = await client.get("https://api.data.gov.sg/v1/transport/carpark-availability")
            if resp.status_code != 200:
                raise HTTPException(status_code=502, detail="Upstream error")
            cache["data"] = resp.json()
            cache["timestamp"] = now
    return cache["data"]`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Backend Integration Blueprint
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ready-to-plug REST API contracts & proxy guidelines for your backend
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

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          {[
            { id: 'overview', label: '1. Overview' },
            { id: 'express', label: '2. Node/Express' },
            { id: 'fastapi', label: '3. Python/FastAPI' },
            { id: 'schema', label: '4. Schema' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto text-xs space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200">
                <strong className="block font-semibold mb-1">Serverless Connection Active:</strong>
                Live serverless endpoints are installed in the root <code className="bg-emerald-100 dark:bg-emerald-900 px-1 py-0.5 rounded font-mono text-[11px]">/api</code> directory:
                <div className="mt-2 space-y-1 font-mono text-[11px]">
                  <div>• <strong className="text-emerald-700 dark:text-emerald-300">/api/carparkavailability</strong>: LTA DataMall v2 OData proxy</div>
                  <div>• <strong className="text-emerald-700 dark:text-emerald-300">/api/health</strong>: Serverless health & key validation status</div>
                </div>
              </div>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Configuring your LTA DataMall Account Key:
              </h4>
              <ol className="list-decimal pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                <li>
                  <strong>Step 1:</strong> Obtain your free API key from{' '}
                  <a
                    href="https://datamall.lta.gov.sg/content/datamall/en.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 underline font-medium"
                  >
                    LTA DataMall
                  </a>.
                </li>
                <li>
                  <strong>Step 2:</strong> Set your key in your environment variable:
                  <div className="mt-1 p-2 bg-slate-900 text-slate-200 font-mono rounded text-[11px]">
                    LTA_ACCOUNT_KEY="YOUR_ACTUAL_LTA_KEY"
                  </div>
                </li>
                <li>
                  <strong>Step 3:</strong> Once configured, <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">/api/carparkavailability</code> automatically queries <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2</code> with the required <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">AccountKey</code> header, handles pagination, and serves cached responses.
                </li>
              </ol>

              <div className="pt-2 flex items-center gap-4">
                <a
                  href="/api/health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  <span>Test /api/health</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="/api/carparkavailability"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  <span>Test /api/carparkavailability</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {activeTab === 'express' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-500 font-mono">Express Server Proxy</span>
                <button
                  onClick={() => copyCode('express', expressSnippet)}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  {copied === 'express' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied === 'express' ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-100 font-mono rounded-lg overflow-x-auto text-[11px] leading-relaxed">
                {expressSnippet}
              </pre>
            </div>
          )}

          {activeTab === 'fastapi' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-500 font-mono">FastAPI Server Proxy</span>
                <button
                  onClick={() => copyCode('fastapi', fastApiSnippet)}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  {copied === 'fastapi' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied === 'fastapi' ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-100 font-mono rounded-lg overflow-x-auto text-[11px] leading-relaxed">
                {fastApiSnippet}
              </pre>
            </div>
          )}

          {activeTab === 'schema' && (
            <div>
              <span className="text-slate-500 font-mono block mb-2">Data Payload Expected by Client</span>
              <pre className="p-3 bg-slate-900 text-slate-100 font-mono rounded-lg overflow-x-auto text-[11px] leading-relaxed">
{`{
  "items": [
    {
      "timestamp": "2026-11-12T17:15:00+08:00",
      "carpark_data": [
        {
          "carpark_number": "ACB",
          "update_datetime": "2026-11-12T17:14:44",
          "carpark_info": [
            { "total_lots": "680", "lot_type": "C", "lots_available": "245" },
            { "total_lots": "90", "lot_type": "Y", "lots_available": "51" }
          ]
        }
      ]
    }
  ]
}`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
