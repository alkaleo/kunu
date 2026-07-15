import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { App } from './App'
import './styles/global.css'

const updateServiceWorker = registerSW({
  immediate: true,
  onNeedRefresh() { void updateServiceWorker(true) },
  onRegisterError(error) { console.error('[Kunu] Service worker registration failed.', error) },
  onRegisteredSW(_url, registration) {
    if (registration) window.setInterval(() => { void registration.update() }, 60 * 60 * 1000)
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
