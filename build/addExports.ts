import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import glob from 'fast-glob';

void (async () => {
  const packageJsonPath = join(process.cwd(), 'dist/package.json')
  const packageJson = JSON.parse(await readFile(packageJsonPath, { encoding: 'utf-8' })) as Record<string, unknown>
  const files = await glob(['dist/**/*.mjs'])

  const tmpObject: Record<string, {
    types: string
    import: string
    require: string
  }> = {}

  for (const file of files) {
    const fixedFilePath = file.replace('dist', '.')
    let key = fixedFilePath

    if (fixedFilePath === './index.mjs') key = '.'

    tmpObject[key] = {
      types: fixedFilePath.replace('.mjs', '.d.mts'),
      import: fixedFilePath,
      require: fixedFilePath.replace('.mjs', '.js'),
    }
  }

  // add the object to the package.json (with sorted keys)
  packageJson.exports = Object.fromEntries(Object.entries(tmpObject).sort())

  await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), { encoding: 'utf-8' })
})()
