/**
 * PWA (service worker) is disabled on loopback hosts so local dev / preview stays a normal SPA.
 */
export function shouldEnablePwa(): boolean {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname.toLowerCase()
  if (h === 'localhost' || h === '127.0.0.1') return false
  if (h === '[::1]' || h === '::1') return false
  return true
}
