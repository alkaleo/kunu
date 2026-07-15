export type JourneyStatus = 'playable' | 'preparing'
export type AppSection = 'world' | 'timeline' | 'passport' | 'profile'
export type WorldView = 'globe' | 'map'
export type ExperienceMode = 'memory' | 'preview' | 'transition' | 'adventure'
export type ActivityId = 'waterfall' | 'souvenirs' | 'memory' | 'question'

export interface ParentProfile {
  id: string
  name: string
  createdAt: string
}

export interface ChildProfile {
  id: string
  name: string
  dateOfBirth: string
  characterStyle: 'kunu-block'
  homeMusic: 'calm'
}

export interface JourneyPhoto {
  id: string
  journeyId: string
  alt: string
  generatedAsset?: string
  localBlobId?: string
}

export interface Journey {
  id: 'yosemite' | 'lapland' | 'corfu'
  location: string
  country: string
  date: string
  coordinates: [number, number]
  theme: string
  coverAsset: string
  photos: JourneyPhoto[]
  memoryText: string
  status: JourneyStatus
  completion: number
  palette: [string, string, string]
}

export interface ActivityProgress {
  journeyId: Journey['id']
  activities: Record<ActivityId, boolean>
  attempts: Partial<Record<ActivityId, number>>
  souvenirs: string[]
  screenshot?: string
}

export interface ExplorerProgress {
  xp: number
  level: number
  visitedJourneyIds: Journey['id'][]
}

export interface Badge {
  id: string
  name: string
  description: string
  asset: string
  unlockedAt?: string
  addedToPassport: boolean
}

export interface Collectible {
  id: string
  journeyId: Journey['id']
  name: string
  asset: string
  collected: boolean
}

export interface Settings {
  masterAudio: boolean
  music: boolean
  ambience: boolean
  volume: number
  reducedMotion: boolean
  reducedSensory: boolean
}

export interface PersistedKunuState {
  schemaVersion: number
  parent: ParentProfile
  child: ChildProfile
  journeys: Journey[]
  activityProgress: Record<string, ActivityProgress>
  explorer: ExplorerProgress
  badges: Badge[]
  collectibles: Collectible[]
  settings: Settings
  onboardingComplete: boolean
}
