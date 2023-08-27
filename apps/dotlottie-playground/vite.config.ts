/**
 * Copyright 2023 Design Barn Inc.
 */

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'development' ? '/' : '/player-component/',
}));
