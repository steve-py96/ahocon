const { readFile, writeFile } = require('node:fs/promises');
const { join } = require('node:path');

void (async () =>
  await writeFile(
    join(__dirname, 'dist/index.d.ts'),
    '/// <reference path="./_global.d.ts" />\n' +
      (await readFile(join(__dirname, 'dist/index.d.ts'), { encoding: 'utf-8' })),
    { encoding: 'utf-8' }
  ))();
