import { useKunuStore } from '../../store/useKunuStore'
import type { WorldView } from '../../types/models'
import { Icon } from '../shared/Icon'

export function WorldViewToggle() {
  const current = useKunuStore((state) => state.worldView)
  const setView = useKunuStore((state) => state.setWorldView)
  return <div className="view-toggle" aria-label="World visualization">
    {(['globe', 'map'] as WorldView[]).map((view) => <button key={view} aria-pressed={current === view} onClick={() => setView(view)}><Icon name={view}/><span>{view === 'globe' ? 'Globe' : 'Map'}</span></button>)}
  </div>
}
