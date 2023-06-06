/**
 * Copyright 2022 Design Barn Inc.
 */

import { defineConfig } from 'tsup';

const commonConfig = {
    bundle: true,
    clean: true,
    dts: true,
    module: 'ESNext',
    format: ['esm', 'cjs', 'iife'],
    metafile: false,
    minify: true,
    sourcemap: true,
    splitting: false,
    tsconfig: 'tsconfig.build.json',
    treeshake: true,
};

export default defineConfig([
    {
        ...commonConfig,
        entry: ['./src/dotlottie-player.ts'],
        outDir: './dist/',
        platform: 'browser',
        target: ['ESNext'],
    },

]);