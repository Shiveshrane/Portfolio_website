/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_USERNAME: string
  readonly VITE_GITHUB_TOKEN: string
  readonly VITE_NAME: string
  readonly VITE_EMAIL: string
  readonly VITE_LOCATION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
