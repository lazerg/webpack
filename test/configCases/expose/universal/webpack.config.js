"use strict";

const webpack = require("../../../../");

/** @type {import("../../../../").Configuration} */
module.exports = {
	target: ["web", "node"],
	plugins: [
		new webpack.ExposePlugin({
			exposes: {
				"./lib": [
					{ globalName: "universal", override: true },
					"universalValue|value|true"
				]
			}
		})
	]
};
