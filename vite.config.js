import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
    plugins: [react()],
    // Relative base for production builds so the site works when served from
    // a sub-path (e.g. GitHub Pages project sites at /portfolio/). Dev keeps
    // root-relative URLs for clean HMR.
    base: command === 'build' ? './' : '/',
    server: {
        // In development, forward API calls to the Express backend so the
        // frontend and backend stay fully separated (no CORS needed in dev).
        proxy: {
            '/api': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            },
        },
    },
}))
