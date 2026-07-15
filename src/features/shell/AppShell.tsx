import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { useKunuAudio } from '../../hooks/useKunuAudio'
import { useKunuStore } from '../../store/useKunuStore'
import { Passport } from '../passport/Passport'
import { Profile } from '../profile/Profile'
import { Timeline } from '../timeline/Timeline'
import { JourneyPreview } from '../world/JourneyPreview'
import { Navigation } from './Navigation'

const WorldHome = lazy(() => import('../world/WorldHome').then((module) => ({ default: module.WorldHome })))

export function AppShell() {
  useKunuAudio('home')
  const section = useKunuStore((state) => state.currentSection)
  const child = useKunuStore((state) => state.child)
  const mode = useKunuStore((state) => state.experienceMode)
  const sections = { world: <Suspense fallback={<div className="world-loading">Polishing the globe…</div>}><WorldHome/></Suspense>, timeline: <Timeline/>, passport: <Passport/>, profile: <Profile/> }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" aria-label="Open World">
          <img src="/kunu-mark.svg" alt="" />
          <span>Kunu</span>
        </button>
        <div className="topbar__status">
          <span className="status-dot" />
          <span>Private on this device</span>
        </div>
        <button className="avatar" aria-label={`${child.name} profile`}>C</button>
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={section}
          className="section-stage"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {sections[section]}
        </motion.main>
      </AnimatePresence>
      <Navigation />
      <AnimatePresence>{mode === 'preview' && <JourneyPreview/>}</AnimatePresence>
    </div>
  )
}
