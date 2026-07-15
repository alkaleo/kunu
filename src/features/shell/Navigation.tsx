import { motion } from 'framer-motion'
import { useKunuStore } from '../../store/useKunuStore'
import type { AppSection } from '../../types/models'
import { Icon, type IconName } from '../shared/Icon'

const destinations: { id: AppSection; label: string; icon: IconName }[] = [
  { id: 'world', label: 'World', icon: 'world' },
  { id: 'timeline', label: 'Timeline', icon: 'timeline' },
  { id: 'passport', label: 'Passport', icon: 'passport' },
  { id: 'profile', label: 'Profile', icon: 'profile' },
]

export function Navigation() {
  const section = useKunuStore((state) => state.currentSection)
  const setSection = useKunuStore((state) => state.setSection)

  return (
    <nav className="app-nav" aria-label="Primary navigation">
      {destinations.map((item) => {
        const active = item.id === section
        return (
          <button key={item.id} className="app-nav__item" aria-current={active ? 'page' : undefined} onClick={() => setSection(item.id)}>
            {active && <motion.span className="app-nav__active" layoutId="active-navigation" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
            <Icon name={item.icon} width="21" height="21" />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
