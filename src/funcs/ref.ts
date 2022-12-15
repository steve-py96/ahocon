export { ref };

const ref: AHOCON.CustomFunction = ({ args, node, root, parseNode }) => {
  if (args.length !== 1) throw Error('ref failed, too many arguments');

  let partials = (args[0] as string).split('.');
  let reference: AHOCON.Node | null | undefined = root as AHOCON.Node;

  // relative path (starts with .)
  if (partials[0] === '') {
    partials.shift();
    reference = node.parent as typeof reference;
  }

  partials.forEach((partial) => {
    if (!reference) return; // skip if there's already no reference

    if (reference.type === 'root') reference = reference.entry;

    if (reference.type === 'object')
      reference = reference.props.find((item) => item.key.value === partial)?.value;
    else if (reference.type === 'array')
      reference = reference.values[partial as unknown as number]; // ['0'] is the same as [0]
    else if (reference.type === 'function')
      reference = reference.args[partial as unknown as number]; // same as with arrays
  });

  if (reference.type === 'string' || reference.type === 'raw') node.evaluated = reference.value;
  else if (
    reference.type === 'array' ||
    reference.type === 'object' ||
    reference.type === 'function'
  )
    node.evaluated = parseNode(reference);
  else if (reference.type === 'root') node.evaluated = parseNode(reference.entry);
};
