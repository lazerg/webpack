"use strict";

const webpack = require("../../../../");

/** @type {import("../../../../").Configuration} */
module.exports = {
	mode: "development",
	plugins: [
		new webpack.ExposePlugin({
			exposes: {
				"./lib": "taken"
			}
		})
	]
};
