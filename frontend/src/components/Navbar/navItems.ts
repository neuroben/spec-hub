import type { MenuProps } from 'antd';

// Placeholder menüstruktúra — később valós tartalommal cserélhető,
// vagy a <Navbar items={...} /> prop-pal felülírható.
export const defaultNavItems: MenuProps['items'] = [
  { key: '/', label: 'Home' },
  {
    key: 'groups',
    label: 'Groups',
    children: [
      { key: '/groups', label: 'All groups' },
      { key: '/groups/new', label: 'New group' },
    ],
  },
  {
    key: 'documents',
    label: 'Documents',
    children: [
      { key: '/documents', label: 'All documents' },
      { key: '/documents/new', label: 'New document' },
    ],
  },
  {
    key: 'tasks',
    label: 'Tasks',
    children: [
      { key: '/tasks', label: 'All tasks' },
      { key: '/tasks/new', label: 'New task' },
    ],
  },
  {
    key: 'templates',
    label: 'Templates',
    children: [
      { key: '/templates', label: 'All templates' },
      { key: '/templates/new', label: 'New template' },
    ],
  },
];
