"use strict";

const webpack = require("../../../../");

/** @type {import("../../../../").Configuration} */
module.exports = {
	plugins: [
		new webpack.ExposePlugin({
			exposes: {
				"./jquery": [
					"$|default|true",
					{ globalName: "jQuery", moduleLocalName: "jQuery", override: true },
					{ globalName: "jQueryNamespace", override: true }
				]
			}
		})
	]
};
