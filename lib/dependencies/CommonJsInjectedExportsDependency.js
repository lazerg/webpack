/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Alexander Akait @alexander-akait
*/

"use strict";

const InitFragment = require("../InitFragment");
const RuntimeGlobals = require("../RuntimeGlobals");
const makeSerializable = require("../util/makeSerializable");
const { propertyName } = require("../util/property");
const NullDependency = require("./NullDependency");

/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency, { ExportsSpec } from "../Dependency" */
/** @import { DependencyTemplateContext } from "../DependencyTemplate" */
/** @import ModuleGraph from "../ModuleGraph" */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext<[[string, string][], boolean]>} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext<[[string, string][], boolean]>} ObjectSerializerContext */

const EMPTY_OBJECT = {};

class CommonJsInjectedExportsDependency extends NullDependency {
	/**
	 * Creates an instance of CommonJsInjectedExportsDependency.
	 * @param {[string, string][]} exports pairs of expression in the module and export name
	 * @param {boolean} single true when the expression replaces the exports object itself
	 */
	constructor(exports, single) {
		super();
		/** @type {[string, string][]} */
		this.exports = exports;
		/** @type {boolean} */
		this.single = single;
	}

	get type() {
		return "cjs injected exports";
	}

	/**
	 * Returns the exported names
	 * @param {ModuleGraph} moduleGraph module graph
	 * @returns {ExportsSpec | undefined} export names
	 */
	getExports(moduleGraph) {
		// the value of a single export is opaque, so it provides no names
		if (this.single) return;
		return {
			exports: this.exports.map(([, name]) => ({
				name,
				// we can't mangle names that are in an empty object
				// because one could access the prototype property
				canMangle: !(name in EMPTY_OBJECT)
			})),
			dependencies: undefined
		};
	}

	/**
	 * Serializes this instance into the provided serializer context.
	 * @param {ObjectSerializerContext} context context
	 */
	serialize(context) {
		context.write(this.exports).write(this.single);
		super.serialize(context);
	}

	/**
	 * Restores this instance from the provided deserializer context.
	 * @param {ObjectDeserializerContext} context context
	 */
	deserialize(context) {
		this.exports = context.read();
		const c1 = context.rest;
		this.single = c1.read();
		super.deserialize(c1.rest);
	}
}

makeSerializable(
	CommonJsInjectedExportsDependency,
	"webpack/lib/dependencies/CommonJsInjectedExportsDependency"
);

CommonJsInjectedExportsDependency.Template = class CommonJsInjectedExportsDependencyTemplate extends (
	NullDependency.Template
) {
	/**
	 * Applies the plugin by registering its hooks on the compiler.
	 * @param {Dependency} dependency the dependency for which the template should be applied
	 * @param {ReplaceSource} source the current replace source which can be modified
	 * @param {DependencyTemplateContext} templateContext the context object
	 * @returns {void}
	 */
	apply(
		dependency,
		source,
		{ module, moduleGraph, runtime, initFragments, runtimeRequirements }
	) {
		const dep = /** @type {CommonJsInjectedExportsDependency} */ (dependency);
		runtimeRequirements.add(RuntimeGlobals.module);
		const base = `${module.moduleArgument}.exports`;
		let code;
		if (dep.single) {
			code = `${base} = ${dep.exports[0][0]};\n`;
		} else {
			const exportsInfo = moduleGraph.getExportsInfo(module);
			const properties = [];
			for (const [expression, name] of dep.exports) {
				const used =
					/** @type {string | false} */
					(exportsInfo.getUsedName(name, runtime));
				if (!used) continue;
				properties.push(`${propertyName(used)}: (${expression})`);
			}
			code = `${base} = { ${properties.join(", ")} };\n`;
		}
		initFragments.push(
			new InitFragment(
				undefined,
				InitFragment.STAGE_CONSTANTS,
				0,
				"cjs injected exports",
				`\n/* injected exports */\n${code}`
			)
		);
	}
};

module.exports = CommonJsInjectedExportsDependency;
