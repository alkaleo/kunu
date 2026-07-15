import { Component, type ErrorInfo, type ReactNode } from 'react'
import { clearKunuRuntimeCaches, reloadWithFreshAssets, resetDynamicImportRecovery } from '../../lib/runtimeRecovery'
import { useKunuStore } from '../../store/useKunuStore'
import { Button } from '../shared/Button'

interface AdventureErrorBoundaryProps { children: ReactNode; resetKey: string }
interface AdventureErrorBoundaryState { error: Error | null; retryCount: number; clearing: boolean }

export class AdventureErrorBoundary extends Component<AdventureErrorBoundaryProps, AdventureErrorBoundaryState> {
  state: AdventureErrorBoundaryState = { error: null, retryCount: 0, clearing: false }

  static getDerivedStateFromError(error: Error): Partial<AdventureErrorBoundaryState> { return { error } }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[Kunu] Yosemite adventure crashed.', error, info)
  }

  componentDidUpdate(previous: AdventureErrorBoundaryProps): void {
    if (previous.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null })
  }

  private retry = (): void => {
    resetDynamicImportRecovery()
    this.setState((state) => ({ error: null, retryCount: state.retryCount + 1 }))
  }

  private reload = (): void => { void reloadWithFreshAssets() }

  private clearLocalData = async (): Promise<void> => {
    this.setState({ clearing: true })
    try {
      await clearKunuRuntimeCaches()
      await useKunuStore.getState().resetDemo()
      useKunuStore.getState().setSection('world')
      useKunuStore.getState().setExperienceMode('memory')
      resetDynamicImportRecovery()
      try { localStorage.removeItem('kunu-yosemite-transition') } catch { /* restricted storage */ }
      this.setState({ error: null, clearing: false })
    } catch (error) {
      console.error('[Kunu] Could not clear local Kunu data.', error)
      this.setState({ clearing: false })
    }
  }

  private returnToWorld = (): void => {
    useKunuStore.getState().setSection('world')
    useKunuStore.getState().setExperienceMode('memory')
    this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return <div key={this.state.retryCount} className="adventure-guard">{this.props.children}</div>
    return <main className="adventure-error" data-testid="adventure-error-fallback">
      <img src="/assets/journeys/yosemite-cover.svg" alt="Stylized Yosemite valley"/>
      <section>
        <p className="eyebrow">The trail paused safely</p>
        <h1>Yosemite needs a fresh trail map.</h1>
        <p>Kunu kept Clara's memories safe. Retry the adventure, refresh its downloaded files, or return to the world.</p>
        <details><summary>Technical details</summary><code>{this.state.error.name}: {this.state.error.message}</code></details>
        <div className="adventure-error__actions">
          <Button onClick={this.retry}>Retry</Button>
          <Button variant="secondary" onClick={this.reload}>Reload</Button>
          <Button variant="quiet" disabled={this.state.clearing} onClick={() => void this.clearLocalData()}>{this.state.clearing ? 'Clearing…' : 'Clear local Kunu data'}</Button>
          <Button variant="glass" onClick={this.returnToWorld}>Return to World</Button>
        </div>
      </section>
    </main>
  }
}
