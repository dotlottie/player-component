import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/dotlottie-player.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  target: 'es2020',
  bundle: true,
  dts: true,
  format: ['esm'],
  metafile: false,
  minify: false,
  tsconfig: 'tsconfig.build.json',
  treeshake: true,
});
