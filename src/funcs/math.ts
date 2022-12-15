export { add, subtract, divide, multiply };

const add: AHOCON.CustomFunction = ({ args, node }) => {
  let acc = 0;

  args.forEach((item) => {
    if (typeof item !== 'number')
      throw Error(
        `${node.name.value} can only work with numbers, got ${typeof item} (value = ${item})`
      );

    acc += item;
  });

  node.evaluated = acc;
};

const subtract: AHOCON.CustomFunction = ({ args, node }) => {
  let acc = 0;

  args.forEach((item, index) => {
    if (typeof item !== 'number')
      throw Error(
        `${node.name.value} can only work with numbers, got ${typeof item} (value = ${item})`
      );

    if (index === 0) acc = item;
    else acc -= item;
  });

  node.evaluated = acc;
};

const divide: AHOCON.CustomFunction = ({ args, node }) => {
  let acc = 0;

  args.forEach((item, index) => {
    if (typeof item !== 'number')
      throw Error(
        `${node.name.value} can only work with numbers, got ${typeof item} (value = ${item})`
      );

    if (index === 0) acc = item;
    else acc /= item;
  });

  node.evaluated = acc;
};

const multiply: AHOCON.CustomFunction = ({ args, node }) => {
  let acc = 0;

  args.forEach((item, index) => {
    if (typeof item !== 'number')
      throw Error(
        `${node.name.value} can only work with numbers, got ${typeof item} (value = ${item})`
      );

    if (index === 0) acc = item;
    else acc *= item;
  });

  node.evaluated = acc;
};
