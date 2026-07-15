import { motion } from 'framer-motion'
import { supportsWebGL } from '../../lib/webgl'
import { useKunuStore } from '../../store/useKunuStore'
import { JourneyCard } from './JourneyCard'
import { WorldGlobe } from './WorldGlobe'
import { WorldMap } from './WorldMap'
import { WorldViewToggle } from './WorldViewToggle'

export function WorldHome() {
  const journeys = useKunuStore((state) => state.journeys)
  const selectedId = useKunuStore((state) => state.selectedJourneyId)
  const view = useKunuStore((state) => state.worldView)
  const selected = journeys.find((journey) => journey.id === selectedId) ?? journeys[0]
  const webgl = supportsWebGL()
  return <main className="world-home">
    <div className="world-hero-copy"><p className="eyebrow">Clara’s world</p><h1>Where should we remember?</h1><p>Drag the globe, follow the turquoise pins, and step back into a journey.</p></div>
    <WorldViewToggle/>
    <motion.div className="world-visual" layout>{view === 'globe' && webgl ? <WorldGlobe journeys={journeys}/> : <WorldMap journeys={journeys} fallback={!webgl}/>}</motion.div>
    <JourneyCard journey={selected}/>
  </main>
}
