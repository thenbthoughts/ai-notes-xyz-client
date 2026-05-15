import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/onnxruntime-web/dist/*.wasm',
          dest: 'vad'
        },
        {
          src: 'node_modules/onnxruntime-web/dist/*.mjs',
          dest: 'vad'
        },
        {
          src: 'node_modules/@ricky0123/vad-web/dist/*.onnx',
          dest: 'vad'
        },
        {
          src: 'node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js',
          dest: 'vad'
        }
      ]
    }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['robots.txt', 'app-icon.svg'],
      manifest: {
        name: 'Ai Notes XYZ',
        short_name: 'Ai Notes XYZ',
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/app-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // VAD ships multi‑MB wasm/onnx/mjs — precache only normal app chunks (keeps SW install fast).
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api(?:\/|$)/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ url }) => url.pathname.endsWith('/DEPLOY_DATE.txt'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/vad/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'vad',
              expiration: {
                maxEntries: 40,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ],
  publicDir: 'public',
  build: {
    rollupOptions: {
      output: {
        // One chunk for all lucide icons instead of many tiny shared files (star-*.js, eye-off-*.js, …)
        manualChunks(id) {
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide-icons';
          }
        },
      },
    },
  },
})
