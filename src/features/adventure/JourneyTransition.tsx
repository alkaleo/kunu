import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { seedChild, seedJourneys, seedSettings } from '../../data/seed'
import { journeyLabel } from '../../lib/journey'
import { useKunuStore } from '../../store/useKunuStore'

export function JourneyTransition() {
  const journey = useKunuStore((state) => state.journeys.find((item) => item.id === 'yosemite') ?? seedJourneys[0])
  const child = useKunuStore((state) => state.child ?? seedChild)
  const reducedMotion = useKunuStore((state) => state.settings?.reducedMotion ?? seedSettings.reducedMotion)
  const setMode = useKunuStore((state) => state.setExperienceMode)
  const visit = useKunuStore((state) => state.visitJourney)
  const [canSkip, setCanSkip] = useState(false)

  useEffect(() => {
    visit('yosemite')
    let seen = false
    try { seen = localStorage.getItem('kunu-yosemite-transition') === 'seen' } catch { /* restrictive private mode */ }
    setCanSkip(seen)
    const finish = window.setTimeout(() => {
      try { localStorage.setItem('kunu-yosemite-transition', 'seen') } catch { /* the transition still completes */ }
      setMode('adventure')
    }, reducedMotion ? 900 : 5600)
    return () => window.clearTimeout(finish)
  }, [reducedMotion, setMode, visit])

  return <main className="journey-transition" aria-label="Traveling to Yosemite">
    <div className="transition-stars"/>
    <motion.div className="transition-globe" initial={{ scale: 1.6, x: '22vw' }} animate={{ scale: .7, x: '-36vw' }} transition={{ duration: reducedMotion ? .4 : 4.6, ease: [0.45, 0, 0.55, 1] }}><span className="california-pulse"/></motion.div>
    <svg className="route-arc" viewBox="0 0 1000 500" aria-hidden="true"><motion.path d="M130 350C390 20 680 32 900 230" fill="none" stroke="#56e1df" strokeWidth="6" strokeDasharray="12 13" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: reducedMotion ? 0 : .65, duration: reducedMotion ? .35 : 3.3 }}/></svg>
    <motion.div className="kunu-plane" initial={{ x: '-36vw', y: '24vh', rotate: -8 }} animate={{ x: '45vw', y: '-7vh', rotate: 4 }} transition={{ delay: reducedMotion ? 0 : .9, duration: reducedMotion ? .5 : 3.7, ease: 'easeInOut' }}><i/><span className="plane-clara"/><span className="plane-buddy"/></motion.div>
    <div className="transition-cloud transition-cloud--one"/><div className="transition-cloud transition-cloud--two"/><div className="transition-cloud transition-cloud--three"/>
    <motion.div className="transition-title" initial={{ opacity: 0, y: 15 }} animate={{ opacity: [0, 1, 1, 0], y: [15, 0, 0, -10] }} transition={{ times: [0, .2, .78, 1], delay: reducedMotion ? 0 : 2, duration: reducedMotion ? .8 : 3 }}><p>Next memory</p><h1>{journey.location}</h1><span>{journeyLabel(child, journey).replace('Yosemite · ', '')}</span></motion.div>
    {canSkip && <button className="transition-skip" onClick={() => setMode('adventure')}>Skip journey</button>}
  </main>
}
