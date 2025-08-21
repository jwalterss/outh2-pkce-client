import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: process.env.NODE_ENV === 'production',
  treeshake: true,
  external: ['react'],
  globalName: 'OAuth2PKCE',
  platform: 'browser',
  target: 'es2020',
  bundle: true,
  outDir: 'dist',
});