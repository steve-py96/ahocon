import { lex } from './lexer';
import { TOKEN } from './tokens';
import { parseFormat, parseRef, parseString, resolvePath } from './parserHelpers';

export { parse };

const parse = <T extends Record<string, unknown> = {}>(input: string): T => {
  let { context } = lex(input);

  if (context.length === 0) return {} as T;

  let re: Record<string, unknown> = {};
  const { keyRef, prefix, inside, refs, topLevel }: HOCON.ParserState = {
    keyRef: [],
    prefix: [],
    inside: [],
    refs: [],
    topLevel: {
      object: false,
      array: false,
    },
  };

  const lastRootType = (): Nullable<'array' | 'object'> => {
    const tmp = inside[inside.length - 1];

    return tmp === undefined ? null : tmp.key;
  };

  if (
    // omitable {} around the code
    context[0].token === TOKEN.OBJECT_OPEN &&
    context[context.length - 1].token === TOKEN.OBJECT_CLOSE
  ) {
    topLevel.object = true;
    context = context.slice(1, -1);
  } else if (
    // we allow root level hocon arrays cause y not, but it's only active when the input started with [ tho
    context[0].token === TOKEN.ARRAY_OPEN &&
    context[context.length - 1].token === TOKEN.ARRAY_CLOSE
  ) {
    inside.push({
      key: 'array',
      size: 1,
    });

    topLevel.array = true;
    re = [] as unknown as Record<string, unknown>;
    context = context.slice(1, -1);

    prefix.push(0);
  }

  for (let i = 0; i < context.length; i += 1) {
    let current = context[i];
    const lastType = lastRootType();
    // if there's a key or it's within an array this is a value
    const isValue = keyRef.length > 0 || lastType === 'array';
    // used for init object setting (array or object)
    const insideTypePath = inside.reduce((acc, cur) => {
      for (let i = 0; i < cur.size; i += 1) acc.push(cur.key);
      return acc;
    }, [] as Array<string>);
    // the current full value path (containing the wrapper paths & the current key)
    const fullPath = [...prefix, ...keyRef];

    // we always expect key = value, key : value or key {, key [ here
    // therefore we need to check what's coming

    switch (current.token) {
      default: {
        throw Error(`unknown token at ${i}! (token = ${current.token})`);
      }
      case TOKEN.MULTILINE_COMMENT_OPEN:
      case TOKEN.MULTILINE_COMMENT_CLOSE: {
        throw Error(`unclosed comment found at ${i}!`);
      }
      // ignoreable itself
      case TOKEN.WHITESPACE:
        break;
      case null:
      case TOKEN.STRING: {
        const [path, index, hasQuotes] = parseString(context, i, isValue);

        // if it's a quoted string we can just apply the new provided index
        if (current.token === TOKEN.STRING) i = index;
        // else we -1 since we run into the +1 of the loop and the current is a raw string
        else i = index - 1;

        if (!isValue) keyRef.push(...path);
        else {
          const tmp = resolvePath(re, fullPath, (item, partial, index) => {
            item[partial] =
              item[partial] ||
              ((insideTypePath[index] === 'array' ? [] : {}) as Record<string | number, unknown>);
          });
          const value = hasQuotes ? path[0] : parseFormat(path[0]);

          if (lastType === 'array') {
            const arrayIndex = prefix[prefix.length - 1];

            tmp[arrayIndex] = value;
            (prefix[prefix.length - 1] as number) += 1;
          } else {
            tmp[keyRef.pop()!] = value;
            keyRef.splice(0, keyRef.length);
          }
        }
        break;
      }
      case TOKEN.OBJECT_OPEN: {
        let size = 1;

        const tmp = resolvePath(re, fullPath, (item, partial, index) => {
          item[partial] =
            item[partial] ||
            ((insideTypePath[index] === 'array' ? [] : {}) as Record<string | number, unknown>);
        });

        if (lastType !== 'array') {
          if (keyRef.length === 0) throw Error(`unexpected object at ${i} (without identifier)`);

          tmp[keyRef[keyRef.length - 1]] = {};
          size = keyRef.length;
          prefix.push(...keyRef);
          keyRef.splice(0, size);
        } else {
          (tmp as unknown as Array<unknown>).push({});
        }

        inside.push({ key: 'object', size });
        break;
      }
      case TOKEN.OBJECT_CLOSE: {
        const { size } = inside.pop()!;

        // within an array the index needs to be updated (can't use lastType since we pop above)
        if (lastRootType() !== 'array') prefix.splice(prefix.length - size, size);
        else (prefix[prefix.length - 1] as number) += 1;
        break;
      }
      case TOKEN.ARRAY_OPEN: {
        let size = 1;

        const tmp = resolvePath(re, fullPath, (item, partial, index) => {
          item[partial] =
            item[partial] ||
            ((insideTypePath[index] === 'array' ? [] : {}) as Record<string | number, unknown>);
        });

        if (lastType !== 'array') {
          if (keyRef.length === 0) throw Error(`unexpected array at ${i} (without identifier)`);

          tmp[keyRef[keyRef.length - 1]] = [];
          size += keyRef.length;
          prefix.push(...keyRef, 0);
          keyRef.splice(0, keyRef.length);
        } else {
          prefix.push(0);
          (tmp as unknown as Array<unknown>).push([]);
        }

        inside.push({ key: 'array', size });
        break;
      }
      case TOKEN.ARRAY_CLOSE: {
        const { size } = inside.pop()!;

        // cut off index & name path
        prefix.splice(prefix.length - size, size);

        // update index if array in array (can't use lastType since we pop above)
        if (lastRootType() === 'array') (prefix[prefix.length - 1] as number) += 1;
        break;
      }
      case TOKEN.REF_OPEN: {
        if (keyRef.length === 0) throw Error(`unexpected ref at ${i} (without identifier)`);

        const [source, index] = parseRef(context, i);

        const otherRef = refs.find(
          (other) =>
            other.target.length === source.length &&
            other.source.length === fullPath.length &&
            other.target.every((val, index) => val === source[index]) &&
            other.source.every((val, index) => val === fullPath[index])
        );

        if (otherRef !== undefined)
          throw Error(
            `cyclic ref found at ${i}! (reference ${fullPath.join(
              '.'
            )} points on reference ${source.join('.')} which references ${fullPath.join(
              '.'
            )} again!)`
          );

        i = index;

        const item = {
          target: fullPath,
          source,
        };

        // if the current ref is the ref of a ref added before it is properly resolved by unshifting it instead of pushing
        if (
          refs.find(
            (other) =>
              other.source.length === fullPath.length &&
              other.source.every((val, index) => val === fullPath[index])
          )
        )
          refs.unshift(item);
        else refs.push(item);

        keyRef.splice(0, keyRef.length);

        if (lastType === 'array') prefix.push((prefix.pop()! as number) + 1);

        break;
      }
      case TOKEN.REF_SHORT: {
        if (keyRef.length === 0 && lastType !== 'array')
          throw Error(`unexpected ref at ${i} (without identifier)`);

        const nextToken = context[i + 1]?.token;

        if (nextToken === undefined || (nextToken !== null && nextToken !== TOKEN.STRING))
          throw Error(
            `unexpected ref-value at ${i} (after @ a string-token or a raw string is expected)`
          );

        const [source, index] = parseString(context, i + 1);

        const otherRef = refs.find(
          (other) =>
            other.target.length === source.length &&
            other.source.length === fullPath.length &&
            other.target.every((val, index) => val === source[index]) &&
            other.source.every((val, index) => val === fullPath[index])
        );

        if (otherRef !== undefined)
          throw Error(
            `cyclic ref found at ${i}! (reference ${fullPath.join(
              '.'
            )} points on reference ${source.join('.')} which references ${fullPath.join(
              '.'
            )} again!)`
          );

        i = index;

        const item = {
          target: fullPath,
          source,
        };

        // if the current ref is the ref of a ref added before it is properly resolved by unshifting it instead of pushing
        if (
          refs.find(
            (other) =>
              other.source.length === fullPath.length &&
              other.source.every((val, index) => val === fullPath[index])
          )
        )
          refs.unshift(item);
        else refs.push(item);

        keyRef.splice(0, keyRef.length);

        if (lastType === 'array') prefix.push((prefix.pop()! as number) + 1);

        break;
      }
    }
  }

  // resolving refs after everything else here
  refs.forEach(({ source, target }) => {
    const src = resolvePath(re, source, (_ref, partial) => {
      if (partial === '') return resolvePath(re, target);

      return undefined;
    });
    const tgt = resolvePath(re, target);

    tgt[target[target.length - 1]] = src[source[source.length - 1]];
  });

  if (keyRef.length > 0) throw Error(`unexpected key (${keyRef.join(',')} has no value)`);
  if (prefix.length > 0) {
    const lastType = lastRootType();

    if (lastType === 'array') {
      if (prefix.length === 1 && topLevel.array) prefix.pop();
      else
        throw Error(
          `unexpected unclosed array (${prefix.slice(0, -1).join(',')} is opened but not closed)`
        );
    } else if (lastType === 'object')
      throw Error(`unexpected unclosed object (${prefix.join(',')} is opened but not closed)`);
  }

  return re as T;
};
