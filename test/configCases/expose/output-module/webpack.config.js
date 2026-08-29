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
		filename: "bundle0.mjs"
	},
	plugins: [
		new webpack.ExposePlugin({
			exposes: {
				"./lib": [
					{ globalName: "esmOutput", override: true },
					"esmOutputValue|value|true"
				]
			}
		})
	]
};
