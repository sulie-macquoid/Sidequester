import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/Sidequester/',
  server: { open: true },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: "Sully's Sidequests",
        short_name: 'Sidequests',
        description: 'Personal quest-generator PWA',
        theme_color: '#0F0F1A',
        background_color: '#0F0F1A',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/Sidequester/',
        start_url: '/Sidequester/',
        icons: [
          { src: '/Sidequester/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/Sidequester/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
})
