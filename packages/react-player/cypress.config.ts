/**
 * Copyright 2023 Design Barn Inc.
 */

import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  screenshotOnRunFailure: false,
  component: {
    retries: {
      runMode: 3,
      openMode: 0,
    },
    video: false,
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
