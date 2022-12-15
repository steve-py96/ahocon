export {
  parseInput,
  parseArray,
  parseAssignment,
  parseFunction,
  parseKey,
  parseObject,
  parseRaw,
  parseString,
  parseValue,
};

const isNewline = (string: string) => string === '\n';

const isWhitespace = (string: string, newline?: boolean) =>
  string === ' ' || string === '\t' || !!(newline && isNewline(string));

const isNumberic = (string: string) => numberRegex.test(string);

const isString = (string: string) => string === '"' || string === '`' || string === "'";

const isAssignment = (string: string) => string === ':' || string === '=' || string === ':=';

const isSeparator = (string: string) => string === ';' || string === ',' || isNewline(string);

const isDot = (string: string) => string === '.';

const isObject = (string: string) => string === '{';

const isObjectClose = (string: string) => string === '}';

const isArray = (string: string) => string === '[';

const isArrayClose = (string: string) => string === ']';

const isFunction = (string: string) => string === '$';

const isFunctionStart = (string: string) => string === '(';

const isFunctionEnd = (string: string) => string === ')';

const isSinglelineComment = (string: string) => string === '#' || string === '//';

const isInlineComment = (string: string) => string === '/*';

const isInlineCommentEnd = (string: string) => string === '*/';

const numberRegex = /^[-+]?\d+((\.\d+)|(e\d+)?)?$/;

const dedent = (string: string) => {
  if (!string.includes('\n')) return string.trim();

  const partials = string.split('\n');

  while (partials[0].trim().length === 0 && partials.length) partials.shift();

  let leadingWhitespaces = '';

  for (let index = 0; index < partials[0].length && isWhitespace(partials[0][index]); index += 1)
    leadingWhitespaces += partials[0][index];

  const newValue: Array<string> = [];

  for (const index in partials) {
    const partial = partials[index];

    newValue.push(
      partial.startsWith(leadingWhitespaces) ? partial.slice(leadingWhitespaces.length) : partial
    );
  }

  return newValue.join('\n').trim();
};

const skip = (
  raw: string,
  startIndex: number,
  isSkippable: (current: string, currentIndex: number) => boolean
) => {
  for (let index = startIndex; index < raw.length; index += 1) {
    if (!isSkippable(raw[index], index)) return index;
  }

  return raw.length;
};

const skipWhitespaces = (raw: string, startIndex: number, newline?: boolean) =>
  skip(raw, startIndex, (current) => isWhitespace(current, newline));

const skipComments = (raw: string, startIndex: number, newlines?: boolean) => {
  const skipNewlines = newlines ?? true;
  let returnedIndex = startIndex;

  do {
    const copy = returnedIndex;
    const nextTokenIndex = skipWhitespaces(raw, copy, skipNewlines);
    const nextToken = raw[nextTokenIndex];
    const nextTokens = nextToken + raw[nextTokenIndex + 1];

    if (isSinglelineComment(nextToken) || isSinglelineComment(nextTokens))
      returnedIndex = skip(raw, nextTokenIndex + 2, (current) => !isNewline(current));

    if (isInlineComment(nextTokens))
      returnedIndex =
        skip(
          raw,
          nextTokenIndex + 2,
          (current, currentIndex) => !isInlineCommentEnd(current + raw[currentIndex + 1])
        ) + 2;

    // no progress => break out
    if (copy === returnedIndex) break;
  } while (returnedIndex < raw.length);

  return skipWhitespaces(raw, returnedIndex, skipNewlines);
};

const parseAssignment = (raw: string, startIndex: number): AHOCON.PickNode<'assignment'> | null => {
  let nextToken = raw[startIndex];

  if (nextToken === ':' && raw[startIndex + 1] === '=') nextToken = ':=';

  if (!isAssignment(nextToken)) return null;

  return {
    type: 'assignment',
    raw: raw.slice(startIndex, startIndex + nextToken.length),
    range: [startIndex, startIndex + nextToken.length - 1],
    value: nextToken,
  };
};

const parseString = (raw: string, startIndex: number): AHOCON.PickNode<'string'> => {
  let quote = raw[startIndex];

  // check for triple quote
  if (raw[startIndex + 1] === quote && raw[startIndex + 2] === quote) quote = quote.repeat(3);

  for (let index = startIndex + quote.length; index < raw.length; index += 1) {
    const current = raw.slice(index, index + quote.length);

    if (current === quote) {
      let value = raw.slice(startIndex + quote.length, index);

      if (quote.length === 3) value = dedent(value);

      return {
        type: 'string',
        raw: raw.slice(startIndex, index + quote.length),
        range: [startIndex, index + quote.length - 1],
        value,
      };
    }
  }

  throw Error(`failed to parse string at ${startIndex}`);
};

