"use strict";

const webpack = require("../../../../");

/** @type {import("../../../../").Configuration} */
module.exports = {
	externals: {
		jquery: "var globalThis.externalJQuery"
	},
	plugins: [
		new webpack.ExposePlugin({
			exposes: {
				jquery: { globalName: "exposedExternal", override: true }
			}
		})
	]
};
