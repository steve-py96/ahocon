import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import unocss from 'unocss/vite';
import svgr from 'vite-plugin-svgr';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), unocss(), svgr()],
  define: {
    __APP_VERSION__: JSON.stringify(
      JSON.parse(await readFile(resolve(__dirname, '../package.json'), { encoding: 'utf-8' }))
        .version
    ),
  },
  base: '/ahocon',
  resolve: {
    alias: [
      {
        find: /^@\/(.+)/,
        replacement: '/src/$1',
      },
    ],
  },
}));
