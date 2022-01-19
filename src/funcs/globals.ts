import createRfdc from 'rfdc';
import { CONST_ARRAY, CONST_STRING, LEXER_RAW } from '../statics';
import { resolvePath, splitPath } from '../utils';

export { ref, assign, concat, variable as var, clone };

const rfdc = createRfdc({
  circles: true,
});

const ref: AHOCON.ParserFunc<Array<string | number>> = ({ ref, args, abs, argsRaw }) => {
  if (args.length < 1) return { value: ref };

  let toResolve = abs;

  if (argsRaw[0].type === LEXER_RAW && (args[0] as string)[0] === '.') {
    args[0] = (args[0] as string).slice(1);
    toResolve = ref;

    // => '' shouldn't be resolved anymore
    if (args[0].length === 0) args.shift();
  }

  try {
    const [resolvedRef, refKey] = resolvePath(
      toResolve,
      (
        args.map((value, index) => ({
          type: argsRaw[index].type,
          value,
        })) as unknown as Array<{
          type: string;
          value: string | number;
        }>
      )
        .map((item) =>
          typeof item.value === 'number' || item.type !== LEXER_RAW
            ? [item].map((partial) => ({
                value: partial.value,
                type: typeof item.value === 'number' ? CONST_ARRAY : CONST_STRING,
              }))
            : splitPath(item.value).map((partial) => ({
                value: partial,
                type: item.type,
              }))
        )
        .flat(),
      false
    );

    return {
      value: resolvedRef[refKey],
    };
  } catch (err) {
    throw Error(`failed to resolve ref "${args.join('.')}" (${(err as Error).message})`);
  }
};

const assign: AHOCON.ParserFunc<[object, ...Array<unknown>]> = ({ args }) => ({
  value: Object.assign(...args),
});

const concat: AHOCON.ParserFunc<Array<unknown>> = (params) => {
  const { args } = params;

  if (typeof args[0] !== 'object')
    return {
      value: args.map((item) => (item as string | number | boolean).toString()).join(''),
    };

  return {
    value: Array.isArray(args[0])
      ? args.flat()
      : assign(params as typeof params & { args: [object, ...Array<unknown>] }).value,
  };
};

const variable: AHOCON.ParserFunc = ({ args, ref }) => {
  if (args.length !== 1) throw Error('you must specify exactly one variable within $var');

  return {
    value: args[0],
    cleanup: (key) => {
      delete ref[key];
    },
  };
};

const clone: AHOCON.ParserFunc = ({ args }) => {
  return {
    value: args.length === 1 ? rfdc(args[0]) : rfdc(args),
  };
};
