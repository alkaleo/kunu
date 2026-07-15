# Kunu

Kunu is a private, browser-based family travel memory game. It turns a child’s real journeys into warm, stylized worlds that can be revisited as a timeline, an explorer passport, and short playable adventures.

This repository contains a production-ready vertical slice centered on Clara’s Yosemite journey, with polished preview worlds for Lapland and Corfu.

## What is included

- Premium local-first onboarding with a ready-to-use Clara demo
- Interactive Three.js globe with inertia, zoom, atmosphere, and destination pins
- Accessible stylized 2D map and automatic non-WebGL fallback
- Responsive World, Timeline, Passport, and Profile destinations
- Cinematic memory portals using original Kunu Block artwork
- A playable Yosemite diorama with Clara, Buddy, waterfall, river, cliffs, meadow, forest, wildlife, wind, and golden-hour light
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

## Install and run

```bash
npm install
npm run dev
```

Vite prints the local URL, normally `http://localhost:5173`.

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

Kunu has no backend, account, analytics SDK, paid API, or API key.

- Imported photographs are written only to local IndexedDB.
- Family photographs are not part of this repository or production bundle.
- The attached private family references were used only to understand age progression, clothing, colors, landscapes, Buddy, and atmosphere.
- Every committed visual is an original procedural Kunu Block derivative. See [ASSETS.md](./ASSETS.md).
- Clearing site data removes imported photos and saved progress.

## Project structure

```text
src/
  data/            Seed family and journey data
  features/        Onboarding, shell, world, timeline, passport, profile, adventure
  hooks/           Browser-safe procedural audio
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
- PWA assets and generated visuals are precached for offline use.

## Known platform behavior

- Safari and iPhone require a user gesture before audio can begin; Kunu waits for the first tap or key press.
- IndexedDB can be unavailable in restrictive private-browsing modes. Kunu remains playable with an in-memory fallback, but progress may not survive a browser restart in that mode.
- Lapland and Corfu are intentionally polished previews in this vertical slice; Yosemite is the fully playable journey.
