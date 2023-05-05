/**
 * Copyright 2023 Design Barn Inc.
 */

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import dts from 'rollup-plugin-dts';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';

import packageJson from './package.json' assert { type: 'json' };

const extensions = ['.ts', '.tsx'];

const bundle = (config) => ({
  ...config,
  input: './src/index.ts',
  external: (id) =>
    !/^[./]/u.test(id) &&
    !/^web-worker.*/u.test(id) &&
    !/^fflate/u.test(id) &&
    !/^@lottiefiles\/dotlottie-js/u.test(id),
});

const configs = [
  bundle({
    plugins: [
      del({ targets: 'dist/*' }),
      resolve({
        extensions,
        jsnext: true,
        module: true,
      }),
      webWorkerLoader(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      copy({
        targets: [
          {
            src: './src/dotlottie-player-styles.css',
            dest: './dist',
          },
        ],
      }),
    ],
    output: [
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
  }),
  bundle({
    plugins: [dts()],
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
  }),
];

export default configs;
