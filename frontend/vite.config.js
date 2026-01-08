import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api/dvh': {
        target: 'https://dvh-frontend-newwebsite.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/dvh/, '/api'),
      },
      '/api/price': {
        target: 'https://website-backend-alpha.vercel.app',
        changeOrigin: true,
      },
      '/api/yahoo': {
        target: 'https://query1.finance.yahoo.com/v8/finance',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
      },
    },
  },
})
