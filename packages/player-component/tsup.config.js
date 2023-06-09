/**
 * Copyright 2022 Design Barn Inc.
 */

import { defineConfig } from 'tsup';

const commonConfig = {
  bundle: true,
  clean: true,
  dts: true,
  module: 'ESNext',
  format: ['esm', 'umd'],
  metafile: false,
  minify: true,
  sourcemap: true,
  splitting: false,
  tsconfig: 'tsconfig.json',
  treeshake: true,
  outDir: './dist/',
  platform: 'browser',
  target: ['ESNext'],
};

export default defineConfig([
  {
    ...commonConfig,
    entry: ['./src/dotlottie-player.ts'],
    globalName: 'DotLottiePlayer',
    external: ['common'],
    noExternal: ['lit', 'lottie-web'],
  },
]);
