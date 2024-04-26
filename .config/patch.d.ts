import type * as _typedoc from 'typedoc';

declare module 'typedoc' {
  export interface TypeDocOptionMap {
    /**
     * Define the name of the module that internal symbols which are not exported should be placed into.
     *
     * @defaultValue "\<internal\>"
     */
    internalModule?: string;
    /**
     * If set internal symbols will not be placed into an internals module, but directly into the module which references them.
     *
     * @defaultValue false
     */
    placeInternalsInOwningModule?: boolean;
  }
}
