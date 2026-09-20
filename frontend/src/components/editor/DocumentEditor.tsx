import { useState } from 'react';
import { Button, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { DocumentHeader } from './DocumentHeader';
import { Module } from './Module';
import './DocumentEditor.css';

// Létrehozunk egy interfészt a szülőtől kapott propoknak
interface DocumentEditorProps {
  modules: any[];
  setModules: React.Dispatch<React.SetStateAction<any[]>>;
  onEditModule: (id: string) => void;
  editingModuleId: string | null;
}

export function DocumentEditor({ 
  modules, 
  setModules, 
  onEditModule, 
  editingModuleId 
}: DocumentEditorProps) {
  
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>('module-1');

  const addModule = () => {
    const newModule = {
      id: `module-${Date.now()}`,
      title: 'New Module',
      hasFrame: true,
      components: [],
    };

    setModules((current) => [...current, newModule]);
    setSelectedModuleId(newModule.id);
    onEditModule(newModule.id); // Létrehozáskor rögtön meg is nyitjuk szerkesztésre
  };

  const deleteModule = (id: string) => {
    setModules((current) => current.filter((module) => module.id !== id));

    if (selectedModuleId === id) {
      setSelectedModuleId(null);
    }
    // Ha azt a modult töröljük, ami épp nyitva van a szerkesztőben
    if (editingModuleId === id) {
      onEditModule(''); // Bezárjuk a szerkesztőt (vagy null)
    }
  };

  return (
    <main className="document-editor">
      <DocumentHeader />

      {modules.length === 0 ? (
        <Empty description="No modules" />
      ) : (
        <div className="modules-list">
          {modules.map((module) => (
            <Module
              key={module.id}
              module={module}
              selected={module.id === selectedModuleId}
              onSelect={() => setSelectedModuleId(module.id)}
              onDelete={() => deleteModule(module.id)}
              // Itt jelezzük a szülőnek, hogy a szerkesztés gombra kattintottak
              onEdit={() => onEditModule(module.id)}
            />
          ))}
        </div>
      )}

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addModule}
        block
      >
        Add module
      </Button>
    </main>
  );
}