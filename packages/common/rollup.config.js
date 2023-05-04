import dts from 'rollup-plugin-dts';
import copy from 'rollup-plugin-copy';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import del from 'rollup-plugin-delete';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

import packageJson from './package.json' assert { type: 'json' };

const extensions = ['.ts', '.tsx'];

const bundle = (config) => ({
  ...config,
  input: './src/index.ts',
  external: (id) =>
    !/^[./]/.test(id) &&
    !/^web-worker.*/.test(id) &&
    !/^fflate/.test(id) &&
    !/^@lottiefiles\/dotlottie-js/.test(id),
});

export default [
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
