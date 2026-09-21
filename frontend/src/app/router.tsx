import { createBrowserRouter, replace, type RouteObject } from 'react-router';
import { PlaceholderPage } from '../pages/PlaceholderPage';
import { loadEditorLoader, loadEditorPage } from './lazyRoutes';
import { AppFallback, PaddedLayout, RootLayout } from './RootLayout';
import { RouteError } from './RouteError';

const placeholder = (path: string, title: string): RouteObject => ({
  path,
  element: <PlaceholderPage title={title} />,
});

/** DEV-only routes. The whole branch (and its chunks) is dropped from production builds. */
const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: 'dev/editor-store',
        lazy: {
          Component: async () => (await import('../pages/EditorStorePlayground')).EditorStorePlayground,
        },
      },
    ]
  : [];

/** DEV-only full-bleed routes. */
const devFullBleedRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        // Previous editor prototype (components/editor/*), kept reachable until the panels take over.
        path: 'dev/legacy-editor',
        lazy: {
          Component: async () => (await import('../pages/DocumentEditorPage')).DocumentEditorPage,
        },
      },
    ]
  : [];

export const routes: RouteObject[] = [
  {
    Component: RootLayout,
    HydrateFallback: AppFallback,
    ErrorBoundary: RouteError,
    children: [
      // Full-bleed editor routes, code-split into their own chunk.
      {
        path: 'templates/new',
        lazy: {
          loader: async () => (await loadEditorLoader()).editorLoader,
          Component: async () => (await loadEditorPage()).TemplateEditorRoute,
        },
      },
      {
        path: 'documents/new',
        lazy: {
          loader: async () => (await loadEditorLoader()).editorLoader,
          Component: async () => (await loadEditorPage()).DocumentEditorRoute,
        },
      },
      // Redirect before render; `replace` keeps /create out of the history stack.
      { path: 'create', loader: () => replace('/templates/new') },
      ...devFullBleedRoutes,

      // Regular pages with padding.
      {
        Component: PaddedLayout,
        children: [
          { index: true, element: <PlaceholderPage title="Home" /> },
          placeholder('groups', 'All groups'),
          placeholder('groups/new', 'New group'),
          placeholder('documents', 'All documents'),
          placeholder('tasks', 'All tasks'),
          placeholder('tasks/new', 'New task'),
          placeholder('templates', 'All templates'),
          ...devRoutes,
          placeholder('*', 'Not found'),
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
