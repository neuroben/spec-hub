import type { LoaderFunctionArgs } from 'react-router';
import type { Document } from '../api/documentTypes';
import { api } from '../api/client';
import { parseDocument } from '../api/parseDocument';
import { parseTemplateDetails } from '../api/parseTemplate';

export interface EditorLoaderData {
  /** Document to open, or null for an empty editor. */
  document: Document | null;
}

/**
 * Mock mode: ON in `npm run dev`, always OFF in production builds (the fixture is not even bundled).
 * Opt out locally with `VITE_USE_MOCKS=false` in frontend/.env.development.local.
 */
export const USE_MOCKS = import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS !== 'false';

/**
 * Route loader for the editor pages. Runs before the page renders, so the store
 * starts with the document already in its initial state (no empty flash, no effect).
 * The single seam for the real API later: replace the body with a fetch + parseDocument.
 */
export async function editorLoader(): Promise<EditorLoaderData> {
  if (USE_MOCKS) {
    const { default: json } = await import('../mocks/sampleDocument.json');
    return { document: parseDocument(json, { strict: true }) };
  }
  return { document: null };
}

/**
 * Loader for templates/:templateId/edit. Fetches the template from the backend
 * (POST/PUT target of the save bar); in mock mode serves the fixture instead —
 * the requested id is then ignored, the fixture stands in for "some template".
 */
export async function editorTemplateLoader({ params }: LoaderFunctionArgs): Promise<EditorLoaderData> {
  const { templateId } = params;
  if (!templateId) throw new Response('Missing template id', { status: 400 });
  if (USE_MOCKS) {
    const { default: json } = await import('../mocks/sampleDocument.json');
    return { document: parseDocument(json, { strict: true }) };
  }
  const details = await api.templates.get(templateId);
  return { document: parseTemplateDetails(details, () => crypto.randomUUID()) };
}