const parseFunction = (raw: string, startIndex: number): AHOCON.PickNode<'function'> => {
  const args: AHOCON.PickNode<'function'>['args'] = [];
  const name = parseKey(raw, startIndex + 1);

  let nextTokenIndex = name.range[1] + 1;
  let nextToken = raw[nextTokenIndex];

  if (!isFunctionStart(nextToken))
    throw Error(`function ${name.value} at index ${startIndex} isn't called`);

  if (isFunctionEnd(raw[nextTokenIndex + 1]))
    return {
      type: 'function',
      raw: raw.slice(startIndex, nextTokenIndex + 2),
      range: [startIndex, nextTokenIndex + 1],
      name,
      args,
    };

  nextTokenIndex += 1;

  do {
    const value = parseValue(raw, nextTokenIndex);

    args.push(value);

    nextTokenIndex = skipComments(raw, value.range[1] + 1, false);
    nextToken = raw[nextTokenIndex];

    if (!isFunctionEnd(nextToken)) {
      if (!isSeparator(nextToken))
        throw Error(`missing separator in arguments of function ${name} at ${startIndex}`);
      else {
        nextTokenIndex = skipComments(raw, nextTokenIndex + 1);
        nextToken = raw[nextTokenIndex];
      }
    }
  } while (nextTokenIndex < raw.length && !isFunctionEnd(nextToken));

  const re: AHOCON.PickNode<'function'> = {
    type: 'function',
    raw: raw.slice(startIndex, nextTokenIndex + 1),
    range: [startIndex, nextTokenIndex],
    name,
    args,
  };

  re.args.forEach((arg) => {
    arg.parent = re;
  });

  return re;
};

const parseRaw = (raw: string, startIndex: number, key?: boolean): AHOCON.PickNode<'raw'> => {
  let nextTokenIndex = skip(raw, startIndex, (current, currentIndex) => {
    const nextChars = current + raw[currentIndex + 1];

    return !(
      isString(current) ||
      isObject(current) ||
      isObjectClose(current) ||
      isArray(current) ||
      isArrayClose(current) ||
      (import.meta.env.MODE === 'extended' &&
        (isFunction(current) || isFunctionStart(current) || isFunctionEnd(current))) ||
      isSeparator(current) ||
      (key &&
        (isAssignment(current) ||
          isAssignment(nextChars) ||
          isWhitespace(current) ||
          isDot(current))) ||
      isSinglelineComment(current) ||
      isSinglelineComment(nextChars) ||
      isInlineComment(nextChars)
    );
  });

  const rawValue = raw.slice(startIndex, nextTokenIndex);
  let value: unknown = rawValue.trim();

  if (value === 'true') value = true;
  else if (value === 'false') value = false;
  else if (value === 'null') value = null;
  else if (value === 'undefined') value = undefined;

  // note: parsefloat ignores invalid chars after the number.. therefore a char check is mandatory
  const numberValue = parseFloat(value as string);
  if (!isNaN(numberValue) && isFinite(numberValue) && isNumberic(value as string))
    value = numberValue;

  return {
    type: 'raw',
    raw: rawValue,
    range: [startIndex, nextTokenIndex - 1],
    value,
  };
};

const parseValue = (
  raw: string,
  startIndex: number
): AHOCON.PickNode<'object'>['props'][number]['value'] => {
  const nextChar = raw[startIndex];

  if (import.meta.env.MODE === 'extended')
    if (isFunction(nextChar)) return parseFunction(raw, startIndex);
  if (isString(nextChar)) return parseString(raw, startIndex);
  if (isObject(nextChar)) return parseObject(raw, startIndex);
  if (isArray(nextChar)) return parseArray(raw, startIndex);

  return parseRaw(raw, startIndex);
};

const parseKey = (
  raw: string,
  startIndex: number
): AHOCON.PickNode<'object'>['props'][number]['key'] => {
  const partials: AHOCON.PickNode<'object'>['props'][number]['key']['partials'] = [];

  let endIndex = startIndex;
  let nextToken = '';

  do {
    const newKey = isString(raw[endIndex])
      ? parseString(raw, endIndex)
      : parseRaw(raw, endIndex, true);

    partials.push(newKey);
    endIndex = newKey.range[1] + 1;
    nextToken = raw[endIndex];

    if (isDot(nextToken)) endIndex += 1;
    else if (!isString(nextToken)) break;
  } while (endIndex < raw.length);

  return {
    raw: raw.slice(startIndex, endIndex),
    range: [startIndex, endIndex - 1],
    value: partials.map((item) => item.value).join('.'),
    partials,
  };
};

