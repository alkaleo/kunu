# Kunu

Kunu is a private, browser-based family travel memory game. It turns a child’s real journeys into warm, stylized worlds that can be revisited as a timeline, an explorer passport, and short playable adventures.

This repository contains a production-ready vertical slice centered on Clara’s Yosemite journey, with polished preview worlds for Lapland and Corfu.

## What is included

- Consent-gated private character studio powered by OpenAI `gpt-image-2`
- Three-reference upload, polished generation progress, reveal, approval, regeneration, adjustment, cancellation, and error recovery
- Interactive Three.js globe with inertia, zoom, atmosphere, and destination pins
- Accessible stylized 2D map and automatic non-WebGL fallback
- Responsive World, Timeline, Passport, and Profile destinations
- Cinematic memory portals using original Kunu Block artwork
- A playable Yosemite diorama with a camera-facing generated 2.5D character, procedural Clara fallback, Buddy, waterfall, river, cliffs, meadow, forest, wildlife, wind, and golden-hour light
- Desktop controls, touch joystick, camera drag, limited zoom, and landscape guidance
- Four working Yosemite activities: waterfall discovery, three souvenirs, memory recreation screenshot, and a retryable valley question
- Persistent XP, completion, explorer levels, collectibles, settings, and Yosemite Explorer badge
- Lapland and Corfu preview experiences
- PWA manifest, service worker, install icons, safe-area support, and offline precaching
- Procedural Web Audio that starts only after user interaction
- Reduced-motion and reduced-sensory settings

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- A current version of Chrome, Safari, or Edge
- An OpenAI API key with access to `gpt-image-2` for character generation

## Install and run

```bash
npm install
npm run dev
```

Vite prints the local URL, normally `http://localhost:5173`.

Vite alone serves the browser app. To exercise the Vercel server function locally, copy `.env.example` to `.env.local`, provide the server-only key, and run `npx vercel dev`. Never use a `VITE_` prefix for the key.

## Character generation configuration

Configure these encrypted environment variables in the Vercel project:

```text
OPENAI_API_KEY=your-server-only-key
OPENAI_IMAGE_MODEL=gpt-image-2
```

The browser sends three resized in-memory references to `POST /api/generate-character` only after explicit consent. The Vercel function passes the images directly to OpenAI, sets `Cache-Control: no-store`, does not write files or database records, and returns one compressed generated character sheet. Original references and unapproved results remain session-only. IndexedDB receives only the approved generated sheet.

## Production build

```bash
npm run build
npm run preview
```

The production output is written to `dist/`. The build also generates the PWA service worker and web app manifest.

## Tests

```bash
npm test
```

The test suite covers:

- age calculation for all three journeys
- IndexedDB/in-memory persistence round trips
- explorer progression and level thresholds
- globe/map switching
- complete Yosemite activity, XP, collectible, and badge-unlock flow
- server endpoint consent, API-key, and three-view validation
- character persistence schema migration
- production-flow character approval without reference-photo persistence

## Yosemite controls

Desktop:

- Move: `WASD` or arrow keys
- Run: hold `Shift`
- Interact: `E` or the context action button
- Pose: `P`
- Camera: drag the right side of the world
- Zoom: mouse wheel

Touch:

- Move with the left joystick
- Drag the right side to rotate the camera
- Use the turquoise context action button near discoveries
- Adventure Mode is landscape-first; portrait shows a polished rotate-device screen

## PWA installation

### iPhone and iPad

1. Open the production URL in Safari.
2. Tap Share.
3. Choose **Add to Home Screen**.
4. Launch Kunu from the new home-screen icon.

### Desktop

Use the install icon in the browser address bar, or open the browser menu and choose **Install Kunu**.

## Privacy

Kunu has no account or analytics SDK. The only backend route is the server-side character-generation proxy.

- Parent consent is required before any reference leaves the browser.
- References are resized in memory, sent temporarily to OpenAI, and never written to Kunu server storage or IndexedDB.
- `OPENAI_API_KEY` exists only in the Vercel server environment and is never exposed through a `VITE_` browser variable.
- Only an approved generated character sheet is written to local IndexedDB.
- Family photographs are not part of this repository or production bundle.
- The attached private family references were used only to understand age progression, clothing, colors, landscapes, Buddy, and atmosphere.
- Every committed visual is an original procedural Kunu Block derivative. See [ASSETS.md](./ASSETS.md).
- Clearing site data removes the approved generated character and saved progress.

## Project structure

```text
src/
  data/            Seed family and journey data
  features/        Onboarding, shell, world, timeline, passport, profile, adventure
  hooks/           Browser-safe audio and approved-character loading/isolation
  lib/             Age, persistence, progression, WebGL, and journey helpers
  store/           Zustand application state and persistence actions
  styles/          Responsive design system and adventure UI
  types/           Persisted domain models
public/
  assets/          Original Kunu Block SVG artwork
  icons/           Install-grade PWA PNG icons
```

## Performance and resilience

- The globe and Yosemite runtime are loaded in separate JavaScript chunks.
- Device pixel ratio is capped at `1.5` for 3D canvases.
- Lighting is limited and shadow resolution is bounded.
- Yosemite rendering pauses when the page is hidden.
- Natural cliffs and the diorama edge keep the player inside the finished world.
- WebGL failure falls back to accessible static journey content instead of crashing.
- Committed PWA assets are precached for offline use; private generated characters remain only in IndexedDB.

## Known platform behavior

- Safari and iPhone require a user gesture before audio can begin; Kunu waits for the first tap or key press.
- IndexedDB can be unavailable in restrictive private-browsing modes. Kunu remains playable with an in-memory fallback, but progress may not survive a browser restart in that mode.
- Lapland and Corfu are intentionally polished previews in this vertical slice; Yosemite is the fully playable journey.
