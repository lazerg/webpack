"use strict";

const webpack = require("../../../../");

/** @type {import("../../../../").Configuration} */
module.exports = {
	target: "node",
	experiments: {
		outputModule: true
	},
	output: {
		module: true,
		filename: "bundle0.mjs",
		library: { type: "module" }
	},
	plugins: [
		new webpack.ExposePlugin({
			exposes: {
				"./lib": [
					{ globalName: "moduleLibrary", override: true },
					"moduleLibraryValue|value|true"
				],
				"./index.js": { globalName: "moduleLibraryEntry", override: true }
			}
		})
	]
};
