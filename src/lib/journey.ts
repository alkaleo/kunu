import { calculateAge } from './age'
import type { ChildProfile, Journey } from '../types/models'

export function formatJourneyDate(date: string): string {
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`))
}

export function journeyAge(child: ChildProfile, journey: Journey): number {
  return calculateAge(child.dateOfBirth, journey.date).years
}

export function journeyLabel(child: ChildProfile, journey: Journey): string {
  return `${journey.location} · ${formatJourneyDate(journey.date)} · Age ${journeyAge(child, journey)}`
}
