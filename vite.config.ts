import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: { proxy: { '/offline-audio/': { target: 'https://cdn.islamic.network', changeOrigin: true, rewrite: path => path.replace('/offline-audio/', '/quran/audio/128/ar.alafasy/') } } },
  worker: { format: 'es' },
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Quran Coach',
        short_name: 'QuranCoach',
        description: 'Application de lecture et mémorisation du Coran',
        theme_color: '#0D1117',
        background_color: '#0D1117',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json,mp3,wav}'],
        globIgnores: ['tilawa/**'],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // Augmenter la limite à 15 Mo pour permettre le cache des gros JSON (comme le Tafsir ou le Coran complet)
      },
      devOptions: {
        enabled: false,
      },
    })
  ]
})
