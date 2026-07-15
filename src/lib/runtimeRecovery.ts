const DYNAMIC_IMPORT_RECOVERY_KEY = 'kunu:dynamic-import-recovery'

function sessionStorageAvailable(): boolean {
  try { sessionStorage.getItem(DYNAMIC_IMPORT_RECOVERY_KEY); return true } catch { return false }
}

export async function clearKunuRuntimeCaches(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations().catch(() => [])
    await Promise.all(registrations.map((registration) => registration.unregister().catch(() => false)))
  }
  if ('caches' in window) {
    const keys = await caches.keys().catch(() => [])
    await Promise.all(keys.map((key) => caches.delete(key).catch(() => false)))
  }
}

export async function reloadWithFreshAssets(): Promise<void> {
  await clearKunuRuntimeCaches()
  window.location.reload()
}

export async function importWithOneRecovery<T>(loader: () => Promise<T>): Promise<T> {
  try {
    const module = await loader()
    if (sessionStorageAvailable()) sessionStorage.removeItem(DYNAMIC_IMPORT_RECOVERY_KEY)
    return module
  } catch (error) {
    console.error('[Kunu] Failed to load the Yosemite adventure chunk.', error)
    const canRecover = sessionStorageAvailable() && sessionStorage.getItem(DYNAMIC_IMPORT_RECOVERY_KEY) !== 'attempted'
    if (canRecover) {
      sessionStorage.setItem(DYNAMIC_IMPORT_RECOVERY_KEY, 'attempted')
      await reloadWithFreshAssets()
      return new Promise<T>(() => undefined)
    }
    throw error
  }
}

export function resetDynamicImportRecovery(): void {
  if (sessionStorageAvailable()) sessionStorage.removeItem(DYNAMIC_IMPORT_RECOVERY_KEY)
}
