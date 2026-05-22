import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// @ts-expect-error -- process.env exists in Node but not in client TS config
const isGitHubPages = typeof process !== 'undefined' && process.env?.GITHUB_ACTIONS

export default defineConfig({
  base: isGitHubPages ? '/pufferone/' : '/',
  plugins: [react(), tailwindcss()],
})
