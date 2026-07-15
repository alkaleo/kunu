import { beforeEach, describe, expect, it } from 'vitest'
import { createInitialSnapshot, useKunuStore } from './useKunuStore'

describe('Kunu store progression', () => {
  beforeEach(() => useKunuStore.setState({ ...createInitialSnapshot(), hydrated: true, experienceMode: 'adventure' }))

  it('persists activity XP and unlocks Yosemite Explorer after every activity', () => {
    const store = useKunuStore.getState()
    store.visitJourney('yosemite')
    store.completeActivity('waterfall')
    store.collectSouvenir('pine-cone')
    store.collectSouvenir('granite-stone')
    store.collectSouvenir('trail-token')
    store.completeActivity('memory')
    store.completeActivity('question')
    const completed = useKunuStore.getState()
    expect(completed.journeys.find((journey) => journey.id === 'yosemite')?.completion).toBe(100)
    expect(completed.activityProgress.yosemite.activities).toEqual({ waterfall: true, souvenirs: true, memory: true, question: true })
    expect(completed.badges.find((badge) => badge.id === 'yosemite-explorer')?.unlockedAt).toBeTruthy()
    expect(completed.explorer.xp).toBe(675)
  })
})
