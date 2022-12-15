import { parseInput } from './input';
import { parseAST } from './ast';

export { parse };

const parse = <T extends {} = {}>(content: string, config?: AHOCON.ParseConfig): T => {
  if (!content?.trim()) return {} as T;

  const root = parseInput(content);

  root.parseConfig = config;

  config?.preparse?.(root);

  return parseAST(root) as T;
};
