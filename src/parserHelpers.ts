import { TOKEN } from './tokens';

export { resolvePath, parseString, parseFormat, parseRef, parsePath };

const resolvePath = (
  record: Record<string | number, unknown>,
  path: Array<string | number>,
  mutator?: (
    ref: Record<string | number, unknown>,
    partial: string | number,
    index: number
  ) => void | Record<string | number, unknown>
) => {
  let tmp: Record<string | number, unknown> = record;

  path
    .slice(0, -1) // we ignore the last item since it might be undefined for setting cases
    .forEach((partial, index) => {
      if (mutator) {
        const mutation = mutator(tmp, partial, index);

        if (mutation !== undefined) {
          tmp = mutation;

          return;
        }
      } else {
        // if index + 1 = length it's allowed since it's a possible value
        if (tmp[partial] === undefined && index + 1 !== path.length)
          throw Error(`failed to resolve ${path.join('.')} (${path[index]} doesn't exist!)`);
      }

      tmp = tmp[partial] as Record<string | number, unknown>;
    });

  return tmp;
};

// index for the error message only
const parsePath = (input: string, index: number) => {
  if (input.includes('..')) throw Error(`malformed key path found at ${index} (contains ..)`);

  const path = [''];
  for (let i = 0, j = 0; i < input.length; i += 1) {
    if (input[i] !== '.') path[j] += input[i];
    else {
      if (input[i - 1] === '\\') {
        path[j] = path[j].slice(0, -1) + '.';

        continue;
      }

      j += 1;
      // we skip the dot here
      path[j] = '';
    }
  }

  // we tolerate this here since it should not really an issue to ignore it
  if (path[path.length - 1] === '') {
    console.warn(`malformed key path found at ${index} (ends with .)`);
    path.pop();
  }

  return path;
};

const parseString = (
  context: Array<HOCON.LexerContext>,
  index: number,
  isValue?: boolean
): [partials: Array<string>, index: number, quoted: boolean] => {
  const quote = context[index].raw;
  // this is important for key resolving
  // a.b => { a: { b: ... } }, "a.b" => { "a.b": ... }
  const hasQuotes = context[index].token === TOKEN.STRING;
  let key = quote;
  let internalIndex = index + 1;

  // if it's a quote we need to fill it with all the content between the quotes
  if (hasQuotes) {
    // cut off the quotes
    key = key.slice(quote.length);

    for (
      ;
      internalIndex < context.length && context[internalIndex].token !== TOKEN.STRING;
      internalIndex += 1
    ) {
      if (
        context[internalIndex].token === TOKEN.WHITESPACE &&
        context[internalIndex].raw.includes('\n')
      ) {
        if (!hasQuotes) break;
        else if (quote.length === 1 && quote !== '`')
          throw Error(`unexpected token at ${index} (quotes not closed)`);
      }

      key += context[internalIndex].raw;
    }

    if (internalIndex === context.length && context[internalIndex - 1].token !== TOKEN.STRING)
      throw Error(`malformed string found at ${index} (missing closing quote)`);

    // ` are for raw strings, ''' and """ for auto-formatted ones
    if (quote.length === 3 && key.includes('\n')) {
      let partials = key.split('\n');

      while (/^(\s*)$/.test(partials[0]) && partials.length) partials.shift();

      if (partials.length > 0) {
        let format = /^(\s*)/.exec(partials[0])?.[0] || '';

        let newKey: Array<string> = [];
        partials.forEach((partial) => {
          newKey.push(partial.startsWith(format) ? partial.slice(format.length) : partial);
        });

        key = newKey.join('\n').trim();
      }
    }
  } else key = key.trim();

  // see above, quoted strings are "escaped" (values are no keys and therefore have no need for path manipulation)
  if (isValue || hasQuotes) return [[key], internalIndex, hasQuotes];

  return [parsePath(key, index), internalIndex, hasQuotes];
};

const parseFormat = (input: string): unknown => {
  // bools
  if (input.toLowerCase() === 'true') return true;
  if (input.toLowerCase() === 'false') return false;

  // numbers (formats: 1, 1e5, 1.0)
  if (/^[-+]?\d+(?:(?:\.\d+)|(?:e\d+)?)?$/.test(input)) return parseFloat(input);

  // null & undefined
  if (input.toLowerCase() === 'null') return null;
  if (input.toLowerCase() === 'undefined') return undefined;

  // unknown so we don't touch it
  return input;
};

const parseRef = (
  context: Array<HOCON.LexerContext>,
  index: number
): [partials: Array<string>, index: number] => {
  let key = '';
  let internalIndex = index + 1;

  for (
    ;
    internalIndex < context.length && context[internalIndex].token !== TOKEN.REF_CLOSE;
    internalIndex += 1
  )
    key += context[internalIndex].raw;

  if (internalIndex === context.length && context[internalIndex - 1].token !== TOKEN.REF_CLOSE)
    throw Error(`malformed ref found at ${index} (missing closing ref)`);

  key = key.trim();

  return [parsePath(key, index), internalIndex];
};
