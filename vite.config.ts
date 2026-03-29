import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy'

// import { VitePWA } from 'vite-plugin-pwa';

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
    })
    // VitePWA({
    //   injectRegister: 'auto',
    //   registerType: 'autoUpdate'
    // }),
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
