import type { EditorMode } from '../editorMode';
import { PanelPlaceholder } from './PanelPlaceholder';

/** Center column (fluid): the document canvas with modules. */
export function CanvasPanel({ mode }: { mode: EditorMode }) {
  return (
    <PanelPlaceholder
      title={mode === 'template' ? 'Sablon' : 'Dokumentum'}
      hint="Középső panel (vászon) jön ide"
    />
  );
}
