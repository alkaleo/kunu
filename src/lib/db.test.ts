import { beforeEach, describe, expect, it } from 'vitest'
import { createInitialSnapshot } from '../store/useKunuStore'
import { clearKunuDatabase, loadSnapshot, saveSnapshot } from './db'

describe('persistence fallback', () => {
  beforeEach(async () => { await clearKunuDatabase() })

  it('round-trips the complete snapshot', async () => {
    const snapshot = createInitialSnapshot()
    snapshot.explorer.xp = 125
    snapshot.settings.reducedMotion = true
    await saveSnapshot(snapshot)
    const restored = await loadSnapshot()
    expect(restored?.explorer.xp).toBe(125)
    expect(restored?.settings.reducedMotion).toBe(true)
    expect(restored?.journeys).toHaveLength(3)
  })
})
