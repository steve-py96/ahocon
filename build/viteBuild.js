import { build } from 'vite';
import glob from 'fast-glob';
import removeExports from 'vite-plugin-remove-exports';

/**
 * @param {string} entry
 * @returns {import('vite').UserConfig}
 */
const createBuildConfig = (entry) => ({
  // abusing mode since env variable isn't passed thru
  mode: process.env.VITE_EXTENDED_MODE ? 'extended' : 'lite',
  plugins: process.env.VITE_EXTENDED_MODE
    ? []
    : [
        removeExports({
          match(id) {
            // needs to be removed, otherwise not tree-shakable in lite-mode
            return ['parseFunction'];
          },
        }),
      ],
  build: {
    lib: {
      entry: `/${entry}`,
      name: 'ahocon',
      fileName: (format) =>
        entry
          .replace('src/', process.env.VITE_EXTENDED_MODE ? 'extended/' : '')
          .replace('.ts', `.${format}.js`),
    },
    emptyOutDir: false,
  },
});

void (async () => {
  let files = await glob(['src/**/*.ts', '!src/**/*.d.ts']);

  if (process.env.VITE_EXTENDED_MODE) files = files.filter((file) => !file.includes('src/funcs/'));

  // for loop to sequentially build the files ( parallely destroys the logs.. :( )
  for (const file of files) {
    await build(createBuildConfig(file));
  }
})();
