export { memorysize };

const memoryTable: Record<string, number> = {
  bit: 1 / 8,
  byte: 1,
  kilobyte: Math.pow(10, 3),
  megabyte: Math.pow(10, 6),
  gigabyte: Math.pow(10, 9),
  terabyte: Math.pow(10, 12),
  kibibyte: Math.pow(2, 10),
  mebibyte: Math.pow(2, 20),
  gibibyte: Math.pow(2, 30),
  tebibyte: Math.pow(2, 40),

  // aliases
  b: 1,
  kb: Math.pow(10, 3),
  mb: Math.pow(10, 6),
  gb: Math.pow(10, 9),
  tb: Math.pow(10, 12),
  kib: Math.pow(2, 10),
  mib: Math.pow(2, 20),
  gib: Math.pow(2, 30),
  tib: Math.pow(2, 40),
};

const memorysize: AHOCON.CustomFunction = ({ args, node }) => {
  if (args.length !== 2) throw Error(`${node.name.value} needs exactly 2 arguments (from and to)`);
  if (typeof args[0] !== 'string' || typeof args[1] !== 'string')
    throw Error(`${node.name.value} needs the arguments to be strings`);

  const value1 = parseFloat(args[0]);
  const unit1 = args[0].match(/[a-z]+/)?.[0]?.toLowerCase();
  const unit2 = args[1].match(/[a-z]+/)?.[0]?.toLowerCase();

  if (!unit1 || !unit2)
    throw Error(
      `${node.name.value} arguments need a unit to convert from and a unit to convert to`
    );

  if (!memoryTable[unit1]) throw Error(`invalid unit ${unit1} at ${node.name.value}`);
  if (!memoryTable[unit2]) throw Error(`invalid unit ${unit2} at ${node.name.value}`);

  node.evaluated = `${(memoryTable[unit1] * value1) / memoryTable[unit2]}${unit2}`;
};
