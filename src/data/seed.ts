import type {
  ActivityProgress,
  Badge,
  ChildProfile,
  Collectible,
  ExplorerProgress,
  Journey,
  ParentProfile,
  Settings,
} from '../types/models'

export const seedParent: ParentProfile = {
  id: 'parent-demo',
  name: 'Clara’s family',
  createdAt: '2026-07-15T00:00:00.000Z',
}

export const seedChild: ChildProfile = {
  id: 'clara',
  name: 'Clara',
  dateOfBirth: '2017-08-01',
  characterStyle: 'kunu-block',
  homeMusic: 'calm',
}

export const seedJourneys: Journey[] = [
  {
    id: 'yosemite',
    location: 'Yosemite',
    country: 'USA',
    date: '2024-07-15',
    coordinates: [37.8651, -119.5383],
    theme: 'Freedom',
    coverAsset: '/assets/journeys/yosemite-cover.svg',
    photos: [
      { id: 'yosemite-memory-1', journeyId: 'yosemite', alt: 'A stylized Yosemite waterfall memory', generatedAsset: '/assets/journeys/yosemite-memory.svg' },
    ],
    memoryText: 'Granite, bright skies, and the feeling that every trail could lead somewhere wonderful.',
    status: 'playable',
    completion: 0,
    palette: ['#78b985', '#c8d7cf', '#f1a85a'],
  },
  {
    id: 'lapland',
    location: 'Lapland',
    country: 'Finland',
    date: '2024-12-15',
    coordinates: [66.5039, 25.7294],
    theme: 'Magic',
    coverAsset: '/assets/journeys/lapland-cover.svg',
    photos: [
      { id: 'lapland-memory-1', journeyId: 'lapland', alt: 'A stylized lantern-lit snow memory', generatedAsset: '/assets/journeys/lapland-memory.svg' },
    ],
    memoryText: 'Blue snow, warm lantern light, and a quiet forest that felt alive with magic.',
    status: 'preparing',
    completion: 0,
    palette: ['#7479df', '#c4e9ed', '#ffbd6c'],
  },
  {
    id: 'corfu',
    location: 'Corfu',
    country: 'Greece',
    date: '2025-07-15',
    coordinates: [39.6243, 19.9217],
    theme: 'Summer',
    coverAsset: '/assets/journeys/corfu-cover.svg',
    photos: [
      { id: 'corfu-memory-1', journeyId: 'corfu', alt: 'A stylized turquoise sea memory', generatedAsset: '/assets/journeys/corfu-memory.svg' },
    ],
    memoryText: 'Salt on the breeze, ancient stone, and turquoise water bright enough to dream in.',
    status: 'preparing',
    completion: 0,
    palette: ['#20bfc3', '#f3d27a', '#e58165'],
  },
]

export const seedActivityProgress: Record<string, ActivityProgress> = {
  yosemite: {
    journeyId: 'yosemite',
    activities: { waterfall: false, souvenirs: false, memory: false, question: false },
    attempts: {},
    souvenirs: [],
  },
}

export const seedExplorer: ExplorerProgress = { xp: 0, level: 0, visitedJourneyIds: [] }

export const seedBadges: Badge[] = [
  {
    id: 'yosemite-explorer',
    name: 'Yosemite Explorer',
    description: 'Followed the valley’s clues and completed every Yosemite memory activity.',
    asset: '/assets/badges/yosemite-explorer.svg',
    addedToPassport: false,
  },
]

export const seedCollectibles: Collectible[] = [
  { id: 'pine-cone', journeyId: 'yosemite', name: 'Pine cone', asset: '/assets/collectibles/pine-cone.svg', collected: false },
  { id: 'granite-stone', journeyId: 'yosemite', name: 'Smooth granite', asset: '/assets/collectibles/granite-stone.svg', collected: false },
  { id: 'trail-token', journeyId: 'yosemite', name: 'Trail token', asset: '/assets/collectibles/trail-token.svg', collected: false },
]

export const seedSettings: Settings = {
  masterAudio: true,
  music: true,
  ambience: true,
  volume: 0.65,
  reducedMotion: false,
  reducedSensory: false,
}
