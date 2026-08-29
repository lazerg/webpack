/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Alexander Akait @alexander-akait
*/

"use strict";

const { JAVASCRIPT_MODULE_TYPE_ESM } = require("../ModuleTypeConstants");
const WebpackError = require("../errors/WebpackError");
const { CONST_BINDING_TAG } = require("../optimize/ConstExportsPlugin");
const { getInnerGraphUtils } = require("../optimize/InnerGraph");
const { RESERVED_IDENTIFIER, SAFE_IDENTIFIER } = require("../util/property");
const CommonJsInjectedExportsDependency = require("./CommonJsInjectedExportsDependency");
const DynamicExports = require("./DynamicExports");
const { enableHarmony } = require("./HarmonyDetectionParserPlugin");
const HarmonyExportSpecifierDependency = require("./HarmonyExportSpecifierDependency");
const HarmonyExports = require("./HarmonyExports");
const {
	harmonySpecifierTag
} = require("./HarmonyImportDependencyParserPlugin");

/** @import { DependencyLocation } from "../Dependency" */
/** @import { BuildInfo } from "../Module" */
/** @import { InlinedValue } from "../optimize/InlineExports" */
/** @import { JavascriptModuleBuildMeta } from "../javascript/JavascriptModule" */
/** @import JavascriptParser from "../javascript/JavascriptParser" */
/**
 * @import {
 * 	JavascriptParserExport,
 * 	JavascriptParserExports
 * } from "../../declarations/WebpackOptions"
 */

/** @typedef {"default" | "named" | "single" | "multiple"} ExportSyntax */
/** @typedef {"commonjs" | "module"} ExportsType */
/** @typedef {{ syntax: ExportSyntax, name: string, alias: string | undefined }} InjectedExport */
/** @typedef {{ type: ExportsType, exports: InjectedExport[] }} ParsedExports */

const PLUGIN_NAME = "InjectedExportsParserPlugin";

/** @type {Record<ExportSyntax, ExportsType>} */
const TYPE_OF_SYNTAX = {
	default: "module",
	named: "module",
	single: "commonjs",
	multiple: "commonjs"
};

/** @type {Record<ExportsType, ExportSyntax>} */
const DEFAULT_SYNTAX = {
	module: "named",
	commonjs: "multiple"
};

// the injected exports have no place in the source, they are appended to it
/** @type {DependencyLocation} */
const INJECTED_LOCATION = {
	start: { line: -1, column: 0 },
	end: { line: -1, column: 0 }
};

/**
 * Formats the value for an error message.
 * @param {JavascriptParserExports} value export item or the whole option
 * @returns {string} readable value
 */
const forError = (value) =>
	typeof value === "string" ? value : JSON.stringify(value);

/**
 * The generated code is never parsed again, so this check is all that stands
 * between the option and a broken bundle: a name is an identifier, or a member
 * expression of them (`Foo.Bar`), whose property parts may be reserved words.
 * @param {string} name name of the export
 * @returns {boolean} true, when the name can be generated as an expression
 */
const isValidName = (name) => {
	const parts = name.split(".");
	if (!SAFE_IDENTIFIER.test(parts[0]) || RESERVED_IDENTIFIER.has(parts[0])) {
		return false;
	}
	return parts.slice(1).every((part) => SAFE_IDENTIFIER.test(part));
};

/**
 * Splits `"<syntax> <name> <alias>"` into its parts.
 * @param {string} item export item
 * @returns {string[]} parts of the item
 */
const splitItem = (item) => {
	// both are inline-loader-query syntax the loader needed and an option doesn't
	if (item.includes("|")) {
		throw new WebpackError(
			`Invalid "${item}" value for export, separate the syntax, name and alias with a space instead of "|"`
		);
	}
	if (item.includes(",")) {
		throw new WebpackError(
			`Invalid "${item}" value for export, pass an array instead of a comma-separated string`
		);
	}
	const result = item.split(" ");
	for (const value of result) {
		if (!value) {
			throw new WebpackError(
				`Invalid "${item}" value for export, there must be a single space between the syntax, name and alias`
			);
		}
	}
	return result;
};

/**
 * Normalizes one item into syntax, name and alias, the syntax stays undefined when the item doesn't name one.
 * @param {JavascriptParserExport} item export item
 * @returns {{ syntax: ExportSyntax | undefined, name: string, alias: string | undefined }} normalized item
 */
