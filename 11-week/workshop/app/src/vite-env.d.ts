/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_SIMULATE?: 'off' | 'error' | 'empty' | 'demo'
  readonly VITE_SIMULATE_DELAY_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
