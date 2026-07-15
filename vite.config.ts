import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: {
    // Three.js is lazy-loaded with the World and Adventure routes; its compressed
    // vendor chunk is intentionally shared between both canvases.
    chunkSizeWarningLimit: 900
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['kunu-mark.svg', 'icons/*.png', 'assets/**/*.svg'],
      manifest: {
        name: 'Kunu - Every journey becomes a world',
        short_name: 'Kunu',
        description: 'A private family travel memory adventure.',
        theme_color: '#0c1b23',
        background_color: '#f7faf9',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: '/assets/launch/launch-art.svg',
            sizes: '1600x900',
            type: 'image/svg+xml',
            form_factor: 'wide',
            label: 'Clara and Buddy explore magical family journey worlds'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}']
      }
    })
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    css: true
  }
})
