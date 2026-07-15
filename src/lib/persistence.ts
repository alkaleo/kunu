import {
  seedActivityProgress,
  seedBadges,
  seedChild,
  seedCollectibles,
  seedExplorer,
  seedJourneys,
  seedParent,
  seedSettings,
} from '../data/seed'
import { activityCompletion, allActivitiesComplete } from './progression'
import type {
  ActivityId,
  ActivityProgress,
  Badge,
  Collectible,
  Journey,
  JourneyPhoto,
  PersistedKunuState,
} from '../types/models'

export const CURRENT_SCHEMA_VERSION = 2

const activityIds: ActivityId[] = ['waterfall', 'souvenirs', 'memory', 'question']
const journeyIds = new Set(seedJourneys.map((journey) => journey.id))
const collectibleIds = new Set(seedCollectibles.map((item) => item.id))

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function text(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function finite(value: unknown, fallback: number, minimum = 0, maximum = Number.MAX_SAFE_INTEGER): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(maximum, Math.max(minimum, value))
    : fallback
}

function mergePhotos(defaults: JourneyPhoto[], value: unknown): JourneyPhoto[] {
  if (!Array.isArray(value)) return structuredClone(defaults)
  return defaults.map((fallback) => {
    const saved = record(value.find((photo) => record(photo).id === fallback.id))
    return {
      ...fallback,
      alt: text(saved.alt, fallback.alt),
      generatedAsset: typeof saved.generatedAsset === 'string' ? saved.generatedAsset : fallback.generatedAsset,
      localBlobId: typeof saved.localBlobId === 'string' ? saved.localBlobId : fallback.localBlobId,
    }
  })
}

function repairYosemiteProgress(value: unknown): ActivityProgress {
  const fallback = seedActivityProgress.yosemite
  const saved = record(value)
  const activities = record(saved.activities)
  const attempts = record(saved.attempts)
  const souvenirs = Array.isArray(saved.souvenirs)
    ? [...new Set(saved.souvenirs.filter((id): id is string => typeof id === 'string' && collectibleIds.has(id)))]
    : []

  return {
    journeyId: 'yosemite',
    activities: Object.fromEntries(activityIds.map((id) => [id, typeof activities[id] === 'boolean' ? activities[id] : fallback.activities[id]])) as Record<ActivityId, boolean>,
    attempts: Object.fromEntries(activityIds.flatMap((id) => typeof attempts[id] === 'number' && Number.isFinite(attempts[id]) ? [[id, Math.max(0, Math.floor(attempts[id] as number))]] : [])),
    souvenirs,
    screenshot: typeof saved.screenshot === 'string' && saved.screenshot.startsWith('data:image/') ? saved.screenshot : undefined,
  }
}

function repairJourneys(value: unknown, progress: ActivityProgress): Journey[] {
  const savedJourneys = Array.isArray(value) ? value : []
  return seedJourneys.map((fallback) => {
    const saved = record(savedJourneys.find((journey) => record(journey).id === fallback.id))
    const coordinates = Array.isArray(saved.coordinates) && saved.coordinates.length === 2 && saved.coordinates.every((coordinate) => typeof coordinate === 'number' && Number.isFinite(coordinate))
      ? saved.coordinates as [number, number]
      : fallback.coordinates
    const palette = Array.isArray(saved.palette) && saved.palette.length === 3 && saved.palette.every((color) => typeof color === 'string')
      ? saved.palette as [string, string, string]
      : fallback.palette
    return {
      ...fallback,
      location: text(saved.location, fallback.location),
      country: text(saved.country, fallback.country),
      date: text(saved.date, fallback.date),
      coordinates,
      theme: text(saved.theme, fallback.theme),
      coverAsset: text(saved.coverAsset, fallback.coverAsset),
      photos: mergePhotos(fallback.photos, saved.photos),
      memoryText: text(saved.memoryText, fallback.memoryText),
      status: saved.status === 'playable' || saved.status === 'preparing' ? saved.status : fallback.status,
      completion: fallback.id === 'yosemite' ? activityCompletion(progress) : finite(saved.completion, fallback.completion, 0, 100),
      palette,
    }
  })
}

