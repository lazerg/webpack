"use strict";

const webpack = require("../../../../");

/** @type {import("../../../../").Configuration} */
module.exports = {
	plugins: [
		new webpack.ExposePlugin({
			globalObject: "globalThis.myScope",
			exposes: {
				"./lib": { globalName: "scopedLib", override: true }
			}
		})
	]
};
