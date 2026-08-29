"use strict";

const path = require("path");
const { ProvidePlugin } = require("webpack");

/** @type {import("../../").Configuration} */
module.exports = {
	mode: "none",
	resolve: {
		alias: {
			// `$` matches the request exactly, so `shim.js` can still reach the real file
			"legacy-lib$": path.resolve(__dirname, "shim.js")
		}
	},
	module: {
		rules: [
			{
				test: /legacy-lib\.js$/,
				parser: {
					// top-level `this` is the platform global, not `module.exports`
					overrideTopLevelThis: "global"
				}
			}
		]
	},
	plugins: [
		// binds `$` in every module that reads it without declaring it
		new ProvidePlugin({ $: path.resolve(__dirname, "jquery.js") })
	]
};
