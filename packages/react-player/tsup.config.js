/**
 * Copyright 2023 Design Barn Inc.
 */

import { defineConfig } from 'tsup';

export default defineConfig({
  bundle: true,
  clean: true,
  dts: {
    entry: './src/index.ts',
    resolve: true,
  },
  minify: true,
  sourcemap: true,
  treeshake: true,
  splitting: true,
  metafile: false,
  format: ['esm'],
  tsconfig: 'tsconfig.json',
  outDir: 'dist',
  platform: 'browser',
  target: ['esnext'],
  entry: ['./src/*.ts', './src/*.tsx', './src/*.css'],
  external: ['react'],
});
