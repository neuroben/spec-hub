import { useState } from 'react';
import { Button, Card, Col, Flex, Input, Row, Select, Tag, Typography } from 'antd';
import { COMPONENT_TYPES, type ComponentType } from '../api/documentTypes';
import { exampleDocument } from '../api/documentTypes.example';
import {
  EditorStoreProvider,
  selectModules,
  selectSelectedModule,
  useEditorStore,
  useEditorStoreApi,
} from '../editor/state';

/**
 * DEV-only playground for the editor store (route: /dev/editor-store).
 * The same actions are available in the browser console via window.__editorStore.getState()
 * (the store of the most recently mounted EditorStoreProvider).
 */
export function EditorStorePlayground() {
  return (
    <EditorStoreProvider>
      <Playground />
    </EditorStoreProvider>
  );
}

function Playground() {
  const store = useEditorStoreApi();
  const modules = useEditorStore(selectModules);
  const selected = useEditorStore(selectSelectedModule);
  const selectedId = useEditorStore((s) => s.selectedModuleId);
  const dirty = useEditorStore((s) => s.dirty);
  const drafts = useEditorStore((s) => s.drafts);
  const order = useEditorStore((s) => s.order);
  const saved = useEditorStore((s) => s.saved);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [componentType, setComponentType] = useState<ComponentType>('paragraph');

  const actions = store.getState();
  const hasDraft = selectedId !== null && selectedId in drafts;
  const firstComponent = selected?.components[0];

  return (
    <Flex vertical gap={16}>
      <Typography.Title level={3}>Editor store playground</Typography.Title>
      <Typography.Text type="secondary">
        Console: <code>__editorStore.getState().addModule('X')</code>
      </Typography.Text>

      <Flex gap={8} wrap>
        <Tag color={dirty ? 'orange' : 'green'}>{dirty ? 'dirty' : 'clean'}</Tag>
        <Tag>modules: {modules.length}</Tag>
        <Tag>drafts: {Object.keys(drafts).length}</Tag>
        <Tag color={hasDraft ? 'blue' : undefined}>selected: {selectedId ?? '–'}</Tag>
      </Flex>

      <Card size="small" title="Document">
        <Flex gap={8} wrap>
          <Button onClick={() => actions.loadDocument(exampleDocument)}>loadDocument(example)</Button>
          <Button onClick={() => actions.addModule()}>addModule()</Button>
          <Button onClick={() => actions.resetDirty()}>resetDirty()</Button>
        </Flex>
      </Card>

      <Card size="small" title="Modules">
        <Flex gap={8} wrap>
          {modules.map((m) => (
            <Button
              key={m.id}
              type={m.id === selectedId ? 'primary' : 'default'}
              onClick={() => actions.selectModule(m.id)}
            >
              {m.title || '(untitled)'}
              {m.id in drafts ? ' *' : ''}
            </Button>
          ))}
          <Button onClick={() => actions.selectModule(null)}>selectModule(null)</Button>
        </Flex>
      </Card>

      <Card size="small" title={`Selected module${selected ? `: ${selected.title}` : ''}`}>
        {selected ? (
          <Flex vertical gap={8}>
            <Flex gap={8} wrap>
              <Input
                style={{ width: 220 }}
                placeholder="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Button onClick={() => actions.updateModuleDraft(selected.id, { title })}>updateModuleDraft(title)</Button>
              <Button
                onClick={() =>
                  actions.updateModuleDraft(selected.id, {
                    parameters: { frame: { visible: !selected.parameters.frame.visible } },
                  })
                }
              >
                toggle frame.visible
              </Button>
            </Flex>
            <Flex gap={8} wrap>
              <Select
                style={{ width: 160 }}
                value={componentType}
                onChange={setComponentType}
                options={COMPONENT_TYPES.map((t) => ({ value: t, label: t }))}
              />
              <Button onClick={() => actions.addComponent(selected.id, componentType)}>addComponent</Button>
            </Flex>
            <Flex gap={8} wrap>
              <Input
                style={{ width: 220 }}
                placeholder="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <Button
                disabled={!firstComponent}
                onClick={() => firstComponent && actions.updateComponent(selected.id, firstComponent.key, { content })}
              >
                updateComponent(first, content)
              </Button>
            </Flex>
            <Flex gap={8} wrap>
              <Button type="primary" disabled={!hasDraft} onClick={() => actions.commitModule(selected.id)}>
                commitModule (Save)
              </Button>
              <Button disabled={!hasDraft} onClick={() => actions.revertModule(selected.id)}>
                revertModule (Cancel)
              </Button>
              <Button danger onClick={() => actions.removeModule(selected.id)}>
                removeModule
              </Button>
            </Flex>
          </Flex>
        ) : (
          <Typography.Text type="secondary">Select a module.</Typography.Text>
        )}
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card size="small" title="State (order / saved / drafts)">
            <pre style={{ margin: 0, fontSize: 12, maxHeight: 480, overflow: 'auto' }}>
              {JSON.stringify({ selectedModuleId: selectedId, dirty, order, saved, drafts }, null, 2)}
            </pre>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card size="small" title="toDocument() — wire format, drafts excluded">
            <pre style={{ margin: 0, fontSize: 12, maxHeight: 480, overflow: 'auto' }}>
              {JSON.stringify(actions.toDocument(), null, 2)}
            </pre>
          </Card>
        </Col>
      </Row>
    </Flex>
  );
}
