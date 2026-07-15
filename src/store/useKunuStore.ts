import { create } from 'zustand'
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
import { clearKunuDatabase, loadSnapshot, saveSnapshot } from '../lib/db'
import type { AppSection, Journey, PersistedKunuState, Settings, WorldView } from '../types/models'

interface KunuStore extends PersistedKunuState {
  hydrated: boolean
  currentSection: AppSection
  worldView: WorldView
  selectedJourneyId: Journey['id']
  setSection: (section: AppSection) => void
  setWorldView: (view: WorldView) => void
  selectJourney: (id: Journey['id']) => void
  updateSettings: (settings: Partial<Settings>) => void
  completeOnboarding: () => void
  hydrate: () => Promise<void>
  resetDemo: () => Promise<void>
}

export function createInitialSnapshot(): PersistedKunuState {
  return {
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

function toSnapshot(state: KunuStore): PersistedKunuState {
  const { parent, child, journeys, activityProgress, explorer, badges, collectibles, settings, onboardingComplete } = state
  return { parent, child, journeys, activityProgress, explorer, badges, collectibles, settings, onboardingComplete }
}

export const useKunuStore = create<KunuStore>((set, get) => ({
  ...createInitialSnapshot(),
  hydrated: false,
  currentSection: 'world',
  worldView: 'globe',
  selectedJourneyId: 'yosemite',
  setSection: (currentSection) => set({ currentSection }),
  setWorldView: (worldView) => set({ worldView }),
  selectJourney: (selectedJourneyId) => set({ selectedJourneyId }),
  updateSettings: (update) => {
    set((state) => ({ settings: { ...state.settings, ...update } }))
    void saveSnapshot(toSnapshot(get()))
  },
  completeOnboarding: () => {
    set({ onboardingComplete: true })
    void saveSnapshot(toSnapshot(get()))
  },
  hydrate: async () => {
    const saved = await loadSnapshot()
    if (saved) set({ ...saved, hydrated: true })
    else {
      set({ hydrated: true })
      await saveSnapshot(toSnapshot(get()))
    }
  },
  resetDemo: async () => {
    await clearKunuDatabase()
    set({ ...createInitialSnapshot(), hydrated: true, currentSection: 'world', selectedJourneyId: 'yosemite' })
    await saveSnapshot(toSnapshot(get()))
  },
}))
