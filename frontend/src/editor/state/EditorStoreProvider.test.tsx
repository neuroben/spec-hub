import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { exampleDocument } from '../../api/documentTypes.example';
import { EditorStoreProvider } from './EditorStoreProvider';
import { useEditorStore } from './editorStoreContext';

function ModuleCount() {
  return <span>{useEditorStore((s) => s.order.length)}</span>;
}

describe('EditorStoreProvider', () => {
  it('gives each provider its own independent store', () => {
    const html = renderToStaticMarkup(
      <>
        <EditorStoreProvider initialDocument={exampleDocument}>
          <ModuleCount />
        </EditorStoreProvider>
        <EditorStoreProvider>
          <ModuleCount />
        </EditorStoreProvider>
      </>,
    );
    expect(html).toBe('<span>1</span><span>0</span>');
  });

  it('throws a clear error outside a provider', () => {
    expect(() => renderToStaticMarkup(<ModuleCount />)).toThrow(/EditorStoreProvider/);
  });
});
