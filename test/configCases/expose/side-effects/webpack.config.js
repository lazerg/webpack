"use strict";

const webpack = require("../../../../");

/** @type {import("../../../../").Configuration} */
module.exports = {
	optimization: {
		sideEffects: true,
		usedExports: true
	},
	plugins: [
		new webpack.ExposePlugin({
			exposes: {
				pmodule: [
					{ globalName: "pmodule", override: true },
					"pmoduleValue|value|true"
				]
			}
		})
	]
};
