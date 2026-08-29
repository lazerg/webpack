/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Alexander Akait @alexander-akait
*/

"use strict";

const path = require("path");
const { ConcatSource } = require("webpack-sources");
const ModuleFilenameHelpers = require("./ModuleFilenameHelpers");
const { JAVASCRIPT_TYPE } = require("./ModuleSourceTypeConstants");
const { STAGE_ADVANCED } = require("./OptimizationStages");
const RuntimeGlobals = require("./RuntimeGlobals");
const Template = require("./Template");
const ExposeWarning = require("./errors/ExposeWarning");
const JavascriptModulesPlugin = require("./javascript/JavascriptModulesPlugin");
const { propertyAccess } = require("./util/property");
const { getEntryRuntime, mergeRuntimeOwned } = require("./util/runtime");

/**
 * @import {
 * 	ExposePluginOptions,
 * 	Exposed,
 * 	ExposedItem,
 * 	ExposeRule
 * } from "../declarations/plugins/ExposePlugin"
 */
/** @import Compilation from "./Compilation" */
/** @import Compiler from "./Compiler" */
/** @import Module from "./Module" */
/** @import { RuntimeSpec } from "./util/runtime" */

/**
 * The requests a module can be selected by. Every `Module` subclass carries a
 * different subset of them, so they are read defensively.
 * @typedef {object} ModuleRequests
 * @property {string=} rawRequest request as written in the source code
 * @property {string=} userRequest request without loaders
 * @property {(string | Module)=} originalRequest request the delegated module stands in for
 * @property {(string | string[] | Record<string, string | string[]>)=} request request of an external
 */

/**
 * A single global name a module is assigned to.
 * @typedef {object} Expose
 * @property {string[]} globalName the path in the global object
 * @property {string | undefined} moduleLocalName the export to expose, whole module when unset
 * @property {boolean | undefined} override overwrite an existing value
 * @property {string} globalObject expression to the global object
 */

/**
 * @typedef {object} CompiledExposeRule
 * @property {(module: Module) => boolean} matches whether the rule applies to a module
 * @property {Expose[]} exposes the global names
 */

const PLUGIN_NAME = "ExposePlugin";

/**
 * Splits a shorthand into its parts, i.e. `_.map|mapExpose|true`.
 * @param {string} command the shorthand
 * @returns {string[]} the parts
 */
const splitCommand = (command) => {
	const result = [];

	for (const part of command.split("|")) {
		for (const item of part.split(" ")) result.push(item);
	}

	for (const item of result) {
		if (!item) {
			throw new Error(
				`Invalid command "${item}" in "${command}" for expose. There must be only one separator: " ", or "|".`
			);
		}
	}

	return result;
};

/**
 * @param {ExposedItem} item shorthand or object notation
 * @param {string} globalObject expression to the global object
 * @returns {Expose} the normalized expose
 */
const normalizeExposedItem = (item, globalObject) => {
	if (typeof item !== "string") {
		return {
			globalName:
				typeof item.globalName === "string"
					? item.globalName.split(".")
					: item.globalName,
			moduleLocalName: item.moduleLocalName,
			override: item.override,
			globalObject
		};
	}

	const parts = splitCommand(item.trim());

	if (parts.length > 3) {
		throw new Error(`Invalid "${item}" for exposes`);
	}

	return {
		globalName: parts[0].split("."),
		moduleLocalName: parts[1],
		override:
			parts[2] === undefined ? undefined : parts[2].toLowerCase() === "true",
		globalObject
	};
};

/**
 * @param {Exposed} exposed the configured global names
 * @param {string} globalObject expression to the global object
 * @returns {Expose[]} the normalized exposes
 */
const normalizeExposed = (exposed, globalObject) => {
	const items =
		typeof exposed === "string" && exposed.includes(",")
			? exposed.split(",")
			: exposed;

	return (Array.isArray(items) ? items : [items]).map((item) =>
		normalizeExposedItem(item, globalObject)
	);
};

/**
 * Replaces `[name]` with the basename of the exposed module.
 * @param {string} globalName the configured name
 * @param {Module} module the exposed module
 * @returns {string} the interpolated name
 */
const interpolateName = (globalName, module) => {
	if (!globalName.includes("[")) return globalName;

	const resource = module.nameForCondition();
	let basename = "file";

	if (resource) {
		const parsed = path.parse(resource.split("?")[0]);

		if (parsed.dir) basename = parsed.name;
	}

	return globalName.replace(/\[name\]/gi, () => basename);
};

/**
 * @param {Module} module the module
 * @returns {string[]} everything the module can be selected by
 */
const getModuleRequests = (module) => {
	const requests = [];
	const name = module.nameForCondition();

	if (name) requests.push(name);

	const m = /** @type {ModuleRequests} */ (/** @type {unknown} */ (module));

	if (typeof m.rawRequest === "string") requests.push(m.rawRequest);
	if (typeof m.userRequest === "string") requests.push(m.userRequest);
	if (typeof m.originalRequest === "string") requests.push(m.originalRequest);
	if (typeof m.request === "string") requests.push(m.request);

	return requests;
};

