import { namespace } from './utils';
import * as globalFuncs from './funcs/globals';
import * as mathFuncs from './funcs/math';

export { funcs };

const funcs = Object.assign({}, globalFuncs, namespace('math', mathFuncs));
