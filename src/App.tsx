import { useEffect } from 'react'
import { Onboarding } from './features/onboarding/Onboarding'
import { AppShell } from './features/shell/AppShell'
import { useKunuStore } from './store/useKunuStore'

export function App() {
  const hydrate = useKunuStore((state) => state.hydrate)
  const hydrated = useKunuStore((state) => state.hydrated)
  const onboarded = useKunuStore((state) => state.onboardingComplete)
  useEffect(() => { void hydrate() }, [hydrate])
  if (!hydrated) return <main className="loading-screen"><img src="/kunu-mark.svg" alt=""/><p>Gathering Clara’s worlds…</p></main>
  if (!onboarded) return <Onboarding/>
  return <AppShell />
}
