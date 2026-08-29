"use strict";

const webpack = require("../../../../");

/** @type {import("../../../../").Configuration} */
module.exports = {
	plugins: [
		new webpack.ExposePlugin({
			exposes: {
				"./async": [
					{ globalName: "asyncNamespace", override: true },
					"asyncValue|value|true"
				]
			}
		})
	]
};
