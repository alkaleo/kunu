import { AnimatePresence, motion } from 'framer-motion'
import { formatJourneyDate, journeyAge } from '../../lib/journey'
import { useKunuStore } from '../../store/useKunuStore'
import type { Journey } from '../../types/models'
import { Button } from '../shared/Button'
import { CharacterArt } from '../shared/CharacterArt'

export function JourneyCard({ journey }: { journey: Journey }) {
  const child = useKunuStore((state) => state.child)
  const setMode = useKunuStore((state) => state.setExperienceMode)
  return <AnimatePresence mode="wait"><motion.article key={journey.id} className="journey-spotlight" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
    <div className="journey-card-art"><img src={journey.coverAsset} alt={`Stylized ${journey.location} memory world`}/><CharacterArt variant="full-body" fallback={journey.id === 'yosemite' ? '/assets/characters/clara-yosemite.svg' : `/assets/characters/clara-${journey.id}.svg`}/></div>
    <div className="journey-spotlight__content">
      <div className="journey-meta"><span>{journey.theme}</span><span>{formatJourneyDate(journey.date)}</span><span>Age {journeyAge(child, journey)}</span></div>
      <h2>{journey.location}, <span>{journey.country}</span></h2>
      <p>{journey.memoryText}</p>
      <div className="journey-progress"><span style={{ width: `${journey.completion}%` }}/></div>
      <Button onClick={() => setMode('preview')} icon="arrow">{journey.status === 'playable' ? 'Visit memory' : 'Preview memory'}</Button>
    </div>
  </motion.article></AnimatePresence>
}
