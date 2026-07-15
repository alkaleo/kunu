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
import { activityCompletion, activityXp, allActivitiesComplete } from '../lib/progression'
import type { ActivityId, AppSection, ChildProfile, ExperienceMode, Journey, ParentProfile, PersistedKunuState, Settings, WorldView } from '../types/models'

interface KunuStore extends PersistedKunuState {
  hydrated: boolean
  currentSection: AppSection
  worldView: WorldView
  selectedJourneyId: Journey['id']
  experienceMode: ExperienceMode
  setSection: (section: AppSection) => void
  setWorldView: (view: WorldView) => void
  selectJourney: (id: Journey['id']) => void
  setExperienceMode: (mode: ExperienceMode) => void
  updateParent: (profile: Partial<ParentProfile>) => void
  updateChild: (profile: Partial<ChildProfile>) => void
  updateSettings: (settings: Partial<Settings>) => void
  completeOnboarding: () => void
  hydrate: () => Promise<void>
  resetDemo: () => Promise<void>
  visitJourney: (id: Journey['id']) => void
  completeActivity: (id: ActivityId) => void
  collectSouvenir: (id: string) => void
  recordActivityAttempt: (id: ActivityId) => void
  saveRecreation: (screenshot: string) => void
  addBadgeToPassport: (id: string) => void
  restartYosemite: () => void
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
  experienceMode: 'memory',
  setSection: (currentSection) => set({ currentSection }),
  setWorldView: (worldView) => set({ worldView }),
  selectJourney: (selectedJourneyId) => set({ selectedJourneyId }),
  setExperienceMode: (experienceMode) => set({ experienceMode }),
  updateParent: (update) => {
    set((state) => ({ parent: { ...state.parent, ...update } }))
    void saveSnapshot(toSnapshot(get()))
  },
  updateChild: (update) => {
    set((state) => ({ child: { ...state.child, ...update } }))
    void saveSnapshot(toSnapshot(get()))
  },
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
    set({ ...createInitialSnapshot(), hydrated: true, currentSection: 'world', selectedJourneyId: 'yosemite', experienceMode: 'memory' })
    await saveSnapshot(toSnapshot(get()))
  },
  visitJourney: (id) => {
    const state = get()
    if (state.explorer.visitedJourneyIds.includes(id)) return
    set({ explorer: { ...state.explorer, xp: state.explorer.xp + 25, visitedJourneyIds: [...state.explorer.visitedJourneyIds, id] } })
    void saveSnapshot(toSnapshot(get()))
  },
  completeActivity: (id) => {
    const state = get()
    const current = state.activityProgress.yosemite
    if (current.activities[id]) return
    const progress = { ...current, activities: { ...current.activities, [id]: true } }
    const unlocked = allActivitiesComplete(progress)
    set({
      activityProgress: { ...state.activityProgress, yosemite: progress },
      explorer: { ...state.explorer, xp: state.explorer.xp + activityXp[id] },
      journeys: state.journeys.map((journey) => journey.id === 'yosemite' ? { ...journey, completion: activityCompletion(progress) } : journey),
      badges: state.badges.map((badge) => badge.id === 'yosemite-explorer' && unlocked && !badge.unlockedAt ? { ...badge, unlockedAt: new Date().toISOString() } : badge),
    })
    void saveSnapshot(toSnapshot(get()))
  },
  collectSouvenir: (id) => {
    const state = get()
    const item = state.collectibles.find((collectible) => collectible.id === id)
    if (!item || item.collected) return
    const current = state.activityProgress.yosemite
    const souvenirs = [...current.souvenirs, id]
    const completesSet = souvenirs.length === 3 && !current.activities.souvenirs
    const progress = { ...current, souvenirs, activities: { ...current.activities, souvenirs: completesSet ? true : current.activities.souvenirs } }
    const unlocked = allActivitiesComplete(progress)
    set({
      collectibles: state.collectibles.map((collectible) => collectible.id === id ? { ...collectible, collected: true } : collectible),
      activityProgress: { ...state.activityProgress, yosemite: progress },
      explorer: { ...state.explorer, xp: state.explorer.xp + 25 + (completesSet ? activityXp.souvenirs : 0) },
      journeys: state.journeys.map((journey) => journey.id === 'yosemite' ? { ...journey, completion: activityCompletion(progress) } : journey),
      badges: state.badges.map((badge) => badge.id === 'yosemite-explorer' && unlocked && !badge.unlockedAt ? { ...badge, unlockedAt: new Date().toISOString() } : badge),
    })
    void saveSnapshot(toSnapshot(get()))
  },
  recordActivityAttempt: (id) => {
    const state = get(); const current = state.activityProgress.yosemite
    const progress = { ...current, attempts: { ...current.attempts, [id]: (current.attempts[id] ?? 0) + 1 } }
    set({ activityProgress: { ...state.activityProgress, yosemite: progress } }); void saveSnapshot(toSnapshot(get()))
  },
  saveRecreation: (screenshot) => {
    const state = get(); const current = state.activityProgress.yosemite
    set({ activityProgress: { ...state.activityProgress, yosemite: { ...current, screenshot } } }); void saveSnapshot(toSnapshot(get()))
  },
  addBadgeToPassport: (id) => {
    set((state) => ({ badges: state.badges.map((badge) => badge.id === id ? { ...badge, addedToPassport: true } : badge) }))
    void saveSnapshot(toSnapshot(get()))
  },
  restartYosemite: () => {
    const state = get(); const reset = structuredClone(seedActivityProgress.yosemite)
    set({ activityProgress: { ...state.activityProgress, yosemite: reset }, collectibles: state.collectibles.map((item) => item.journeyId === 'yosemite' ? { ...item, collected: false } : item), journeys: state.journeys.map((journey) => journey.id === 'yosemite' ? { ...journey, completion: 0 } : journey), experienceMode: 'adventure' })
    void saveSnapshot(toSnapshot(get()))
  },
}))
