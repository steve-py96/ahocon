#!/usr/bin/env bash
# -*- coding: utf-8 -*-

# exit on any error
set -e

# remove current dist
echo "remove current dist"
rm -rf dist

# check types
echo "checking types.."
pnpm exec tsc -p ./tsconfig-build.json

# build parser & subpackages
echo "build parser & subpackages (lite version with variables only)"
pnpm exec tsx build/viteBuild.ts

# build light-version
echo "build parser & subpackages (extended version with functions)"
VITE_EXTENDED_MODE=true pnpm exec tsx build/viteBuild.ts

# copy _globals.d.ts (with AHOCON namespace) into dist
echo "copy .d.ts files into dist & extended + the global AHOCON namespace"
pnpm exec tsx build/copyTs.ts

# patch ts namespace references
echo "patch AHOCON namespace into d.ts files by adding /// <reference path..."
pnpm exec tsx build/ts-namespace-patch.ts

echo "copying package.json & README into dist"
cp package.json dist/package.json
cp README.md dist/README.md

echo "adding proper exports to package.json"
pnpm exec tsx build/addExports.ts

TGZ_FILE="ahocon-$npm_package_version.tgz"

echo "building test setup with $TGZ_FILE"
rm -rf package-test
cd dist
npm pack
mv ./$TGZ_FILE ../$TGZ_FILE
cd ..
mkdir package-test
cd package-test
npm init --yes
npm install --force ../$TGZ_FILE
npm install tsx
cat << EOF > test.ts
import { parse } from 'ahocon'

console.log(parse(\`
  file_extension = typescript
\`))
EOF
cat << EOF > test.js
import { parse } from 'ahocon'

console.log(parse(\`
  file_extension = javascript
\`))
EOF
npm pkg set scripts.ts="tsx test.ts"
npm pkg set scripts.js="tsx test.js"
echo "\n\nrun \`npm run ts\` (or js) inside the package-test directory <3\n\n"

# check if the package.json is fine
echo "linting exports field with publint..."
npx --yes publint ./node_modules/ahocon
