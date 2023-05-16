/**
 * Copyright 2023 Design Barn Inc.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './app';

import 'react-player/dist/dotlottie-player-styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);