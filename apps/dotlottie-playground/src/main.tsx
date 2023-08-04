import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.tsx';
import './index.css';
import store from './store';
import { Provider } from 'react-redux';
import { DotLottieProvider } from './hooks/use-dotlottie';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <DotLottieProvider>
        <App />
      </DotLottieProvider>
    </Provider>
  </React.StrictMode>,
);
