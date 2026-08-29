"use strict";

const webpack = require("../../../../");

/** @type {import("../../../../").Configuration} */
module.exports = {
	plugins: [
		new webpack.ExposePlugin({
			globalObject: "globalThis.myScope",
			exposes: [
				{
					test: /lib\.js$/,
					expose: { globalName: "libByTest", override: true }
				},
				{
					request: "./other",
					include: /other/,
					exclude: /never/,
					expose: { globalName: "otherByRule", override: true }
				},
				{
					test: /other\.js$/,
					globalObject: "globalThis",
					expose: { globalName: "otherByOwnGlobalObject", override: true }
				}
			]
		})
	]
};
