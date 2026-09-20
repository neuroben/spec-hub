import { useState } from 'react';
import { Layout } from 'antd';
import { ComponentSidebar } from './ComponentSidebar';
import { DocumentEditor } from './DocumentEditor';
import { ModuleEditor } from './ModuleEditor';
import './EditorLayout.css';

const { Sider, Content } = Layout;

// A kezdeti mock adatokat áthoztuk ide, hogy a szülő tudja kezelni
const initialModules = [
  {
    id: 'module-1',
    title: 'Module with frame 1',
    hasFrame: true,
    components: [
      { id: 'component-1', type: 'title', content: 'Example title' },
      { id: 'component-2', type: 'paragraph', content: 'This is an example paragraph.' },
    ],
  },
  {
    id: 'module-2',
    title: 'Module without frame',
    hasFrame: false,
    components: [
      { id: 'component-3', type: 'title', content: 'Second module' },
      { id: 'component-4', type: 'paragraph', content: 'This module has no frame.' },
    ],
  },
];

export function EditorLayout() {
  // Ezek a state-ek most már a legfelső szinten vannak
  const [modules, setModules] = useState(initialModules);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

  // Kikeresjük az éppen szerkesztett modult
  const editingModule = modules.find((m) => m.id === editingModuleId);

  return (
    <Layout className="editor-layout">
      <Sider width={250} theme="light" className="editor-sidebar">
        <ComponentSidebar />
      </Sider>

      <Content className="editor-content">
        {/* Átadjuk a state-eket és a módosító függvényeket a DocumentEditor-nak */}
        <DocumentEditor 
          modules={modules}
          setModules={setModules}
          onEditModule={(id) => setEditingModuleId(id)}
          editingModuleId={editingModuleId}
        />
      </Content>

      <Sider width={300} theme="light" className="editor-inspector">
        {/* A ModuleEditor csak a kiválasztott modult kapja meg */}
        <ModuleEditor 
          module={editingModule} 
          // Opcionális: Ha írsz egy onClose propsot a ModuleEditor-ba, itt be is zárhatod
          // onClose={() => setEditingModuleId(null)}
        />
      </Sider>
    </Layout>
  );
}