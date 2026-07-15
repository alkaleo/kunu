# Kunu visual assets

All committed visuals are original, stylized Kunu Block derivatives created for this application. No family photograph, crop, thumbnail, encoded copy, or unmodified excerpt is present in this repository or production bundle.

The requested Higgsfield integration was not available in the build environment, so the master prompt’s procedural/vector fallback was used. Private references informed only high-level appearance, age progression, clothing palette, Buddy, landscape color, and atmosphere.

## Asset inventory

| Path | Format | Dimensions | Source | Generation brief |
|---|---|---:|---|---|
| `public/kunu-mark.svg` | SVG | 512×512 | Procedural vector | Premium dark rounded-square compass mark; Kunu turquoise; simplified `K`; no text outside the mark. |
| `public/icons/icon-192.png` | PNG | 192×192 | Rasterized from `kunu-mark.svg` | Exact production PWA icon rendering. |
| `public/icons/icon-512.png` | PNG | 512×512 | Rasterized from `kunu-mark.svg` | Exact high-resolution production PWA icon rendering. |
| `public/icons/maskable-512.png` | PNG | 512×512 | Rasterized from `kunu-mark.svg` | Maskable PWA icon with a safe centered mark and dark edge-to-edge field. |
| `public/icons/apple-touch-icon.png` | PNG | 180×180 | Rasterized from `kunu-mark.svg` | iOS home-screen icon rendering. |
| `public/assets/launch/launch-art.svg` | SVG | 1600×900 | Procedural vector | Clara and Buddy facing three circular Yosemite, Lapland, and Corfu worlds; warm premium Kunu Block style. |
| `public/assets/characters/clara-reference-sheet.svg` | SVG | 1500×900 | Procedural vector | Clara age progression, rounded toy-like proportions, warm materials, confident age-seven stance, and Buddy reference. |
| `public/assets/characters/clara-age-6.svg` | SVG | 600×900 | Procedural vector | Curious age-six Clara; larger head-to-body ratio; rose shirt, pale denim, illustrated trainers. |
| `public/assets/characters/clara-age-7.svg` | SVG | 600×900 | Procedural vector | Taller age-seven Clara; longer limbs, smaller head ratio, more confident posture. |
| `public/assets/characters/clara-yosemite.svg` | SVG | 600×900 | Procedural vector | Age-six Yosemite outfit in blush, pale denim, turquoise sunglasses, and trail shoes. |
| `public/assets/characters/clara-lapland.svg` | SVG | 600×900 | Procedural vector | Age-seven coral and navy snowsuit, soft rose hat, warm winter silhouette. |
| `public/assets/characters/clara-corfu.svg` | SVG | 600×900 | Procedural vector | Age-seven green summer dress, wide sunhat, and rose sandals against turquoise water. |
| `public/assets/characters/buddy.svg` | SVG | 600×700 | Procedural vector | Rounded plush bear companion designed to follow, point, and celebrate without dominating. |
| `public/assets/journeys/yosemite-cover.svg` | SVG | 1200×760 | Procedural vector | Golden-hour granite valley, waterfall, meadow, river, Clara, and Buddy. |
| `public/assets/journeys/lapland-cover.svg` | SVG | 1200×760 | Procedural vector | Violet snow forest, northern lights, lantern glow, winter Clara, and reindeer. |
| `public/assets/journeys/corfu-cover.svg` | SVG | 1200×760 | Procedural vector | Turquoise sea, fortress silhouette, boat, Mediterranean plants, and summer Clara. |
| `public/assets/journeys/yosemite-memory.svg` | SVG | 900×1200 | Procedural vector | Portrait memory reference with Yosemite Falls, trail color, and Clara; explicitly stylized rather than photographic. |
| `public/assets/journeys/lapland-memory.svg` | SVG | 900×1200 | Procedural vector | Portrait lantern-lit Lapland memory with snow and aurora color. |
| `public/assets/journeys/corfu-memory.svg` | SVG | 900×1200 | Procedural vector | Portrait underwater Corfu memory with clear turquoise water and playful pose. |
| `public/assets/ui/memory-portal-frame.svg` | SVG | 1000×1250 | Procedural vector | Dark premium portal rim with turquoise energy line and restrained magical particles. |
| `public/assets/collectibles/pine-cone.svg` | SVG | 512×512 | Procedural vector | Toy-like faceted pine cone on a soft mint collectible tile. |
| `public/assets/collectibles/granite-stone.svg` | SVG | 512×512 | Procedural vector | Smooth speckled granite with a soft readable highlight. |
| `public/assets/collectibles/trail-token.svg` | SVG | 512×512 | Procedural vector | Warm gold Yosemite trail token with abstract granite, waterfall, and meadow. |
| `public/assets/badges/yosemite-explorer.svg` | SVG | 512×512 | Procedural vector | Turquoise-rim explorer stamp with granite, waterfall, pine, and Buddy. |
| `public/assets/celebration/yosemite-celebration.svg` | SVG | 1600×900 | Procedural vector | Clara and Buddy victory pose over restrained turquoise explorer rays. |

## Real-time assets

The globe, Yosemite terrain, waterfall, river, pine forest, wildlife, Clara rig, Buddy rig, collectibles, route transition, controls, and activity markers are generated at runtime from Three.js geometry and materials. They do not contain external textures or private media.

The in-game recreation screenshot is generated locally from the player’s WebGL canvas and persisted to IndexedDB. It is never uploaded.
