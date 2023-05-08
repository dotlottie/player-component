/**
 * Copyright 2023 Design Barn Inc.
 */

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    video: false,
    baseUrl: 'http://localhost:5173/test',
  },
});
