/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 * Run `yarn fix:special` to update
 */

/**
 * Names in the global object a module is assigned to.
 */
export type Exposed = ExposedItem[] | ExposedItem;
/**
 * A name in the global object a module is assigned to.
 */
export type ExposedItem = ExposedItemShorthand | ExposedItemObject;
/**
 * A name in the global object, optionally followed by the name of the export to expose and whether to overwrite an existing value, separated by a space or '|' (i.e. '_.map|mapExpose|true').
 */
export type ExposedItemShorthand = string;

export interface ExposePluginOptions {
	/**
	 * Modules to expose to the global object, keyed by the request of the module, as written in the source code or as an absolute path.
	 */
	exposes: {
		/**
		 * Names in the global object the module is assigned to.
		 */
		[k: string]: Exposed;
	};
	/**
	 * An expression to the global object, defaults to the global object of the target environment.
	 */
	globalObject?: string;
}
/**
 * A name in the global object a module is assigned to.
 */
export interface ExposedItemObject {
	/**
	 * The name in the global object, a nested name is created when it contains dots or is an array.
	 */
	globalName: string[] | string;
	/**
	 * The name of the export of the module to expose, the whole module is exposed when unset.
	 */
	moduleLocalName?: string;
	/**
	 * Overwrite an existing value in the global object.
	 */
	override?: boolean;
}
