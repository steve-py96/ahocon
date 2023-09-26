import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import glob from 'fast-glob';

void (async () =>
  (await glob(['dist/**/*.d.ts', '!dist/_global.d.ts'])).map(async (path) => {
    const partials = path.split('/').length - 1; // dist/ isn't counted

    return writeFile(
      join(process.cwd(), path),
      `/// <reference path="${'../'.repeat(partials - 1)}_global.d.ts" />\n` +
        (await readFile(join(process.cwd(), path), { encoding: 'utf-8' })),
      { encoding: 'utf-8' }
    );
  }))();
