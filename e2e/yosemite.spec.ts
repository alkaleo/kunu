import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'

async function enterYosemite(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Build Memory|Visit memory/i }).click()
  await page.getByRole('button', { name: 'Begin the journey' }).click()

  const playableOrFallback = page.locator('[data-testid="yosemite-canvas"] canvas, [data-testid="webgl-fallback"]')
  await expect(playableOrFallback.first()).toBeVisible({ timeout: 18_000 })
  await expect(page.getByTestId('adventure-error-fallback')).toHaveCount(0)
}

test('the production build enters the Clara Yosemite demo', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Explore fallback demo' }).click()
  await enterYosemite(page)
})

test('a consented generated character can be approved without persisting reference photos', async ({ page }) => {
  const pixel = readFileSync('public/icons/icon-192.png').toString('base64')
  await page.route('**/api/generate-character', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ image: `data:image/png;base64,${pixel}`, model: 'gpt-image-2' }) }))
  await page.goto('/')
  await page.getByRole('button', { name: 'Create our Kunu' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  const inputs = page.locator('input[type="file"]')
  for (let index = 0; index < 3; index += 1) await inputs.nth(index).setInputFiles({ name: `reference-${index}.png`, mimeType: 'image/png', buffer: Buffer.from(pixel, 'base64') })
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Create Kunu character' }).click()
  await expect(page.getByRole('heading', { name: 'Meet the Kunu version.' })).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: 'Approve' }).click()
  await page.getByRole('button', { name: /Enter .* world/ }).click()
  await expect(page.getByRole('heading', { name: 'Where should we remember?' })).toBeVisible()
  const stores = await page.evaluate(async () => {
    const request = indexedDB.open('kunu-memory-v1', 1)
    const database = await new Promise<IDBDatabase>((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error) })
    const transaction = database.transaction('photos', 'readonly')
    const keys = await new Promise<IDBValidKey[]>((resolve, reject) => { const get = transaction.objectStore('photos').getAllKeys(); get.onsuccess = () => resolve(get.result); get.onerror = () => reject(get.error) })
    database.close()
    return keys
  })
  expect(stores).toEqual(['approved-kunu-character-v1'])
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
