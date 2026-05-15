import { atomWithStorage } from 'jotai/utils'

/** ISO timestamp from `/DEPLOY_DATE.txt` (Docker build). Persisted in localStorage. */
export const jotaiDeployDateStampAtom = atomWithStorage<string>(
  'ai-notes-deploy-date-stamp',
  '',
)
