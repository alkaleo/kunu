import { describe, expect, it } from 'vitest'
import { seedActivityProgress } from '../data/seed'
import { activityCompletion, allActivitiesComplete, explorerLevel } from './progression'

describe('Yosemite progression', () => {
  it('calculates completion from all four activities', () => {
    const progress = structuredClone(seedActivityProgress.yosemite)
    progress.activities.waterfall = true
    progress.activities.souvenirs = true
    expect(activityCompletion(progress)).toBe(50)
    expect(allActivitiesComplete(progress)).toBe(false)
    progress.activities.memory = true
    progress.activities.question = true
    expect(activityCompletion(progress)).toBe(100)
    expect(allActivitiesComplete(progress)).toBe(true)
  })

  it('maps XP to private explorer levels', () => {
    expect(explorerLevel(0).name).toBe('Curious Traveler')
    expect(explorerLevel(650).name).toBe('Country Adventurer')
    expect(explorerLevel(9999).name).toBe('Legend of the World')
  })
})
