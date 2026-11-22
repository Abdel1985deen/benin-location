import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Base GitHub Pages : https://<pseudo>.github.io/benin-location/
  base: '/benin-location/',
  plugins: [react()],
  server: { host: '0.0.0.0', port: 5173 },
})
