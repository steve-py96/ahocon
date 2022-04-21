import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { cp } from 'node:fs/promises';

export default defineConfig(async () => {
  await cp(resolve(__dirname, 'src/_global.d.ts'), resolve(__dirname, 'dist/_global.d.ts'));

  return {
    build: {
      lib: {
        entry: '/src/index.ts',
        name: 'ahocon',
        fileName: (format) => `index.${format}.js`,
      },
      emptyOutDir: false,
    },
  };
});
