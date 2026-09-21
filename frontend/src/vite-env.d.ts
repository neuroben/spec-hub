/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend base URL (empty → same origin / Vite proxy). */
  readonly VITE_API_URL?: string;
  /** "false" disables the mock document in `npm run dev`. */
  readonly VITE_USE_MOCKS?: string;
}
