/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend base URL (empty → same origin / Vite proxy). */
  readonly VITE_API_URL?: string;
  /** User id required by the current template API (authentication is not wired yet). */
  readonly VITE_USER_ID?: string;
  /** "false" disables the mock document in `npm run dev`. */
  readonly VITE_USE_MOCKS?: string;
}
