import { expect, test, type Page } from '@playwright/test'

async function enterYosemite(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Build Memory|Visit memory/i }).click()
  await page.getByRole('button', { name: 'Begin the journey' }).click()

  const playableOrFallback = page.locator('[data-testid="yosemite-canvas"] canvas, [data-testid="webgl-fallback"]')
  await expect(playableOrFallback.first()).toBeVisible({ timeout: 18_000 })
  await expect(page.getByTestId('adventure-error-fallback')).toHaveCount(0)
}

test('the production build enters the Clara Yosemite demo', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'View demo' }).click()
  await enterYosemite(page)
})

test('an older incomplete PWA snapshot is migrated before Yosemite starts', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(async () => {
    const request = indexedDB.open('kunu-memory-v1', 1)
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('snapshot')) request.result.createObjectStore('snapshot')
        if (!request.result.objectStoreNames.contains('photos')) request.result.createObjectStore('photos')
      }
    })
    const transaction = database.transaction('snapshot', 'readwrite')
    transaction.objectStore('snapshot').put({
      onboardingComplete: true,
      parent: { name: 'Clara family' },
      child: { name: 'Clara' },
      journeys: [{ id: 'yosemite', location: 'Yosemite' }],
      activityProgress: { yosemite: { activities: { waterfall: true } } },
      explorer: { xp: 125 },
      badges: [],
      collectibles: [{ id: 'pine-cone', collected: true }],
      settings: { masterAudio: true, reducedMotion: true },
    }, 'primary')
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
    database.close()
  })

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Where should we remember?' })).toBeVisible()
  await enterYosemite(page)
})
