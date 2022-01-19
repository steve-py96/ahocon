import { assertType } from '../utils';

export { sum };

const sum: AHOCON.ParserFunc<Array<string | number>> = ({ args }) => {
  let tmp = 0;

  args.forEach((arg) => {
    assertType(arg, 'number');

    tmp += arg as number;
  });

  return { value: tmp };
};
