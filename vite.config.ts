/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    // GitHub Pages serves this repo from a /kinetic-task-tracker/ subpath, but
    // Vercel serves it from the domain root — Vercel sets VERCEL=1 during build.
    base: process.env.VERCEL ? '/' : '/kinetic-task-tracker/',

    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg'],
        manifest: {
          name: 'Кинетическое пространство',
          short_name: 'Кинетика',
          description: 'Личный трекер задач с синхронизацией между устройствами',
          lang: 'ru',
          theme_color: '#003fe5',
          background_color: '#fbf8ff',
          display: 'standalone',
          icons: [
            { src: 'icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
            { src: 'icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,ico}'],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('motion')) return 'motion';
            if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) return 'react-vendor';
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      fileParallelism: false,
    },
  };
});
