import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Disable pinch-to-zoom on iOS Safari
document.addEventListener('touchstart', (e) => {
  if (e.touches.length > 1) {
    e.preventDefault()
  }
}, { passive: false })

document.addEventListener('gesturestart', (e) => {
  e.preventDefault()
}, { passive: false })

document.addEventListener('gesturechange', (e) => {
  e.preventDefault()
}, { passive: false })

document.addEventListener('gestureend', (e) => {
  e.preventDefault()
}, { passive: false })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
