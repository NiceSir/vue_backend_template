import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { createESLintPlugin } from './config/eslint/vitePlugin.ts'
import { createUserMockPlugin } from './config/mock/vitePlugin.ts'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  clearScreen: false,
  plugins: [
    vue(),
    vueDevTools(),
    createESLintPlugin(command),
    createUserMockPlugin(),
  ],
  resolve: {
    alias: {
      '@/config': fileURLToPath(new URL('./config', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
