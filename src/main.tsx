import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { startDeployVersionChecks } from './pwa/deployVersion'
import { shouldEnablePwa } from './pwa/isPwaHost'

if (shouldEnablePwa()) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      window.location.reload()
    },
  })
  startDeployVersionChecks()
} else if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  void navigator.serviceWorker
    .getRegistrations()
    .then((regs) => Promise.all(regs.map((r) => r.unregister())))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
