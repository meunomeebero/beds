import React from 'react';
import { createRoot } from 'react-dom/client';
import 'beds/styles.css';
import DataPatterns from './DataPatterns';

createRoot(document.getElementById('root')!).render(<React.StrictMode><DataPatterns /></React.StrictMode>);
