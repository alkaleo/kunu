import type { ActivityId, ActivityProgress } from '../types/models'

export const activityXp: Record<ActivityId, number> = {
  waterfall: 125,
  souvenirs: 150,
  memory: 175,
  question: 125,
}

export function activityCompletion(progress: ActivityProgress): number {
  const complete = Object.values(progress.activities).filter(Boolean).length
  return Math.round((complete / Object.keys(progress.activities).length) * 100)
}

export function allActivitiesComplete(progress: ActivityProgress): boolean {
  return Object.values(progress.activities).every(Boolean)
}

export function explorerLevel(xp: number): { index: number; name: string; nextXp: number } {
  const names = ['Curious Traveler', 'City Explorer', 'Country Adventurer', 'World Pathfinder', 'Master Explorer', 'Legend of the World']
  const index = Math.min(Math.floor(xp / 300), names.length - 1)
  return { index, name: names[index], nextXp: Math.min((index + 1) * 300, 1500) }
}
