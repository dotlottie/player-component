/**
 * Copyright 2023 Design Barn Inc.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import App from './app';
import { DotLottieProvider } from './hooks/use-dotlottie';
import store from './store';
import './index.css';

// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <DotLottieProvider>
        <App />
      </DotLottieProvider>
    </Provider>
  </React.StrictMode>,
);
