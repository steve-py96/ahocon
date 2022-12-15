export {};

declare global {
  /**
   * the AHOCON namespace with some helper types such as `PickNode<...>` (`type RootNode = AHOCON.PickNode<'root'>`)
   */
  export namespace AHOCON {
    /**
     * the node shell (shared stuff of any node)
     */
    export type NodeShell<T> = T & {
      range: [start: number, end: number];
      raw: string;
    };

    /**
     * any possible node
     */
    export type Node =
      | AHOCON.NodeShell<{
          type: 'root';
          entry: AHOCON.PickNode<'array' | 'object'>;
          parseConfig?: AHOCON.ParseConfig;
          parent?: AHOCON.Node | null;
          evaluated?: unknown;
        }>
      | AHOCON.NodeShell<{
          type: 'object';
          props: Array<{
            key: AHOCON.KeyNode;
            value: AHOCON.ValueNode;
          }>;
          parent?: AHOCON.Node | null;
          evaluated?: unknown;
        }>
      | AHOCON.NodeShell<{
          type: 'array';
          values: Array<AHOCON.ValueNode>;
          parent?: AHOCON.Node | null;
          evaluated?: unknown;
        }>
      | AHOCON.NodeShell<{ type: 'string'; value: string; parent?: AHOCON.Node | null }>
      | AHOCON.NodeShell<{ type: 'assignment'; value: string; parent?: AHOCON.Node | null }>
      | AHOCON.NodeShell<{
          type: 'function';
          name: AHOCON.KeyNode;
          args: Array<AHOCON.ValueNode>;
          parent?: AHOCON.Node | null;
          evaluated?: unknown;
        }>
      | AHOCON.NodeShell<{ type: 'raw'; value: unknown; parent?: AHOCON.Node | null }>;

    /**
     * possible keys for objects
     */
    export type KeyNode = NodeShell<{
      value: string;
      partials: Array<AHOCON.PickNode<'string' | 'raw'>>;
      parent?: AHOCON.Node | null;
    }>;

    /**
     * possible values of objects / arrays / function args
     */
    export type ValueNode = AHOCON.PickNode<'string' | 'array' | 'object' | 'function' | 'raw'>;

    /**
     * picks the node by the provided type identifier, f.e. `let ref = myNode as PickNode<'root'>`
     */
    export type PickNode<T extends AHOCON.Node['type']> = Exclude<
      AHOCON.Node,
      Exclude<AHOCON.Node, { type: T }>
    >;

    /**
     * the type for custom functions, f.e. `const myFunc: CustomFunction = (params) => {}`
     */
    export type CustomFunction = (params: {
      args: Array<unknown>;
      root: AHOCON.PickNode<'root'>;
      node: AHOCON.PickNode<'function'>;
      parseNode: (node: AHOCON.Node) => unknown;
    }) => unknown;

    /**
     * the optionally providable parse config
     */
    export interface ParseConfig {
      /**
       * functions which can be used in the config
       *
       * IMPORTANT: only the extended parse (`import { parse } from 'ahocon/extended'`) uses this
       */
      functions?: Record<string, AHOCON.CustomFunction | Record<string, AHOCON.CustomFunction>>;

      /**
       * allows to run over the ast nodes before the parser does
       */
      preparse?: (root: AHOCON.PickNode<'root'>) => unknown;
    }
  }
}
