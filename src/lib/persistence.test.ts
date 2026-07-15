import { describe, expect, it } from 'vitest'
import { CURRENT_SCHEMA_VERSION, migrateAndRepairSnapshot } from './persistence'

describe('persisted Kunu migrations', () => {
  it('repairs an incomplete pre-version snapshot without losing saved progress', () => {
    const repaired = migrateAndRepairSnapshot({
      onboardingComplete: true,
      child: { name: 'Clara' },
      settings: { masterAudio: false },
      activityProgress: { yosemite: { activities: { waterfall: true }, souvenirs: ['pine-cone'] } },
      collectibles: [{ id: 'granite-stone', collected: true }],
      explorer: { xp: 125 },
      journeys: [{ id: 'yosemite', memoryText: 'A saved family memory.' }],
    })

    expect(repaired.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
    expect(repaired.onboardingComplete).toBe(true)
    expect(repaired.activityProgress.yosemite.activities).toEqual({ waterfall: true, souvenirs: false, memory: false, question: false })
    expect(repaired.activityProgress.yosemite.souvenirs).toEqual(['pine-cone', 'granite-stone'])
    expect(repaired.collectibles.find((item) => item.id === 'pine-cone')?.collected).toBe(true)
    expect(repaired.settings).toMatchObject({ masterAudio: false, music: true, ambience: true, reducedMotion: false })
    expect(repaired.explorer).toMatchObject({ xp: 125, level: 0, visitedJourneyIds: [] })
    expect(repaired.journeys).toHaveLength(3)
    expect(repaired.journeys[0].memoryText).toBe('A saved family memory.')
    expect(repaired.badges).toHaveLength(1)
  })

  it('repairs corrupted collection values and always restores Yosemite data', () => {
    const repaired = migrateAndRepairSnapshot({
      settings: null,
      badges: null,
      collectibles: 'missing',
      explorer: { xp: Number.NaN, visitedJourneyIds: ['unknown'] },
      activityProgress: {},
      journeys: [],
    })

    expect(repaired.activityProgress.yosemite.activities).toBeDefined()
    expect(repaired.journeys.some((journey) => journey.id === 'yosemite')).toBe(true)
    expect(repaired.collectibles).toHaveLength(3)
    expect(repaired.badges[0].id).toBe('yosemite-explorer')
    expect(repaired.settings.volume).toBeGreaterThan(0)
  })
})
