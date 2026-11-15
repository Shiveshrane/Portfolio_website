/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_USERNAME: string
  readonly VITE_GITHUB_TOKEN: string
  readonly VITE_NAME: string
  readonly VITE_EMAIL: string
  readonly VITE_LOCATION: string
  readonly VITE_ARXIV_AUTHOR?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'virtual:arxiv-papers' {
  import type { ArxivPaper } from '../plugins/arxiv';
  /** The author name the papers were searched by. */
  export const author: string;
  const papers: ArxivPaper[];
  export default papers;
}
