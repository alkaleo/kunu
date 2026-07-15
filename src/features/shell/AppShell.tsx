import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { formatAge } from '../../lib/age'
import { useKunuStore } from '../../store/useKunuStore'
import type { AppSection } from '../../types/models'
import { Icon } from '../shared/Icon'
import { Navigation } from './Navigation'

const copy: Record<AppSection, { eyebrow: string; title: string; body: string }> = {
  world: { eyebrow: 'Clara’s world', title: 'Where should we remember?', body: 'Three real journeys, reimagined as small magical worlds.' },
  timeline: { eyebrow: 'Growing through journeys', title: 'A story measured in places', body: 'Every trip becomes another chapter in Clara’s timeline.' },
  passport: { eyebrow: 'Private explorer passport', title: 'Small discoveries. Big story.', body: 'Badges and keepsakes live only on this device.' },
  profile: { eyebrow: 'Family space', title: 'Made for Clara', body: 'Her memories, settings, and privacy controls stay together.' },
}

export function AppShell() {
  const hydrate = useKunuStore((state) => state.hydrate)
  const hydrated = useKunuStore((state) => state.hydrated)
  const section = useKunuStore((state) => state.currentSection)
  const child = useKunuStore((state) => state.child)
  const journeys = useKunuStore((state) => state.journeys)

  useEffect(() => { void hydrate() }, [hydrate])

  if (!hydrated) {
    return <main className="loading-screen"><img src="/kunu-mark.svg" alt=""/><p>Gathering Clara’s worlds…</p></main>
  }

  const current = copy[section]

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
          <div className="section-intro">
            <p className="eyebrow">{current.eyebrow}</p>
            <h1>{current.title}</h1>
            <p>{current.body}</p>
          </div>
          <div className="foundation-grid" aria-label="Journey summary">
            {journeys.map((journey) => (
              <article className="foundation-card" key={journey.id} style={{ '--journey-accent': journey.palette[0] } as React.CSSProperties}>
                <div className="foundation-card__icon"><Icon name={journey.status === 'playable' ? 'sparkle' : 'world'} /></div>
                <div>
                  <p className="card-kicker">{journey.theme} · {formatAge(child.dateOfBirth, journey.date)}</p>
                  <h2>{journey.location}</h2>
                  <p>{journey.status === 'playable' ? 'Ready to explore' : 'Memory world preparing'}</p>
                </div>
              </article>
            ))}
          </div>
        </motion.main>
      </AnimatePresence>
      <Navigation />
    </div>
  )
}
