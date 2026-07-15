import { motion } from 'framer-motion'
import { formatJourneyDate, journeyAge } from '../../lib/journey'
import { useKunuStore } from '../../store/useKunuStore'
import { Button } from '../shared/Button'

export function JourneyPreview() {
  const journey = useKunuStore((state) => state.journeys.find((item) => item.id === state.selectedJourneyId)!)
  const child = useKunuStore((state) => state.child)
  const setMode = useKunuStore((state) => state.setExperienceMode)
  return <motion.div className={`journey-preview journey-preview--${journey.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <img src={journey.coverAsset} alt=""/>
    <div className="journey-preview__shade"/>
    <button className="preview-close" onClick={() => setMode('memory')} aria-label="Close preview">×</button>
    <div className="journey-preview__copy"><p className="eyebrow">{journey.status === 'playable' ? 'Playable memory' : 'Memory world preparing'}</p><h1>{journey.location}</h1><p>{formatJourneyDate(journey.date)} · Age {journeyAge(child, journey)} · {journey.theme}</p><p>{journey.status === 'playable' ? 'Clara and Buddy are ready at the trailhead.' : journey.memoryText}</p>{journey.status === 'playable' ? <Button icon="sparkle" onClick={() => setMode('transition')}>Begin the journey</Button> : <Button variant="glass" onClick={() => setMode('memory')}>Return to world</Button>}</div>
  </motion.div>
}
