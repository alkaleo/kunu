import { useEffect } from 'react'
import { JourneyTransition } from './features/adventure/JourneyTransition'
import { YosemiteAdventure } from './features/adventure/YosemiteAdventure'
import { Onboarding } from './features/onboarding/Onboarding'
import { AppShell } from './features/shell/AppShell'
import { useKunuStore } from './store/useKunuStore'

export function App() {
  const hydrate = useKunuStore((state) => state.hydrate)
  const hydrated = useKunuStore((state) => state.hydrated)
  const onboarded = useKunuStore((state) => state.onboardingComplete)
  const mode = useKunuStore((state) => state.experienceMode)
  useEffect(() => { void hydrate() }, [hydrate])
  if (!hydrated) return <main className="loading-screen"><img src="/kunu-mark.svg" alt=""/><p>Gathering Clara’s worlds…</p></main>
  if (!onboarded) return <Onboarding/>
  if (mode === 'transition') return <JourneyTransition/>
  if (mode === 'adventure') return <YosemiteAdventure/>
  return <AppShell />
}
