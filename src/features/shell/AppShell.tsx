import { AnimatePresence, motion } from 'framer-motion'
import { useKunuStore } from '../../store/useKunuStore'
import { Passport } from '../passport/Passport'
import { Profile } from '../profile/Profile'
import { Timeline } from '../timeline/Timeline'
import { JourneyPreview } from '../world/JourneyPreview'
import { WorldHome } from '../world/WorldHome'
import { Navigation } from './Navigation'

export function AppShell() {
  const section = useKunuStore((state) => state.currentSection)
  const child = useKunuStore((state) => state.child)
  const mode = useKunuStore((state) => state.experienceMode)
  const sections = { world: <WorldHome/>, timeline: <Timeline/>, passport: <Passport/>, profile: <Profile/> }

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