/**
 * The module's exports object as seen from inside its own scope. `module.exports`
 * is what the module ends up exporting, whatever it assigns to it — except in an
 * async module, where the runtime replaces it with the module's promise.
 * @param {Module} module the module
 * @returns {boolean} true, when the module object is needed
 */
const needModuleObject = (module) => {
	const buildMeta = module.buildMeta;

	return !buildMeta || !buildMeta.async;
};

/**
 * Renders the assignments to the global object.
 * @param {Module} module the exposed module
 * @param {Expose[]} exposes the exposes of the module
 * @param {Compilation} compilation the compilation
 * @returns {string} the generated code
 */
const renderExposes = (module, exposes, compilation) => {
	const exportsExpression = needModuleObject(module)
		? `${module.moduleArgument}.exports`
		: module.exportsArgument;
	const development = compilation.options.mode === "development";
	const code = [];

	for (const expose of exposes) {
		const globalName = expose.globalName.map((item) =>
			interpolateName(item, module)
		);
		const value =
			expose.moduleLocalName === undefined
				? exportsExpression
				: `${exportsExpression}${propertyAccess([expose.moduleLocalName])}`;
		let property = expose.globalObject;

		for (let i = 0; i < globalName.length; i++) {
			if (i > 0) {
				code.push(`if (typeof ${property} === "undefined") ${property} = {};`);
			}

			property += propertyAccess([globalName[i]]);
		}

		if (expose.override) {
			code.push(`${property} = ${value};`);
		} else {
			code.push(
				`if (typeof ${property} === "undefined") ${property} = ${value};`
			);

			if (development) {
				code.push(
					`else throw new Error(${JSON.stringify(
						`[ExposePlugin] The "${globalName.join(
							"."
						)}" value exists in the global scope, it may not be safe to overwrite it, use the "override" option`
					)});`
				);
			}
		}
	}

	return Template.asString(code);
};

class ExposePlugin {
	/**
	 * Creates an instance of ExposePlugin.
	 * @param {ExposePluginOptions} options options object
	 */
	constructor(options) {
		/** @type {ExposePluginOptions} */
		this.options = options;
	}

	/**
	 * Applies the plugin by registering its hooks on the compiler.
	 * @param {Compiler} compiler the compiler instance
	 * @returns {void}
	 */
	apply(compiler) {
		compiler.hooks.validate.tap(PLUGIN_NAME, () => {
			compiler.validate(
				() => require("../schemas/plugins/ExposePlugin.json"),
				this.options,
				{
					name: "Expose Plugin",
					baseDataPath: "options"
				},
				(options) => require("../schemas/plugins/ExposePlugin.check")(options)
			);
		});

		const globalObject = this.options.globalObject;
		/** @type {ExposeRule[]} */
		const rules = [];

		if (Array.isArray(this.options.exposes)) {
			for (const rule of this.options.exposes) rules.push(rule);
		} else {
			for (const request of Object.keys(this.options.exposes)) {
				rules.push({ request, expose: this.options.exposes[request] });
			}
		}

		/** @type {CompiledExposeRule[]} */
		const compiledRules = rules.map((rule) => {
			const request = rule.request;
			const hasConditions =
				rule.test !== undefined ||
				rule.include !== undefined ||
				rule.exclude !== undefined;
			const matchObject = ModuleFilenameHelpers.matchObject.bind(
				undefined,
				rule
			);

			return {
				matches: (module) => {
					const requests = getModuleRequests(module);

					if (request !== undefined && !requests.includes(request)) {
						return false;
					}

					if (!hasConditions) return request !== undefined;

					return requests.some((name) => matchObject(name));
				},
				exposes: normalizeExposed(
					rule.expose,
					rule.globalObject || globalObject || RuntimeGlobals.global
				)
			};
		});

		compiler.hooks.compilation.tap(
			PLUGIN_NAME,
			(compilation, { normalModuleFactory }) => {
				/** @type {WeakMap<Module, Expose[] | null>} */
				const matchCache = new WeakMap();

				/**
				 * @param {Module} module the module
				 * @returns {Expose[] | null} the exposes of the module
				 */
				const matchModule = (module) => {
					const cached = matchCache.get(module);

					if (cached !== undefined) return cached;

					/** @type {Expose[] | null} */
					let exposes = null;

					for (const rule of compiledRules) {
						if (!rule.matches(module)) continue;

						if (exposes === null) exposes = [];

						for (const expose of rule.exposes) exposes.push(expose);
					}

					matchCache.set(module, exposes);

					return exposes;
				};

				// Exposing is a side effect: a module dropped by `sideEffects: false`
				// never reaches code generation.
				normalModuleFactory.hooks.module.tap(PLUGIN_NAME, (module) => {
					if (matchModule(module)) {
						module.factoryMeta = module.factoryMeta || {};
						module.factoryMeta.sideEffectFree = false;
					}

					return module;
				});

				/** @type {Map<Module, Expose[]>} */
				const exposedModules = new Map();

				compilation.hooks.finishModules.tap(PLUGIN_NAME, (modules) => {
					exposedModules.clear();

					for (const module of modules) {
						const matched = matchModule(module);

						if (!matched) continue;

						exposedModules.set(module, matched);

						if (module.factoryMeta) module.factoryMeta.sideEffectFree = false;

						// The code is appended to the rendered module, which a module
						// concatenated into another one no longer is.
						if (module.buildInfo) {
							module.buildInfo.moduleConcatenationBailout = PLUGIN_NAME;
						}
					}
				});

				// After `FlagDependencyUsagePlugin`, so the exposed exports are kept,
				// unmangled and not inlined, whatever the rest of the graph does.
				compilation.hooks.optimizeDependencies.tap(
					{ name: PLUGIN_NAME, stage: STAGE_ADVANCED },
					() => {
						if (exposedModules.size === 0) return;

						const moduleGraph = compilation.moduleGraph;
						/** @type {RuntimeSpec} */
						let runtime;

						for (const [name, { options }] of compilation.entries) {
							runtime = mergeRuntimeOwned(
								runtime,
								getEntryRuntime(compilation, name, options)
							);
						}

						for (const [module, exposes] of exposedModules) {
							const exportsInfo = moduleGraph.getExportsInfo(module);

							for (const expose of exposes) {
								const name = expose.moduleLocalName;

								if (name === undefined) {
									exportsInfo.setUsedInUnknownWay(runtime);
									continue;
								}

								exportsInfo.getExportInfo(name).setUsedInUnknownWay(runtime);

								if (exportsInfo.isExportProvided(name) === false) {
									compilation.warnings.push(
										new ExposeWarning(
											`The "${name}" export, exposed as "${expose.globalName.join(
												"."
											)}", is not provided by the module.`,
											module
										)
									);
								} else if (module.buildMeta && module.buildMeta.async) {
									compilation.warnings.push(
										new ExposeWarning(
											`The "${name}" export, exposed as "${expose.globalName.join(
												"."
											)}", is read before the asynchronous module has been evaluated. Expose the module itself instead of one of its exports.`,
											module
										)
									);
								}
							}
						}
					}
				);

				// An asset every consumer reads through `new URL()` keeps no javascript
				// module in analyzable output, and there is then nothing to expose from.
				compilation.hooks.afterChunks.tap(PLUGIN_NAME, () => {
					const chunkGraph = compilation.chunkGraph;

					for (const [module, exposes] of exposedModules) {
						const sourceTypes = chunkGraph.getModuleSourceTypes(module);

						if (sourceTypes.has(JAVASCRIPT_TYPE)) continue;

						const names = exposes
							.map((expose) => `"${expose.globalName.join(".")}"`)
							.join(", ");

						compilation.warnings.push(
							new ExposeWarning(
								`The module generates no JavaScript in this output (${[...sourceTypes].join(", ") || "nothing"}), so it is not exposed as ${names}. Reference it from JavaScript, i.e. by importing it, to expose it.`,
								module
							)
						);
					}
				});

				compilation.hooks.additionalModuleRuntimeRequirements.tap(
					PLUGIN_NAME,
					(module, runtimeRequirements) => {
						const exposes = exposedModules.get(module);

						if (exposes === undefined) return;

						for (const expose of exposes) {
							if (expose.globalObject === RuntimeGlobals.global) {
								runtimeRequirements.add(RuntimeGlobals.global);
							}
						}

						runtimeRequirements.add(
							needModuleObject(module)
								? RuntimeGlobals.module
								: RuntimeGlobals.exports
						);
					}
				);

				JavascriptModulesPlugin.getCompilationHooks(
					compilation
				).renderModuleContent.tap(PLUGIN_NAME, (source, module) => {
					const exposes = exposedModules.get(module);

					if (exposes === undefined) return source;

					return new ConcatSource(
						source,
						"\n",
						renderExposes(module, exposes, compilation)
					);
				});

				// The code is added after code generation, so nothing else makes the
				// hash of a chunk holding an exposed module depend on the options.
				compilation.hooks.chunkHash.tap(PLUGIN_NAME, (chunk, hash) => {
					const chunkGraph = compilation.chunkGraph;

					for (const [module, exposes] of exposedModules) {
						if (!chunkGraph.isModuleInChunk(module, chunk)) continue;

						hash.update(`${PLUGIN_NAME}${JSON.stringify(exposes)}`);
					}
				});
			}
		);
	}
}

module.exports = ExposePlugin;
