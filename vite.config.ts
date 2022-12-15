import { stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig(async () => {
  if (
    !(await stat(join(process.cwd(), 'src/dev.ts'))
      .then(() => true)
      .catch(() => false))
  ) {
    console.log('creating src/dev.ts');

    writeFile(
      join(process.cwd(), 'src/dev.ts'),
      "import { parse } from '.';\n\nconsole.log(parse('test = 123'));",
      { encoding: 'utf-8' }
    );
  }

  return {
    test: {
      passWithNoTests: true,
    },
  };
});
