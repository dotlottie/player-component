/**
 * Copyright 2023 Design Barn Inc.
 */

import { defineConfig } from 'tsup';

import pkg from './package.json';

export default defineConfig({
  bundle: true,
  clean: true,
  dts: true,
  minify: true,
  sourcemap: true,
  treeshake: true,
  module: 'ESNext',
  format: ['esm'],
  tsconfig: 'tsconfig.json',
  outDir: 'dist',
  platform: 'browser',
  target: ['ESNext'],
  entry: ['./src/index.ts'],
  noExternal: Object.keys(pkg.dependencies ?? []),
});
