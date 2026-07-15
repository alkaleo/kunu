export interface CalculatedAge {
  years: number
  months: number
}

function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function calculateAge(dateOfBirth: string, journeyDate: string): CalculatedAge {
  const birth = parseLocalDate(dateOfBirth)
  const journey = parseLocalDate(journeyDate)

  if (Number.isNaN(birth.getTime()) || Number.isNaN(journey.getTime()) || journey < birth) {
    throw new Error('Journey date must be on or after the child’s birth date.')
  }

  let years = journey.getFullYear() - birth.getFullYear()
  let months = journey.getMonth() - birth.getMonth()

  if (journey.getDate() < birth.getDate()) months -= 1
  if (months < 0) {
    years -= 1
    months += 12
  }

  return { years, months }
}

export function formatAge(dateOfBirth: string, journeyDate: string): string {
  return `Age ${calculateAge(dateOfBirth, journeyDate).years}`
}
