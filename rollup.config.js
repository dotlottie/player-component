import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import filesize from 'rollup-plugin-filesize';
import resolve from '@rollup/plugin-node-resolve';
import serve from 'rollup-plugin-serve';
import { terser } from 'rollup-plugin-terser';
import typescript2 from 'rollup-plugin-typescript2';

const production = !process.env.ROLLUP_WATCH;
const extensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];
const outputDir = './dist/';

export default {
  input: './src/dotlottie-player.ts',
  treeshake: false,
  output: [
    {
      file: './dist/dotlottie-player.esm.js',
      // dir: outputDir,
      format: 'es',
      sourcemap: true,
    },
    {
      file: './dist/dotlottie-player.js',
      format: 'umd',
      name: 'dotlottie-player',
      sourcemap: true,
    },
  ],
  plugins: [
    resolve({
      extensions,
      jsnext: true,
      module: true,
    }),
    commonjs(),
    typescript2({
      check: false,
    }),
    babel({
      extensions: extensions,
      exclude: ['./node_modules/**'],
    }),
    !production &&
      copy({
        targets: [
          { src: './src/index.html', dest: outputDir },
          { src: './src/sample_dotlottie.lottie', dest: outputDir },
          { src: './src/animation.lottie', dest: outputDir },
          {
            src: './node_modules/@webcomponents/webcomponentsjs/bundles/',
            dest: outputDir,
          },
          {
            src: './node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js',
            dest: outputDir,
          },
        ],
      }),
    filesize(),
    !production &&
      serve({
        contentBase: [outputDir],
        open: true,
        host: 'localhost',
        port: 10000,
      }),

    production && terser(),
  ],
};