const normalizeItem = (item) => {
	if (typeof item !== "string") {
		return {
			syntax: /** @type {ExportSyntax | undefined} */ (item.syntax),
			name: item.name,
			alias: item.alias
		};
	}
	const parts = splitItem(item.trim());
	if (parts.length > 3) {
		throw new WebpackError(`Invalid "${item}" value for export`);
	}
	if (parts.length === 1) {
		return { syntax: undefined, name: parts[0], alias: undefined };
	}
	return {
		syntax: /** @type {ExportSyntax} */ (parts[0]),
		name: parts[1],
		alias: parts[2]
	};
};

/**
 * Normalizes and validates the `exports` parser option.
 * @param {JavascriptParserExports} exports the option
 * @returns {ParsedExports} the exports to inject and the format they are generated in
 */
const parseExports = (exports) => {
	const items = Array.isArray(exports) ? exports : [exports];
	/** @type {ExportsType | undefined} */
	let type;
	const normalized = items.map((item) => {
		const { syntax, name, alias } = normalizeItem(item);
		if (syntax !== undefined) {
			if (!(syntax in TYPE_OF_SYNTAX)) {
				throw new WebpackError(
					`Unknown "${syntax}" syntax export in "${forError(item)}" value`
				);
			}
			if (
				alias !== undefined &&
				(syntax === "default" || syntax === "single")
			) {
				throw new WebpackError(
					`The "${syntax}" syntax can't have "${alias}" alias in "${forError(
						item
					)}" value`
				);
			}
			const syntaxType = TYPE_OF_SYNTAX[syntax];
			if (type !== undefined && type !== syntaxType) {
				throw new WebpackError(
					`The "${syntax}" syntax export in "${forError(
						item
					)}" value can't be mixed with "${type}" exports`
				);
			}
			type = syntaxType;
		}
		return { syntax, name, alias };
	});
	// no item named a syntax, so the ES module format and its default syntax apply
	const exportsType = type === undefined ? "module" : type;
	const result = normalized.map(({ syntax, name, alias }) => ({
		syntax: syntax === undefined ? DEFAULT_SYNTAX[exportsType] : syntax,
		name,
		alias
	}));
	const singles = result.filter(
		({ syntax }) => syntax === "default" || syntax === "single"
	);
	if (singles.length > 1) {
		throw new WebpackError(
			`The "${exportsType}" format can't have multiple "${singles[0].syntax}" exports in "${forError(exports)}" value`
		);
	}
	// a second assignment to `module.exports` would overwrite the single export
	if (singles.length === 1 && type === "commonjs" && result.length > 1) {
		throw new WebpackError(
			`The "single" syntax export can't be mixed with "multiple" exports in "${forError(exports)}" value`
		);
	}
	for (const { name } of result) {
		if (!isValidName(name)) {
			throw new WebpackError(
				`Invalid "${name}" name for export, it must be an identifier or a member expression of identifiers`
			);
		}
	}
	const identifiers = result.map(({ name, alias }) =>
		alias === undefined ? name : alias
	);
	const duplicates = identifiers.filter(
		(identifier, index) => identifiers.indexOf(identifier) !== index
	);
	if (duplicates.length > 0) {
		throw new WebpackError(
			`Duplicate ${duplicates
				.map((identifier) => `"${identifier}"`)
				.join(", ")} identifiers found in "${forError(exports)}" value`
		);
	}
	return { type: exportsType, exports: result };
};

class InjectedExportsParserPlugin {
	/**
	 * Creates an instance of InjectedExportsParserPlugin.
	 * @param {JavascriptParserExports} exports the `exports` parser option
	 */
	constructor(exports) {
		/** @type {ExportsType | undefined} */
		this.type = undefined;
		/** @type {InjectedExport[] | undefined} */
		this.exports = undefined;
		/** @type {string | undefined} */
		this.error = undefined;
		try {
			const parsed = parseExports(exports);
			this.type = parsed.type;
			this.exports = parsed.exports;
		} catch (err) {
			this.error = /** @type {WebpackError} */ (err).message;
		}
	}

