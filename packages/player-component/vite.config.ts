/**
 * Copyright 2023 Design Barn Inc.
 */

import legacy from '@vitejs/plugin-legacy';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: './cypress/public',
  plugins: [
    legacy({
      targets: ['defaults'],
    }),
  ],
});
