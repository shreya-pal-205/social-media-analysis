import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: "/social-media-analysis/",
  plugins: [react()],
  server: {
    proxy: {
      '/lf': 'https://api.langflow.astra.datastax.com', // Proxy all requests that start with /lf
    },
  },
})