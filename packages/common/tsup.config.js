/**
 * Copyright 2023 Design Barn Inc.
 */

import fs from 'node:fs/promises';

import { defineConfig } from 'tsup';

import pkg from './package.json';

export default defineConfig((options) => ({
  bundle: true,
  clean: true,
  dts: true,
  sourcemap: true,
  minify: true,
  treeshake: true,
  module: 'ESNext',
  format: ['esm'],
  tsconfig: 'tsconfig.json',
  outDir: 'dist',
  platform: 'browser',
  target: ['ESNext'],
  entry: ['./src/*.ts'],
  noExternal: Object.keys(pkg.dependencies ?? []),
  onSuccess: () => {
    if (options.watch) {
      const time = new Date();

      fs.utimes('../react-player/src/index.ts', time, time);
      fs.utimes('../player-component/src/dotlottie-player.ts', time, time);
    }
  },
}));
