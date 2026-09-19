import React from 'react';
import { createRoot } from 'react-dom/client';
import DialogHarness from './dialog-harness';

createRoot(document.getElementById('root')!).render(<React.StrictMode><DialogHarness /></React.StrictMode>);
