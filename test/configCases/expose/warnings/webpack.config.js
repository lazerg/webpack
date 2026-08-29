"use strict";

const webpack = require("../../../../");

/** @type {import("../../../../").Configuration} */
module.exports = {
	plugins: [
		new webpack.ExposePlugin({
			exposes: {
				"./lib": "missing|notHere"
			}
		})
	]
};
