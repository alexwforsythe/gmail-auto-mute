import gas from '@gas-plugin/unplugin/bun';

await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: 'dist',
  target: 'node',
  plugins: [gas()],
});
