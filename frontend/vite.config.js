import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['dvh.web3d.llc'],
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
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
    },
  },
})