function repairCollectibles(value: unknown, progress: ActivityProgress): Collectible[] {
  const savedCollectibles = Array.isArray(value) ? value : []
  const collected = new Set(progress.souvenirs)
  const repaired = seedCollectibles.map((fallback) => {
    const saved = record(savedCollectibles.find((item) => record(item).id === fallback.id))
    if (saved.collected === true) collected.add(fallback.id)
    return { ...fallback, collected: saved.collected === true || collected.has(fallback.id) }
  })
  progress.souvenirs = repaired.filter((item) => item.collected).map((item) => item.id)
  if (progress.souvenirs.length === seedCollectibles.length) progress.activities.souvenirs = true
  return repaired
}

function repairBadges(value: unknown, progress: ActivityProgress): Badge[] {
  const savedBadges = Array.isArray(value) ? value : []
  return seedBadges.map((fallback) => {
    const saved = record(savedBadges.find((badge) => record(badge).id === fallback.id))
    const unlockedAt = typeof saved.unlockedAt === 'string'
      ? saved.unlockedAt
      : allActivitiesComplete(progress) ? seedParent.createdAt : undefined
    return {
      ...fallback,
      name: text(saved.name, fallback.name),
      description: text(saved.description, fallback.description),
      asset: text(saved.asset, fallback.asset),
      unlockedAt,
      addedToPassport: saved.addedToPassport === true && Boolean(unlockedAt),
    }
  })
}

export function createDefaultSnapshot(): PersistedKunuState {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    parent: structuredClone(seedParent),
    child: structuredClone(seedChild),
    journeys: structuredClone(seedJourneys),
    activityProgress: structuredClone(seedActivityProgress),
    explorer: structuredClone(seedExplorer),
    badges: structuredClone(seedBadges),
    collectibles: structuredClone(seedCollectibles),
    settings: structuredClone(seedSettings),
    onboardingComplete: false,
  }
}

/** Merges every legacy snapshot into the current seed before it can reach React. */
export function migrateAndRepairSnapshot(value: unknown): PersistedKunuState {
  const fallback = createDefaultSnapshot()
  const saved = record(value)
  const savedParent = record(saved.parent)
  const savedChild = record(saved.child)
  const savedSettings = record(saved.settings)
  const savedExplorer = record(saved.explorer)
  const savedProgress = record(saved.activityProgress)
  const progress = repairYosemiteProgress(savedProgress.yosemite)
  const collectibles = repairCollectibles(saved.collectibles, progress)
  const journeys = repairJourneys(saved.journeys, progress)
  const visitedJourneyIds = Array.isArray(savedExplorer.visitedJourneyIds)
    ? [...new Set(savedExplorer.visitedJourneyIds.filter((id): id is Journey['id'] => typeof id === 'string' && journeyIds.has(id as Journey['id'])))]
    : fallback.explorer.visitedJourneyIds

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    parent: {
      ...fallback.parent,
      id: text(savedParent.id, fallback.parent.id),
      name: text(savedParent.name, fallback.parent.name),
      createdAt: text(savedParent.createdAt, fallback.parent.createdAt),
    },
    child: {
      ...fallback.child,
      id: text(savedChild.id, fallback.child.id),
      name: text(savedChild.name, fallback.child.name),
      dateOfBirth: text(savedChild.dateOfBirth, fallback.child.dateOfBirth),
      characterStyle: savedChild.characterStyle === 'kunu-block' ? savedChild.characterStyle : fallback.child.characterStyle,
      homeMusic: savedChild.homeMusic === 'calm' ? savedChild.homeMusic : fallback.child.homeMusic,
    },
    journeys,
    activityProgress: { yosemite: progress },
    explorer: {
      xp: finite(savedExplorer.xp, fallback.explorer.xp),
      level: Math.floor(finite(savedExplorer.level, fallback.explorer.level)),
      visitedJourneyIds,
    },
    badges: repairBadges(saved.badges, progress),
    collectibles,
    settings: {
      masterAudio: typeof savedSettings.masterAudio === 'boolean' ? savedSettings.masterAudio : fallback.settings.masterAudio,
      music: typeof savedSettings.music === 'boolean' ? savedSettings.music : fallback.settings.music,
      ambience: typeof savedSettings.ambience === 'boolean' ? savedSettings.ambience : fallback.settings.ambience,
      volume: finite(savedSettings.volume, fallback.settings.volume, 0, 1),
      reducedMotion: typeof savedSettings.reducedMotion === 'boolean' ? savedSettings.reducedMotion : fallback.settings.reducedMotion,
      reducedSensory: typeof savedSettings.reducedSensory === 'boolean' ? savedSettings.reducedSensory : fallback.settings.reducedSensory,
    },
    onboardingComplete: saved.onboardingComplete === true,
  }
}
