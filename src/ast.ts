export {
  parseAST,
  parseString,
  parseRaw,
  parseArray,
  parseNode,
  parseObject,
  parseRoot,
  parseFunction,
};

const isEvaluated = (node: AHOCON.Node) => 'evaluated' in node;

const parseString = (node: AHOCON.PickNode<'string'>) => node.value;

const parseRaw = (node: AHOCON.PickNode<'raw'>) => node.value;

const parseFunction = (node: AHOCON.PickNode<'function'>) => {
  if (isEvaluated(node)) return node.evaluated; // don't reevaluate

  let parent = node.parent;

  while (parent?.parent) parent = parent?.parent;

  if (parent?.type !== 'root')
    throw Error(`cannot resolve function ${node.name.value} due to missing parent`);

  let func: AHOCON.CustomFunction | undefined = undefined;

  if (parent.parseConfig?.functions) {
    if (node.name.partials.length === 1)
      func = parent.parseConfig.functions[node.name.value] as AHOCON.CustomFunction;
    else {
      let ref: AHOCON.ParseConfig['functions'] = parent.parseConfig.functions;

      node.name.partials.forEach((partial) => {
        if (!ref) return;

        const currentKey = parseNode(partial) as string;

        ref = ref[currentKey] as typeof ref;
      });

      if (ref) func = ref as unknown as AHOCON.CustomFunction;
    }
  }

  if (!func) throw Error(`function ${node.name.value} isn't defined`);

  func({
    args: node.args.map((arg) => parseNode(arg)),
    node,
    root: parent,
    parseNode,
  });

  return node.evaluated;
};

const parseObject = (node: AHOCON.PickNode<'object'>) => {
  if (isEvaluated(node)) return node.evaluated;

  const re: Record<string | number, unknown> = {};

  node.props.forEach(({ key, value }) => {
    if (key.partials.length === 1) re[key.value] = parseNode(value);
    else {
      let ref: Record<string | number, unknown> = re;

      key.partials.slice(0, -1).forEach((partial, index) => {
        const currentKey = parseNode(partial) as string | number;
        const nextKey = parseNode(key.partials[index + 1]) as string | number;

        ref[currentKey] ??= typeof nextKey === 'number' ? [] : {};
        ref = ref[currentKey] as Record<string, unknown>;
      });

      ref[parseNode(key.partials[key.partials.length - 1]) as string] = parseNode(value);
    }
  });

  node.evaluated = re;

  return re;
};

const parseArray = (node: AHOCON.PickNode<'array'>): Array<unknown> => {
  if (isEvaluated(node)) return node.evaluated as Array<unknown>;

  const re = node.values.map((childNode) => parseNode(childNode));

  node.evaluated = re;

  return re;
};

const nodeMap =
  import.meta.env.MODE === 'extended'
    ? {
        array: parseArray,
        object: parseObject,
        string: parseString,
        raw: parseRaw,
        function: parseFunction,
      }
    : {
        array: parseArray,
        object: parseObject,
        string: parseString,
        raw: parseRaw,
      };

const parseNode = (node: AHOCON.Node) => {
  const func = nodeMap[node.type as keyof typeof nodeMap] as
    | ((node: AHOCON.Node) => unknown)
    | undefined;

  if (!func) throw Error(`failed parsing node with type ${node.type} (${node.raw})`);

  return func(node);
};

const parseRoot = (node: AHOCON.PickNode<'root'>) => {
  const re = node.entry.type === 'array' ? parseArray(node.entry) : parseObject(node.entry);

  node.evaluated = re;

  return re;
};

const parseAST = (node: AHOCON.PickNode<'root'>): unknown => parseRoot(node);
