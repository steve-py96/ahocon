import { Parser } from './defaults';

export { parse };

const parser = new Parser();
const parse = parser.parse.bind(parser);
