import React from 'react';
import { createRoot } from 'react-dom/client';
import { defineCustomElements } from 'jeep-sqlite/loader';
import './locales/i18n';
import App from './App';

// Registra <jeep-sqlite>, el fallback web de @capacitor-community/sqlite (core/storage/sqlite) —
// sin efecto en Android nativo.
defineCustomElements(window);

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);