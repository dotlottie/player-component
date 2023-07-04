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
    devServer: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      framework: 'cypress-ct-lit' as any,
      bundler: 'vite',
    },
  },
});
