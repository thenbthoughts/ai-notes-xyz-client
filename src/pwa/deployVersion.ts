import { getDefaultStore } from 'jotai'

import { jotaiDeployDateStampAtom } from '../jotai/stateJotaiDeployDate'
import { shouldEnablePwa } from './isPwaHost'

const POLL_INTERVAL_MS = 60_000

type JotaiStore = ReturnType<typeof getDefaultStore>

async function clearSwCachesAndUnregister(): Promise<void> {
  if ('caches' in window) {
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
  }
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((reg) => reg.unregister()))
  }
}

/** Clears Cache Storage and unregisters service workers, then reloads (fresh assets). */
export async function forceReloadPwa(): Promise<void> {
  if (!shouldEnablePwa()) {
    window.location.reload()
    return
  }
  await clearSwCachesAndUnregister()
  window.location.reload()
}

async function fetchDeployStamp(): Promise<string | null> {
  try {
    const res = await fetch('/DEPLOY_DATE.txt', {
      cache: 'no-store',
      credentials: 'same-origin',
    })
    if (!res.ok) return null
    const text = (await res.text()).trim()
    return text.length ? text : null
  } catch {
    return null
  }
}

/**
 * Fetch `/DEPLOY_DATE.txt`, persist via jotai (localStorage), and reload when the server stamp changed.
 */
export async function syncDeployStamp(store: JotaiStore): Promise<void> {
  const stamp = await fetchDeployStamp()
  if (!stamp) return

  const stored = store.get(jotaiDeployDateStampAtom)

  if (!stored) {
    store.set(jotaiDeployDateStampAtom, stamp)
    return
  }

  if (stamp !== stored) {
    store.set(jotaiDeployDateStampAtom, stamp)
    if (shouldEnablePwa()) {
      await clearSwCachesAndUnregister()
      window.location.reload()
    }
  }
}

/**
 * Written at Docker image build time (`dist/DEPLOY_DATE.txt`).
 * When it changes, clear SW precache and reload so users pick up new assets.
 */
export function startDeployVersionChecks(): void {
  if (!import.meta.env.PROD || typeof window === 'undefined' || !shouldEnablePwa()) return

  const store = getDefaultStore()
  const tick = () => void syncDeployStamp(store)

  void tick()
  window.setInterval(tick, POLL_INTERVAL_MS)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') tick()
  })
}
