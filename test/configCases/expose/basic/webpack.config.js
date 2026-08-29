"use strict";

const webpack = require("../../../../");

/** @type {import("../../../../").Configuration} */
module.exports = {
	plugins: [
		new webpack.ExposePlugin({
			exposes: {
				"./lib": [
					{ globalName: "myLib", override: true },
					{ globalName: "nested.deep.myLib", override: true },
					{ globalName: "[name]Global", override: true },
					"myMap|map|true",
					"taken",
					"overriddenMap map true",
					{ globalName: ["overridden"], override: true }
				],
				[require.resolve("./other")]: { globalName: "myOther", override: true }
			}
		})
	]
};
