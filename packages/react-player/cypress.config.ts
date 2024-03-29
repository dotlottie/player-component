/**
 * Copyright 2023 Design Barn Inc.
 */

import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  screenshotOnRunFailure: false,
  component: {
    setupNodeEvents(on) {
      on('task', {
        log(message) {
          // eslint-disable-next-line no-console
          console.log(message);

          return null;
        },
        table(message) {
          // eslint-disable-next-line node/no-unsupported-features/node-builtins, no-console
          console.table(message);

          return null;
        },
      });
    },
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