	/**
	 * Applies the plugin by registering its hooks on the parser.
	 * @param {JavascriptParser} parser the parser
	 * @returns {void}
	 */
	apply(parser) {
		if (this.type === "module") {
			// the module must be ESM before its body is walked, as an `export` in the source would make it
			parser.hooks.program.tap(PLUGIN_NAME, () => {
				enableHarmony(
					parser,
					parser.state.module.type === JAVASCRIPT_MODULE_TYPE_ESM
				);
			});
		}

		parser.hooks.finish.tap(PLUGIN_NAME, () => {
			const module = parser.state.module;
			if (this.error !== undefined) {
				module.addError(new WebpackError(this.error));
				return;
			}
			const exports = /** @type {InjectedExport[]} */ (this.exports);
			if (this.type === "module") {
				this.injectHarmonyExports(parser, exports);
				return;
			}
			this.injectCommonJsExports(parser, exports);
		});
	}

	/**
	 * Adds the exports as `export { … }` would.
	 * @param {JavascriptParser} parser the parser
	 * @param {InjectedExport[]} exports the exports to add
	 * @returns {void}
	 */
	injectHarmonyExports(parser, exports) {
		const module = parser.state.module;
		const harmonyNamedExports = (parser.state.harmonyNamedExports =
			parser.state.harmonyNamedExports || new Set());
		const innerGraph = getInnerGraphUtils(parser.state.compilation);
		for (const [index, { syntax, name, alias }] of exports.entries()) {
			const exportName =
				syntax === "default" ? "default" : alias === undefined ? name : alias;
			// a member expression exports a value, not a binding: nothing to look up,
			// but also nothing the concatenation scope could rename
			const isExpression = name.includes(".");
			if (!isExpression) {
				if (!parser.scope.definitions.has(name)) {
					module.addError(
						new WebpackError(
							`Can't export "${name}", the module has no top-level declaration with this name`
						)
					);
					continue;
				}
				if (parser.getTagData(name, harmonySpecifierTag)) {
					module.addError(
						new WebpackError(
							`Can't export "${name}", it is an imported binding, re-export it in the module instead`
						)
					);
					continue;
				}
			} else {
				/** @type {BuildInfo} */
				(module.buildInfo).moduleConcatenationBailout =
					"injected export of a member expression";
			}
			harmonyNamedExports.add(exportName);
			innerGraph.addVariableUsage(parser, name.split(".")[0], exportName);
			const tagData = isExpression
				? undefined
				: /** @type {{ value?: InlinedValue } | undefined} */
					(parser.getTagData(name, CONST_BINDING_TAG));
			const dep = new HarmonyExportSpecifierDependency(
				name,
				exportName,
				tagData ? tagData.value || null : undefined
			);
			dep.setLocWithIndex(INJECTED_LOCATION, index);
			module.addDependency(dep);
		}
	}

	/**
	 * Adds the exports as an assignment to `module.exports` would.
	 * @param {JavascriptParser} parser the parser
	 * @param {InjectedExport[]} exports the exports to add
	 * @returns {void}
	 */
	injectCommonJsExports(parser, exports) {
		const module = parser.state.module;
		if (HarmonyExports.isEnabled(parser.state)) {
			module.addError(
				new WebpackError(
					'Can\'t add CommonJs exports to an ES module, use the "default"/"named" syntax instead'
				)
			);
			return;
		}
		const single = exports[0].syntax === "single";
		if (single) {
			DynamicExports.bailout(parser.state);
		} else {
			DynamicExports.enable(parser.state);
		}
		// nothing in the source references these names, so the inner graph would
		// drop the declarations they read as unused
		const innerGraph = getInnerGraphUtils(parser.state.compilation);
		for (const { name, alias } of exports) {
			innerGraph.addVariableUsage(
				parser,
				name.split(".")[0],
				single ? true : alias === undefined ? name : alias
			);
		}
		/** @type {JavascriptModuleBuildMeta} */
		(module.buildMeta).treatAsCommonJs = true;
		const dep = new CommonJsInjectedExportsDependency(
			exports.map(({ name, alias }) => [
				name,
				alias === undefined ? name : alias
			]),
			single
		);
		dep.setLocWithIndex(INJECTED_LOCATION, 0);
		module.addDependency(dep);
	}
}

InjectedExportsParserPlugin.parseExports = parseExports;

module.exports = InjectedExportsParserPlugin;