const parseObject = (raw: string, startIndex: number): AHOCON.PickNode<'object'> => {
  const props: AHOCON.PickNode<'object'>['props'] = [];
  const firstTokenIndex = skipComments(raw, startIndex + 1); // +1 = skip {
  const firstToken = raw[firstTokenIndex];

  // empty object => instant return
  if (isObjectClose(firstToken))
    return {
      type: 'object',
      raw: raw.slice(startIndex, firstTokenIndex + 1),
      range: [startIndex, firstTokenIndex],
      props,
    };

  let nextTokenIndex = firstTokenIndex;
  let key: AHOCON.PickNode<'object'>['props'][number]['key'];
  let assignment: AHOCON.PickNode<'assignment'> | null;
  let valueIndex: number;
  let nextToken: string;
  let value: AHOCON.PickNode<'object'>['props'][number]['value'];

  do {
    key = parseKey(raw, nextTokenIndex);
    assignment = parseAssignment(raw, skipComments(raw, key.range[1] + 1));
    valueIndex = skipComments(raw, (assignment?.range[1] ?? key.range[1]) + 1);
    nextToken = raw[valueIndex];

    if (!assignment && !isObject(nextToken) && !isArray(nextToken))
      throw Error(`missing assignment for field ${key.value}`);

    value = parseValue(raw, valueIndex);

    props.push({
      key,
      value,
    });

    nextTokenIndex = skipComments(raw, value.range[1] + 1);
  } while (nextTokenIndex < raw.length && !isObjectClose(raw[nextTokenIndex]));

  const re: AHOCON.PickNode<'object'> = {
    type: 'object',
    raw: raw.slice(startIndex, nextTokenIndex + 1),
    range: [startIndex, nextTokenIndex],
    props,
  };

  re.props.forEach((prop) => {
    prop.key.parent = re;
    prop.value.parent = re;
  });

  return re;
};

const parseArray = (raw: string, startIndex: number): AHOCON.PickNode<'array'> => {
  const values: AHOCON.PickNode<'array'>['values'] = [];
  const firstTokenIndex = skipComments(raw, startIndex + 1); // +1 = skip {
  const firstToken = raw[firstTokenIndex];

  // empty array => instant return
  if (isArrayClose(firstToken))
    return {
      type: 'array',
      raw: raw.slice(startIndex, firstTokenIndex + 1),
      range: [startIndex, firstTokenIndex],
      values,
    };

  let nextTokenIndex = firstTokenIndex;
  let nextToken = '';

  do {
    const value = parseValue(raw, nextTokenIndex);

    values.push(value);

    nextTokenIndex = skipComments(raw, value.range[1] + 1, false);
    nextToken = raw[nextTokenIndex];

    if (!isArrayClose(nextToken)) {
      if (!isSeparator(nextToken)) throw Error(`missing separator in array at ${startIndex}`);
      else {
        nextTokenIndex = skipComments(raw, nextTokenIndex + 1);
        nextToken = raw[nextTokenIndex];
      }
    }
  } while (nextTokenIndex < raw.length && !isArrayClose(nextToken));

  const re: AHOCON.PickNode<'array'> = {
    type: 'array',
    raw: raw.slice(startIndex, nextTokenIndex + 1),
    range: [startIndex, nextTokenIndex],
    values,
  };

  re.values.forEach((value) => {
    value.parent = re;
  });

  return re;
};

const parseInput = (raw: string): AHOCON.PickNode<'root'> => {
  let overwritableRaw = raw;
  let startIndex = skipComments(raw, 0);
  const firstToken = raw[startIndex];
  let entry: AHOCON.PickNode<'object' | 'array'>;

  if (isArray(firstToken)) entry = parseArray(overwritableRaw, startIndex);
  else {
    // not forcing {} around the code
    if (!isObject(firstToken)) {
      overwritableRaw = `{${overwritableRaw}}`;
      startIndex = 0;
    }

    entry = parseObject(overwritableRaw, startIndex);
  }

  const re: AHOCON.PickNode<'root'> = {
    type: 'root',
    raw: overwritableRaw,
    range: [0, raw.length],
    entry,
  };

  entry.parent = re;

  return re;
};
