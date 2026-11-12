# Project Prompts & Conversation History

This document collates all prompts used during the development of **SG Carpark Live** (`cargowhere`).

---

## Prompt 1: Initial Frontend Application Build

**Prompt:**
> Build me an singapore based carpark application that tracks in real time how many car park lots are avaiable in singapore. Build just the front end, i will integrate backend later

**Summary of Deliverables:**
- Developed real-time Singapore Carpark Lot Availability Tracker frontend.
- Integrated official Data.gov.sg Carpark Availability API (`https://api.data.gov.sg/v1/transport/carpark-availability`) with automatic 60s background polling and manual refresh.
- Built Leaflet interactive map with custom lot count badges and color-coded status pins (Green $>40$, Amber $15$–$40$, Red $<15$).
- Created comprehensive Singapore carpark catalog (Orchard, Marina Bay/CBD, Bugis, Tampines, Jurong East, Woodlands, Ang Mo Kio, etc.) with real EPS codes, clearance heights, and rates.
- Added vehicle lot filters (Cars, Motorcycles, EV charging stations), clearance height filters, and area selectors.
- Built Singapore Parking Fee Estimator and precinct-wide rate comparator.
- Added bookmarks/saved carparks persisted in `localStorage`.
- Included light/dark mode support with Tailwind CSS.

---

## Prompt 2: GitHub Repository Setup & Push

**Prompt:**
> git push https://[REDACTED_GH_TOKEN]@github.com/vitagen13-ilene/cargowhere.git

**Summary of Deliverables:**
- Configured Git workspace with safe directory settings and user credentials.
- Staged and created initial commit `29f4344` (`feat: Singapore real-time carpark availability tracker`).
- Added remote origin and pushed `main` branch to [vitagen13-ilene/cargowhere](https://github.com/vitagen13-ilene/cargowhere.git).

---

## Prompt 3: LTA DataMall Serverless Connection

**Prompt:**
> 1. Add a serverless connection that pulls live data from LTA's datamall using the folloing endpoints:
>
> \# Live carpark lots (HDB, LTA and URA):
> https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
>
> \# Every request needs the header:  AccountKey: <LTA_ACCOUNT_KEY>
>
> 2. store this in /api folder at project root level (not the src file)
> 3. include/health.ts and carparkavailability.ts with the same sub folder
> 4. do not hard code any key, i will input them later

**Summary of Deliverables:**
- Created `/api/carparkavailability.ts` at the root level:
  - Connects to `https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2`
  - Injects `AccountKey: <LTA_ACCOUNT_KEY>` from environment variable or request header
  - Supports OData `$skip` pagination, auto-aggregating multi-page batches (500 records/page), and 60-second in-memory caching
  - Implements clean 401 response when `LTA_ACCOUNT_KEY` is not yet configured (no hardcoded keys)
- Created `/api/health.ts` at the root level for health checks and key validation status.
- Created `server.ts` mounting Express routes to serverless handlers with Vite middleware integration.
- Documented `LTA_ACCOUNT_KEY` in `.env.example`.
- Updated `src/services/carparkService.ts` to query `/api/carparkavailability` with fallback.
- Committed and pushed changes to GitHub repository (commit `9dfa57d`).

---

## Prompt 4: Prompts Collation

**Prompt:**
> Collate all of the prompts and store them as a PROMPTS.md file

**Summary of Deliverables:**
- Generated `PROMPTS.md` containing all prompts, context, and associated implementation deliverables.
