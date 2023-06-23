/**
 * Copyright 2023 Design Barn Inc.
 */

import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  screenshotOnRunFailure: false,
  component: {
    video: false,
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
