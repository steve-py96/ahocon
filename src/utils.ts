export { resolvePath, splitPath, optional, prettifyString, namespace, assertType, detectedValue };

const whitespacesOnlyRegex = /^(\s*)$/;
const leadingWhitespacesRegex = /^(\s*)/;
const numberRegex = /\d+/;

/** @description returns val1 if not undefined, else val2 */
const optional = <T = unknown, X = unknown>(val1: T | undefined, val2: X) =>
  val1 === undefined ? val2 : val1;

const splitPath = (path: string | number) => {
  if (typeof path === 'number' || path.length === 0 || !path.includes('.'))
    return [path.toString()];

  const partials: Array<string> = [''];

  for (let i = 0; i < path.length; i += 1) {
    if (path[i] !== '.' || path[i - 1] === '\\') partials[partials.length - 1] += path[i];
    else partials.push('');
  }

  return partials;
};

/** @description resolves a provided path, creates everything that doesn't exist on the fly (unless createIfNotExisting is set to false) */
const resolvePath = (
  ref: Record<string | number, unknown>,
  path: Array<{
    type: string;
    value: string | number;
  }>,
  createIfNotExisting?: boolean
): [ref: Record<string | number, unknown>, key: string | number] => {
  if (path.length === 0) throw Error(`empty path provided`);

  const internalPath = path.slice(),
    key = internalPath.pop()!;
  let current = ref;

  for (const index in internalPath) {
    let { value: internalPartial } = internalPath[index];
    const { value: nextPartial } = internalPath[+index + 1] || key;

    if (createIfNotExisting !== false)
      current[internalPartial] =
        current[internalPartial] ||
        (typeof nextPartial === 'number' || numberRegex.test(nextPartial) ? [] : {});
    else if (!(internalPartial in current))
      throw Error(`failed to resolve path! (partial ${internalPartial} not found)`);

    current = current[internalPartial] as Record<string | number, unknown>;
  }

  return [current, key.value];
};

/** @description trims and dedents multiline strings */
const prettifyString = (input: string) => {
  if (!input.includes('\n')) return input.trim();

  const partials = input.split('\n');

  while (whitespacesOnlyRegex.test(partials[0]) && partials.length) partials.shift();

  const format = leadingWhitespacesRegex.exec(partials[0])?.[0] || '',
    newValue: Array<string> = [];

  for (const index in partials) {
    const partial = partials[index];

    newValue.push(partial.startsWith(format) ? partial.slice(format.length) : partial);
  }

  return newValue.join('\n').trim();
};

/** @description creates namespaces (for funcs mainly) */
const namespace = <T extends Record<string, unknown> = Record<string, unknown>>(
  nsPrefix: string,
  obj: T
) => {
  const re: Record<string, unknown> = {};

  for (const key in obj) re[`${nsPrefix}.${key}`] = obj[key];

  return re as T;
};

/** @description asserts the type of any value */
const assertType = (value: unknown, type: string) => {
  const actualType = typeof value;

  if (actualType !== type) throw new Error(`expected ${type}, got ${actualType}!`);
};

const detectedValue = (value: string, control?: RegExp | Array<string> | string) => {
  const lowercased = value.toLowerCase();

  if (control === undefined) return false;
  if (typeof control === 'string') return lowercased === control.toLowerCase();

  return Array.isArray(control)
    ? control.some((item) => item.toLowerCase() === lowercased)
    : control.test(lowercased);
};
