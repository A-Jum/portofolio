import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves the site from https://a-jum.github.io/portofolio/
  base: command === 'build' ? '/portofolio/' : '/',
  plugins: [react()],
}))
