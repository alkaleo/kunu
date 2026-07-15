import { Component, type ErrorInfo, type ReactNode } from 'react'
import { clearKunuDatabase } from '../../lib/db'

export class RootErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('[Kunu] Uncaught application error.', error, info.componentStack) }
  render() {
    if (!this.state.error) return this.props.children
    return <main className="root-error"><section><p className="eyebrow">A safe pause</p><h1>Kunu kept the memories safe.</h1><p>The current screen could not be shown. Reload the experience or clear local demo data and begin again.</p><details><summary>Technical detail</summary><code>{this.state.error.message}</code></details><div><button onClick={() => window.location.reload()}>Reload Kunu</button><button onClick={() => void clearKunuDatabase().then(() => window.location.reload())}>Clear local Kunu data</button></div></section></main>
  }
}
