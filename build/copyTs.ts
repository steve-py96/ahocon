import { resolve } from 'node:path';
import { cp } from 'node:fs/promises';
import glob from 'fast-glob';

void (async () => {
  // copy all .d.ts files into lite aswell (paths are same, just extra directory)
  await Promise.all(
    (
      await glob(['dist/**/*.d.ts', '!dist/funcs/**/*.d.ts'])
    ).map(async (file) => cp(file, file.replace('dist', 'dist/extended')))
  );

  // copy _global.d.ts from src into dist & dist/lite
  await cp(resolve(process.cwd(), 'src/_global.d.ts'), resolve(process.cwd(), 'dist/_global.d.ts'));

  // create a .d.mts duplicate of all .d.ts files
  await Promise.all(
    (await glob(['dist/**/*.d.ts'])).map(async (file) => cp(file, file.replace('.d.ts', '.d.mts')))
  );
})();
