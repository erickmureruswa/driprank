import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': '/src' },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/three') || id.includes('@react-three')) return 'vendor-three'
          if (id.includes('node_modules/gsap')) return 'vendor-gsap'
          if (id.includes('node_modules/recharts')) return 'vendor-charts'
          if (id.includes('@supabase')) return 'vendor-supabase'
          if (id.includes('node_modules/react') || id.includes('react-router-dom')) return 'vendor-react'
        },
      },
    },
    chunkSizeWarningLimit: 1500,
  },
})
