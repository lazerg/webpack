/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Alexander Akait @alexander-akait
*/

"use strict";

const {
	JAVASCRIPT_MODULE_TYPE_AUTO,
	JAVASCRIPT_MODULE_TYPE_DYNAMIC,
	JAVASCRIPT_MODULE_TYPE_ESM
} = require("./ModuleTypeConstants");
const RuntimeGlobals = require("./RuntimeGlobals");
const ConstDependency = require("./dependencies/ConstDependency");
const HarmonyExports = require("./dependencies/HarmonyExports");

/** @import { JavascriptParserOptions } from "../declarations/WebpackOptions" */
/** @import { Expression, ThisExpression } from "estree" */
/** @import Compiler from "./Compiler" */
/** @import JavascriptParser, { Range } from "./javascript/JavascriptParser" */

const PLUGIN_NAME = "OverrideTopLevelThisPlugin";

// Tagging `this` rather than tapping its name puts these handlers ahead of the ones
// reading top-level `this` as the commonjs exports object; a nested function scope
// drops the definition, so its own `this` falls back to them.
const topLevelThisTag = Symbol("top level this");

/**
 * Returns the `this` a member chain reads from.
 * @param {Expression} expression member expression
 * @returns {ThisExpression} the this expression at its root
 */
const getRootThis = (expression) => {
	let current = expression;
	while (current.type === "MemberExpression") {
		current = /** @type {Expression} */ (current.object);
	}
	return /** @type {ThisExpression} */ (current);
};

class OverrideTopLevelThisPlugin {
	/**
	 * Applies the plugin by registering its hooks on the compiler.
	 * @param {Compiler} compiler the compiler instance
	 * @returns {void}
	 */
	apply(compiler) {
		compiler.hooks.compilation.tap(
			PLUGIN_NAME,
			(compilation, { normalModuleFactory }) => {
				/**
				 * Handles the hook callback for this code path.
				 * @param {JavascriptParser} parser the parser
				 * @param {JavascriptParserOptions} parserOptions the javascript parser options
				 * @returns {void}
				 */
				const handler = (parser, parserOptions) => {
					const override = parserOptions.overrideTopLevelThis;

					if (override === undefined) return;

					/**
					 * Replaces a `this` the module reads at its top level.
					 * @param {ThisExpression} expr this expression
					 * @returns {true | void} true when it was replaced
					 */
					const replace = (expr) => {
						// esm answers `undefined` here per spec, so leave it to the esm handler
						if (HarmonyExports.isEnabled(parser.state)) return;

						const range = /** @type {Range} */ (expr.range);
						const dep =
							override === "undefined"
								? new ConstDependency("undefined", range, null)
								: compilation.outputOptions.environment.globalThis
									? new ConstDependency("globalThis", range)
									: new ConstDependency(RuntimeGlobals.global, range, [
											RuntimeGlobals.global
										]);

						dep.loc = parser.getLocation(expr);
						parser.state.module.addPresentationalDependency(dep);

						return true;
					};

					parser.hooks.program.tap(PLUGIN_NAME, () => {
						parser.tagVariable("this", topLevelThisTag, undefined);
					});
					parser.hooks.expression
						.for(topLevelThisTag)
						.tap(PLUGIN_NAME, (expr) =>
							replace(/** @type {ThisExpression} */ (expr))
						);
					parser.hooks.expressionMemberChain
						.for(topLevelThisTag)
						.tap(PLUGIN_NAME, (expr) => replace(getRootThis(expr)));
					parser.hooks.callMemberChain
						.for(topLevelThisTag)
						.tap(PLUGIN_NAME, (expr) => {
							const result = replace(
								getRootThis(/** @type {Expression} */ (expr.callee))
							);

							if (result) parser.walkExpressions(expr.arguments);

							return result;
						});
					parser.hooks.assignMemberChain
						.for(topLevelThisTag)
						.tap(PLUGIN_NAME, (expr) => {
							const result = replace(
								getRootThis(/** @type {Expression} */ (expr.left))
							);

							if (result) parser.walkExpression(expr.right);

							return result;
						});
				};

				normalModuleFactory.hooks.parser
					.for(JAVASCRIPT_MODULE_TYPE_AUTO)
					.tap(PLUGIN_NAME, handler);
				normalModuleFactory.hooks.parser
					.for(JAVASCRIPT_MODULE_TYPE_DYNAMIC)
					.tap(PLUGIN_NAME, handler);
				normalModuleFactory.hooks.parser
					.for(JAVASCRIPT_MODULE_TYPE_ESM)
					.tap(PLUGIN_NAME, handler);
			}
		);
	}
}

module.exports = OverrideTopLevelThisPlugin;
