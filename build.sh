#!/usr/bin/env bash
# -*- coding: utf-8 -*-

# remove current dist
echo "remove current dist"
rm -rf dist

# check types
echo "checking types.."
tsc -p ./tsconfig-build.json

# build parser & subpackages
echo "build parser & subpackages (lite version with variables only)"
pnpm dlx tsx build/viteBuild.js

# build light-version
echo "build parser & subpackages (extended version with functions)"
VITE_EXTENDED_MODE=true pnpm dlx tsx build/viteBuild.js

# copy _globals.d.ts (with AHOCON namespace) into dist
echo "copy .d.ts files into dist & extended + the global AHOCON namespace"
pnpm dlx tsx build/copyTs.js

# patch ts namespace references
echo "patch AHOCON namespace into d.ts files by adding /// <reference path..."
pnpm dlx tsx build/ts-namespace-patch.js

echo "copying package.json into dist"
cp package.json dist/package.json

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
echo "run \`npm run ts\` (or js) <3"
