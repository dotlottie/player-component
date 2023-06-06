/**
 * Copyright 2023 Design Barn Inc.
 */

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
// import { copy } from '@web/rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import dts from 'rollup-plugin-dts';
import json from "@rollup/plugin-json";

import packageJson from './package.json' assert { type: 'json' };

const extensions = ['.ts'];

const bundle = (config) => ({
  ...config,
  input: './src/dotlottie-player.ts',
  //   external: (id) =>
  //     !/^[./]/u.test(id) && !/^fflate/u.test(id) && !/^@dotlottie\/dotlottie-js/u.test(id) && !/common/u.test(id),
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
      json(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      // copy({
      //   targets: [
      //     {
      //       src: './src/dotlottie-player-styles.css',
      //       dest: './dist',
      //     },
      //   ],
      // }),
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


// // Import rollup plugins
// import html from '@web/rollup-plugin-html';
// import { copy } from '@web/rollup-plugin-copy';
// import resolve from '@rollup/plugin-node-resolve';
// import { terser } from '@rollup/plugin-terser';
// import minifyHTML from 'rollup-plugin-minify-html-literals';
// import summary from 'rollup-plugin-summary';

// export default {
//   input: 'src/index.ts',
//   plugins: [
//     // Resolve bare module specifiers to relative paths
//     resolve({
//       extensions,
//       jsnext: true,
//       module: true,
//     }),
//     // Minify HTML template literals
//     minifyHTML(),
//     // Minify JS
//     terser({
//       ecma: 2020,
//       module: true,
//       warnings: true,
//     }),
//     // Print bundle summary
//     summary(),
//   ],
//   output: {
//     dir: 'build',
//   },
//   preserveEntrySignatures: 'strict',
// };